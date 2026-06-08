(function () {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var button = document.querySelector('.play-trigger');
    var streamUrl = window.currentStream || '';
    var hls = null;
    var prepared = false;

    var hideCover = function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    };

    var playVideo = function () {
        if (!video) {
            return;
        }

        hideCover();
        video.setAttribute('controls', 'controls');
        var request = video.play();

        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    };

    var prepareVideo = function () {
        if (!video || !streamUrl) {
            return;
        }

        if (prepared) {
            playVideo();
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            return;
        }

        video.src = streamUrl;
        playVideo();
    };

    if (cover) {
        cover.addEventListener('click', prepareVideo);
    }

    if (button) {
        button.addEventListener('click', prepareVideo);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!prepared || video.paused) {
                prepareVideo();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
