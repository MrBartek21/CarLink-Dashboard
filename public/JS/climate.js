// Tablica z konfiguracją przycisków i ich funkcji
const controls = [
    {
        id: 'temp-up',
        action: () => {
            updateTemperature(1); // Zwiększ temperaturę
        }
    },
    {
        id: 'temp-down',
        action: () => {
            updateTemperature(-1); // Zmniejsz temperaturę
        }
    },
    {
        id: 'ac-toggle',
        action: () => {
            toggleAC(); // Włącz/wyłącz klimatyzację
        }
    },
    {
        id: 'auto-toggle',
        action: () => {
            toggleAuto(); // Włącz/wyłącz tryb automatyczny
        }
    },
    {
        id: 'recirc-toggle',
        action: () => {
            toggleRecirc(); // Włącz/wyłącz recyrkulację powietrza
        }
    },
    {
        id: 'defrost-toggle',
        action: () => {
            toggleDefrost(); // Włącz/wyłącz odmrażanie
        }
    },
    {
        id: 'rear-window-heating',
        action: () => {
            toggleRearWindowHeating(); // Włącz/wyłącz ogrzewanie tylnej szyby
        }
    },
    {
        id: 'fan-speed',
        action: () => {
            adjustFanSpeed(); // Ustaw prędkość wentylatora
        }
    },
    {
        id: 'dir-face',
        action: () => {
            setAirflowDirection('face'); // Ustaw nawiew na twarz
        }
    },
    {
        id: 'dir-feet',
        action: () => {
            setAirflowDirection('feet'); // Ustaw nawiew na nogi
        }
    },
    {
        id: 'dir-windshield',
        action: () => {
            setAirflowDirection('windshield'); // Ustaw nawiew na szybę
        }
    }
];

// Inicjalizacja obsługi przycisków
controls.forEach(control => {
    const button = document.getElementById(control.id);
    if (button) {
        button.addEventListener('click', control.action);
    }
});

// Przykładowe funkcje, które mogą być wywoływane przez przyciski

function updateTemperature(change) {
    let currentTemp = parseInt(document.getElementById('ac-temperature').textContent);
    currentTemp += change;
    document.getElementById('ac-temperature').textContent = `${currentTemp}°C`;
}

function toggleAC() {
    const acButton = document.getElementById('ac-toggle');
    acButton.classList.toggle('btn-outline-info');
    acButton.classList.toggle('btn-info');
    // Możesz dodać logikę do włączania/wyłączania klimatyzacji
}

function toggleAuto() {
    const autoButton = document.getElementById('auto-toggle');
    autoButton.classList.toggle('btn-outline-warning');
    autoButton.classList.toggle('btn-warning');
    // Możesz dodać logikę do włączania/wyłączania trybu auto
}

function toggleRecirc() {
    const recircButton = document.getElementById('recirc-toggle');
    recircButton.classList.toggle('btn-outline-secondary');
    recircButton.classList.toggle('btn-secondary');
    // Logika do włączania/wyłączania recyrkulacji powietrza
}

function toggleDefrost() {
    const defrostButton = document.getElementById('defrost-toggle');
    defrostButton.classList.toggle('btn-outline-danger');
    defrostButton.classList.toggle('btn-danger');
    // Logika do włączania/wyłączania odmrażania
}

function toggleRearWindowHeating() {
    const rearWindowHeatingButton = document.getElementById('rear-window-heating');
    rearWindowHeatingButton.classList.toggle('btn-outline-danger');
    rearWindowHeatingButton.classList.toggle('btn-danger');
    // Logika do włączania/wyłączania ogrzewania tylnej szyby
}

function adjustFanSpeed() {
    const fanSpeed = document.getElementById('fan-speed').value;
    document.getElementById('fan-level').textContent = fanSpeed;
}

function setAirflowDirection(direction) {
    // Zmieniamy kierunek nawiewu
    console.log(`Ustawiono nawiew na: ${direction}`);
}
