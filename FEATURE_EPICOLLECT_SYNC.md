# EpiCollect Data Sync Feature

## Overview

This feature allows automatic retrieval of latest survey data from EpiCollect and appends it to the local CSV file.

## What's New

### Frontend Components

**HTML Changes** (`index.html`)
- Added "Refresh" button in the "Collected Data" sidebar section
- Added status message display area (`#fetch-status`)

**JavaScript Functions** (`epicollect.js`)
- `fetchEpiCollectData()` - Main function that triggers the sync process
  - Reads form reference from `window.epicollectConfig`
  - Prompts for form reference if not configured
  - Sends request to backend
  - Handles success/error feedback
  - Auto-reloads page after success

**Configuration** (`epicollect.config.js`)
- Centralized credentials storage
- Can be updated with your EpiCollect API details
- Excluded from git to protect credentials

### Backend Components

**Node.js Server** (`index.js`)
- Added `/api/fetch-epicollect` POST endpoint
- Validates form reference
- Calls EpiCollect API using native `https` module
- Converts JSON response to CSV format
- Appends to `Uganda/epiCollectForm.csv`
- Returns success/error response

**Helper Functions** (`index.js`)
- `handleEpiCollectFetch()` - Processes incoming sync requests
- `fetchEpiCollectAPI()` - Calls EpiCollect HTTPS API
- `convertToCSVLines()` - Formats entries as CSV rows

### Utility Modules

**Not currently used but available for future:**
- `utils/dataSync.js` - Frontend data sync handler
- `utils/epicollectAPI.js` - Reusable API utilities

## Usage

### Step 1: Configure Credentials

Edit `epicollect.config.js`:

```javascript
window.epicollectConfig = {
    formRef: 'your_form_ref_from_epicollect',
    authToken: null,  // Leave null for public projects
    projectSlug: 'uganda-hospitals',
};
```

### Step 2: Run Server

```bash
npm start
```

### Step 3: Click Refresh Button

1. Open dashboard in browser
2. Find "Collected Data" section in sidebar
3. Click the "Refresh" button
4. Wait for status message
5. Page auto-reloads with new data

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│ User clicks "Refresh" button in sidebar                 │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ fetchEpiCollectData() in epicollect.js                  │
│ - Reads formRef from window.epicollectConfig            │
│ - Sends POST to /api/fetch-epicollect                   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Node.js Server (index.js)                               │
│ - handleEpiCollectFetch() processes request             │
│ - fetchEpiCollectAPI() calls EpiCollect HTTPS API       │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ EpiCollect API                                          │
│ - Returns JSON with survey entries                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Server processes response                               │
│ - Validates entries                                     │
│ - Converts to CSV format                                │
│ - Appends to Uganda/epiCollectForm.csv                  │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Server sends success response                           │
│ - Entry count                                           │
│ - Confirmation message                                 │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Browser displays status message                         │
│ - Shows: "✓ Successfully added X new entries"           │
│ - Auto-reloads page after 2 seconds                     │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│ Map refreshes with new data                             │
│ - Loads updated CSV file                               │
│ - Displays new markers on map                           │
│ - Updates statistics (total, last added)                │
└─────────────────────────────────────────────────────────┘
```

## Data Transformation

EpiCollect JSON → CSV

```
Input (EpiCollect API):
{
    "title": "Hospital A",
    "created_at": "2024-05-17T10:30:00Z",
    "answers": {
        "lat_2_What_is_your_locat": "1.234",
        "long_2_What_is_your_locat": "32.456",
        ...
    }
}

Output (CSV append):
"Hospital A","2024-05-17T10:30:00Z","1.234","32.456",...
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Form reference is required" | Not configured | Edit `epicollect.config.js` |
| "EpiCollect API Error: 401" | Invalid auth token | Check token in config file |
| "EpiCollect API Error: 404" | Invalid form reference | Verify form ref in EpiCollect |
| "EpiCollect API Error: 429" | Rate limited | Wait a few minutes |
| File write error | Permission issue | Check file permissions on CSV |

## Files Modified/Added

### Added
- `epicollect.config.js` - Configuration
- `EPICOLLECT_SETUP.md` - Setup instructions
- `utils/dataSync.js` - Frontend sync handler
- `utils/epicollectAPI.js` - API utilities
- `FEATURE_EPICOLLECT_SYNC.md` - This file

### Modified
- `index.html` - Added Refresh button + status element
- `epicollect.js` - Added `fetchEpiCollectData()` function
- `index.js` - Added `/api/fetch-epicollect` endpoint
- `.gitignore` - Added `epicollect.config.js`

## Security

⚠️ **Important Notes:**
- `epicollect.config.js` is in `.gitignore` and won't be committed
- Never commit API tokens or credentials to git
- Keep auth tokens secret
- For sensitive projects, use environment variables instead

## Future Enhancements

Potential improvements:
1. **Scheduled sync** - Auto-fetch every hour/day
2. **Deduplication** - Skip entries already in CSV
3. **Date filtering** - Only fetch new entries since last sync
4. **Environment variables** - Store credentials in `.env`
5. **Progress indicator** - Show loading animation during fetch
6. **Batch operations** - Fetch multiple pages of data
7. **Database storage** - Store in database instead of CSV
8. **Sync history** - Track when/how many entries were synced

## API Reference

### POST /api/fetch-epicollect

**Request:**
```json
{
    "formRef": "form_reference_id",
    "authToken": "optional_bearer_token"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Added 10 new entries",
    "count": 10,
    "entries": [...]
}
```

**Error Response (500):**
```json
{
    "success": false,
    "error": "Error message"
}
```

## Testing

To test the feature:

1. **Start server**: `npm start`
2. **Configure credentials** in `epicollect.config.js`
3. **Open dashboard**: http://localhost:3000
4. **Click Refresh** button
5. **Check status message** for success/error
6. **Verify CSV** was updated: `Uganda/epiCollectForm.csv`
7. **Check map** for new markers

## Troubleshooting

See `EPICOLLECT_SETUP.md` for detailed troubleshooting guide.

## Contact

For issues with EpiCollect API:
- Visit: https://five.epicollect.net/
- Check API documentation: https://epicollect.net/developers
