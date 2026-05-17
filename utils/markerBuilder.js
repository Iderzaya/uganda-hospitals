import { EPIDATA_COLUMNS, COLORS } from "./config.js";

export function createEpiMarker(row) {
    const lat = parseFloat(row[EPIDATA_COLUMNS.lat]);
    const lng = parseFloat(row[EPIDATA_COLUMNS.lng]);

    if (isNaN(lat) || isNaN(lng)) return null;

    const marker = L.marker([lat, lng]).bindPopup(buildPopupHtml(row));
    return marker;
}

function buildPopupHtml(row) {
    const createdAt = new Date(row[EPIDATA_COLUMNS.createdAt]);
    const formattedDate = createdAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const imageHtml = row[EPIDATA_COLUMNS.image]
        ? `<img src="${row[EPIDATA_COLUMNS.image]}" alt="Hospital Photo" style="width:200px;height:auto;margin-bottom:10px;" />`
        : '<p style="color: gray;">No image</p>';

    return `
        <h3>${row[EPIDATA_COLUMNS.title]}</h3>
        ${imageHtml}
        <p>
            <b>Location:</b> ${row[EPIDATA_COLUMNS.lat]}, ${row[EPIDATA_COLUMNS.lng]}<br>
            <b>Maintenance Level:</b> ${row[EPIDATA_COLUMNS.maintenance]}<br>
            <b>Windows:</b> ${row[EPIDATA_COLUMNS.windows]}<br>
            <b>Entrance:</b> ${row[EPIDATA_COLUMNS.entrance]}<br>
            <b>Road leading to hospital:</b> ${row[EPIDATA_COLUMNS.road]}<br>
            <b>Can a car reach the door:</b> ${row[EPIDATA_COLUMNS.carAccess]}<br>
            <b>Note on cleanliness:</b> ${row[EPIDATA_COLUMNS.cleanliness]}<br>
            <b>Created at:</b> ${formattedDate}<br>
        </p>
    `;
}
