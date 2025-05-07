const os = require('os');
const { exec } = require('child_process');

class SystemInfo{
    constructor() {}

    static getVoltage(){
        return new Promise((resolve, reject) => {
            exec('vcgencmd get_throttled', (error, stdout, stderr) => {
                if(error){
                    resolve({
                        throttled: 'N/A',
                        undervoltage: 'N/A',
                        error: error.message
                    });
                }else{
                    let Voltage = {
                        throttled: 'N/A',
                        undervoltage: 'N/A',
                        error: 'N/A'
                    };

                    Voltage.throttled = stdout.trim();

                    const throttledHex = parseInt(stdout.trim(), 16);
                    Voltage.undervoltage = (throttledHex & 0x10000) !== 0; // Sprawdzamy bit undervoltage

                    resolve(Voltage);
                }
            });
        });
    }

    static getCpuTemperature(){
        return new Promise((resolve, reject) => {
            exec('cat /sys/class/thermal/thermal_zone*/temp', (error, stdout, stderr) => {
                if(error){
                    resolve({
                        temperatures: 'N/A',
                        error: error.message
                    });
                }else{
                    let CpuTemperature = {
                        temperatures: 'N/A',
                        error: 'N/A'
                    };

                    const temps = stdout.split('\n').filter(line => line.trim() !== '');
                    const temp = parseInt(temps) / 1000
                    
                    CpuTemperature.temperatures = temp;
                    resolve(CpuTemperature);
                }
            });
        });
    }

    static getSystemLoad(){
        let SystemLoad = {
            load1: 'N/A',
            load5: 'N/A',
            load15: 'N/A',
            error: 'N/A'
        };

        try{
            const loadAvg = os.loadavg();
            SystemLoad.load1 = loadAvg[0];
            SystemLoad.load15 = loadAvg[1];
            SystemLoad.load5 = loadAvg[2];

            return SystemLoad;
        }catch(error){
            SystemLoad.error = error.message;
            return SystemLoad;
        }
    }

    static getMemoryUsage(){
        let MemoryUsage = {
            totalMemory: 'N/A',
            freeMemory: 'N/A',
            usedMemory: 'N/A',
            memoryUsagePercentage: 'N/A',
            error: 'N/A'
        };
    
        try{
            const totalMemoryBytes = os.totalmem();
            const freeMemoryBytes = os.freemem();
            const usedMemoryBytes = totalMemoryBytes - freeMemoryBytes;
    
            const totalMemoryGB = (totalMemoryBytes / (1024 * 1024 * 1024)).toFixed(2); // Konwersja na gigabajty z zaokrągleniem do dwóch miejsc po przecinku
            const freeMemoryGB = (freeMemoryBytes / (1024 * 1024 * 1024)).toFixed(2);
            const usedMemoryGB = (usedMemoryBytes / (1024 * 1024 * 1024)).toFixed(2);
    
            const memoryUsagePercentage = ((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2); // Obliczenie procentowego użycia pamięci
    
            MemoryUsage.totalMemory = `${totalMemoryGB} GB`;
            MemoryUsage.freeMemory = `${freeMemoryGB} GB`;
            MemoryUsage.usedMemory = `${usedMemoryGB} GB`;
            MemoryUsage.memoryUsagePercentage = `${memoryUsagePercentage}%`;
    
            return MemoryUsage;
        }catch (error){
            MemoryUsage.error = error.message;
            return MemoryUsage;
        }
    }
    

    static getDiskUsage(){
        return new Promise((resolve, reject) => {
            exec('df -h', (error, stdout, stderr) => {
                if(error){
                    console.error("Error retrieving disk usage:", error.message);
                    resolve(error.message);
                }
    
                const lines = stdout.split('\n'); // Dzielimy wynik na linie
                const diskUsageInfo = [];
    
                for(let i = 1; i < lines.length; i++){ // Pomijamy pierwszą linię z nagłówkami
                    const line = lines[i].split(/\s+/); // Dzielimy linię na kolumny, separator to dowolna liczba spacji
    
                    // Sprawdzamy, czy linia zawiera montowaną partycję / oraz czy jej rodzicem jest urządzenie USB
                    if(line.length >= 6 && line[5] === '/' || line[0].startsWith('/dev/sd')){
                        const disk = {
                            filesystem: line[0],
                            size: line[1],
                            used: line[2],
                            available: line[3],
                            usePercentage: line[4], // Procentowe użycie przestrzeni dyskowej
                            mountedOn: line[5]
                        };
                        diskUsageInfo.push(disk);
                    }
                }
    
                resolve(diskUsageInfo);
            });
        });
    }

}


module.exports = { SystemInfo };
