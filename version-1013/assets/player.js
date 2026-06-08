(function () {
    function setupPlayer(player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-button]');
        var stream = player.getAttribute('data-stream');
        var attached = false;

        if (!video || !stream) {
            return;
        }

        function begin() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.getAttribute('src')) {
                    video.setAttribute('src', stream);
                }
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!attached) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });

                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    video.hls = hls;
                    attached = true;
                } else {
                    video.play().catch(function () {});
                }
                return;
            }

            if (!video.getAttribute('src')) {
                video.setAttribute('src', stream);
            }
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (!video.getAttribute('src') && !attached) {
                begin();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
