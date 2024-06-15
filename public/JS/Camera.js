async function DashCam_Files(){
    try{
        const response = await fetch('/dashcam_listFiles'); // Fetch list of files from server
        const files = await response.json(); // Parse JSON response

        const container = document.querySelector('.dashcam_files'); // Select container element
        container.innerHTML = '';

        files.forEach(file => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'col-md-2 mb-3';

            console.log(file);

            cardDiv.innerHTML = `
                <div class="card h-10">
                    <video class="video-thumbnail" preload="metadata">
                        <source src="/dashcam_getFiles/${file}" type="video/mp4">
                    </video>
                    <div class="card-body d-flex flex-column">
                        <p class="card-text text-dark mb-4">${file}</p>
                        <a href="/dashcam_getFiles/${file}" class="btn btn-primary mt-auto">Odtwórz</a>
                    </div>
                </div>
            `;

            container.appendChild(cardDiv); // Append card to container
        });
    }catch (err){
        log('error', 'DashCam_Files', err);
    }
}




(() => {
    const width = 320; // We will scale the photo width to this
    let height = 0; // This will be computed based on the input stream
    let streaming = false;
    let video = null;

    function startCamera(){
        video = document.getElementById('video');

        navigator.mediaDevices.getUserMedia({video: true, audio: false})
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });

        video.addEventListener('canplay', (ev) => {
            if(!streaming){
                height = video.videoHeight / (video.videoWidth/width);

                if(isNaN(height)) height = width / (4/3);

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                streaming = true;
            }
        }, false);
    }

    // Set up our event listener to run the startup process
    // once loading is complete.
    window.addEventListener('load', startCamera, false);
})();

/*
// Function to start the video streaming
function startVideoStream() {
    const width = 320; // We will scale the photo width to this
    let height = 0; // This will be computed based on the input stream
    let streaming = false;
    let video = document.getElementById('video');

    // Function to handle video streaming startup
    function handleVideoStartup(stream) {
        video.srcObject = stream;
        video.play();
    }

    // Function to handle video playability
    function handleVideoPlayability(ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);

            // Firefox currently has a bug where the height can't be read from
            // the video, so we will make assumptions if this happens.
            if (isNaN(height)) {
                height = width / (4/3);
            }

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            streaming = true;
        }
    }

    // Function to handle errors during video streaming
    function handleVideoError(err) {
        console.error(`An error occurred: ${err}`);
    }

    // Set up video streaming when the page is loaded
    function initializeVideoStream() {
        video.addEventListener('canplay', handleVideoPlayability, false);

        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(handleVideoStartup)
            .catch(handleVideoError);
    }

    // Run the initialization when the window is loaded
    window.addEventListener('load', initializeVideoStream, false);
}

// Call the function to start video streaming
startVideoStream();

*/