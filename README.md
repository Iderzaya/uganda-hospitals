# Uganda Hospitals Dashboard

A web-based interactive map dashboard for visualizing hospital data in Uganda using crowdsourced health facility survey data.

## Project Structure

```
├── index.html              # Main HTML entry point
├── index.js               # Node.js server file
├── map.js                 # Main map initialization and data loading
├── sidebar.js             # Sidebar feature display logic
├── state.js               # Global application state
├── styles.js              # Style utility functions
├── epicollect.js          # Modal overlay functionality
│
├── layers/                # Leaflet layer creation modules
│   ├── createLayer.js     # Generic GeoJSON layer factory
│   ├── hxlLayer.js        # HXL administrative boundary layer
│   └── hospitalLayer.js   # Hospital facilities layer
│
├── utils/                 # Utility functions
│   ├── config.js          # Centralized configuration (colors, styles, column names)
│   ├── csvHandler.js      # CSV parsing and table population
│   └── markerBuilder.js   # Marker and popup creation for survey data
│
├── style/                 # CSS files
│   ├── style.css          # Main layout styles
│   └── epi_style.css      # EpiCollect modal styles
│
└── Uganda/                # Data files
    ├── uganda_hxl.geojson     # Administrative boundaries
    ├── hospitals.geojson      # Hospital facilities
    ├── epiCollectForm.csv     # Survey data
    ├── epiCollectForm1.csv    # Alternative survey data
    └── population.tif         # Population density raster
```

## Features

- **Interactive Map Layers**
    - OpenStreetMap, Google Maps (satellite, hybrid, terrain) base layers
    - HXL administrative boundaries
    - Hospital facilities
    - Population density heatmap
    - EpiCollect survey data points

- **Marker Clustering** - Automatic clustering at zoom levels < 12

- **Feature Details** - Click any feature to view properties in sidebar

- **Survey Data Table** - Browse complete EpiCollect survey responses

- **Statistics** - Display total collected surveys and latest entry date

## Running the Project

```bash
# Start Node.js server (serves static files on port 3000)
node index.js

# Open browser to http://localhost:3000
```

## Configuration

All colors, styles, and data column names are centralized in `utils/config.js`:

- **COLORS** - Layer and UI colors
- **STYLES** - Default, highlight, and hover styles
- **LAYER_COLORS** - Per-layer color configuration
- **MAP_CONFIG** - Center, zoom level, and clustering settings
- **EPIDATA_COLUMNS** - CSV column name mappings

## Data Sources

- **HXL Data** - Health administrative boundaries
- **Hospital Data** - Health facility locations and details
- **EpiCollect Surveys** - Crowdsourced health facility condition assessments
- **Population Data** - Rasterized population density

## Technologies

- **Leaflet.js** - Interactive mapping library
- **Leaflet MarkerCluster** - Marker clustering plugin
- **Chroma.js** - Color scale generation
- **Papa Parse** - CSV parsing
- **GeoRaster** - Raster data visualization
