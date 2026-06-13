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
    lat: "latitude",
    lng: "longitude",
    submitted_by: "1_Full_name",
    title: "2_Facility_name",
    type: "3_Facility_type",
    image: "5_Take_a_picture_of_",
    maintenance: "6_How_does_the_build",
    windows: "7_Are_there_windows_",
    entrance: "8_How_do_you_enter_t",
    road: "9_What_type_of_road_",
    carAccess: "10_Can_a_car_reach_t",
    cleanliness: "11_How_clean_are_the_",
    createdAt: "created_at",
};
