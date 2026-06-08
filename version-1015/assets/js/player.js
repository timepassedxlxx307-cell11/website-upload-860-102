document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".video-player").forEach(function (player) {
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var url = player.getAttribute("data-play-url");
        var hls = null;
        var ready = false;

        var begin = function () {
            if (!video || !url) {
                return;
            }

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (ready) {
                video.play().catch(function () {});
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.addEventListener("loadedmetadata", function () {
                    video.play().catch(function () {});
                }, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = url;
            video.play().catch(function () {});
        };

        if (cover) {
            cover.addEventListener("click", begin);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!ready) {
                    begin();
                }
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
});
