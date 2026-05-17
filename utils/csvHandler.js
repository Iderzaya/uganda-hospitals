export async function loadCsvData(filePath) {
    const response = await fetch(filePath);
    const csvText = await response.text();

    return Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
    }).data;
}

export function getLatestDate(data, dateField) {
    const dates = data
        .map(row => new Date(row[dateField]))
        .filter(date => !isNaN(date));

    if (dates.length === 0) return null;

    return new Date(Math.max(...dates));
}

export function formatDate(date) {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

const COLUMN_CONFIG = {
    created_at: "Date Collected",
    "1_Facility_type": "Facility Type",
    lat_2_What_is_your_locat: "Latitude",
    long_2_What_is_your_locat: "Longitude",
    "3_Take_a_picture_of_": "Photo",
    "4_How_does_the_build": "Building Condition",
    "5_Are_there_windows_": "Windows",
    "6_How_do_you_enter_t": "Entrance",
    "7_What_type_of_road_": "Road Type",
    "8_Can_a_car_reach_th": "Car Access",
    "9_How_clean_are_the_": "Cleanliness",
};

const COLUMNS_TO_SHOW = Object.keys(COLUMN_CONFIG);

export function populateTable(data) {
    const thead = document.querySelector("#csvTable thead");
    const tbody = document.querySelector("#csvTable tbody");

    if (!thead || !tbody) return;

    const headerNames = [
        ...COLUMNS_TO_SHOW.map(col => COLUMN_CONFIG[col]),
        "AI Evaluation",
        "AI Confidence Score",
    ];

    let headerHTML = "<tr>";
    headerNames.forEach(header => {
        headerHTML += `<th>${header}</th>`;
    });
    headerHTML += "</tr>";
    thead.innerHTML = headerHTML;

    let bodyHTML = "";
    data.forEach(row => {
        bodyHTML += "<tr>";

        COLUMNS_TO_SHOW.forEach(colKey => {
            const value = row[colKey] || "";

            if (colKey === "3_Take_a_picture_of_" && value) {
                bodyHTML += `<td><img src="${value}" alt="Photo" style="max-width: 100px; max-height: 80px; cursor: pointer;" onclick="window.open('${value}', '_blank')" /></td>`;
            } else if (colKey === "created_at" && value) {
                const date = new Date(value);
                const formatted = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });
                bodyHTML += `<td>${formatted}</td>`;
            } else {
                bodyHTML += `<td>${value}</td>`;
            }
        });

        bodyHTML += `<td style="text-align: center;">-</td>`;
        bodyHTML += `<td style="text-align: center;">-</td>`;

        bodyHTML += "</tr>";
    });

    tbody.innerHTML = bodyHTML;
}
