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

// TO DO
//zrobic odbieranie danych do wysłania do usb
// zrobic endpoint wysyłający stany ikoonek na navbar
// zrobić hex to rgb dla led




//===================================================================================================
//============================================[Variables]============================================
//===================================================================================================

// create application/json parser
var jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express();
const PORT = process.env.PORT || 3000;
const TITLE = "Main Page · CarLink v9"
// Ścieżka do folderu z muzyką
const musicDir = path.join(__dirname, 'Files_Music');
const settingsFile = 'settings.json';






//===================================================================================================
//============================================[Endpoints]============================================
//===================================================================================================

//Multimedia - Playlisty i Piosenki
// Zwraca listę playlist
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

// Zwraca szczegóły i listę piosenek z jednej playlisty
app.get('/playlists/:playlistId', (req, res) => {
    const playlistName = req.params.playlistId;
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
                src: `playlists/${playlistName}/songs/${file}`
            };
        });
        res.json(playlist);
    });
});

// Zwraca dane konkretnej piosenki w playliście
app.get('/playlists/:playlistId/songs/:songId', (req, res) => {
    const filePath = path.join(__dirname, 'Files_Music', req.params.playlistId, req.params.songId);
    
    // Serwowanie pliku muzycznego
    res.sendFile(filePath);
});



//System - Informacje, Statusy i Ustawienia
// Zwraca status systemu (ikony stanu, np. WiFi, GPS, LTE, bateria)
const DEBUG_MODE = true;
const readSettingsFile = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));

app.get('/system/status', async (req, res) => {
    const status = {};

    try {
        if (DEBUG_MODE) {
            // Losowe dane debug
            status.system = {
                voltage: (Math.random() * (5 - 3.3) + 3.3).toFixed(2), // np. 3.3V - 5V
                cpuTemperature: (Math.random() * (85 - 40) + 40).toFixed(1), // 40°C - 85°C
                systemLoad: {
                    oneMinute: Math.random().toFixed(2),
                    fiveMinutes: Math.random().toFixed(2),
                    fifteenMinutes: Math.random().toFixed(2),
                },
                memoryUsage: {
                    total: 4096,
                    used: Math.floor(Math.random() * 4096),
                },
                diskUsage: {
                    total: 128000,
                    used: Math.floor(Math.random() * 128000),
                },
                settings: {
                    warnTemperature: readSettingsFile.warnTemp,
                    unitsTemperature: readSettingsFile.units.temperature,
                },
            };

            status.network = {
                networkStatus: 'connected',
                wifi: {
                    ssid: 'DebugNet',
                    signalStrength: Math.floor(Math.random() * 100),
                    ip: '192.168.0.' + Math.floor(Math.random() * 255),
                },
                ethernet: {
                    status: 'connected',
                    ip: '10.0.0.' + Math.floor(Math.random() * 255),
                },
            };

        } else {
            // Rzeczywiste dane
            status.system = {
                voltage: await SystemInfo.getVoltage(),
                cpuTemperature: await SystemInfo.getCpuTemperature(),
                systemLoad: SystemInfo.getSystemLoad(),
                memoryUsage: SystemInfo.getMemoryUsage(),
                diskUsage: await SystemInfo.getDiskUsage(),
                settings: {
                    warnTemperature: readSettingsFile.warnTemperature,
                    unitsTemperature: readSettingsFile.units.temperature,
                },
            };

            status.network = {
                networkStatus: await NetworkInfo.getNetworkStatus(),
                wifi: await NetworkInfo.getWifiInfo(),
                ethernet: await NetworkInfo.getEthernetInfo(),
            };

            // status.bluetooth = await SystemInfo.getBluetoothDevices();
        }

        res.json(status);
    } catch (error) {
        console.error("Error retrieving system status:", error);
        res.status(500).json({ error: error.message });
    }
});


// Pobiera aktualne ustawienia systemowe
app.get('/system/settings', (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(path.join(__dirname, settingsFile), 'utf8'));
        res.json(settings);
    } catch (err) {
        console.error('Error reading settings file:', err);
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

// Aktualizuje ustawienia systemowe
app.put('/system/settings', jsonParser, (req, res) => {
    const updatedSettings = req.body;

    fs.readFile(path.join(__dirname, settingsFile), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading settings file:', err);
            return res.status(500).json({ error: 'Failed to read settings' });
        }

        let settings;
        try {
            settings = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing settings file:', parseErr);
            return res.status(500).json({ error: 'Invalid settings format' });
        }

        const newSettings = { ...settings, ...updatedSettings };

        fs.writeFile(path.join(__dirname, settingsFile), JSON.stringify(newSettings, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing settings file:', err);
                return res.status(500).json({ error: 'Failed to write settings' });
            }

            res.json(newSettings);
        });
    });
});

// Wykonuje akcję systemową (np. reboot, shutdown, sleep)
app.post('/action/:type', (req, res) => {
    const action = req.params.type;
    console.log(`Wykonywana akcja: ${action}`);

    let command;
    switch (action) {
        case 'shutdown':
            command = 'sudo shutdown now';
            break;
        case 'restart':
        case 'reboot':
            command = 'sudo reboot';
            break;
        case 'sleep':
            command = 'sudo systemctl suspend';
            break;
        default:
            res.status(400).send(`Nieznana akcja: ${action}`);
            return;
    }

    exec(command, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send(`Błąd: ${error.message}`);
            return;
        }
        res.send(`System wykonał akcję: ${action}`);
    });
});



// USB i Urządzenia Multimedialne







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



/*
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
*/


// Ustawienie katalogu z widokami
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Ustawienie folderu, z którego będą serwowane pliki HTML i inne zasoby statyczne
app.use(express.static(path.join(__dirname, 'public')));

// Strona główna
app.get('/', (req, res) => {
    res.render('index', { title: TITLE });
  });

// Startowanie serwera
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
