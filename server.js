const express = require('express'); //webServer
var bodyParser = require('body-parser') //body parser (odbieranie body poprzez endpointy)
const path = require('path'); // obsługa ścierzek do plików
const fs = require('fs'); //praca na plikach

const SerialPort = require('serialport').SerialPort;
const WebSocket = require('ws');
const os = require('os');

const { exec, spawn } = require('child_process'); //obsługa poleceń linux

const { SystemInfo } = require('./utils/SystemInfo');
const { NetworkInfo } = require('./utils/NetworkInfo');




//===================================================================================================
//============================================[Variables]============================================
//===================================================================================================

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express();
const PORT = process.env.PORT || 3000;
// Ścieżka do folderu z muzyką
const musicDir = path.join(__dirname, 'Files_Music');
const settingsFile = 'settings.json';




// Opcje konfiguracji kamery
const dashcam_files = 'Files_DashCam';
const maxRecordingTime = 10 * 60 * 1000; // Maksymalny czas nagrania w milisekundach (10 minut)

let recordingStartTime;
let recordingProcess;

// Ensure output directory exists
if(!fs.existsSync(dashcam_files)){
    fs.mkdirSync(dashcam_files);
}


function startRecording() {
    const fileName = `recording_${Date.now()}.mp4`;
    const filePath = path.join(dashcam_files, fileName);
    recordingStartTime = Date.now();
    console.log(`Rozpoczęto nagrywanie: ${filePath}`);

    try {
        recordingProcess = spawn('ffmpeg', ['-f', 'v4l2', '-video_size', '640x480', '-i', '/dev/video0', '-t', '600', filePath]); // Domyślnie nagrywa przez 10 minut (600 sekund)
        
        recordingProcess.on('exit', (code, signal) => {
            console.log(`Nagrywanie zakończone (${filePath})`);
            if (Date.now() - recordingStartTime < maxRecordingTime) {
                startRecording(); // Jeśli nagranie nie trwało jeszcze 10 minut, rozpocznij nowe nagranie
            }
        });

        recordingProcess.on('error', (err) => {
            console.error('Błąd podczas nagrywania:', err);
        });
    } catch (err) {
        console.error('Błąd w funkcji startRecording:', err);
    }
}




//===================================================================================================
//============================================[Endpoints]============================================
//===================================================================================================

// Endpoint do pobrania ustawień
app.get('/getSettings', (req, res) => {
    try{
        const settings = JSON.parse(fs.readFileSync(path.join(__dirname, settingsFile)));
        res.json(settings);
    }catch(err){
        console.error('Error reading settings file:', err);
    }
});

// Endpoint to update the settings
app.put('/setSettings', jsonParser, (req, res) => {
  const updatedSettings = req.body;

  fs.readFile(settingsFile, 'utf8', (err, data) => {
      if(err) return res.status(500).json({ error: 'Error reading settings file' });
      
      const settings = JSON.parse(data);
      const newSettings = { ...settings, ...updatedSettings };

      fs.writeFile(settingsFile, JSON.stringify(newSettings, null, 2), 'utf8', (err) => {
          if(err) return res.status(500).json({ error: 'Error writing to settings file' });
          
          res.json(newSettings);
      });
  });
});




