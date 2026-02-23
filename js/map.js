const MapModule = (() => {
  let map;
  let mbtiData = {};
  let autoRotateId = null;
  let autoRotateTimeout = null;
  let isInteracting = false;
  let countryFeatures = null;

  // Antarctica id in Natural Earth TopoJSON
  const ANTARCTICA_ID = '010';

  function init(data) {
    mbtiData = data;
    mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;

    map = new mapboxgl.Map({
      container: 'map',
      style: CONFIG.STYLE,
      projection: 'globe',
      center: CONFIG.INITIAL_CENTER,
      zoom: CONFIG.INITIAL_ZOOM,
      maxZoom: CONFIG.MAX_ZOOM,
      minZoom: CONFIG.MIN_ZOOM,
      attributionControl: false,
      antialias: true,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
    if (window.innerWidth > 640) {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    }

    map.on('style.load', () => {
      setupAtmosphere();
      setupCountryLayers();
      setupInteractions();
      startAutoRotate();
    });

    return map;
  }

  function setupAtmosphere() {
    map.setFog({
      color: 'rgb(6, 8, 18)',
      'high-color': 'rgb(18, 24, 50)',
      'horizon-blend': 0.04,
      'space-color': 'rgb(2, 2, 8)',
      'star-intensity': 0.6,
    });
  }

  function fixAntimeridian(geojson) {
    geojson.features.forEach(f => processGeometry(f.geometry));
    return geojson;
  }

  function processGeometry(geometry) {
    if (!geometry) return;
    if (geometry.type === 'Polygon') fixPolygonCoords(geometry.coordinates);
    else if (geometry.type === 'MultiPolygon') geometry.coordinates.forEach(p => fixPolygonCoords(p));
  }

  function fixPolygonCoords(rings) {
    rings.forEach(ring => {
      let minLng = Infinity, maxLng = -Infinity;
      ring.forEach(c => { if (c[0] < minLng) minLng = c[0]; if (c[0] > maxLng) maxLng = c[0]; });
      if (maxLng - minLng > 180) ring.forEach(c => { if (c[0] < 0) c[0] += 360; });
    });
  }

  function setupCountryLayers() {
    fetch('data/countries-110m.json')
      .then(r => r.json())
      .then(topoData => {
        const countries = topojson.feature(topoData, topoData.objects.countries);

        // Remove Antarctica
        countries.features = countries.features.filter(f => f.id !== ANTARCTICA_ID);

        fixAntimeridian(countries);

        countries.features.forEach(f => {
          const info = mbtiData[f.id];
          if (info) {
            f.properties.mbti = info.mbti;
            f.properties.iso_a3 = info.iso_a3;
            f.properties.name = info.name_en;
            f.properties.color = getMBTIColor(info.mbti);
          }
        });

        countryFeatures = countries;

        map.addSource('mbti-countries', { type: 'geojson', data: countries });

        map.addLayer({
          id: 'country-fills',
          type: 'fill',
          source: 'mbti-countries',
          paint: {
            'fill-color': ['coalesce', ['get', 'color'], '#333'],
            'fill-opacity': 0.82,
            'fill-opacity-transition': { duration: 300 },
          },
        });

        map.addLayer({
          id: 'country-borders',
          type: 'line',
          source: 'mbti-countries',
          paint: { 'line-color': 'rgba(255,255,255,0.15)', 'line-width': 0.5 },
        });

        map.addLayer({
          id: 'country-hover',
          type: 'line',
          source: 'mbti-countries',
          paint: { 'line-color': '#FFD700', 'line-width': 2 },
          filter: ['==', 'iso_a3', ''],
        });

        // MBTI labels (Mapbox GL symbol - auto globe occlusion)
        const labelFeatures = [];
        countries.features.forEach(f => {
          if (!f.properties.mbti) return;
          const centroid = d3.geoCentroid(f);
          labelFeatures.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: centroid },
            properties: { mbti: f.properties.mbti },
          });
        });

        map.addSource('mbti-labels', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: labelFeatures },
        });

        map.addLayer({
          id: 'mbti-labels',
          type: 'symbol',
          source: 'mbti-labels',
          layout: {
            'text-field': ['get', 'mbti'],
            'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 1, 9, 3, 12, 5, 14, 6, 0],
            'text-allow-overlap': false,
            'text-padding': 2,
          },
          paint: {
            'text-color': '#ffffff',
            'text-opacity': ['interpolate', ['linear'], ['zoom'], 1, 0.75, 3, 0.9, 5, 0.6, 5.5, 0],
            'text-halo-color': 'rgba(0,0,0,0.7)',
            'text-halo-width': 1.5,
          },
        });
      });
  }

  function setupInteractions() {
    map.on('mousemove', 'country-fills', e => {
      if (!e.features.length) return;
      const f = e.features[0];
      if (!f.properties.mbti) return;
      map.getCanvas().style.cursor = 'pointer';
      map.setFilter('country-hover', ['==', 'iso_a3', f.properties.iso_a3]);
      document.dispatchEvent(new CustomEvent('country-hover', {
        detail: {
          name: f.properties.name,
          iso_a3: f.properties.iso_a3,
          mbti: f.properties.mbti,
          point: e.point,
        }
      }));
    });

    map.on('mouseleave', 'country-fills', () => {
      map.getCanvas().style.cursor = '';
      map.setFilter('country-hover', ['==', 'iso_a3', '']);
      document.dispatchEvent(new CustomEvent('country-leave'));
    });

    map.on('click', 'country-fills', e => {
      if (!e.features.length) return;
      const f = e.features[0];
      if (!f.properties.iso_a3) return;
      flyToCountry(f.properties.iso_a3, e.lngLat);
      document.dispatchEvent(new CustomEvent('country-click', {
        detail: { iso_a3: f.properties.iso_a3 }
      }));
    });

    map.on('mousedown', () => { stopAutoRotate(); isInteracting = true; });
    map.on('mouseup', () => { isInteracting = false; scheduleAutoRotate(); });
    map.on('touchstart', () => { stopAutoRotate(); isInteracting = true; });
    map.on('touchend', () => { isInteracting = false; scheduleAutoRotate(); });
    map.on('wheel', () => { stopAutoRotate(); scheduleAutoRotate(); });
  }

  function flyToCountry(isoA3, lngLat) {
    stopAutoRotate();
    let center = lngLat;
    if (!center && countryFeatures) {
      const feature = countryFeatures.features.find(f => f.properties.iso_a3 === isoA3);
      if (feature) {
        const c = d3.geoCentroid(feature);
        center = { lng: c[0], lat: c[1] };
      }
    }
    if (!center) return;

    // Zoom out slightly first then zoom in for visible fly effect
    const currentZoom = map.getZoom();
    const targetZoom = CONFIG.FLY_TO_ZOOM;
    const needsBounce = Math.abs(currentZoom - targetZoom) < 1;

    map.flyTo({
      center,
      zoom: needsBounce ? targetZoom - 0.5 : targetZoom,
      duration: CONFIG.FLY_TO_DURATION,
      essential: true,
    });

    if (needsBounce) {
      map.once('moveend', () => {
        map.easeTo({ zoom: targetZoom, duration: 400 });
      });
    }
  }

  function highlightType(mbtiType) {
    if (!map.getLayer('country-fills')) return;
    map.setPaintProperty('country-fills', 'fill-color', [
      'case', ['==', ['get', 'mbti'], mbtiType],
      ['coalesce', ['get', 'color'], '#333'], 'rgba(40,40,50,0.6)'
    ]);
    map.setPaintProperty('country-fills', 'fill-opacity', [
      'case', ['==', ['get', 'mbti'], mbtiType], 0.9, 0.3
    ]);
  }

  function resetHighlight() {
    if (!map.getLayer('country-fills')) return;
    map.setPaintProperty('country-fills', 'fill-color', ['coalesce', ['get', 'color'], '#333']);
    map.setPaintProperty('country-fills', 'fill-opacity', 0.82);
  }

  function startAutoRotate() {
    if (autoRotateId) return;
    autoRotateId = requestAnimationFrame(function rotate() {
      if (!isInteracting) {
        const c = map.getCenter();
        c.lng += CONFIG.AUTO_ROTATE_SPEED;
        map.setCenter(c);
      }
      autoRotateId = requestAnimationFrame(rotate);
    });
  }

  function stopAutoRotate() {
    if (autoRotateId) { cancelAnimationFrame(autoRotateId); autoRotateId = null; }
    if (autoRotateTimeout) { clearTimeout(autoRotateTimeout); autoRotateTimeout = null; }
  }

  function scheduleAutoRotate() {
    if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
    autoRotateTimeout = setTimeout(() => startAutoRotate(), CONFIG.AUTO_ROTATE_DELAY);
  }

  function resetView() {
    resetHighlight();
    map.flyTo({ center: CONFIG.INITIAL_CENTER, zoom: CONFIG.INITIAL_ZOOM, duration: 1500 });
    scheduleAutoRotate();
  }

  return { init, getMap: () => map, flyToCountry, resetView, startAutoRotate, stopAutoRotate, highlightType, resetHighlight };
})();
