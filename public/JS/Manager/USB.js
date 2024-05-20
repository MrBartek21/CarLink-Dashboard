const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event){
    log('log', 'USBManager', 'WebSocket connection established');
});

let buffer = '';
socket.addEventListener('message', function (event){
    const newData = event.data;

    if(buffer === '' && newData.includes('{')) buffer += newData.slice(newData.indexOf('{'));
    else buffer += newData;
    

    if(buffer.includes('}')){
        try{
            const startIndex = buffer.indexOf('{');
            const endIndex = buffer.lastIndexOf('}') + 1;
            const jsonData = buffer.slice(startIndex, endIndex);
    
            const parsedData = JSON.parse(jsonData);
            const dataType = parsedData.type;
            const dataValue = parsedData.data;

            if(dataType == "gps"){
                const table = createTable(dataValue);
                const dataDisplay = document.querySelector('.gpsinfo');
                dataDisplay.innerHTML = '';
                dataDisplay.appendChild(table);
            }else if(dataType == "car"){
                const table = createTable(dataValue);
                const dataDisplay = document.querySelector('.carinfo');
                dataDisplay.innerHTML = '';
                dataDisplay.appendChild(table);
            }else if(dataType == "power"){
                const table = createTable(dataValue);
                const dataDisplay = document.querySelector('.powerinfo');
                dataDisplay.innerHTML = '';
                dataDisplay.appendChild(table);
            }else if(dataType == "scm"){
                const table = createTable(dataValue);
                const dataDisplay = document.querySelector('.scminfo');
                dataDisplay.innerHTML = '';
                dataDisplay.appendChild(table);
            }
    
            buffer = '';
        }catch (error){
            log("error", "USB", error);
        }
    }
});


function createTable(data){
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
    const jsonValueHeader = document.createElement('th');
    jsonValueHeader.textContent = "Description";
    headerRow.appendChild(variableHeader);
    headerRow.appendChild(valueHeader);
    headerRow.appendChild(jsonValueHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    for(const key in data){
        const tr = document.createElement('tr');

        const variableCell = document.createElement('td');
        variableCell.textContent = key;
        const valueCell = document.createElement('td');
        const jsonValueCell = document.createElement('td');

        // Sprawdzamy, czy wartość jest obiektem
        if(typeof data[key] === 'object'){
            // Jeśli tak, sprawdzamy, czy jest to tablica
            if(Array.isArray(data[key])){
                valueCell.textContent = data[key].join(', '); // Łączymy elementy tablicy jako łańcuch znaków
            }else{
                valueCell.textContent = JSON.stringify(data[key]); // Konwertujemy obiekt na łańcuch znaków
            }

            // Ustawiamy wartość JSON jako tekst
            jsonValueCell.textContent = JSON.stringify(data[key]);
        }else{
            valueCell.textContent = data[key]; // Ustawiamy wartość bezpośrednio
            jsonValueCell.textContent = ""; // Pusta wartość dla wartości JSON
        }

        tr.appendChild(variableCell);
        tr.appendChild(valueCell);
        tr.appendChild(jsonValueCell); // Dodanie komórki dla wartości JSON do wiersza

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    return table;
}

socket.addEventListener('close', function (event){
    log('log', 'USBManager', 'WebSocket connection closed');
});

socket.addEventListener('error', function (event){
    log('error', 'USBManager', 'WebSocket error:'+event);
});