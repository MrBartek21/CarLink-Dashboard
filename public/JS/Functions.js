window.addEventListener("load", zegar); 


function log(type="log", source="null", message){
    const logsDiv = document.querySelector('.logs');

    // Pobieranie aktualnej daty i czasu
    const currentTime = new Date().toLocaleString();

    // Dodawanie logu do konsoli
    switch(type){
        case 'error':
            console.error(`[${currentTime}] [${source}] Error: ${message}`);
            break;
        case 'warning':
            console.warn(`[${currentTime}] [${source}] Warning: ${message}`);
            break;
        default:
            console.log(`[${currentTime}] [${source}] ${message}`);
            break;
    }

    // Sprawdzanie liczby istniejących logów
    const logsCount = logsDiv.children.length;
    if(logsCount >= 15){
        // Usunięcie najstarszego logu
        logsDiv.removeChild(logsDiv.children[0]);
    }

    // Dodawanie logu do tabelki
    const newRow = document.createElement('tr');
    switch(type){
        case 'error':
            newRow.innerHTML = `
                <td>${currentTime}</td>
                <td class="table-danger">${type}</td>
                <td>${source}</td>
                <td>${message}</td>
            `;
            break;
        case 'warning':
            newRow.innerHTML = `
                <td>${currentTime}</td>
                <td class="table-warning">${type}</td>
                <td>${source}</td>
                <td>${message}</td>
            `;
            break;
        default:
            newRow.innerHTML = `
                <td>${currentTime}</td>
                <td>${type}</td>
                <td>${source}</td>
                <td>${message}</td>
            `;
            break;
    }
    logsDiv.appendChild(newRow);
}

function setSettings(settings, value){
    fetch('/getSettings')
        .then(response => response.json())
        .then(data => {
            let decodeData = JSON.stringify(data);
            document.getElementById('debugSettings').innerText = decodeData;
            
            let obj = JSON.parse(decodeData);

            obj[settings] = value;

            console.log(obj);

            // Wysyłanie zaktualizowanych ustawień na endpoint
            fetch('/setSettings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
            })
            .then(response => response.json())
            .then(updatedSettings => {
                log('log', 'setSettings', 'Updated settings: '+updatedSettings);
                if(settings == "defaultPlaylist"){
                    document.querySelectorAll('.playlist-icon').forEach(icon => {
                        if(icon.dataset.playlist === value) icon.innerHTML = '<i class="bi bi-star-fill"></i>';
                        else icon.innerHTML = '<i class="bi bi-star"></i>';
                    });
                }
            })
            .catch(error => {
                log('error', 'setSettings', 'Error updating settings: '+error);
            });
        })
        .catch(error => {
            log('error', 'setSettings', 'Error in getSettings: '+error);
        });
}

