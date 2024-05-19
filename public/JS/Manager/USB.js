const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event){
    console.log('WebSocket connection established');
});

socket.addEventListener('message', function (event){
    // Wyświetlanie otrzymanych danych na stronie
    const dataDisplay = document.getElementById('gpsinfo');
    dataDisplay.innerHTML = 'Received data: ' + event.data;
});

socket.addEventListener('close', function (event){
    console.log('WebSocket connection closed');
});

socket.addEventListener('error', function (event){
    console.error('WebSocket error:', event);
});