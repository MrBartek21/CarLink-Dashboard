const os = require('os');
const { exec } = require('child_process');

class NetworkInfo {
    constructor() {}

    static getNetworkStatus(){
        return new Promise((resolve, reject) => {
            exec('ping -c 1 google.com', (error, stdout, stderr) => {
                if(error){
                    console.error("Error retrieving network status:", error.message);
                    resolve({
                        available: false,
                        responseTime: 'N/A',
                        error: error.message
                    });
                }else{
                    const match = stdout.match(/time=(\d+\.\d+) ms/); // Szukamy linii zawierającej czas odpowiedzi
                    if(match && match[1]){
                        const responseTime = parseFloat(match[1]);
                        resolve({
                            available: true,
                            responseTime: responseTime,
                            error: 'N/A'
                        });
                    }else{
                        resolve({
                            available: true,
                            responseTime: 'N/A',
                            error: 'N/A'
                        });
                    }
                }
            });
        });
    }

    static getWifiInfo(){
        return new Promise((resolve, reject) => {
            exec('iwconfig wlan0', (error, stdout, stderr) => {
                if(error){
                    //console.error("Error retrieving Wi-Fi connection:", error.message);
                    resolve({
                        interface: 'N/A',
                        essid: 'N/A',
                        accessPoint: 'N/A',
                        signalLevel: 'N/A',
                        ipAddress: 'N/A',
                        error: error.message
                    });
                }else{
                    const lines = stdout.split('\n');
                    let wifiInfo = {
                        interface: 'N/A',
                        essid: 'N/A',
                        accessPoint: 'N/A',
                        signalLevel: 'N/A',
                        ipAddress: 'N/A',
                        error: 'N/A'
                    };
    
                    for(const line of lines){
                        const parts = line.trim().split(/\s+/);
    
                        if(parts.includes('wlan0')) wifiInfo.interface = 'wlan0';
                        
    
                        if(line.includes('ESSID:')){
                            const essidMatch = line.match(/ESSID:"([^"]+)"/);
                            if(essidMatch) wifiInfo.essid = essidMatch[1];
                        }
    
                        const accessPointIndex = parts.indexOf('Point:') + 1;
                        if(accessPointIndex > 0 && accessPointIndex < parts.length) wifiInfo.accessPoint = parts[accessPointIndex];
                        
    
                        const signalLevelIndex = parts.findIndex(part => part.startsWith('level='));
                        if(signalLevelIndex !== -1) wifiInfo.signalLevel = parts[signalLevelIndex].split('=')[1].replace('dBm', '').trim();
                        

                         // Fetch IP address for wlan0
                        exec('ip -4 addr show wlan0', (ipError, ipStdout, ipStderr) => {
                            if(ipError) wifiInfo.error = ipError.message;
                            else{
                                const ipMatch = ipStdout.match(/inet (\d+\.\d+\.\d+\.\d+)/);
                                if(ipMatch) wifiInfo.ipAddress = ipMatch[1];
                            }
                        });
                    }
                    resolve(wifiInfo);
                }
            });
        });
    }

    static getEthernetInfo(){
        return new Promise((resolve, reject) => {
            exec('ip link show eth0', (error, stdout, stderr) => {
                if(error){
                    resolve({
                        interface: 'N/A',
                        state: 'N/A',
                        mac: 'N/A',
                        ipAddress: 'N/A',
                        error: error.message
                    });
                }else{
                    const lines = stdout.split('\n');
                    let ethernetConnection = {
                        interface: 'N/A',
                        state: 'N/A',
                        mac: 'N/A',
                        ipAddress: 'N/A',
                        error: 'N/A'
                    };
    
                    for(const line of lines){
                        const parts = line.trim().split(/\s+/);
    
                        if(parts.includes('eth0:')) ethernetConnection.interface = 'eth0';
    
                        if(parts.includes('state')){
                            const stateIndex = parts.findIndex(part => part === 'state') + 1;
                            if(stateIndex > 0 && stateIndex < parts.length) ethernetConnection.state = parts[stateIndex];
                        }
    
                        if(parts.includes('link/ether')){
                            const macIndex = parts.findIndex(part => part === 'link/ether') + 1;
                            if(macIndex > 0 && macIndex < parts.length) ethernetConnection.mac = parts[macIndex].toUpperCase();
                            
                        }
                    }

                    // Fetch IP address for eth0
                    exec('ip -4 addr show eth0', (ipError, ipStdout, ipStderr) => {
                        if(ipError) ethernetConnection.error = ipError.message;
                        else{
                            const ipMatch = ipStdout.match(/inet (\d+\.\d+\.\d+\.\d+)/);
                            if(ipMatch) ethernetConnection.ipAddress = ipMatch[1];
                        }
                        resolve(ethernetConnection);
                    });
                }
            });
        });
    }
}

module.exports = { NetworkInfo };
