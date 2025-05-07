// Definicja przycisków, przypisanych menu oraz opisów
const menuButtons = [
    { id: "btnMenuBack", menu: "menuTile", desc: "Powrót do ekranu głównego" },
    { id: "btnTileDash", menu: "menuDash", desc: "Panel główny" },
    { id: "btnTileLed", menu: "menuLed", desc: "Sterowanie LED" },
    { id: "btnTilePump", menu: "menuPump", desc: "Sterowanie pompą" },
    { id: "btnTileDebug", menu: "menuDebug", desc: "Tryb debugowania" },
    { id: "btnTileFiles", menu: "menuFiles", desc: "Zarządzanie plikami" },
    { id: "btnTileLogs", menu: "menuLogs", desc: "Logi systemowe" },
    { id: "btnMenuCamera", menu: "menuCamera", desc: "Podgląd z kamery" },
    { id: "btnTileSettings", menu: "menuSettings", desc: "Ustawienia systemowe" },
    { id: "btnSpotify", menu: "menuSpotify", desc: "Spotify" },
    { id: "btnYouTube", menu: "menuYouTube", desc: "YouTube" },
    { id: "btnTileMusicPlaylist", menu: "menuMusicPlaylist", desc: "Lista odtwarzania" },
    { id: "btnMenuClimate", menu: "menuClimate", desc: "Klimatyzacja" },
    { id: "btnTileTest", menu: "menuTest", desc: "Testy systemowe" },
    { id: "btnTileSensors", menu: "menuSensors", desc: "Dane z czujników" },
    { id: "btnTileSCM", menu: "menuSCM", desc: "System Control Module" },

    { id: "btnScreenOff", menu: null, desc: "Wygaszacz ekranu" },

    { id: "btnMenuMusic", panel: "musicDiv", desc: "Muzyka" },
    { id: "btnMenuTel", panel: "telDiv", desc: "Telefon / alerty" },
    { id: "btnMenuCarState", panel: "carStateDiv", desc: "Stan pojazdu" }
];



document.addEventListener('DOMContentLoaded', function() {
    // Funkcja do przełączania widoczności menu
    function toggleMenu(menuId) {
        menuButtons.forEach(button => {
            const displayStyle = button.menu === menuId ? (menuId === "menuTile" ? 'flex' : 'block') : 'none';
            if (button.menu) {
                const el = document.getElementById(button.menu);
                if (el) el.style.display = displayStyle;
            }
        });
    }

    function showRightPanel(panelId) {
        const panels = ["musicDiv", "telDiv", "carStateDiv"];
        panels.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = (id === panelId) ? "block" : "none";
        });
    }

    // Obsługa kliknięć przycisków
    menuButtons.forEach(button => {
        const btnEl = document.getElementById(button.id);
        if (btnEl) {
            btnEl.addEventListener('click', () => {
                if (button.id === "btnScreenOff") {
                    activateScreenSaver();
                } else if (button.menu) {
                    toggleMenu(button.menu);
                } else if (button.panel) {
                    showRightPanel(button.panel);
                }
            });
        }
    });
});



// Funkcja aktywująca wygaszacz
function activateScreenSaver(){
    // Tworzymy ciemną nakładkę
    const overlay = document.createElement("div");
    overlay.id = "screenSaverOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "black";
    overlay.style.zIndex = "9999";
    overlay.style.cursor = "none";
    document.body.appendChild(overlay);

    // Po kliknięciu wygaszacz znika
    overlay.addEventListener("click", () => {
        overlay.remove();
    });
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