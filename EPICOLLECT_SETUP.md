# EpiCollect Data Sync Setup

This guide explains how to configure automatic data retrieval from EpiCollect.

## Quick Start

### 1. Get Your EpiCollect Credentials

1. Go to [EpiCollect](https://five.epicollect.net/)
2. Navigate to your project (Uganda Hospitals)
3. Go to **Project Settings** → **API**
4. Copy your **Form Reference ID**
5. (Optional) Generate an **API Token** if the project is private

### 2. Configure in `epicollect.config.js`

Edit `epicollect.config.js` and add your credentials:

```javascript
window.epicollectConfig = {
    formRef: 'your_form_reference_id_here',
    authToken: 'your_api_token_here',  // Optional, only if project is private
    projectSlug: 'uganda-hospitals',
};
```

### 3. Start the Server

```bash
npm start
# or
node index.js
```

Open `http://localhost:3000` in your browser.

## Using the Data Sync Feature

### Manual Sync

1. Go to the **Collected Data** section in the sidebar
2. Click the **Refresh** button
3. The system will:
   - Fetch latest entries from EpiCollect
   - Append them to `Uganda/epiCollectForm.csv`
   - Update the map with new data
   - Show success/error message

### Automatic Sync (Optional)

To add automatic sync on page load, add this to `map.js`:

```javascript
// Auto-fetch on load (optional)
if (window.epicollectConfig?.formRef) {
    fetchEpiCollectData();
}
```

## How It Works

### Architecture

```
Frontend (Browser)
    ↓ Click "Refresh" button
    ↓
Backend (Node.js)
    ↓ POST /api/fetch-epicollect
    ↓
EpiCollect API
    ↓ Returns JSON entries
    ↓
CSV File (Uganda/epiCollectForm.csv)
    ↓ Appended with new data
    ↓
Frontend reloads
    ↓ Map updates with new markers
```

### Data Flow

1. **Browser** sends POST request to `/api/fetch-epicollect` with form reference
2. **Server** fetches data from EpiCollect API
3. **Server** converts JSON response to CSV format
4. **Server** appends CSV lines to existing file
5. **Server** returns success response with entry count
6. **Browser** shows status message and reloads page
7. **Map** loads updated CSV and displays new markers

## Troubleshooting

### "Form reference is required"
- Make sure you've configured `epicollect.config.js`
- Or enter form reference when prompted

### "Rate limit hit"
- EpiCollect API may have rate limits
- Check the status message for details
- Try again after a few minutes

### "API Error 401"
- Your authentication token may be invalid
- Check token in `epicollect.config.js`
- Regenerate token in EpiCollect project settings

### Data not appearing
- Check browser console (F12) for errors
- Verify CSV file is being written to `Uganda/epiCollectForm.csv`
- Check server logs for error messages

### "Failed to fetch data"
- Check project reference is correct
- Verify EpiCollect API is accessible
- Check firewall/network settings

## API Details

### EpiCollect API Endpoint

```
POST https://five.epicollect.net/api/export/entries
```

### Request Format

```json
{
    "formRef": "your_form_reference",
    "authToken": "optional_bearer_token"
}
```

### Response Format

```json
{
    "success": true,
    "message": "Added 10 new entries",
    "count": 10,
    "entries": [...]
}
```

## CSV Format

New entries are appended to `Uganda/epiCollectForm.csv` with columns:

- `title` - Entry title
- `created_at` - Timestamp
- `lat_2_What_is_your_locat` - Latitude
- `long_2_What_is_your_locat` - Longitude
- `3_Take_a_picture_of_` - Image URL
- `4_How_does_the_build` - Maintenance level
- `5_Are_there_windows_` - Windows info
- `6_How_do_you_enter_t` - Entrance info
- `7_What_type_of_road_` - Road type
- `8_Can_a_car_reach_th` - Car access
- `9_How_clean_are_the_` - Cleanliness notes

## Files Involved

- `epicollect.config.js` - Configuration storage
- `epicollect.js` - `fetchEpiCollectData()` function
- `index.js` - `/api/fetch-epicollect` endpoint
- `Uganda/epiCollectForm.csv` - Data storage

## Security Notes

⚠️ **Important:** Don't commit API tokens to git!

Add to `.gitignore`:
```
epicollect.config.js
```

Or use environment variables (future enhancement).
