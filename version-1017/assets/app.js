(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-mobile-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        function setHeaderState() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }

        setHeaderState();
        window.addEventListener("scroll", setHeaderState, { passive: true });

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
                document.body.classList.toggle("nav-open", mobileNav.classList.contains("open"));
            });
        }
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var dotIndex = Number(dot.getAttribute("data-hero-dot"));
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var searchInput = document.querySelector("[data-search-input]");
        var genreFilter = document.querySelector("[data-genre-filter]");
        var yearFilter = document.querySelector("[data-year-filter]");

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filterCards() {
            if (!cards.length) {
                return;
            }

            var query = normalize(searchInput ? searchInput.value : "");
            var genre = normalize(genreFilter ? genreFilter.value : "");
            var year = normalize(yearFilter ? yearFilter.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search") || card.textContent);
                var cardGenre = normalize(card.getAttribute("data-genre"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesGenre = !genre || cardGenre.indexOf(genre) !== -1;
                var matchesYear = !year || cardYear === year;
                var matches = matchesQuery && matchesGenre && matchesYear;

                card.style.display = matches ? "" : "none";
                if (matches) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        [searchInput, genreFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var localCards = document.querySelectorAll("[data-movie-card]").length;
                var isSearchPage = /search\.html$/.test(window.location.pathname) || document.title.indexOf("影片搜索") !== -1;
                if (isSearchPage || localCards > 80) {
                    event.preventDefault();
                    filterCards();
                    return;
                }
                var input = form.querySelector("[data-search-input]");
                if (input && input.value.trim()) {
                    form.action = "./search.html";
                }
            });
        });

        filterCards();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var streamUrl = player.getAttribute("data-stream");
            var started = false;
            var hls = null;

            if (!video || !button || !streamUrl) {
                return;
            }

            function attachStream() {
                if (started) {
                    return;
                }
                started = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                attachStream();
                player.classList.add("is-playing");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    player.classList.remove("is-playing");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initHeader();
        initHero();
        initSearch();
        initPlayers();
    });
})();
