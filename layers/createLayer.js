import { state } from "../state.js";
import { defaultStyle, highlightStyle } from "../styles.js";
import { updateSidebar } from "../sidebar.js";
import { STYLES } from "../utils/config.js";

export function createGeoJsonLayer(data, options) {
    const {
        color,
        selectedColor,
        layerType,
        clusterGroup,
    } = options;

    const layer = L.geoJSON(data, {
        style: defaultStyle,
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: createCircleIcon(color),
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                }),
            });
        },
    });

    layer.eachLayer((l) => {
        l.on("click", () => handleClick(l, layerType, selectedColor));
        l.on("mouseover", () => handleHover(l));
        l.on("mouseout", () => handleOut(l));

        clusterGroup.addLayer(l);
    });

    return clusterGroup;
}

function handleClick(layer, layerType, selectedColor) {
    if (state.selectedLayer) resetLayer(state.selectedLayer);

    state.selectedFeature = layer.feature;
    state.selectedLayer = layer;
    state.selectedLayerType = layerType;

    applyHighlight(layer, selectedColor);
    updateSidebar(layer.feature, layerType);
}

function resetLayer(layer) {
    if (layer.setStyle) {
        layer.setStyle(defaultStyle());
    }
}

function applyHighlight(layer, color) {
    if (layer.setStyle) {
        layer.setStyle(highlightStyle());
    } else {
        layer.setIcon(L.icon({ iconUrl: createCircleIcon(color) }));
    }
}

function handleHover(layer) {
    if (state.selectedLayer !== layer && layer.setStyle) {
        layer.setStyle(STYLES.HOVER);
    }
}

function handleOut(layer) {
    if (state.selectedLayer !== layer && layer.setStyle) {
        layer.setStyle(defaultStyle());
    }
}



function createCircleIcon(color) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" fill="${color}" stroke="#333" stroke-width="1"/>
        </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
