// sidebar.js

const sidebarState = {
    container: null,
};

export function initSidebar(selector = ".sidebar-content") {
    sidebarState.container = document.querySelector(selector);

    if (!sidebarState.container) {
        console.warn("Sidebar container not found:", selector);
        return;
    }

    setEmptyState();
}

/**
 * Render feature properties
 */
export function updateSidebar(feature, layerType = "feature") {
    if (!sidebarState.container) return;

    if (!feature || !feature.properties) {
        setEmptyState();
        return;
    }

    const color = getLayerColor(layerType);

    let html = `
        <div class="info">
            <h4 style="display:flex;align-items:center;">
                ${createDot(color)}
                Feature Properties
            </h4>
            <div class="feature-props">
    `;

    for (const key in feature.properties) {
        const value = feature.properties[key];

        if (value !== null && value !== undefined && value !== "") {
            html += `
                <div class="prop">
                    <strong>${escapeHtml(key)}:</strong>
                    <p>${escapeHtml(String(value))}</p>
                </div>
            `;
        }
    }

    html += `
            </div>
        </div>
    `;

    sidebarState.container.innerHTML = html;
}

/**
 * Show default empty state
 */
export function setEmptyState() {
    if (!sidebarState.container) return;

    sidebarState.container.innerHTML = `
        <div class="no-selection">
            Click on a feature to view details
        </div>
    `;
}

export function setLoadingState(text = "Loading features...") {
    if (!sidebarState.container) return;

    sidebarState.container.innerHTML = `
        <div class="loading">${text}</div>
    `;
}

function getLayerColor(type) {
    switch (type) {
        case "hxl":
            return "#4ECDC4";
        case "hospitals":
            return "#FF9500";
        default:
            return "#999";
    }
}

function createDot(color) {
    return `
        <span style="
            display:inline-block;
            width:10px;
            height:10px;
            border-radius:50%;
            background:${color};
            margin-right:8px;
        "></span>
    `;
}

function escapeHtml(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}