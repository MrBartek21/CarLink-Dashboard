const express = require('express');
const path = require('path');
const fs = require('fs');

const SerialPort = require('serialport');
const WebSocket = require('ws');
const os = require('os');

const { SystemInfo } = require('./utils/SystemInfo');

const app = express();
const PORT = process.env.PORT || 3000;

// Ustawienie folderu, z którego będą serwowane pliki HTML i inne zasoby statyczne
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint do pobrania listy odtwarzania
app.get('/playlist', (req, res) => {
    const musicDir = path.join(__dirname, 'Music');
    fs.readdir(musicDir, (err, files) => {
      if (err) {
        console.error('Error reading music directory:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      const playlist = files
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          const [author, title] = file.replace('.mp3', '').split(' - ');
          return {
            name: title,
            author: author,
            src: `Music/${file}`
          };
        });
      res.json(playlist);
    });
  });

// Endpoint do obsługi plików muzycznych
app.get('/Music/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'Music', filename);
    
    // Serwowanie pliku muzycznego
    res.sendFile(filePath);
  });


// WebSocket dla przesyłania danych w czasie rzeczywistym
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  let portPath;

  if (os.platform() === 'win32') {
      portPath = 'COM3'; // Przykładowy port dla Windows, dostosuj według potrzeb
  } else {
      portPath = '/dev/ttyUSB0'; // Przykładowy port dla Linux, dostosuj według potrzeb
  }

  try {
      const port = new SerialPort(portPath, { baudRate: 115200 });

      port.on('data', function (data) {
          // Odebrano dane z portu USB, przekaż je przez WebSocket do klienta
          ws.send(data.toString());
      });

      port.on('error', function (err) {
          console.error('Serial port error:', err);
          ws.send(JSON.stringify({ error: 'Serial port error: ' + err.message }));
      });
  } catch (err) {
      console.error('Error opening serial port:', err);
      ws.send(JSON.stringify({ error: 'Error opening serial port: ' + err.message }));
  }
});


// Endpoint pobierający informacje i zwracający w formie JSON
app.get('/system-info', async (req, res) => {
    const systemInfo = {
        localIpAddress: SystemInfo.getLocalIpAddress(),
    };

    try{
        systemInfo.Voltage = await SystemInfo.getVoltage();
        //systemInfo.bluetoothDevices = await SystemInfo.getBluetoothDevices();
        systemInfo.CpuTemperature = await SystemInfo.getCpuTemperature();
        systemInfo.SystemLoad = SystemInfo.getSystemLoad();
        systemInfo.MemoryUsage = SystemInfo.getMemoryUsage();
        systemInfo.DiskUsage = await SystemInfo.getDiskUsage();
        systemInfo.NetworkStatus = await SystemInfo.getNetworkStatus();
        
        res.json(systemInfo);
    }catch (error){
        console.error("Error retrieving system information:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/action/shutdown', (req, res) => {
    exec('sudo shutdown now', (error, stdout, stderr) => {
        if(error){
            res.status(500).send(`Błąd: ${error.message}`);
            return;
        }
        res.send('System został pomyślnie wyłączony.');
    });
});

app.post('/action/restart', (req, res) => {
    exec('sudo reboot', (error, stdout, stderr) => {
        if(error){
            res.status(500).send(`Błąd: ${error.message}`);
            return;
        }
        res.send('System został pomyślnie zrestartowany.');
    });
});

// Startowanie serwera
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
