const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const duplicateDetector = require('./utils/duplicateDetector');

const PORT = 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API endpoint for fetching EpiCollect data
    if (pathname === '/api/fetch-epicollect' && req.method === 'POST') {
        handleEpiCollectFetch(req, res);
        return;
    }

    // API endpoint for validating locations
    if (pathname === '/api/validate-locations' && req.method === 'POST') {
        handleValidateLocations(req, res);
        return;
    }

    // API endpoint for detecting duplicate photos
    if (pathname === '/api/detect-duplicates' && req.method === 'POST') {
        handleDetectDuplicates(req, res);
        return;
    }

    // Default file serving
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 - File not found');
            return;
        }

        let contentType = 'text/plain';
        switch (ext) {
            case '.html':
                contentType = 'text/html';
                break;
            case '.json':
            case '.geojson':
                contentType = 'application/json';
                break;
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

function handleEpiCollectFetch(req, res) {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const payload = JSON.parse(body);
            const { formRef, projectSlug, authToken } = payload;

            if (!formRef || !projectSlug) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Form reference and project slug are required',
                }));
                return;
            }

            fetchEpiCollectAPI(projectSlug, formRef, authToken, (err, entries) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: err.message,
                    }));
                    return;
                }

                const csvFile = path.join(__dirname, 'Uganda', 'epiCollectForm.csv');

                if (entries.length === 0) {
                    console.log('No new entries to add');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'No new entries found',
                        count: 0,
                    }));
                    return;
                }

                // CSV Header row
                const csvHeaders = [
                    'ec5_uuid', 'created_at', 'uploaded_at','title','1_Facility_name', '2_Facility_type',
                    'latitude', 'longitude', 'accuracy', 'UTM_Northing', 'UTM_Easting', 'UTM_Zone',
                    '4_Take_a_picture_of_', '5_How_does_the_build', '6_Are_there_windows_', '7_How_do_you_enter_t',
                    '8_What_type_of_road_', '9_Can_a_car_reach_th', '10_How_clean_are_the',
                    'GPS Evaluation', 'GPS Confidence', 'AI Evaluation', 'AI Confidence', 'GPS Notes',
                    'Photo Hash', 'Duplicate Status'
                ];
                const headerRow = csvHeaders.map(h => `"${h}"`).join(',');

                // Read existing CSV to get existing UUIDs
                fs.readFile(csvFile, 'utf8', (err, csvData) => {
                    let existingUuids = new Set();
                    let fileExists = false;

                    if (!err && csvData && csvData.trim()) {
                        fileExists = true;
                        const lines = csvData.trim().split('\n');
                        // Skip header row (line 0)
                        for (let i = 1; i < lines.length; i++) {
                            const values = parseCSVLine(lines[i]);
                            if (values[0]) {
                                existingUuids.add(values[0]);
                            }
                        }
                    }

                    // Filter out entries that already exist
                    const newEntries = entries.filter(entry => !existingUuids.has(entry.ec5_uuid));

                    if (newEntries.length === 0) {
                        console.log(`All ${entries.length} entries already exist in CSV`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: 'No new entries found (all already in database)',
                            count: 0,
                        }));
                        return;
                    }

                    console.log(`Found ${newEntries.length} new entries (${existingUuids.size} already exist)`);
                    const csvLines = convertToCSVLines(newEntries);

                    console.log(`Converting ${newEntries.length} entries to CSV`);
                    console.log(`CSV lines length: ${csvLines.length}`);
                    console.log(`First line preview: ${csvLines.substring(0, 200)}`);

                    // If file doesn't exist or is empty, prepend header
                    const contentToWrite = fileExists ? csvLines : (headerRow + '\n' + csvLines);

                    fs.appendFile(csvFile, contentToWrite, (err) => {
                        if (err) {
                            console.error('Error appending to CSV:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: false,
                                error: err.message,
                            }));
                            return;
                        }

                        console.log(`Successfully appended ${newEntries.length} entries to ${csvFile}`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: `Added ${newEntries.length} new entries`,
                            count: newEntries.length,
                            entries: newEntries,
                        }));
                    });
                });
            });
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: error.message,
            }));
        }
    });
}

