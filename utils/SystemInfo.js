const os = require('os');
const { exec } = require('child_process');

class SystemInfo{
    constructor() {}

    static getVoltage(){
        return new Promise((resolve, reject) => {
            exec('vcgencmd get_throttled', (error, stdout, stderr) => {
                if(error){
                    console.error("Error retrieving voltage:", error.message);
                    resolve(JSON.stringify({ error: error.message }));
                }else{
                    const throttledHex = parseInt(stdout.trim(), 16);
                    const undervoltageDetected = (throttledHex & 0x10000) !== 0; // Sprawdzamy bit undervoltage
                    const voltage = {
                        value: stdout.trim(),
                        undervoltage: undervoltageDetected
                    };
                    resolve(JSON.stringify({ voltage }));
                }
            });
        });
    }

    static getCpuTemperature(){
        return new Promise((resolve, reject) => {
            exec('cat /sys/class/thermal/thermal_zone*/temp', (error, stdout, stderr) => {
                if(error){
                    console.error("Error retrieving CPU temperature:", error.message);
                    resolve(JSON.stringify({ error: error.message }));
                }else{
                    const temps = stdout.split('\n').filter(line => line.trim() !== ''); // Dzielimy wynik na linie i usuwamy puste linie
                    const temperatures = temps.map(temp => {
                        const temperature = parseInt(temp) / 1000; // Konwertujemy wartość na stopnie Celsiusza
                        return temperature;
                    });
                    resolve(JSON.stringify({ temperatures }));
                }
            });
        });
    }

    static getSystemLoad(){
        return os.loadavg(); // Zwraca tablicę obciążenia systemu w ciągu ostatnich 1, 5 i 15 minut
    }

    static getMemoryUsage(){
        const totalMemoryBytes = os.totalmem();
        const freeMemoryBytes = os.freemem();
        const usedMemoryBytes = totalMemoryBytes - freeMemoryBytes;
    
        const totalMemoryGB = (totalMemoryBytes / (1024 * 1024 * 1024)).toFixed(2); // Konwersja na gigabajty z zaokrągleniem do dwóch miejsc po przecinku
        const freeMemoryGB = (freeMemoryBytes / (1024 * 1024 * 1024)).toFixed(2);
        const usedMemoryGB = (usedMemoryBytes / (1024 * 1024 * 1024)).toFixed(2);
    
        const memoryUsagePercentage = ((usedMemoryBytes / totalMemoryBytes) * 100).toFixed(2); // Obliczenie procentowego użycia pamięci
    
        return{
            totalMemory: `${totalMemoryGB} GB`,
            freeMemory: `${freeMemoryGB} GB`,
            usedMemory: `${usedMemoryGB} GB`,
            memoryUsagePercentage: `${memoryUsagePercentage}%`
        };
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
