window.handlePosterError = function handlePosterError(image) {
  if (!image) {
    return;
  }
  var parent = image.closest('.poster-frame, .hero-thumb, .category-mosaic, .search-result-item, .detail-bg, .hero-slide');
  if (parent) {
    parent.classList.add('image-missing');
  }
  image.remove();
};

(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }
})();

(function () {
  var slider = document.querySelector('[data-hero-slider]');

  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
  var thumbs = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-thumb]'));
  var prev = slider.querySelector('[data-hero-prev]');
  var next = slider.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });

    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('active', thumbIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }

    timer = window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(Number(dot.getAttribute('data-hero-dot')) || 0);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      show(current + 1);
      restart();
    });
  }

  show(0);
  restart();
})();

(function () {
  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupPageFilters(panel) {
    var pageCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var searchInput = panel.querySelector('[data-site-search]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var typeSelect = panel.querySelector('[data-type-filter]');

    function apply() {
      var query = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);

      pageCards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }

        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }

        card.classList.toggle('filtered-out', !matched);
      });
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupGlobalSearch(panel) {
    var searchInput = panel.querySelector('[data-site-search]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var results = panel.querySelector('[data-search-results]');

    if (!searchInput || !results || !window.MOVIE_INDEX) {
      setupPageFilters(panel);
      return;
    }

    function resultItem(movie) {
      return [
        '<a class="search-result-item" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + movie.title + '" onerror="handlePosterError(this)">',
        '<span><strong>' + movie.title + '</strong><span>' + movie.year + ' · ' + movie.genre + ' · ' + movie.region + '</span></span>',
        '<span class="primary-btn">观看</span>',
        '</a>'
      ].join('');
    }

    function apply() {
      var query = normalize(searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);

      if (!query && !year && !type) {
        results.classList.remove('open');
        results.innerHTML = '';
        return;
      }

      var matches = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.genre,
          movie.type,
          movie.tags,
          movie.category
        ].join(' '));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }

        if (year && normalize(movie.year).indexOf(year) === -1) {
          return false;
        }

        if (type && normalize(movie.type).indexOf(type) === -1) {
          return false;
        }

        return true;
      }).slice(0, 20);

      results.classList.add('open');
      results.innerHTML = matches.length
        ? matches.map(resultItem).join('')
        : '<p>没有找到匹配影片，请换一个关键词。</p>';
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]')).forEach(function (panel) {
    if (panel.getAttribute('data-search-scope') === 'global') {
      setupGlobalSearch(panel);
    } else {
      setupPageFilters(panel);
    }
  });
})();

(function () {
  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(shell, message) {
    var status = shell.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(function (shell) {
    var video = shell.querySelector('[data-video-player]');
    var button = shell.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      var src = button.getAttribute('data-src');

      if (!src) {
        setStatus(shell, '播放源暂不可用。');
        return;
      }

      button.classList.add('hidden');
      setStatus(shell, '正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().then(function () {
          setStatus(shell, '正在播放。');
        }).catch(function () {
          setStatus(shell, '浏览器阻止了自动播放，请再次点击播放器播放。');
        });
        return;
      }

      loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus(shell, '正在播放。');
            }).catch(function () {
              setStatus(shell, '浏览器阻止了自动播放，请再次点击播放器播放。');
            });
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus(shell, '播放器加载失败，请稍后重试。');
            }
          });
        } else {
          video.src = src;
          video.play().catch(function () {
            setStatus(shell, '当前浏览器不支持 HLS 播放。');
          });
        }
      }).catch(function () {
        video.src = src;
        video.play().catch(function () {
          setStatus(shell, 'HLS 组件加载失败，请检查网络后重试。');
        });
      });
    });
  });
})();
