import { createGeoJsonLayer } from "./createLayer.js";
import { LAYER_COLORS } from "../utils/config.js";

export function loadHospitals(data, clusterGroup) {
    return createGeoJsonLayer(data, {
        ...LAYER_COLORS.hospitals,
        layerType: "hospitals",
        clusterGroup,
    });
}