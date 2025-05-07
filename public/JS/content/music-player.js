window.addEventListener("DOMContentLoaded", () => {
    let playlist = [];

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

	const playlists = document.querySelector('.playlists');
	

	// (B) FUNCTION TO LOAD PLAYLIST
	const loadPlaylist = (playlistName) => {
		fetch('/playlists/' + playlistName)
		.then(response => response.json())
		.then(data => {
			playlist = data;
			// CLEAR CURRENT PLAYLIST
			aList.innerHTML = "";
			// (C) BUILD PLAYLIST
			for (let i in playlist) {
				let row = document.createElement("div");
				row.className = "col-sm-12";
				row.innerHTML = playlist[i]["author"] + " - " + playlist[i]["name"];
				row.addEventListener("click", () => { audPlay(i); });
				playlist[i]["row"] = row;
				aList.appendChild(row);
			}
			// (D) INIT SET FIRST SONG
			audPlay(0, false);

			// Update play buttons
            document.querySelectorAll('.playlist-button').forEach(button => {
                if(button.dataset.playlist === playlistName){
                    button.innerHTML = '<i class="bi bi-play-fill"></i> Playing';
                    button.disabled = true;
                }else{
                    button.innerHTML = '<i class="bi bi-play-fill"></i> Play';
                    button.disabled = false;
                }
            });
		})
		.catch(error => {
			console.error('Error fetching playlist:', error);
		});
	};

	

	// Pobranie listy playlist
	fetch('/system/settings')
		.then(response => response.json())
		.then(dataSettings => {
			// Pobranie listy playlists
			fetch('/playlists')
				.then(response => response.json())
				.then(dataPlaylistSelect => {
					dataPlaylistSelect.forEach(element => {
						const colDiv = document.createElement('div');
						colDiv.classList.add('col-lg-4', 'col-md-4', 'col-sm-6', 'mb-4');
					
						const innerDiv = document.createElement('div');
						innerDiv.classList.add('card', 'shadow-sm', 'border-0', 'bg-info');
					
						const cardHeader = document.createElement('div');
						cardHeader.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'p-3');
					
						const heading = document.createElement('h5');
						heading.classList.add('card-title', 'fw-bold', 'text-dark', 'mb-0');
						heading.textContent = element;
					
						const starButton = document.createElement('button');
						starButton.setAttribute('type', 'button');
						starButton.classList.add('btn', 'btn-warning', 'btn-outline-danger', 'btn-sm', 'playlist-icon');
						starButton.innerHTML = element === dataSettings.defaultPlaylist ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
						starButton.addEventListener('click', () => { setSettings('defaultPlaylist', element); });
						starButton.dataset.playlist = element;
					
						cardHeader.appendChild(heading);
						cardHeader.appendChild(starButton);
					
						const cardBody = document.createElement('div');
						cardBody.classList.add('card-body', 'd-flex', 'flex-column', 'align-strech');
					
						const buttonDiv = document.createElement('div');
						buttonDiv.classList.add('btn-group', 'mt-3');
					
						const playButton = document.createElement('button');
						playButton.setAttribute('type', 'button');
						playButton.classList.add('btn', 'btn-primary', 'btn-sm', 'playlist-button');
						
						if(element == dataSettings.defaultPlaylist){
							playButton.innerHTML = '<i class="bi bi-play-fill"></i> Playing';
							playButton.disabled = true;
						}else{
							playButton.innerHTML = '<i class="bi bi-play-fill"></i> Play';
							playButton.disabled = false;
						}

						
						playButton.addEventListener('click', () => { loadPlaylist(element); });
						playButton.dataset.playlist = element;
					
						buttonDiv.appendChild(playButton);
					
						cardBody.appendChild(playButton);
					
						innerDiv.appendChild(cardHeader);
						innerDiv.appendChild(cardBody);
						colDiv.appendChild(innerDiv);
					
						playlists.appendChild(colDiv);
					});
					


			})
			.catch(error => {
				log("error", "Player.js", 'Error fetching Playlists: '+error);
			});


			fetch('/playlists/'+dataSettings.defaultPlaylist)
				.then(response => response.json())
				.then(dataPlaylistFile => {
					playlist = dataPlaylistFile;

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
					log("error", "Player.js", 'Error fetching Playlist: '+error);
				});
		})
		.catch(error => {
			log("error", "Player.js", 'Error fetching Settings: '+error);
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
