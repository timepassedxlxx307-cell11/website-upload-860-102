(function() {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('open');
    });
  }

  var topButton = document.querySelector('.back-to-top');
  if (topButton) {
    window.addEventListener('scroll', function() {
      topButton.classList.toggle('show', window.scrollY > 420);
    });
    topButton.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = selectAll('.hero-slide');
  var dots = selectAll('.hero-dot');
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === currentSlide);
    });
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  if (slides.length) {
    var nextButton = document.querySelector('.hero-control.next');
    var prevButton = document.querySelector('.hero-control.prev');
    if (nextButton) {
      nextButton.addEventListener('click', function() {
        showSlide(currentSlide + 1);
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function() {
        showSlide(currentSlide - 1);
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });
    setInterval(function() {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  selectAll('.featured-band').forEach(function(section) {
    var scroller = section.querySelector('.horizontal-scroller');
    var left = section.querySelector('.scroll-left');
    var right = section.querySelector('.scroll-right');
    if (scroller && left && right) {
      left.addEventListener('click', function() {
        scroller.scrollBy({ left: -340, behavior: 'smooth' });
      });
      right.addEventListener('click', function() {
        scroller.scrollBy({ left: 340, behavior: 'smooth' });
      });
    }
  });

  selectAll('.category-movie-grid').forEach(function(grid) {
    var panel = grid.parentElement;
    var input = panel.querySelector('.category-search');
    var buttons = selectAll('.filter-buttons button', panel);
    var active = 'all';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      selectAll('.movie-card', grid).forEach(function(card) {
        var text = card.getAttribute('data-search') || '';
        var typeMatch = active === 'all' || text.indexOf(active.toLowerCase()) !== -1;
        var wordMatch = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('hidden-card', !(typeMatch && wordMatch));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        buttons.forEach(function(item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        active = button.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  });

  function createCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="play-badge">播放</span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-row">' + movie.tags.slice(0, 3).map(function(tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var searchForm = document.getElementById('searchPageForm');
  var searchResults = document.getElementById('searchResults');
  if (searchForm && searchResults && window.MovieIndex) {
    var params = new URLSearchParams(window.location.search);
    var input = document.getElementById('searchInput');
    var region = document.getElementById('regionFilter');
    var type = document.getElementById('typeFilter');
    var year = document.getElementById('yearFilter');
    var summary = document.getElementById('searchSummary');
    input.value = params.get('q') || '';

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;
      var matches = window.MovieIndex.filter(function(movie) {
        var text = movie.search.toLowerCase();
        var word = !keyword || text.indexOf(keyword) !== -1;
        var reg = !regionValue || movie.region === regionValue;
        var typ = !typeValue || movie.type === typeValue;
        var yr = !yearValue || movie.year === yearValue;
        return word && reg && typ && yr;
      }).slice(0, 120);
      if (summary) {
        summary.textContent = keyword || regionValue || typeValue || yearValue ? '搜索结果' : '热门推荐';
      }
      searchResults.innerHTML = matches.map(createCard).join('');
    }

    searchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      runSearch();
    });
    [input, region, type, year].forEach(function(control) {
      control.addEventListener('input', runSearch);
      control.addEventListener('change', runSearch);
    });
    runSearch();
  }

  selectAll('.watch-player').forEach(function(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var started = false;

    function startVideo() {
      if (!video || started) {
        if (video) {
          video.play().catch(function() {});
        }
        if (overlay) {
          overlay.classList.add('hidden');
        }
        return;
      }
      started = true;
      var source = video.getAttribute('data-hls');
      if (source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.play().catch(function() {});
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }
    if (video) {
      video.addEventListener('click', startVideo);
    }
  });
})();
