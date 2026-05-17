import { createGeoJsonLayer } from "./createLayer.js";
import { LAYER_COLORS } from "../utils/config.js";

export function loadHxl(data, clusterGroup) {
    return createGeoJsonLayer(data, {
        ...LAYER_COLORS.hxl,
        layerType: "hxl",
        clusterGroup,
    });
}