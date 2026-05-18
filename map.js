import { loadHxl } from "./layers/hxlLayer.js";
import { loadHospitals } from "./layers/hospitalLayer.js";
import { initSidebar, setLoadingState } from "./sidebar.js";
import { MAP_CONFIG } from "./utils/config.js";
import { loadCsvData, formatDate, populateTable } from "./utils/csvHandler.js";
import { createEpiMarker } from "./utils/markerBuilder.js";
import chroma from 'https://esm.sh/chroma-js';

const hxlMarkers = L.markerClusterGroup({ disableClusteringAtZoom: MAP_CONFIG.CLUSTER_ZOOM });
const hospitalsMarkers = L.markerClusterGroup({ disableClusteringAtZoom: MAP_CONFIG.CLUSTER_ZOOM });
const epiCollectMarkers = L.markerClusterGroup({ disableClusteringAtZoom: MAP_CONFIG.CLUSTER_ZOOM });
const overlayLayers = {};

const map = L.map("map").setView(MAP_CONFIG.CENTER, MAP_CONFIG.ZOOM);

function addLayerControl() {

    const baseLayers = {
        OpenStreetMap: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }),
        "Google Maps": L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
            attribution: "&copy; Google",
            maxZoom: 20,
        }),
        "Google Satellite": L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            attribution: "&copy; Google",
            maxZoom: 20,
        }),
        "Google Hybrid": L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
            attribution: "&copy; Google",
            maxZoom: 20,
        }),
        "Google Terrain": L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
            attribution: "&copy; Google",
            maxZoom: 20,
        }),
    };
    const overlays = {
        "HXL": overlayLayers["HXL"],
        "Hospitals": overlayLayers["Hospitals"],
        "Population Density": overlayLayers["Population Density"],
        "EpiCollect": overlayLayers["EpiCollect"],
    };

    baseLayers.OpenStreetMap.addTo(map);
    overlays["Population Density"].addTo(map);

    L.control.layers(baseLayers, overlays).addTo(map);
}

initSidebar();
setLoadingState();

fetch("Uganda/uganda_hxl.geojson")
    .then(res => res.json())
    .then(data => {
        overlayLayers["HXL"] = loadHxl(data, hxlMarkers);
        addLayerControl();
    });

fetch("Uganda/hospitals.geojson")
    .then(res => res.json())
    .then(data => {
        overlayLayers["Hospitals"] = loadHospitals(data, hospitalsMarkers);
        addLayerControl();
    });


fetch("/Uganda/population.tif")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        console.log("File loaded. Size:", blob.size, "Type:", blob.type);
        return parseGeoraster(URL.createObjectURL(blob));
    })
    .then(georaster => {
        console.log("Success! GeoRaster loaded.");
        var scale = chroma.scale(['yellow', 'green', 'blue', 'black']).domain([0, 1, 10, 100]);

        const layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7,
            resolution: 50,
            pixelValuesToColorFn: function (values) {
                var population = values[0];
                if (population === -200) return;
                if (population < 0) return;
                return scale(population).hex();
            }
        });

        overlayLayers["Population Density"] = layer;
        addLayerControl();
    })
    .catch(err => {
        console.error("DEBUG:", err);
    });

loadCsvData("Uganda/epiCollectForm.csv")
    .then(data => {
        data.forEach(row => {
            const marker = createEpiMarker(row);
            if (marker) epiCollectMarkers.addLayer(marker);
        });

        document.getElementById("total-collected").textContent = data.length;
        populateTable(data);

        overlayLayers["EpiCollect"] = epiCollectMarkers;
        addLayerControl();
    })
    .catch(err => {
        console.error("Error loading CSV:", err);
    });
