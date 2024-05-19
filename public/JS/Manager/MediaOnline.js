function searchVideos(){
    const searchInput = document.getElementById('searchInput').value;
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Wyczyść poprzednie wyniki

    // Zapytanie do YouTube API
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchInput}&key=AIzaSyCO92ynWkU6Of-khaDiPlgMfUNnCnwCC8Q`)
        .then(response => response.json())
        .then(data => {
            data.items.forEach(item => {
                const videoId = item.id.videoId;
                const videoTitle = item.snippet.title;

                // Tworzenie linku do filmu YouTube
                const videoLink = document.createElement('a');
                videoLink.href = '#'; // używamy hash'a, aby link nie zmieniał adresu URL
                videoLink.textContent = videoTitle;

                // Dodanie obsługi zdarzenia kliknięcia na link
                videoLink.addEventListener('click', () => {
                    playVideo(videoId);
                });

                // Tworzenie elementu listy dla wyniku wyszukiwania
                const listItem = document.createElement('div');
                listItem.classList.add('mb-2');
                listItem.appendChild(videoLink);
                searchResults.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Błąd podczas wyszukiwania filmów:', error);
        });
}

function playVideo(videoId){
    const playerYouTube = document.getElementById('playerYouTube');
    playerYouTube.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1" frameborder="0" allowfullscreen></iframe>`;
}