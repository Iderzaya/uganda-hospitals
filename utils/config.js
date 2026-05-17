export const COLORS = {
    HXL: "#4ECDC4",
    HOSPITALS: "#FF9500",
    PRIMARY: "#FF6B6B",
    TEXT: "#333",
    GRAY: "#999",
    LIGHT_GRAY: "#ccc",
};

export const STYLES = {
    DEFAULT: {
        fillColor: COLORS.HXL,
        weight: 1,
        opacity: 0.8,
        color: COLORS.TEXT,
        fillOpacity: 0.6,
    },
    HIGHLIGHT: {
        fillColor: COLORS.PRIMARY,
        weight: 3,
        opacity: 1,
        color: "#8B0000",
        fillOpacity: 0.9,
    },
    HOVER: {
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
    },
};

export const LAYER_COLORS = {
    hxl: {
        color: COLORS.HXL,
        selectedColor: COLORS.PRIMARY,
    },
    hospitals: {
        color: COLORS.HOSPITALS,
        selectedColor: COLORS.PRIMARY,
    },
};

export const MAP_CONFIG = {
    CENTER: [1.373, 32.29],
    ZOOM: 7,
    CLUSTER_ZOOM: 12,
};

export const EPIDATA_COLUMNS = {
    lat: "lat_2_What_is_your_locat",
    lng: "long_2_What_is_your_locat",
    title: "title",
    image: "3_Take_a_picture_of_",
    maintenance: "4_How_does_the_build",
    windows: "5_Are_there_windows_",
    entrance: "6_How_do_you_enter_t",
    road: "7_What_type_of_road_",
    carAccess: "8_Can_a_car_reach_th",
    cleanliness: "9_How_clean_are_the_",
    createdAt: "created_at",
};
