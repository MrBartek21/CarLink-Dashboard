function toggleKeyboard(targetInputId){
    const keyboard = document.getElementById('keyboard');
    const isKeyboardVisible = (keyboard.style.display === 'block');
    keyboard.style.display = isKeyboardVisible ? 'none' : 'block';

    if(isKeyboardVisible){
        // Usuwamy nasłuchiwanie zdarzenia kliknięcia na klawiszach klawiatury
        document.querySelectorAll('.keyboard-key').forEach(key => {
            key.removeEventListener('click', handleKeyboardClick);
        });
    }else{
        // Dodajemy nasłuchiwanie zdarzenia kliknięcia na klawiszach klawiatury
        document.querySelectorAll('.keyboard-key').forEach(key => {
            key.addEventListener('click', handleKeyboardClick);
        });
        // Zapisujemy id pola tekstowego, do którego ma być wpisywany tekst
        keyboard.dataset.targetInputId = targetInputId;
    }
}

function handleKeyboardClick(){
    const targetInputId = document.getElementById('keyboard').dataset.targetInputId;
    updateTextInput(this.textContent, targetInputId);
}

function updateTextInput(key, targetInputId){
    const textInput = document.getElementById(targetInputId);
    if(textInput){
        if(key === "Spacebar"){
            key = " ";
        }else if(key === "Backspace"){
            // Usuń ostatni znak z pola tekstowego
            textInput.value = textInput.value.slice(0, -1);
            return; // Zakończ funkcję, aby nie dodawać "undefined" do pola tekstowego
        }else if(key === "Enter"){
            // Dodaj znak nowej linii (niech symbolizuje klawisz Enter)
            textInput.value += "\n";
            return; // Zakończ funkcję, nie dodawaj pustego znaku na końcu
        }
        textInput.value += key;
    }
}