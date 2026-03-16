# MBTI Earth

**What if every country had a personality type?**

![MBTI Earth 3D Globe](assets/map_2x_optimized.gif)

MBTI Earth is an interactive 3D globe that playfully maps MBTI personality types onto 195+ countries. Spin the globe, click a country, and discover its imagined personality -- complete with dimension breakdowns, fun descriptions, and an AI chat companion named Atlas who knows way too much about fictional country personalities.

**[Live Demo](https://die-hu.github.io/MBTIearth/)**

---

> **Disclaimer:** This project is purely for fun and creative exploration. MBTI personality types do **not** and **cannot** represent real countries, cultures, or populations. There is no scientific, psychological, or sociological basis for assigning personality types to nations. This is an abstract artistic expression and visualization exercise -- nothing more. Please don't take it seriously. We certainly didn't.

---

## Features

- **Interactive 3D Globe** -- Rotate, zoom, and explore the world with smooth Mapbox GL-powered navigation
- **195+ Countries Mapped** -- Every recognized country has been assigned a type (with great artistic liberty)
- **Search** -- Find countries by name or filter by MBTI type
- **Detailed Dimension Analysis** -- See E/I, S/N, T/F, J/P breakdowns for each country
- **Atlas AI Chat** -- An AI assistant that can discuss any country's "personality" with you
- **Type Legend with Filtering** -- Click any type in the legend to highlight all countries that share it
- **Responsive Design** -- Works on desktop and mobile

## Tech Stack

- Vanilla JavaScript (no frameworks, no build step)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) v3
- [D3.js](https://d3js.org/) (geo projections and arrays)
- [TopoJSON](https://github.com/topojson/topojson) for efficient map data
- CSS3

## Quick Start

No build tools needed. Just serve the files:

```bash
# Option 1: Python
python -m http.server

# Option 2: Node
npx serve

# Option 3: Just open index.html in your browser
open index.html
```

Then visit `http://localhost:8000` (or whichever port your server uses).

## Project Structure

```
MBTIearth/
├── index.html              # Main page
├── css/
│   └── style.css           # All styles
├── js/
│   ├── app.js              # Tooltip and legend UI
│   ├── map.js              # Globe rendering and interaction
│   ├── panels.js           # Country info panel
│   ├── search.js           # Search functionality
│   ├── chat.js             # Atlas AI chat
│   ├── colors.js           # MBTI color mapping
│   └── config.js           # Configuration and constants
├── data/
│   ├── mbti-countries.json  # Country-to-MBTI assignments
│   └── countries-110m.json  # TopoJSON world map data
└── assets/
    └── characters/          # MBTI character illustrations (SVG)
```

## Roadmap

Some ideas for where this could go next:

- More cultural data sources to inform (and debate) type assignments
- Community voting on country types
- Historical "MBTI shifts" -- how a country's type might change over decades
- Side-by-side country comparison tools
- Internationalization (i18n) support

If any of these sound interesting to you, contributions are welcome.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get involved.

## License

[MIT](LICENSE)
