const Search = (() => {
  let allCountries = [];
  let inputEl, resultsEl;

  function init(countries) {
    allCountries = countries;
    inputEl = document.getElementById('search-input');
    resultsEl = document.getElementById('search-results');
    if (!inputEl) return;

    inputEl.addEventListener('input', handleInput);
    inputEl.addEventListener('focus', () => {
      if (inputEl.value.trim().length > 0) handleInput();
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-bar')) resultsEl.classList.remove('visible');
    });
  }

  function handleInput() {
    const q = inputEl.value.trim().toLowerCase();
    if (q.length < 1) { resultsEl.classList.remove('visible'); return; }

    const matches = allCountries.filter(c =>
      c.name_en.toLowerCase().includes(q) ||
      c.mbti.toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) { resultsEl.classList.remove('visible'); return; }

    resultsEl.innerHTML = matches.map(c => {
      const color = getMBTIColor(c.mbti);
      const flag = getFlagUrl(c.iso_a3);
      return `<div class="search-item" data-iso="${c.iso_a3}">
        ${flag ? `<img class="country-flag" src="${flag}" alt="">` : `<span class="search-item-color" style="background:${color}"></span>`}
        <span class="search-item-name">${c.name_en}</span>
        <span class="search-item-mbti">${c.mbti}</span>
      </div>`;
    }).join('');

    resultsEl.classList.add('visible');
    resultsEl.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        inputEl.value = '';
        resultsEl.classList.remove('visible');
        App.selectCountryByIso(el.dataset.iso);
      });
    });
  }

  return { init };
})();
