window.addEventListener("DOMContentLoaded", () => {
    let playlist = []; // Zmienna playlist będzie zainicjowana pustą tablicą

    // (A2) AUDIO PLAYER & GET HTML CONTROLS
	const audio = new Audio(),
	aPlay = document.getElementById("btnMenuSongPlay"),
	aPlayIco = document.getElementById("PlayerIco"),
	aNow = document.getElementById("PlayerNow"),
	aTime = document.getElementById("PlayerTime"),
	aList = document.getElementById("PlayerList");

	aAuthor = document.getElementById("PlayerAuthor");
	aTitle = document.getElementById("PlayerTitle");
	aBack = document.getElementById("btnMenuSongBack");
	aNext = document.getElementById("btnMenuSongNext");

    // (B) FETCH PLAYLIST DATA FROM ENDPOINT
    fetch('/playlist')
        .then(response => response.json())
        .then(data => {
            playlist = data; // Przypisanie danych zwróconych przez endpoint do zmiennej playlist

            // (C) BUILD PLAYLIST
            for(let i in playlist){
                let row = document.createElement("div");
                row.className = "col-sm-12";
                row.innerHTML = playlist[i]["author"]+" - "+playlist[i]["name"];
                row.addEventListener("click", () => { audPlay(i); });
                playlist[i]["row"] = row;
                aList.appendChild(row);
            }

            // (D) INIT SET FIRST SONG
            audPlay(0, false);
        })
        .catch(error => {
            console.error('Error fetching playlist:', error);
        });

    // (E) PLAY MECHANISM
	// (E1) PLAY SELECTED SONG
	const audPlay = (idx, nostart) => {
		const song = playlist[idx];
		if (!song) return; // Sprawdzenie, czy utwór istnieje na liście odtwarzania
		audio.src = song.src;
		audio.load();
		audio.addEventListener("loadeddata", () => {
			audio.play(); // Uruchomienie odtwarzania po załadowaniu danych
		});
		aTitle.innerHTML = song.name;
		aAuthor.innerHTML = song.author;
		for(let i in playlist){
			if(i == idx) playlist[i]["row"].classList.add("now");
			else playlist[i]["row"].classList.remove("now");
		}
	};

    // (E2) AUTOPLAY NEXT SONG IN THE PLAYLIST
    // (E2) AUTOPLAY NEXT SONG IN THE PLAYLIST
	audio.addEventListener("ended", () => {
		let currentSongIndex = -1;
		for(let i = 0; i < playlist.length; i++){
			if (playlist[i].row.classList.contains("now")){
				currentSongIndex = i;
				break;
			}
		}

		if(currentSongIndex !== -1){
			let nextSongIndex = (currentSongIndex + 1) % playlist.length;
			audPlay(nextSongIndex);
		}
	});



    // (C) PLAY/PAUSE BUTTON
	audio.addEventListener("play", () =>{
		aPlayIco.classList.add('bi-pause');
		aPlayIco.classList.remove('bi-caret-right');
	});
	audio.addEventListener("pause", () =>{
		aPlayIco.classList.remove('bi-pause');
		aPlayIco.classList.add('bi-caret-right');
	});
	aPlay.addEventListener("click", () =>{
		if(audio.paused){audio.play();}
		else{audio.pause();}
	});

    // (E4) BACK BUTTON
	aBack.addEventListener("click", () => {
		let currentSongIndex = -1;
		for(let i = 0; i < playlist.length; i++){
			if(playlist[i].row.classList.contains("now")){
				currentSongIndex = i;
				break;
			}
		}

		if(currentSongIndex !== -1){
			let prevSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
			audPlay(prevSongIndex);
		}
	});

    // (E5) NEXT BUTTON
	aNext.addEventListener("click", () => {
		let currentSongIndex = -1;
		for(let i = 0; i < playlist.length; i++){
			if(playlist[i].row.classList.contains("now")){
				currentSongIndex = i;
				break;
			}
		}

		if(currentSongIndex !== -1){
			let nextSongIndex = (currentSongIndex + 1) % playlist.length;
			audPlay(nextSongIndex);
		}
	});



    // (F) TRACK PROGRESS
    // (F1) INIT SET TRACK TIME
    audio.addEventListener("loadedmetadata", () => {
        aNow.innerHTML = timeString(0);
        aTime.innerHTML = timeString(audio.duration);
    });

    // (F2) UPDATE TIME ON PLAYING
    audio.addEventListener("timeupdate", () => {
        aNow.innerHTML = timeString(audio.currentTime);
    });

    // (F3) SUPPORT FUNCTION - FORMAT HH:MM:SS
    const timeString = (secs) => {
        let ss = Math.floor(secs),
            hh = Math.floor(ss / 3600),
            mm = Math.floor((ss - (hh * 3600)) / 60);
        ss = ss - (hh * 3600) - (mm * 60);
        if(hh > 0) mm = mm < 10 ? "0" + mm : mm;
        ss = ss < 10 ? "0" + ss : ss;
        return hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    };

    // (G) ENABLE/DISABLE CONTROLS
    audio.addEventListener("canplay", () => {
        aPlay.disabled = false;
    });
    audio.addEventListener("waiting", () => {
        aPlay.disabled = true;
    });
});
