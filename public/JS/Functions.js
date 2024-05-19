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

function fetchData(){
    const sysInfoDiv = document.querySelector('.sysinfo');
    const tempCPUNavDiv = document.querySelector('.tempCPUNav');

    const tempWarningIcon = document.querySelector('#tempWarningIcon');
    const undervoltageIcon = document.querySelector('#undervoltageIcon');
    const bluetoothIcon = document.querySelector('#bluetoothIcon');
    const wifiIcon = document.querySelector('#wifiIcon');
    const usbIcon = document.querySelector('#usbIcon');
    const gpsIcon = document.querySelector('#gpsIcon');

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
            variableHeader.textContent = "Zmienna";
            const valueHeader = document.createElement('th');
            valueHeader.textContent = "Wartość";
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

                // Sprawdzenie czy istnieje zmienna CpuTemperature
                if(key === 'CpuTemperature'){
                    try{
                        decodejson = JSON.parse(data[key]);

                        if(!decodejson.error){
                            if(decodejson.temperatures > 55) tempWarningIcon.style.display = "inline";
                            else tempWarningIcon.style.display = "none";
                            
                            tempCPUNavDiv.textContent = decodejson.temperatures + "℃";
                        }
                    }catch(error){
                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej CpuTemperature');
                    }
                }

                if(key === 'Voltage'){
                    try{
                        const decodejson = JSON.parse(data[key]);
                        const voltage = decodejson.voltage;

                        if(!decodejson.error){
                            if(voltage.undervoltage == true) undervoltageIcon.style.display = "inline";
                            else undervoltageIcon.style.display = "none";
                        }
                    }catch(error){
                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej Voltage '+error);
                    }
                }

                if(key === 'NetworkStatus'){
                    try{
                        decodejson = JSON.parse(data[key]);

                        if(!decodejson.error){
                            if(decodejson.available == true){
                                wifiIcon.style.display = "inline";
                            }else{
                                wifiIcon.style.display = "none";
                            }
                        }
                    }catch(error){
                        log('error', 'fetchData', 'Błąd podczas przetwarzania zmiennej NetworkStatus '+error);
                    }
                }

                tbody.appendChild(tr);
            }

            table.appendChild(tbody);
            sysInfoDiv.innerHTML = ''; // Wyczyszczenie poprzedniej zawartości
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