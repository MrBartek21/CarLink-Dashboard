(() => {
    const width = 320; // We will scale the photo width to this
    let height = 0; // This will be computed based on the input stream
    let streaming = false;
    let video = null;

    function startCamera(){
        video = document.getElementById('video');

        // Check if navigator.mediaDevices is available
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    video.srcObject = stream;
                    video.play();
                })
                .catch((err) => {
                    console.error(`An error occurred: ${err}`);
                });

            video.addEventListener('canplay', (ev) => {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    if (isNaN(height)) height = width / (4 / 3);

                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    streaming = true;
                }
            }, false);
        } else {
            console.error('getUserMedia is not supported in this browser.');
        }
    }

    // Set up our event listener to run the startup process once loading is complete
    window.addEventListener('load', startCamera, false);
})();
