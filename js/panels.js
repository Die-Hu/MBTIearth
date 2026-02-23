const Panels = (() => {
  let panelEl, contentEl, scrollEl;

  function init() {
    panelEl = document.getElementById('info-panel');
    contentEl = document.getElementById('panel-content');
    scrollEl = document.getElementById('panel-scroll');
    setupDrag();
  }

  function setupDrag() {
    const handle = document.getElementById('panel-handle');
    if (!handle) return;
    let startY;
    handle.addEventListener('touchstart', e => {
      startY = e.touches[0].clientY;
      panelEl.style.transition = 'none';
    }, { passive: true });
    handle.addEventListener('touchmove', e => {
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) panelEl.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    handle.addEventListener('touchend', e => {
      panelEl.style.transition = '';
      if (e.changedTouches[0].clientY - startY > 100) { hide(); App.resetView(); }
      else { panelEl.style.transform = ''; panelEl.classList.add('visible'); }
    });
  }

  function flagImg(iso3, size) {
    const url = size === 'lg' ? getFlagUrl2x(iso3) : getFlagUrl(iso3);
    if (!url) return '';
    return `<img class="country-flag${size === 'lg' ? ' flag-lg' : ''}" src="${url}" alt="" loading="lazy">`;
  }

  function showCountry(info) {
    const color = getMBTIColor(info.mbti);
    const charSrc = getMBTICharacterSrc(info.mbti);

    let html = `
      <button class="panel-back" onclick="App.resetView()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Globe
      </button>

      <div class="panel-country-header">
        ${charSrc ? `<img class="panel-character" src="${charSrc}" alt="${info.mbti}">` : ''}
        <div class="panel-country-info">
          <div class="panel-country-name">${flagImg(info.iso_a3)} ${info.name_en}</div>
          <div class="panel-mbti-badge" style="background:${color}">
            <span class="panel-mbti-type">${info.mbti}</span>
            <span class="panel-mbti-name">${MBTI_NAMES[info.mbti]}</span>
          </div>
        </div>
      </div>
    `;

    // Confidence
    if (info.confidence != null) {
      const filled = Math.min(Math.max(info.confidence, 0), 5);
      const stars = '\u2605'.repeat(filled) + '\u2606'.repeat(5 - filled);
      html += `<div class="panel-confidence">
        Confidence: <span class="confidence-stars">${stars}</span>
        <span style="opacity:0.6">(${filled}/5)</span>
      </div>`;
    }

    // Dimension analysis
    if (info.dimension_analysis) {
      html += `<div class="panel-section"><div class="panel-section-title">Dimension Analysis</div>`;
      const labels = {
        'E_reason': 'E Extraversion', 'I_reason': 'I Introversion',
        'S_reason': 'S Sensing', 'N_reason': 'N Intuition',
        'T_reason': 'T Thinking', 'F_reason': 'F Feeling',
        'J_reason': 'J Judging', 'P_reason': 'P Perceiving'
      };
      const pairs = [['E_reason','I_reason'],['S_reason','N_reason'],['T_reason','F_reason'],['J_reason','P_reason']];
      for (const [a, b] of pairs) {
        const key = info.dimension_analysis[a] ? a : (info.dimension_analysis[b] ? b : null);
        if (!key) continue;
        const letter = key[0];
        const isActive = info.mbti && info.mbti.includes(letter);
        html += `<div class="dim-row${isActive ? ' active' : ''}">
          <span class="dim-label">${labels[key]}</span>
          <span class="dim-text">${info.dimension_analysis[key]}</span>
        </div>`;
      }
      html += '</div>';
    }

    // Sources
    if (info.sources && info.sources.length) {
      html += `<div class="panel-section panel-sources">
        <div class="panel-section-title">Data Sources</div>
        <ul>${info.sources.map(s => `<li>${s}</li>`).join('')}</ul>
      </div>`;
    }

    contentEl.innerHTML = html;
    scrollEl.scrollTop = 0;
    panelEl.classList.add('visible');
    panelEl.classList.remove('peek', 'half');
  }

  function showTypeCountries(mbtiType, countries, activeIndex) {
    const color = getMBTIColor(mbtiType);
    const charSrc = getMBTICharacterSrc(mbtiType);

    let html = `
      <button class="panel-back" onclick="App.resetView()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Globe
      </button>

      <div class="panel-type-header">
        ${charSrc ? `<img class="panel-character-large" src="${charSrc}" alt="${mbtiType}">` : ''}
        <div class="panel-mbti-badge panel-mbti-badge-large" style="background:${color}">
          <span class="panel-mbti-type">${mbtiType}</span>
          <span class="panel-mbti-name">${MBTI_NAMES[mbtiType]}</span>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-section-title">${mbtiType} Countries (${countries.length})</div>
        <div class="panel-country-list">
    `;

    countries.forEach((c, i) => {
      const isActive = i === activeIndex;
      html += `
        <div class="country-list-item${isActive ? ' active' : ''}" data-iso="${c.iso_a3}">
          ${flagImg(c.iso_a3)}
          <span class="country-list-name">${c.name_en}</span>
          <svg class="country-list-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </div>`;
    });

    html += `</div></div>`;
    contentEl.innerHTML = html;
    scrollEl.scrollTop = 0;
    panelEl.classList.add('visible');
    panelEl.classList.remove('peek', 'half');

    contentEl.querySelectorAll('.country-list-item').forEach(el => {
      el.addEventListener('click', () => {
        // Stay in type view, just fly to the country
        LegendUI.jumpToCountryInList(el.dataset.iso);
      });
    });

    const activeEl = contentEl.querySelector('.country-list-item.active');
    if (activeEl) setTimeout(() => activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }

  function hide() {
    panelEl.classList.remove('visible', 'peek', 'half');
    panelEl.style.transform = '';
  }

  return { init, showCountry, showTypeCountries, hide };
})();