//Music Player
// Endpoint do pobrania listy playlist
app.get('/playlists', (req, res) => {
    fs.readdir(musicDir, (err, files) => {
        if(err){
            console.error('Error reading music directory:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        const playlists = files.filter(file => fs.statSync(path.join(musicDir, file)).isDirectory());
        res.json(playlists);
    });
});

// Endpoint do pobrania listy utworów w playlistach
app.get('/playlist/:name', (req, res) => {
    const playlistName = req.params.name;
    const playlistPath = path.join(musicDir, playlistName);
    fs.readdir(playlistPath, (err, files) => {
        if(err){
            console.error('Error reading playlist directory:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const playlist = files.filter(file => file.endsWith('.mp3')).map(file => {
            const [author, title] = file.replace('.mp3', '').split(' - ');

            return{
                name: title,
                author: author,
                src: `Music/${playlistName}/${file}`
            };
        });
        res.json(playlist);
    });
});

// Endpoint do obsługi plików muzycznych
app.get('/Music/:playlist/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'Files_Music', req.params.playlist, req.params.filename);
    
    // Serwowanie pliku muzycznego
    res.sendFile(filePath);
});




// Endpoint pobierający informacje i zwracający w formie JSON
app.get('/system-info', async (req, res) => {
    const systemInfo = {};

    try{
        systemInfo.System_Voltage = await SystemInfo.getVoltage();
        systemInfo.System_CpuTemperature = await SystemInfo.getCpuTemperature();
        systemInfo.System_SystemLoad = SystemInfo.getSystemLoad();
        systemInfo.System_MemoryUsage = SystemInfo.getMemoryUsage();
        systemInfo.System_DiskUsage = await SystemInfo.getDiskUsage();


        systemInfo.Network_NetworkStatus = await NetworkInfo.getNetworkStatus();
        systemInfo.Network_WifiInfo = await NetworkInfo.getWifiInfo();
        systemInfo.Network_EthernetInfo = await NetworkInfo.getEthernetInfo();

        //systemInfo.bluetoothDevices = await SystemInfo.getBluetoothDevices();
        
        res.json(systemInfo);
    }catch (error){
        console.error("Error retrieving system information:", error);
        res.status(500).json({ error: error.message });
    }
});

// WebSocket dla przesyłania danych w czasie rzeczywistym
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws){
  let portPath;

  if(os.platform() === 'win32') portPath = 'COM5';
  else portPath = '/dev/ttyUSB0';
  
  try{
    const port = new SerialPort({path: portPath, baudRate: 115200 });

    port.on('data', function (data){
      ws.send(data.toString());
    });

    port.on('error', function (err){
      ws.send(JSON.stringify({ error: 'Serial port error: ' + err.message }));
    });
  
    ws.on('close', function () {
      console.log('WebSocket connection closed');
      port.close();
  });
  }catch(err){
    ws.send(JSON.stringify({ error: 'Error opening serial port: ' + err.message }));
  }
});




//Files
// Rekurencyjna funkcja do pobierania struktury katalogu
const getDirectoryStructure = (dirPath) => {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  return items.map(item => {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
          return {
              name: item.name,
              path: fullPath,
              isDirectory: true,
              children: getDirectoryStructure(fullPath)
          };
      } else {
          return {
              name: item.name,
              path: fullPath,
              isDirectory: false
          };
      }
  });
};

app.get('/files/*', (req, res) => {
  const directoryPath = `/${req.params[0]}`;

  try {
      const structure = getDirectoryStructure(directoryPath);
      res.json(structure);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// Endpoint do pobierania listy plików w folderze
app.get('/dashcam_listFiles', (req, res) => {
    try{
        const files = fs.readdirSync(dashcam_files);
        res.json(files);
    }catch (err){
        console.error('Error reading directory:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint do obsługi plików filmowych
app.get('/dashcam_getFiles/:filename', (req, res) => {
    const filePath = path.join(__dirname, dashcam_files, req.params.filename);
    
    res.sendFile(filePath);
});





// Endpoint do uruchamiania nagrywania
app.post('/action/start-recording', (req, res) => {
    if(!isRecording){
        isRecording = true;
        startRecording();
        res.send("Recording started.");
    }else{
        res.send("Already recording.");
    }
});

// Endpoint do zatrzymywania nagrywania
app.post('/action/stop-recording', (req, res) => {
    if (isRecording) {
        isRecording = false;
        if(recordingProcess){
            recordingProcess.kill('SIGINT'); // Zakończ proces ffmpeg
        }
        res.send("Recording stopped.");
    }else{
        res.send("Not currently recording.");
    }
});


app.post('/action/shutdown', (req, res) => {
    console.log(res);
    exec('sudo shutdown now', (error, stdout, stderr) => {
        if(error){
            res.status(500).send(`Błąd: ${error.message}`);
            return;
        }
        res.send('System został pomyślnie wyłączony.');
    });
});

app.post('/action/restart', (req, res) => {
    console.log(res);
    exec('sudo reboot', (error, stdout, stderr) => {
        if(error){
            res.status(500).send(`Błąd: ${error.message}`);
            return;
        }
        res.send('System został pomyślnie zrestartowany.');
    });
});





// Ustawienie folderu, z którego będą serwowane pliki HTML i inne zasoby statyczne
app.use(express.static(path.join(__dirname, 'public')));

// Startowanie serwera
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    let isRecording;
    if(!isRecording){
        isRecording = true;
        startRecording();
    }
});
