const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API endpoint for fetching EpiCollect data
    if (pathname === '/api/fetch-epicollect' && req.method === 'POST') {
        handleEpiCollectFetch(req, res);
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
            const { formRef, authToken } = payload;

            if (!formRef) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Form reference is required',
                }));
                return;
            }

            fetchEpiCollectAPI(formRef, authToken, (err, entries) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: err.message,
                    }));
                    return;
                }

                const csvFile = path.join(__dirname, 'Uganda', 'epiCollectForm.csv');
                const csvLines = convertToCSVLines(entries);

                fs.appendFile(csvFile, csvLines, (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: err.message,
                        }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: `Added ${entries.length} new entries`,
                        count: entries.length,
                        entries: entries,
                    }));
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

function fetchEpiCollectAPI(formRef, authToken, callback) {
    const projectSlug = 'hospital-infrastructure-mapping-kampala';
    const epicollectUrl = new URL(`https://five.epicollect.net/api/export/entries/${projectSlug}`);
    epicollectUrl.searchParams.append('form_ref', formRef);

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
                const entries = json?.data?.data || [];
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
        const answers = entry.answers || {};
        const createdAt = entry.created_at || '';

        return [
            entry.title || '',
            createdAt,
            answers['lat_2_What_is_your_locat'] || '',
            answers['long_2_What_is_your_locat'] || '',
            answers['3_Take_a_picture_of_'] || '',
            answers['4_How_does_the_build'] || '',
            answers['5_Are_there_windows_'] || '',
            answers['6_How_do_you_enter_t'] || '',
            answers['7_What_type_of_road_'] || '',
            answers['8_Can_a_car_reach_th'] || '',
            answers['9_How_clean_are_the_'] || '',
        ]
            .map(v => `"${String(v).replace(/"/g, '""')}"`)
            .join(',');
    }).join('\n') + '\n';
}

server.listen(PORT, () => {
    console.log(`🗺️  Dashboard running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
});
