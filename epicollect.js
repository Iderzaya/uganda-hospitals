function showEpicollect() {
    document.getElementById("epiCollectOverlay").style.display = "flex";
    const overlay = document.getElementById("epiCollectOverlay");

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeEpicollect();
        }
    });
}

function closeEpicollect() {
    document.getElementById("epiCollectOverlay").style.display = "none";
}

function updateLastSyncTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const dateStr = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    localStorage.setItem('lastSyncTime', now.toISOString());

    const syncEl = document.getElementById('last-sync');
    syncEl.textContent = `Last synced: ${dateStr} at ${timeStr}`;
}

function displayLastSyncTime() {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
        const date = new Date(lastSync);
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        const syncEl = document.getElementById('last-sync');
        syncEl.textContent = `Last synced: ${dateStr} at ${timeStr}`;
    }
}

// Show last sync time on page load
document.addEventListener('DOMContentLoaded', displayLastSyncTime);

async function fetchEpiCollectData() {
    try {
        const formRef = window.epicollectConfig?.formRef;
        const authToken = window.epicollectConfig?.authToken || null;

        if (!formRef) {
            const statusEl = document.getElementById('fetch-status');
            statusEl.textContent = '✗ Form reference not configured in epicollect.config.js';
            statusEl.style.color = '#f44336';
            statusEl.style.display = 'block';
            return;
        }

        const response = await fetch('/api/fetch-epicollect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formRef, authToken }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch data');
        }

        const statusEl = document.getElementById('fetch-status');
        statusEl.textContent = `✓ Successfully added ${result.count} new entries`;
        statusEl.style.color = '#4CAF50';
        statusEl.style.display = 'block';

        updateLastSyncTime();

        document.getElementById('fetch-btn').disabled = true;
        setTimeout(() => {
            statusEl.style.display = 'none';
            document.getElementById('fetch-btn').disabled = false;
            window.location.reload();
        }, 2000);
    } catch (error) {
        const statusEl = document.getElementById('fetch-status');
        statusEl.textContent = `✗ Error: ${error.message}`;
        statusEl.style.color = '#f44336';
        statusEl.style.display = 'block';
        console.error('Data sync error:', error);
    }
}