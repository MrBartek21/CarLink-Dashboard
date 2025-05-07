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
    fetch('/system/settings')
        .then(response => response.json())
        .then(data => {
            let decodeData = JSON.stringify(data);
            document.getElementById('debugSettings').innerText = decodeData;
            
            let obj = JSON.parse(decodeData);

            obj[settings] = value;

            console.log(obj);

            // Wysyłanie zaktualizowanych ustawień na endpoint
            fetch('/system/settings', {
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
        case 'screen_off':
            activateScreenSaver();
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