function fetchEpiCollectAPI(projectSlug, formRef, authToken, callback) {
    const epicollectUrl = new URL(`https://five.epicollect.net/api/export/entries/${projectSlug}`);

    const urlStr = epicollectUrl.toString();
    console.log('Fetching from:', urlStr);

    const options = {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Uganda-Hospitals-Dashboard',
        },
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    https.get(urlStr, options, (response) => {
        let data = '';

        response.on('data', chunk => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                console.log('API Response Status:', response.statusCode);

                if (response.statusCode !== 200) {
                    console.log('Response body:', data);
                    callback(new Error(`EpiCollect API Error: ${response.statusCode} - ${data}`));
                    return;
                }

                const json = JSON.parse(data);
                console.log('API Response status: entries endpoint');

                // Extract entries from the response
                let entries = [];
                if (Array.isArray(json)) {
                    entries = json;
                } else if (json.data && Array.isArray(json.data)) {
                    entries = json.data;
                } else if (json.data && Array.isArray(json.data.entries)) {
                    entries = json.data.entries;
                }

                console.log(`Fetched ${entries.length} entries from EpiCollect`);
                if (entries.length > 0) {
                    console.log('First entry keys:', Object.keys(entries[0]));
                    console.log('First entry:', JSON.stringify(entries[0], null, 2).substring(0, 500));
                }

                callback(null, entries);
            } catch (err) {
                callback(new Error(`Parse Error: ${err.message}`));
            }
        });
    }).on('error', callback);
}

function convertToCSVLines(entries) {
    if (!entries.length) return '';

    return entries.map(entry => {
        // Handle location object
        const location = entry['3_What_is_your_locat'] || {};
        const facilityType = entry['2_Facility_type'] || [];
        const facilityTypeStr = Array.isArray(facilityType) ? facilityType.join(', ') : facilityType;

        return [
            entry.ec5_uuid || '',
            entry.created_at || '',
            entry.uploaded_at || '',
            entry.title || '',
            entry['1_Facility_name'] || '',
            entry['2_Facility_type'] ? (Array.isArray(entry['2_Facility_type']) ? entry['2_Facility_type'][0] : entry['2_Facility_type']) : '',
            location.latitude || '',
            location.longitude || '',
            location.accuracy || '',
            location.UTM_Northing || '',
            location.UTM_Easting || '',
            location.UTM_Zone || '',
            entry['4_Take_a_picture_of_'] || '',
            entry['5_How_does_the_build'] ? (Array.isArray(entry['5_How_does_the_build']) ? entry['5_How_does_the_build'][0] : entry['5_How_does_the_build']) : '',
            entry['6_Are_there_windows_'] ? (Array.isArray(entry['6_Are_there_windows_']) ? entry['6_Are_there_windows_'][0] : entry['6_Are_there_windows_']) : '',
            entry['7_How_do_you_enter_t'] ? (Array.isArray(entry['7_How_do_you_enter_t']) ? entry['7_How_do_you_enter_t'][0] : entry['7_How_do_you_enter_t']) : '',
            entry['8_What_type_of_road_'] ? (Array.isArray(entry['8_What_type_of_road_']) ? entry['8_What_type_of_road_'][0] : entry['8_What_type_of_road_']) : '',
            entry['9_Can_a_car_reach_th'] ? (Array.isArray(entry['9_Can_a_car_reach_th']) ? entry['9_Can_a_car_reach_th'][0] : entry['9_Can_a_car_reach_th']) : '',
            entry['10_How_clean_are_the'] ? (Array.isArray(entry['10_How_clean_are_the']) ? entry['10_How_clean_are_the'][0] : entry['10_How_clean_are_the']) : '',
            '', // GPS Evaluation (empty for new entries)
            '', // GPS Confidence (empty for new entries)
            '', // AI Evaluation (empty for new entries)
            '', // AI Confidence (empty for new entries)
            '', // GPS Notes (empty for new entries)
            '', // Photo Hash (empty for new entries)
            '', // Duplicate Status (empty for new entries)
        ]
            .map(v => `"${String(v).replace(/"/g, '""')}"`)
            .join(',');
    }).join('\n') + '\n';
}

