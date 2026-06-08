const mobileButton = document.querySelector('[data-mobile-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (mobileButton && mobileMenu) {
  mobileButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
}

const carousel = document.querySelector('[data-hero-carousel]');

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  const prev = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const startTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(current - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(current + 1);
      startTimer();
    });
  }

  startTimer();
}

const filterBlocks = document.querySelectorAll('[data-list-filter]');

filterBlocks.forEach((block) => {
  const keyword = block.querySelector('[data-filter-keyword]');
  const type = block.querySelector('[data-filter-type]');
  const year = block.querySelector('[data-filter-year]');
  const region = block.querySelector('[data-filter-region]');
  const cards = Array.from(block.querySelectorAll('.movie-card-item'));

  const applyFilter = () => {
    const keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
    const typeValue = type ? type.value : '';
    const yearValue = year ? year.value : '';
    const regionValue = region ? region.value : '';

    cards.forEach((item) => {
      const card = item.querySelector('[data-movie-card]');
      if (!card) {
        return;
      }
      const text = (card.dataset.searchText || '').toLowerCase();
      const matchedKeyword = !keywordValue || text.includes(keywordValue);
      const matchedType = !typeValue || card.dataset.type === typeValue;
      const matchedYear = !yearValue || card.dataset.year === yearValue;
      const matchedRegion = !regionValue || card.dataset.region === regionValue;
      item.classList.toggle('is-hidden', !(matchedKeyword && matchedType && matchedYear && matchedRegion));
    });
  };

  [keyword, type, year, region].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });
});

const playerShells = document.querySelectorAll('[data-player]');

playerShells.forEach((shell) => {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-player-button]');
  let hlsInstance = null;

  const startPlayer = async () => {
    if (!video || shell.dataset.ready === 'true') {
      if (video) {
        video.play().catch(() => {});
      }
      return;
    }

    const source = video.dataset.videoSrc;

    if (!source) {
      return;
    }

    shell.dataset.ready = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      try {
        const module = await import('./hls-module.js');
        const Hls = module.H;
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          });
        } else {
          video.src = source;
        }
      } catch (error) {
        video.src = source;
      }
    }

    shell.classList.add('is-playing');
    video.play().catch(() => {});
  };

  if (button) {
    button.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('play', () => shell.classList.add('is-playing'));
    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
});
