const os = require('os');
const { exec } = require('child_process');

class NetworkInfo {
    constructor() {}

    static getIpAddress(){
        const interfaces = os.networkInterfaces();
        for(const interfaceName in interfaces) {
            const iface = interfaces[interfaceName];
            for(const ifAddr of iface){
                if(ifAddr.family === 'IPv4' && !ifAddr.internal){
                    return ifAddr.address;
                }
            }
        }
        return null;
    }

    static getNetworkStatus(){
        return new Promise((resolve, reject) => {
            exec('ping -c 1 google.com', (error, stdout, stderr) => {
                if(error){
                    console.error("Error retrieving network status:", error.message);
                    resolve(JSON.stringify({ available: false, responseTime: null }));
                }else{
                    const match = stdout.match(/time=(\d+\.\d+) ms/); // Szukamy linii zawierającej czas odpowiedzi
                    if(match && match[1]){
                        const responseTime = parseFloat(match[1]);
                        resolve(JSON.stringify({ available: true, responseTime }));
                    }else{
                        resolve(JSON.stringify({ available: true, responseTime: null }));
                    }
                }
            });
        });
    }

    static getWifiInfo(){
        return new Promise((resolve, reject) => {
            exec('iwconfig wlan0', (error, stdout, stderr) => {
                if(error){
                    console.error("Error retrieving Wi-Fi connection:", error.message);
                    resolve({
                        interface: 'N/A',
                        essid: 'N/A',
                        accessPoint: 'N/A',
                        signalLevel: 'N/A'
                    });
                }else{
                    const lines = stdout.split('\n');
                    let wifiInfo = {
                        interface: 'N/A',
                        essid: 'N/A',
                        accessPoint: 'N/A',
                        signalLevel: 'N/A'
                    };
    
                    for(const line of lines){
                        const parts = line.trim().split(/\s+/);
    
                        if(parts.includes('wlan0')){
                            wifiInfo.interface = 'wlan0';
                        }
    
                        if(line.includes('ESSID:')){
                            const essidMatch = line.match(/ESSID:"([^"]+)"/);
                            if(essidMatch){
                                wifiInfo.essid = essidMatch[1];
                            }
                        }
    
                        const accessPointIndex = parts.indexOf('Point:') + 1;
                        if(accessPointIndex > 0 && accessPointIndex < parts.length){
                            wifiInfo.accessPoint = parts[accessPointIndex];
                        }
    
                        const signalLevelIndex = parts.findIndex(part => part.startsWith('level='));
                        if(signalLevelIndex !== -1){
                            wifiInfo.signalLevel = parts[signalLevelIndex].split('=')[1].replace('dBm', '').trim();
                        }
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
                    console.error("Error retrieving ethernet connection:", error.message);
                    resolve({
                        interface: 'N/A',
                        state: 'N/A',
                        mac: 'N/A'
                    });
                }else{
                    const lines = stdout.split('\n');
                    let ethernetConnection = {
                        interface: 'N/A',
                        state: 'N/A',
                        mac: 'N/A'
                    };
    
                    for(const line of lines){
                        const parts = line.trim().split(/\s+/);
    
                        if(parts.includes('eth0:')) ethernetConnection.interface = 'eth0';
    
                        if(parts.includes('state')){
                            const stateIndex = parts.findIndex(part => part === 'state') + 1;
                            if(stateIndex > 0 && stateIndex < parts.length){
                                ethernetConnection.state = parts[stateIndex];
                            }
                        }
    
                        if(parts.includes('link/ether')){
                            const macIndex = parts.findIndex(part => part === 'link/ether') + 1;
                            if(macIndex > 0 && macIndex < parts.length){
                                ethernetConnection.mac = parts[macIndex];
                            }
                        }
                    }
                    resolve(ethernetConnection);
                }
            });
        });
    }
}

module.exports = { NetworkInfo };