function handleValidateLocations(req, res) {
    try {
        const csvFile = path.join(__dirname, 'Uganda', 'epiCollectForm.csv');
        const hospitalsFile = path.join(__dirname, 'Uganda', 'hospitals.geojson');

        // Load hospitals database
        fs.readFile(hospitalsFile, 'utf8', (err, hospitalsData) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Failed to load hospitals database'
                }));
                return;
            }

            const hospitals = JSON.parse(hospitalsData).features;

            // Read CSV file
            fs.readFile(csvFile, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Failed to read CSV file'
                    }));
                    return;
                }

                // Parse CSV
                const lines = data.trim().split('\n');
                if (lines.length < 2) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'No entries to validate',
                        count: 0,
                        verified: 0
                    }));
                    return;
                }

                const headerLine = lines[0];
                const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));

                // Add GPS columns if they don't exist
                if (!headers.includes('GPS Evaluation')) {
                    headers.push('GPS Evaluation');
                }
                if (!headers.includes('GPS Confidence')) {
                    headers.push('GPS Confidence');
                }
                if (!headers.includes('GPS Notes')) {
                    headers.push('GPS Notes');
                }

                const updatedLines = [headers.map(h => `"${h}"`).join(',')];
                let verifiedCount = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line.trim()) continue;

                    // Parse CSV row values
                    const values = parseCSVLine(line);

                    // Create entry object from headers and values
                    const entry = {};
                    headers.forEach((header, idx) => {
                        if (idx < values.length) {
                            entry[header] = values[idx];
                        }
                    });

                    // Validate this entry
                    const validation = validateLocation(entry, hospitals, 1);

                    // Update values with validation results
                    const gpsEvaluationIdx = headers.indexOf('GPS Evaluation');
                    const gpsConfidenceIdx = headers.indexOf('GPS Confidence');
                    const gpsNotesIdx = headers.indexOf('GPS Notes');

                    if (gpsEvaluationIdx >= 0) {
                        values[gpsEvaluationIdx] = validation.status;
                    }
                    if (gpsConfidenceIdx >= 0) {
                        values[gpsConfidenceIdx] = Math.round(validation.confidence * 100).toString();
                    }
                    if (gpsNotesIdx >= 0) {
                        values[gpsNotesIdx] = validation.reason || "";
                    }

                    if (validation.status === 'Location Verified') {
                        verifiedCount++;
                    }

                    updatedLines.push(values.map(v => `"${v}"`).join(','));
                }

                // Write back to CSV
                fs.writeFile(csvFile, updatedLines.join('\n') + '\n', (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Failed to write CSV file'
                        }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: `Validated ${lines.length - 1} entries`,
                        count: lines.length - 1,
                        verified: verifiedCount
                    }));
                });
            });
        });
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: error.message
        }));
    }
}

// Helper function to calculate Haversine distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Helper function for fuzzy string matching
function fuzzyMatch(str1, str2) {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w));

    if (commonWords.length > 0) {
        return Math.min(commonWords.length / Math.max(words1.length, words2.length), 1);
    }

    const distance = levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    const similarity = 1 - (distance / maxLen);

    return Math.max(0, similarity);
}

// Levenshtein distance calculation
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

