const TooltipUI = (() => {
  let el;
  function init() { el = document.getElementById('tooltip'); }
  function show(detail) {
    if (!el) return;
    const color = getMBTIColor(detail.mbti);
    const flag = getFlagUrl(detail.iso_a3);
    el.innerHTML = `
      <div class="tooltip-name">${flag ? `<img class="country-flag" src="${flag}" alt="">` : ''} ${detail.name}</div>
      <div class="tooltip-mbti" style="color:${color}">${detail.mbti} ${MBTI_NAMES[detail.mbti] || ''}</div>
    `;
    el.classList.add('visible');
    if (detail.point) {
      el.style.left = (detail.point.x + 12) + 'px';
      el.style.top = (detail.point.y - 12) + 'px';
    }
  }
  function hide() { if (el) el.classList.remove('visible'); }
  return { init, show, hide };
})();

const LegendUI = (() => {
  let activeType = null;
  let cycleIndex = -1;
  let typeCountries = [];

  function init() {
    const body = document.getElementById('legend-body');
    const toggle = document.getElementById('legend-toggle');
    const legend = document.getElementById('legend');
    if (!body) return;

    toggle.addEventListener('click', () => legend.classList.toggle('expanded'));
    if (window.innerWidth > 640) legend.classList.add('expanded');

    let html = '';
    TEMPERAMENT_GROUPS.forEach(group => {
      html += `<div class="legend-group"><div class="legend-group-name">${group.name}</div>`;
      group.types.forEach(type => {
        const charSrc = getMBTICharacterSrc(type);
        html += `<div class="legend-item" data-type="${type}">
          ${charSrc ? `<img class="legend-character" src="${charSrc}" alt="${type}">` : ''}
          <span class="legend-color" style="background:${getMBTIColor(type)}"></span>
          <span class="legend-type">${type}</span>
          <span class="legend-name">${MBTI_NAMES[type]}</span>
        </div>`;
      });
      html += '</div>';
    });
    body.innerHTML = html;

    body.querySelectorAll('.legend-item').forEach(el => {
      el.addEventListener('click', () => onTypeClick(el.dataset.type));
    });
  }

  function onTypeClick(type) {
    const state = App.getState();
    if (activeType === type) {
      cycleIndex = (cycleIndex + 1) % typeCountries.length;
    } else {
      activeType = type;
      cycleIndex = 0;
      typeCountries = state.countries.filter(c => c.mbti === type);
      document.querySelectorAll('.legend-item').forEach(el => {
        el.classList.toggle('active', el.dataset.type === type);
      });
      MapModule.highlightType(type);
    }
    if (!typeCountries.length) return;
    Panels.showTypeCountries(type, typeCountries, cycleIndex);
    MapModule.flyToCountry(typeCountries[cycleIndex].iso_a3);
  }

  // Called from panel country list click - fly to country without leaving type view
  function jumpToCountryInList(isoA3) {
    if (!activeType || !typeCountries.length) return;
    const idx = typeCountries.findIndex(c => c.iso_a3 === isoA3);
    if (idx < 0) return;
    cycleIndex = idx;
    Panels.showTypeCountries(activeType, typeCountries, cycleIndex);
    MapModule.flyToCountry(isoA3);
  }

  function reset() {
    activeType = null;
    cycleIndex = -1;
    typeCountries = [];
    document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('active'));
  }

  function getActiveType() { return activeType; }
  return { init, reset, getActiveType, jumpToCountryInList };
})();

const App = (() => {
  let state = {
    selectedCountry: null,
    mbtiData: {},
    mbtiByIso: {},
    countries: [],
  };

  async function init() {
    const mbtiResp = await fetch('data/mbti-countries.json').then(r => r.json());
    state.countries = mbtiResp.countries;
    mbtiResp.countries.forEach(c => {
      state.mbtiData[c.id] = c;
      state.mbtiByIso[c.iso_a3] = c;
    });

    MapModule.init(state.mbtiData);
    Panels.init();
    Search.init(state.countries);
    LegendUI.init();
    TooltipUI.init();
    if (typeof ChatModule !== 'undefined') ChatModule.init();

    document.addEventListener('country-hover', e => TooltipUI.show(e.detail));
    document.addEventListener('country-leave', () => TooltipUI.hide());
    document.addEventListener('country-click', e => handleCountryClick(e));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && (state.selectedCountry || LegendUI.getActiveType())) resetView();
    });
  }

  function handleCountryClick(e) {
    const info = state.mbtiByIso[e.detail.iso_a3];
    if (!info) return;
    state.selectedCountry = info;
    TooltipUI.hide();
    LegendUI.reset();
    MapModule.resetHighlight();
    Panels.showCountry(info);
  }

  function resetView() {
    state.selectedCountry = null;
    LegendUI.reset();
    Panels.hide();
    MapModule.resetView();
  }

  function selectCountryByIso(isoA3) {
    const info = state.mbtiByIso[isoA3];
    if (!info) return;
    MapModule.flyToCountry(isoA3);
    handleCountryClick({ detail: { iso_a3: isoA3 } });
  }

  return { init, resetView, selectCountryByIso, getState: () => state };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
