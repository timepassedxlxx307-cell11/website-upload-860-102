(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var previous = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var startTimer = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var normalize = function (value) {
        return (value || '').toString().trim().toLowerCase();
    };

    var escapeHtml = function (value) {
        return (value || '').toString().replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    };

    var localFilter = document.querySelector('[data-page-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var activeChipValue = '';
    var noResults = null;

    var ensureNoResults = function () {
        if (!cards.length) {
            return null;
        }

        if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = '没有找到匹配的影片';
            cards[cards.length - 1].parentNode.appendChild(noResults);
        }

        return noResults;
    };

    var applyLocalFilter = function () {
        if (!cards.length) {
            return;
        }

        var keyword = localFilter ? normalize(localFilter.value) : '';
        var shown = 0;

        cards.forEach(function (card) {
            var searchText = normalize(card.getAttribute('data-search'));
            var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
            var matchChip = !activeChipValue || searchText.indexOf(activeChipValue) !== -1;
            var visible = matchKeyword && matchChip;

            card.classList.toggle('is-filtered-out', !visible);

            if (visible) {
                shown += 1;
            }
        });

        var empty = ensureNoResults();

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    };

    if (localFilter) {
        localFilter.addEventListener('input', applyLocalFilter);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
        chip.addEventListener('click', function () {
            Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (item) {
                item.classList.remove('is-active');
            });

            chip.classList.add('is-active');
            activeChipValue = normalize(chip.getAttribute('data-filter-chip'));
            applyLocalFilter();
        });
    });

    var globalInput = document.querySelector('[data-global-search]');
    var globalResults = document.querySelector('[data-global-results]');

    if (globalInput && globalResults && Array.isArray(window.searchMovies)) {
        var renderGlobalResults = function () {
            var keyword = normalize(globalInput.value);

            if (!keyword) {
                globalResults.classList.remove('is-open');
                globalResults.innerHTML = '';
                return;
            }

            var results = window.searchMovies.filter(function (item) {
                return normalize(item.title + ' ' + item.meta + ' ' + item.tags).indexOf(keyword) !== -1;
            }).slice(0, 9);

            if (!results.length) {
                globalResults.innerHTML = '<div class="no-results">没有找到匹配的影片</div>';
                globalResults.classList.add('is-open');
                return;
            }

            globalResults.innerHTML = results.map(function (item) {
                return '<a href="' + encodeURI(item.url) + '"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.meta) + '</small></a>';
            }).join('');
            globalResults.classList.add('is-open');
        };

        globalInput.addEventListener('input', renderGlobalResults);
        globalInput.addEventListener('focus', renderGlobalResults);
        document.addEventListener('click', function (event) {
            if (!globalResults.contains(event.target) && event.target !== globalInput) {
                globalResults.classList.remove('is-open');
            }
        });
    }
})();