function loadDirectory(path){
    fetch(`/files${path}`)
        .then(response => response.json())
        .then(data => {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';

            if (path !== '/') {
                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item list-group-item-secondary';
                listItem.textContent = 'Go up..';
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('click', () => {
                    loadDirectory(parentPath);
                });
                fileList.appendChild(listItem);
            }

            data.forEach(file => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.textContent = file.name;

                if (file.isDirectory) {
                    listItem.style.fontWeight = 'bold';
                    listItem.style.cursor = 'pointer';
                    listItem.addEventListener('click', () => {
                        loadDirectory(file.path);
                    });
                }

                fileList.appendChild(listItem);
            });

            currentPath = path;
        })
        .catch(error => console.error('Error fetching files:', error));
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

    fetch('/system-info')
        .then(response => response.json())
        .then(data => {
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



                if(key === 'System_Voltage'){
                    const dataJson = data[key];

                    if(dataJson.error == "N/A"){
                        if(dataJson.undervoltage == true) undervoltageIcon.style.display = "inline";
                        else undervoltageIcon.style.display = "none";
                    }else{
                        undervoltageIcon.style.display = "none";

                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej '+key+': '+dataJson.error);
                    }
                }

                if(key === 'System_CpuTemperature'){
                    const dataJson = data[key];

                    if(dataJson.error == "N/A"){
                        if(dataJson.temperatures > 55) tempWarningIcon.style.display = "inline";
                        else tempWarningIcon.style.display = "none";

                        tempCPUNavDiv.textContent = dataJson.temperatures + "℃";
                    }else{
                        tempWarningIcon.style.display = "inline";
                        tempCPUNavDiv.textContent = "N/A℃";

                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej '+key+': '+dataJson.error);
                    }
                }

                if(key === 'Network_NetworkStatus'){
                    const dataJson = data[key];

                    if(dataJson.error == "N/A"){
                        if(dataJson.available == true) pingIcon.style.display = "inline";
                        else pingIcon.style.display = "none";
                    }else{
                        pingIcon.style.display = "none";

                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej '+key+': '+dataJson.error);
                    }
                }

                if(key === 'Network_WifiInfo'){
                    const dataJson = data[key];

                    if(dataJson.error == "N/A"){
                        if(dataJson.essid != "N/A"){
                            wifiIcon.style.display = "inline";

                            wifiSignalStrengthDiv.textContent = dataJson.signalLevel;
                        }else{
                            wifiIcon.style.display = "none";
                            wifiSignalStrengthDiv.textContent = "";
                        }
                    }else{
                        wifiIcon.style.display = "none";
                        wifiSignalStrengthDiv.textContent = "";

                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej '+key+': '+dataJson.error);
                    }
                }

                if(key === 'Network_EthernetInfo'){
                    const dataJson = data[key];

                    if(dataJson.error == "N/A"){
                        if(dataJson.state == "UP") ethernetIcon.style.display = "inline";
                        else ethernetIcon.style.display = "none";
                    }else{
                        ethernetIcon.style.display = "none";

                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej '+key+': '+dataJson.error);
                    }
                }

                if(key === 'System_DiskUsage'){
                    const dataJson = data[key];
                    let foundUsb = false;

                    dataJson.forEach(disk => {
                        //console.log(`Filesystem: ${disk.filesystem}, Size: ${disk.size}, Used: ${disk.used}, Available: ${disk.available}, Use Percentage: ${disk.usePercentage}`);

                        if(disk.filesystem.startsWith('/dev/sd')){
                            usbIcon.style.display = "inline";
                            foundUsb = true;

                            const diskUsageText = `
                                <div class="row align-items-center">
                                    <div class="col"><span class="badge bg-success">Used: ${disk.used} GB</span></div>
                                    <div class="col"><span class="badge bg-primary">Free: ${disk.available} GB</span></div>
                                    <div class="col"><span class="badge bg-secondary">Total: ${disk.size} GB</span></div>
                                    <div class="col"><span class="badge bg-info">Usage: ${disk.usePercentage}</span></div>
                                </div>
                                `;

                            usbDiskUsage.innerHTML = diskUsageText;

                            const usbMountedValue = usbMounted.textContent;
                            if(usbMountedValue == "NONE"){
                                loadDirectory(disk.mountedOn);
                                usbMounted.textContent = disk.mountedOn;
                            }

                        }
                    });

                    // Jeśli nie znaleziono żadnego dysku zaczynającego się od '/dev/sd'
                    if(!foundUsb){
                        usbIcon.style.display = "none";
                        usbMounted.textContent = "NONE";

                        usbDiskUsage.innerHTML = '';
                        fileList.innerHTML = '<li class="list-group-item">No USB device connected</li>';
                    }
                }
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

function menuAction(action){
    switch (action) {
        case 'fullscreen':
            document.documentElement.requestFullscreen();
            break;
        case 'exit_fullscreen':
            document.exitFullscreen();
            break;
        case 'refresh':
            location.reload();
            break;
        case 'close_browser':
            window.close();
            break;
        case 'shutdown':
            executeAction('shutdown');
            break;
        case 'restart':
                executeAction('restart');
                break;
        case 'start_recording':
            executeAction('start-recording');
            break;
        case 'stop_recording':
            executeAction('stop-recording');
            break;
        default:
            log('error', 'menuAction', 'Nieprawidłowa akcja.');
            break;
    }
}

function executeAction(action){
    fetch(`/action/${action}`,{
        method: 'POST'
    })
    .then(response => {
        if(!response.ok){
            throw new Error(response.status);
        }
        return response.text();
    })
    .then(data => {
        log('log', 'executeAction', data);
    })
    .catch(error => {
        log('error', 'executeAction', `Wystąpił błąd: ${error}`);
    });
}

// Function to convert hex value to rgb array
function hexToRgb(hex){
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function zegar(){
    var dzisiaj = new Date();
    var godzina = dzisiaj.getHours();
    var minuta = dzisiaj.getMinutes();
    var sekunda = dzisiaj.getSeconds();
    
    if(sekunda<10) sekunda = "0"+sekunda;
    if(minuta<10) minuta = "0"+minuta;
    if(godzina<10) godzina = "0"+godzina;


    document.querySelector("#clockNav").innerHTML = godzina+":"+minuta+":"+sekunda;


    setTimeout(zegar, 1000); 
}


function updateVolumeLabel(sliderId, labelId){
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    label.textContent = slider.value;
}
  
function muteAll(){
    document.getElementById('musicVolume').value = 0;
    document.getElementById('navVolume').value = 0;
    document.getElementById('notifVolume').value = 0;
    updateVolumeLabel('musicVolume', 'musicVolumeValue');
    updateVolumeLabel('navVolume', 'navVolumeValue');
    updateVolumeLabel('notifVolume', 'notifVolumeValue');
}




function updateScreen(newScreen){
    const screen1 = document.querySelector('#screen1');
    const screen2 = document.querySelector('#screen2');
    const screen3 = document.querySelector('#screen3');

    if(newScreen == 0){
        screen1.style.display = "flex";
        screen2.style.display = "none";
        screen3.style.display = "none";
    }else if(newScreen == 1){
        screen1.style.display = "none";
        screen2.style.display = "flex";
        screen3.style.display = "none";
    }else if(newScreen == 2){
        screen1.style.display = "none";
        screen2.style.display = "none";
        screen3.style.display = "flex";
    }
}


function goToScreen(slideIndex){
    updateScreen(slideIndex);

    document.querySelectorAll('.screen-button').forEach((button, index) => {
        button.classList.toggle('active', index === slideIndex);
    });
}