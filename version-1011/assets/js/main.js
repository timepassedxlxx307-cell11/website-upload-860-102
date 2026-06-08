(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');
    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var active = 0;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        if (slides.length) {
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                });
            });
            show(0);
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(active + 1);
                }, 5200);
            }
        }
    });

    var searchInputs = document.querySelectorAll('[data-search-input]');
    searchInputs.forEach(function (input) {
        var targetSelector = input.getAttribute('data-search-target') || '.movie-card';
        var scope = input.closest('[data-search-scope]') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(targetSelector));
        var empty = scope.querySelector('[data-empty-state]');

        function runFilter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        input.addEventListener('input', runFilter);
        var button = input.parentElement ? input.parentElement.querySelector('button') : null;
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                runFilter();
            });
        }
    });
})();

function initMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var button = document.getElementById(config.buttonId);
    var hlsInstance = null;
    var isReady = false;

    function prepare() {
        if (!video || isReady) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(config.source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = config.source;
        }

        isReady = true;
    }

    function start() {
        prepare();
        if (overlay) {
            overlay.classList.add('hidden');
        }
        if (video) {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            start();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function (event) {
            event.preventDefault();
            start();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!isReady || video.paused) {
                start();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
