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

export function populateTable(data, headers = null) {
    const headersToUse = headers || Object.keys(data[0] || {});
    const thead = document.querySelector("#csvTable thead");
    const tbody = document.querySelector("#csvTable tbody");

    if (!thead || !tbody) return;

    let headerHTML = "<tr>";
    headersToUse.forEach(header => {
        headerHTML += `<th>${header}</th>`;
    });
    headerHTML += "</tr>";
    thead.innerHTML = headerHTML;

    let bodyHTML = "";
    data.forEach(row => {
        bodyHTML += "<tr>";
        headersToUse.forEach(header => {
            bodyHTML += `<td>${row[header] || ""}</td>`;
        });
        bodyHTML += "</tr>";
    });
    tbody.innerHTML = bodyHTML;
}