// Validate a single location against hospitals
function validateLocation(entry, hospitals, radiusKm = 1) {
    const entryLat = parseFloat(entry.latitude);
    const entryLng = parseFloat(entry.longitude);
    const entryName = entry.title || entry["1_Facility_type"] || "";

    if (isNaN(entryLat) || isNaN(entryLng)) {
        return {
            status: "Need Manual Review",
            confidence: 0,
            reason: "Invalid coordinates",
        };
    }

    // Find nearby hospitals
    const nearbyHospitals = hospitals
        .map(hospital => {
            const hospitalLat = hospital.geometry.coordinates[1];
            const hospitalLng = hospital.geometry.coordinates[0];
            const distance = calculateDistance(entryLat, entryLng, hospitalLat, hospitalLng);

            return {
                distance,
                hospital,
                nameMatch: fuzzyMatch(entryName, hospital.properties.name || ""),
            };
        })
        .filter(h => h.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

    if (nearbyHospitals.length === 0) {
        return {
            status: "Need Manual Review",
            confidence: 0.1,
            reason: "No facilities found within 1km",
        };
    }

    const closest = nearbyHospitals[0];

    // Calculate confidence (90% distance, 10% name match)
    const distanceScore = Math.max(0, 1 - (closest.distance / radiusKm));
    const nameScore = closest.nameMatch;
    const combinedScore = (distanceScore * 0.9) + (nameScore * 0.1);

    if (combinedScore > 0.7) {
        return {
            status: "Location Verified",
            confidence: Math.min(1, combinedScore + 0.15),
            reason: `Matched: ${closest.hospital.properties.name} (${closest.distance.toFixed(2)}km away)`,
        };
    } else if (combinedScore > 0.5) {
        return {
            status: "Need Manual Review",
            confidence: combinedScore,
            reason: `Possible match: ${closest.hospital.properties.name} (${closest.distance.toFixed(2)}km away)`,
        };
    } else {
        return {
            status: "Need Manual Review",
            confidence: Math.max(0.2, combinedScore),
            reason: `Nearest: ${closest.hospital.properties.name} (${closest.distance.toFixed(2)}km away) - weak match`,
        };
    }
}

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = "";
        } else {
            current += char;
        }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    return values;
}

async function handleDetectDuplicates(req, res) {
    try {
        const csvFile = path.join(__dirname, 'Uganda', 'epiCollectForm.csv');

        // Read CSV file
        fs.readFile(csvFile, 'utf8', async (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Failed to read CSV file'
                }));
                return;
            }

            try {
                // Parse CSV
                const lines = data.trim().split('\n');
                if (lines.length < 2) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'No entries to check',
                        count: 0,
                        duplicates: 0
                    }));
                    return;
                }

                const headerLine = lines[0];
                const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));

                // Add Photo Hash and Duplicate Status columns if they don't exist
                if (!headers.includes('Photo Hash')) {
                    headers.push('Photo Hash');
                }
                if (!headers.includes('Duplicate Status')) {
                    headers.push('Duplicate Status');
                }

                // Parse CSV rows
                const entries = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line.trim()) continue;

                    const values = parseCSVLine(line);
                    const entry = {};
                    headers.forEach((header, idx) => {
                        if (idx < values.length) {
                            entry[header] = values[idx];
                        }
                    });
                    entries.push(entry);
                }

                // Detect duplicates
                const entriesWithDuplicates = await duplicateDetector.detectDuplicates(entries);

                // Count duplicates
                let duplicateCount = 0;
                for (const entry of entriesWithDuplicates) {
                    if (entry['Duplicate Status'] && entry['Duplicate Status'].includes('Duplicate')) {
                        duplicateCount++;
                    }
                }

                // Write back to CSV with hashes and duplicate status
                const updatedLines = [headers.map(h => `"${h}"`).join(',')];

                for (const entry of entriesWithDuplicates) {
                    const values = [];
                    for (const header of headers) {
                        const value = entry[header] || '';
                        values.push(String(value).replace(/"/g, '""'));
                    }
                    updatedLines.push(values.map(v => `"${v}"`).join(','));
                }

                fs.writeFile(csvFile, updatedLines.join('\n') + '\n', (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Failed to write CSV file'
                        }));
                        return;
                    }

                    // Clean up temp files
                    duplicateDetector.cleanupTempFiles();

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: `Duplicate detection complete`,
                        count: entries.length,
                        duplicates: duplicateCount,
                        details: `${duplicateCount} exact or near-duplicate photos detected`
                    }));
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: error.message
        }));
    }
}

server.listen(PORT, () => {
    console.log(`🗺️  Dashboard running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
});
