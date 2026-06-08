(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      var next = function () {
        show(current + 1);
      };
      var start = function () {
        timer = window.setInterval(next, 5200);
      };
      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      };
      var prevButton = hero.querySelector('[data-hero-prev]');
      var nextButton = hero.querySelector('[data-hero-next]');
      if (prevButton) {
        prevButton.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }
      if (nextButton) {
        nextButton.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });
      if (slides.length > 1) {
        start();
      }
    }

    document.querySelectorAll('.scroll-section').forEach(function (section) {
      var row = section.querySelector('[data-scroll-row]');
      var left = section.querySelector('[data-scroll-left]');
      var right = section.querySelector('[data-scroll-right]');
      if (row && left) {
        left.addEventListener('click', function () {
          row.scrollBy({ left: -360, behavior: 'smooth' });
        });
      }
      if (row && right) {
        right.addEventListener('click', function () {
          row.scrollBy({ left: 360, behavior: 'smooth' });
        });
      }
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var root = panel.parentElement;
      var list = root ? root.querySelector('[data-filter-list]') : null;
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]'));
      var search = panel.querySelector('[data-filter-search]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var apply = function () {
        var q = search ? search.value.trim().toLowerCase() : '';
        var t = type ? type.value : '';
        var y = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.tags, card.textContent].join(' ').toLowerCase();
          var matchText = !q || haystack.indexOf(q) !== -1;
          var matchType = !t || card.dataset.type === t;
          var matchYear = !y || card.dataset.year === y;
          card.style.display = matchText && matchType && matchYear ? '' : 'none';
        });
      };
      [search, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    });

    var searchForm = document.querySelector('[data-search-page-form]');
    var searchResults = document.querySelector('[data-search-results]');
    if (searchForm && searchResults && window.SEARCH_MOVIES) {
      var input = searchForm.querySelector('input[name="q"]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      input.value = initial;
      var render = function () {
        var q = input.value.trim().toLowerCase();
        var list = window.SEARCH_MOVIES.filter(function (movie) {
          return !q || movie.text.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120);
        searchResults.innerHTML = list.map(function (movie) {
          return '<article class="movie-card compact">' +
            '<a class="movie-poster" href="' + movie.href + '">' +
            '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
            '<span class="poster-play">▶</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
            '<a href="' + movie.href + '" class="movie-title">' + escapeHtml(movie.title) + '</a>' +
            '<p class="movie-meta">' + escapeHtml([movie.region, movie.type, movie.year].filter(Boolean).join(' · ')) + '</p>' +
            '<p class="movie-desc">' + escapeHtml(movie.text.slice(0, 90)) + '</p>' +
            '<div class="card-bottom"><span class="card-category">' + escapeHtml(movie.category) + '</span><span class="score">' + escapeHtml(movie.score) + '</span></div>' +
            '</div>' +
            '</article>';
        }).join('');
      };
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input.value.trim();
        var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        history.replaceState(null, '', url);
        render();
      });
      input.addEventListener('input', render);
      render();
    }
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
