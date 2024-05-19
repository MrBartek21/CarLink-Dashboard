const socket = new WebSocket('ws://localhost:8080');

// Obsługa zdarzenia otwarcia połączenia WebSocket
socket.addEventListener('open', function (event) {
    console.log('WebSocket connection established');
});

// Obsługa zdarzenia otrzymania wiadomości
socket.addEventListener('message', function (event) {
    // Wyświetlanie otrzymanych danych na stronie
    const dataDisplay = document.getElementById('gpsinfo');
    dataDisplay.innerHTML = 'Received data: ' + event.data;
});

// Obsługa zdarzenia zamknięcia połączenia WebSocket
socket.addEventListener('close', function (event) {
    console.log('WebSocket connection closed');
});

// Obsługa zdarzenia błędu połączenia WebSocket
socket.addEventListener('error', function (event) {
    console.error('WebSocket error:', event);
});