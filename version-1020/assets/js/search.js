const keywordInput = document.getElementById('searchKeyword');
const typeInput = document.getElementById('searchType');
const yearInput = document.getElementById('searchYear');
const regionInput = document.getElementById('searchRegion');
const resetButton = document.getElementById('searchReset');
const results = document.getElementById('searchResults');
const params = new URLSearchParams(window.location.search);

if (keywordInput && params.get('q')) {
  keywordInput.value = params.get('q');
}

const escapeHtml = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
}[char]));

const renderCard = (movie) => `
  <div class="movie-card-item">
    <article class="movie-card" data-movie-card>
      <a class="movie-card-link" href="${escapeHtml(movie.url)}" title="${escapeHtml(movie.title)}">
        <div class="poster-wrap">
          <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
          <span class="type-badge">${escapeHtml(movie.type)}</span>
          <span class="play-hover">▶</span>
          <div class="poster-info">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.year)} · ${escapeHtml(movie.genre)}</p>
          </div>
        </div>
        <div class="card-text">
          <h3>${escapeHtml(movie.title)}</h3>
          <p>${escapeHtml(movie.oneLine)}</p>
        </div>
      </a>
    </article>
  </div>`;

const applySearch = () => {
  if (!results || !window.MOVIE_INDEX) {
    return;
  }

  const keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
  const type = typeInput ? typeInput.value : '';
  const year = yearInput ? yearInput.value : '';
  const region = regionInput ? regionInput.value : '';

  const matched = window.MOVIE_INDEX.filter((movie) => {
    const text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      movie.category,
      ...(movie.tags || [])
    ].join(' ').toLowerCase();
    return (!keyword || text.includes(keyword)) &&
      (!type || movie.type === type) &&
      (!year || movie.year === year) &&
      (!region || movie.region === region);
  }).slice(0, 120);

  results.innerHTML = matched.map(renderCard).join('');
};

[keywordInput, typeInput, yearInput, regionInput].forEach((control) => {
  if (control) {
    control.addEventListener('input', applySearch);
    control.addEventListener('change', applySearch);
  }
});

if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (keywordInput) keywordInput.value = '';
    if (typeInput) typeInput.value = '';
    if (yearInput) yearInput.value = '';
    if (regionInput) regionInput.value = '';
    applySearch();
  });
}

applySearch();
