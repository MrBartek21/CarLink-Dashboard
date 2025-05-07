window.addEventListener("load", clock); 
fetchData();
setInterval(fetchData, 5000);


function clock(){
    var dzisiaj = new Date();
    var godzina = dzisiaj.getHours();
    var minuta = dzisiaj.getMinutes();
    var sekunda = dzisiaj.getSeconds();
    
    if(sekunda<10) sekunda = "0"+sekunda;
    if(minuta<10) minuta = "0"+minuta;
    if(godzina<10) godzina = "0"+godzina;


    document.querySelector("#clockNav").innerHTML = godzina+":"+minuta+":"+sekunda;


    setTimeout(clock, 1000); 
}

function fetchData(){
    const sysInfoDiv = document.querySelector('.sysinfo');
    const tempCPUNavDiv = document.querySelector('#tempCPUNav');
    const wifiSignalStrengthDiv = document.querySelector('#wifiSignalStrength');

    const tempWarningIcon = document.querySelector('#tempWarningIcon');
    const undervoltageIcon = document.querySelector('#undervoltageIcon');
    const bluetoothIcon = document.querySelector('#bluetoothIcon');
    const wifiIcon = document.querySelector('#wifiIcon');
    const ethernetIcon = document.querySelector('#ethernetIcon');
    const usbIcon = document.querySelector('#usbIcon');
    const pingIcon = document.querySelector('#pingIcon');

    const usbMounted = document.querySelector('#debugUsbMounted');
    const usbDiskUsage = document.querySelector('#usbDiskUsage');
    const fileList = document.querySelector('#fileList');

    fetch('/system/status')
        .then(response => response.json())
        .then(data => {
            const systemData = data.system;
            const networkData = data.network;

            const handlers = {
                /*'System_Voltage': () => {
                    //const voltage = parseFloat(systemData.voltage);
                    //undervoltageIcon.style.display = (voltage < 4.0) ? "inline" : "none";
                },*/

                'System_CpuTemperature': () => {
                    const temp = parseFloat(systemData.cpuTemperature);
                    tempWarningIcon.style.display = (temp > systemData.settings.warnTemperature) ? "inline" : "none";
                    tempCPUNavDiv.textContent = temp + "°" + systemData.settings.unitsTemperature;
                },

                'System_DiskUsage': () => {
                    const used = systemData.diskUsage.used;
                    const total = systemData.diskUsage.total;
                    const free = total - used;
                    const usagePercent = ((used / total) * 100).toFixed(1) + "%";

                    usbIcon.style.display = "inline";
                    usbDiskUsage.innerHTML = `
                        <div class="row align-items-center">
                            <div class="col"><span class="badge bg-success">Used: ${(used / 1024).toFixed(1)} GB</span></div>
                            <div class="col"><span class="badge bg-primary">Free: ${(free / 1024).toFixed(1)} GB</span></div>
                            <div class="col"><span class="badge bg-secondary">Total: ${(total / 1024).toFixed(1)} GB</span></div>
                            <div class="col"><span class="badge bg-info">Usage: ${usagePercent}</span></div>
                        </div>
                    `;
                },

                'Network_WifiInfo': () => {
                    const wifi = networkData.wifi;
                    if (wifi && wifi.ssid !== "") {
                        wifiIcon.style.display = "inline";
                        wifiSignalStrengthDiv.textContent = wifi.signalStrength;
                    } else {
                        wifiIcon.style.display = "none";
                        wifiSignalStrengthDiv.textContent = "";
                    }
                },

                'Network_EthernetInfo': () => {
                    const eth = networkData.ethernet;
                    ethernetIcon.style.display = (eth.status === "connected") ? "inline" : "none";
                }
            };

            // Uruchomienie wszystkich handlerów
            Object.values(handlers).forEach(fn => fn());


            
            // Tworzenie tabeli Bootstrap z danymi JSON
            const table = document.createElement('table');
            table.classList.add('table', 'table-dark', 'table-striped');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            // Dodanie nagłówków kolumn
            const headerRow = document.createElement('tr');
            const variableHeader = document.createElement('th');
            variableHeader.textContent = "Variable";
            const valueHeader = document.createElement('th');
            valueHeader.textContent = "Value";
            headerRow.appendChild(variableHeader);
            headerRow.appendChild(valueHeader);
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Iteracja przez właściwości obiektu JSON i tworzenie wierszy tabeli
            for(const key in data){
                const tr = document.createElement('tr');
                
                const variableCell = document.createElement('td');
                variableCell.textContent = key;
                const valueCell = document.createElement('td');


                // Sprawdzamy, czy wartość jest obiektem
                if(typeof data[key] === 'object'){
                    // Jeśli tak, sprawdzamy, czy jest to tablica (np. temperatures)
                    if(Array.isArray(data[key])){
                        // Jeśli tak, przetwarzamy tablicę i pobieramy jej elementy
                        const values = data[key].map(value => {
                            // Sprawdzamy, czy wartość jest obiektem (np. temperatures w formie {"temperatures":[36.998]})
                            if(typeof value === 'object'){
                                // Jeśli tak, zwracamy wartość jako JSON string
                                return JSON.stringify(value);
                            }else{
                                // Jeśli nie, zwracamy wartość bezpośrednio
                                return value;
                            }
                        });
                        // Łączymy elementy tablicy jako łańcuch znaków oddzielony przecinkami
                        valueCell.textContent = values.join(', ');
                    }else{
                        // Jeśli nie, konwertujemy obiekt na łańcuch znaków
                        valueCell.textContent = JSON.stringify(data[key]);
                    }
                }else{
                    // Jeśli nie, ustawiamy wartość bezpośrednio
                    valueCell.textContent = data[key];
                }

                

                tr.appendChild(variableCell);
                tr.appendChild(valueCell);
                tbody.appendChild(tr);

            }

            table.appendChild(tbody);
            sysInfoDiv.innerHTML = '';
            sysInfoDiv.appendChild(table);
        })
        .catch(error =>{
            log('error', 'fetchData', 'Błąd podczas pobierania danych '+error);
            sysInfoDiv.textContent = "Wystąpił błąd podczas pobierania danych. "+error;
        });
}

// TO DO 
// zrobić tutaj pobieranie statusów aby wyświetlać ikony na pasku u góry