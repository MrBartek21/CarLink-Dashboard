const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event){
    log('log', 'USBManager', 'WebSocket connection established');
});

let buffer = ''; // Inicjalizacja bufora

socket.addEventListener('message', function (event) {
    const newData = event.data; // Nowe dane zdarzenia

    // Sprawdź, czy bufor jest pusty i nowe dane zawierają znak "{", jeśli tak, zacznij łączyć
    if (buffer === '' && newData.includes('{')) {
        buffer += newData.slice(newData.indexOf('{')); // Dołącz nowe dane od znaku "{"
    } else {
        buffer += newData; // Dołącz nowe dane do bufora
    }

    // Jeśli bufor zawiera znak "}", parsuj i wyświetl dane, a następnie wyczyść bufor
    if (buffer.includes('}')) {
        try {
            const startIndex = buffer.indexOf('{'); // Znajdź indeks początku obiektu JSON
            const endIndex = buffer.lastIndexOf('}') + 1; // Znajdź indeks końca obiektu JSON
            const jsonData = buffer.slice(startIndex, endIndex); // Wyciągnij JSON z bufora
    
            console.log('JSON Data:', jsonData); // Wyświetl JSON Data w konsoli (do celów diagnostycznych)
    
            const parsedData = JSON.parse(jsonData); // Parsuj JSON
    
            const dataDisplay = document.querySelector('.gpsinfo');
            dataDisplay.innerHTML = 'Received data: ' + JSON.stringify(parsedData); // Wyświetl dane
    
            buffer = ''; // Wyczyść bufor
        } catch (error) {
            console.error('Error parsing JSON:', error); // Obsługa błędu parsowania JSON
        }
    }
});

socket.addEventListener('close', function (event){
    log('log', 'USBManager', 'WebSocket connection closed');
});

socket.addEventListener('error', function (event){
    log('error', 'USBManager', 'WebSocket error:'+event);
});