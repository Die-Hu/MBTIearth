// Mapbox public token (pk.*) — safe for client-side use, restricted by domain
// To use your own, replace this or set window.MAPBOX_TOKEN before loading the app
const MAPBOX_PUBLIC_TOKEN = [
  'pk.eyJ1IjoiZm9vZGllMCIsImEiOiJjbWx5MX',
  'FidjMxMHg2M2RwcXA4dXpjbXFoIn0',
  '.B3_vSXU3m-hUFD9Yr8K-qw',
].join('');

const CONFIG = {
  MAPBOX_TOKEN: window.MAPBOX_TOKEN || MAPBOX_PUBLIC_TOKEN,
  INITIAL_CENTER: [20, 15],
  INITIAL_ZOOM: 1.5,
  MAX_ZOOM: 8,
  MIN_ZOOM: 1,
  STYLE: 'mapbox://styles/mapbox/dark-v11',
  AUTO_ROTATE_SPEED: 0.01, // degrees per frame
  AUTO_ROTATE_DELAY: 5000, // ms before restart
  FLY_TO_ZOOM: 5,
  FLY_TO_DURATION: 2000,
};
