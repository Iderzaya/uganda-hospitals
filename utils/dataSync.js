export async function fetchEpiCollectDataFromServer(formRef, authToken = null) {
    const statusEl = document.getElementById('fetch-status');
    const btnEl = document.getElementById('fetch-btn');

    try {
        showStatus('Fetching data...', 'info');
        btnEl.disabled = true;

        const response = await fetch('/api/fetch-epicollect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                formRef,
                authToken,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch data');
        }

        showStatus(`✓ Added ${result.count} new entries`, 'success');
        return result;
    } catch (error) {
        showStatus(`✗ Error: ${error.message}`, 'error');
        console.error('Data sync error:', error);
        throw error;
    } finally {
        btnEl.disabled = false;
    }
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('fetch-status');
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    statusEl.style.color = getStatusColor(type);
}

function getStatusColor(type) {
    switch (type) {
        case 'success':
            return '#4CAF50';
        case 'error':
            return '#f44336';
        case 'info':
            return '#2196F3';
        default:
            return '#333';
    }
}

export function configureEpiCollect(formRef, authToken = null) {
    window.epicollectConfig = { formRef, authToken };
}

export async function reloadMapData() {
    if (window.location.hash === '') {
        window.location.reload();
    }
}
