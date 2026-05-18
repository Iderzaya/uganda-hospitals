// EpiCollect Configuration
window.epicollectConfig = {
    formRef: '004763649a194fe0b26e4db270ea6a8c',
    authToken: null,
    projectSlug: 'hospital-infrastructure-mapping-kampala',
};

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

function updateLastValidationTime() {
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

    localStorage.setItem('lastValidationTime', now.toISOString());

    const validationEl = document.getElementById('last-validation');
    validationEl.textContent = `Last validated: ${dateStr} at ${timeStr}`;
}

function displayLastValidationTime() {
    const lastValidation = localStorage.getItem('lastValidationTime');
    if (lastValidation) {
        const date = new Date(lastValidation);
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        const validationEl = document.getElementById('last-validation');
        validationEl.textContent = `Last validated: ${dateStr} at ${timeStr}`;
    }
}

function updateLastDuplicateCheckTime() {
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

    localStorage.setItem('lastDuplicateCheckTime', now.toISOString());

    const duplicateEl = document.getElementById('last-duplicate-check');
    duplicateEl.textContent = `Last checked: ${dateStr} at ${timeStr}`;
}

function displayLastDuplicateCheckTime() {
    const lastCheck = localStorage.getItem('lastDuplicateCheckTime');
    if (lastCheck) {
        const date = new Date(lastCheck);
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });

        const duplicateEl = document.getElementById('last-duplicate-check');
        duplicateEl.textContent = `Last checked: ${dateStr} at ${timeStr}`;
    }
}

async function detectDuplicatePhotos() {
    try {
        const statusEl = document.getElementById('fetch-status');
        const btnEl = document.getElementById('duplicate-btn');

        statusEl.textContent = '⏳ Analyzing photos for duplicates... (This may take a few minutes)';
        statusEl.style.color = '#2196F3';
        statusEl.style.display = 'block';
        btnEl.disabled = true;

        const response = await fetch('/api/detect-duplicates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Duplicate detection failed');
        }

        statusEl.textContent = `✓ ${result.details || 'Duplicate detection complete'}`;
        statusEl.style.color = '#4CAF50';

        updateLastDuplicateCheckTime();

        setTimeout(() => {
            statusEl.style.display = 'none';
            btnEl.disabled = false;
            window.location.reload();
        }, 2000);
    } catch (error) {
        const statusEl = document.getElementById('fetch-status');
        statusEl.textContent = `✗ Error: ${error.message}`;
        statusEl.style.color = '#f44336';
        statusEl.style.display = 'block';
        document.getElementById('duplicate-btn').disabled = false;
        console.error('Duplicate detection error:', error);
    }
}

// Show last sync, validation, and duplicate check times on page load
document.addEventListener('DOMContentLoaded', () => {
    displayLastSyncTime();
    displayLastValidationTime();
    displayLastDuplicateCheckTime();
});

async function validateLocations() {
    try {
        const statusEl = document.getElementById('fetch-status');
        const btnEl = document.getElementById('validate-btn');

        statusEl.textContent = '⏳ Validating locations...';
        statusEl.style.color = '#2196F3';
        statusEl.style.display = 'block';
        btnEl.disabled = true;

        const response = await fetch('/api/validate-locations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Validation failed');
        }

        statusEl.textContent = `✓ Validated ${result.count} entries (${result.verified} verified)`;
        statusEl.style.color = '#4CAF50';

        updateLastValidationTime();

        setTimeout(() => {
            statusEl.style.display = 'none';
            btnEl.disabled = false;
            window.location.reload();
        }, 2000);
    } catch (error) {
        const statusEl = document.getElementById('fetch-status');
        statusEl.textContent = `✗ Error: ${error.message}`;
        statusEl.style.color = '#f44336';
        statusEl.style.display = 'block';
        document.getElementById('validate-btn').disabled = false;
        console.error('Validation error:', error);
    }
}

async function fetchEpiCollectData() {
    try {
        const formRef = window.epicollectConfig?.formRef;
        const projectSlug = window.epicollectConfig?.projectSlug;
        const authToken = window.epicollectConfig?.authToken || null;

        if (!formRef || !projectSlug) {
            const statusEl = document.getElementById('fetch-status');
            statusEl.textContent = '✗ EpiCollect config incomplete in epicollect.config.js';
            statusEl.style.color = '#f44336';
            statusEl.style.display = 'block';
            return;
        }

        const response = await fetch('/api/fetch-epicollect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formRef, projectSlug, authToken }),
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