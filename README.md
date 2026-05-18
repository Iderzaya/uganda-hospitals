# Uganda Hospitals Dashboard

A web-based application for collecting, validating, and visualizing hospital infrastructure data across Uganda.

## 📱 What is This?

The Uganda Hospitals Dashboard helps you:
- **Collect** survey data about hospital conditions from the field using EpiCollect
- **View** all collected surveys on an interactive map
- **Validate** GPS coordinates to ensure surveys are recorded at real hospitals
- **Analyze** hospital infrastructure quality across Uganda

---

## 🎯 How It Works

### The Map View (Left Side)
The interactive map shows:
- 🏥 **Hospital Locations** (orange dots) - 7,463 hospitals in Uganda
- 📍 **Survey Points** (blue dots) - Hospitals you've surveyed
- 🌍 **Population Density** (color gradient) - Shows population across regions
- 🤝 **HXL Data** (cyan areas) - Humanitarian data zones

**What you can do:**
- Switch between different map styles (OpenStreetMap, Google Maps, Satellite, etc.)
- Click on any hospital or survey point to see details
- Zoom in/out to explore different regions
- Toggle layers on/off using the menu at bottom right

### The Control Panel (Right Side)

#### 📊 **Feature Details** (Top Section)
When you click on a location on the map, this shows:
- The facility name
- Location details
- Any available information about that location

#### 📋 **Collected Data** (Middle Section)
Shows your survey statistics:

**Statistics:**
- **Total collected survey** - How many surveys have been submitted
- **Last added** - When the most recent survey was added
- **See survey** - Click "Open" to view all surveys in a detailed table

**Action Buttons:**

| Button | What It Does | When to Use |
|--------|-------------|-----------|
| 🔄 **Refresh** | Syncs latest surveys from EpiCollect field teams | After field teams submit new surveys |
| ✓ **Validate** | Checks if survey GPS coordinates are accurate | Before analyzing or trusting the data |
| 📂 **Open** | Shows all surveys in a detailed table format | To review individual survey details |

#### 🏥 **Hospital Data** (Bottom Section)
Reference information:
- **Total Uganda hospitals** - 7,463 facilities nationwide
- **Total Kampala hospitals** - 2,447 in the capital region

---

## 📊 Understanding Your Survey Data

Click **"Open"** to view all surveys in a table with these columns:

### Basic Information:
- **Facility Type** - Hospital, clinic, health center, etc.
- **Photo** - Image taken at the facility (click to enlarge)
- **Date** - When the survey was collected

### Facility Condition:
- **Building Condition** - Well maintained, Partially maintained, etc.
- **Windows** - Does it have windows? (Yes/No)
- **Entrance** - Steps, ramp, level ground, etc.
- **Road Type** - Tarmac, dirt, gravel, etc.
- **Car Access** - Can a vehicle reach the door? (Yes/No)
- **Cleanliness** - General cleanliness level

### GPS Validation Results:
- **GPS Evaluation** - Is the location accurate?
  - 🟢 **"Location Verified"** (green) = This is a real hospital
  - 🟠 **"Need Manual Review"** (orange) = Location needs checking
  
- **GPS Confidence** - How confident the system is (0-100%)
  - 100% = Perfect match with known hospital location
  - 50-70% = Possible match, needs review
  - <50% = Weak match, likely inaccurate
  
- **GPS Notes** - Details explaining the validation
  - Example: "Matched: Tahil Pharmacy (0.01km away)" 
  - Example: "No facilities found within 1km"

---

## ✓ GPS Validation Explained

When you click **"Validate"**, the system:

1. Reads all your survey locations
2. Compares GPS coordinates against a database of 7,463 hospitals
3. Finds hospitals within 1km of each survey point
4. Checks if the facility name matches
5. Calculates a confidence score
6. Updates the survey table with results

### What The Colors Mean:

| Color | Status | Meaning | Action Needed |
|-------|--------|---------|---------------|
| 🟢 Green | Location Verified | Survey is at a real hospital | None - data is trusted |
| 🟠 Orange | Need Manual Review | Something seems off | Check GPS coordinates manually |

### Confidence Breakdown:

- **90% weight** - How close the GPS is to the hospital (distance)
- **10% weight** - How well the facility name matches known hospitals

**Example:**
- Survey GPS is 0.5km from a hospital, name matches = ~95% confidence ✓
- Survey GPS is 5km from nearest hospital = ~10% confidence ✗

---

## 🎮 Quick Start Guide

### Step 1: Start the Dashboard
```bash
node index.js
```

### Step 2: Open in Browser
Go to: `http://localhost:3000`

### Step 3: Import New Surveys
- Click **"Refresh"** button
- Wait for confirmation message
- New survey points appear on the map (blue dots)

### Step 4: Validate GPS Accuracy
- Click **"Validate"** button
- Wait for validation to complete
- Check survey table for 🟢 green or 🟠 orange status

### Step 5: Review Details
- Click **"Open"** to see full survey table
- Click survey points on map to see details in sidebar
- Read GPS Notes to understand why a survey was marked as verified or needs review

---

## 🗺️ Map Controls

### Change Map Style (Bottom Right)
- **OpenStreetMap** - Standard road map (fastest)
- **Google Maps** - Detailed street maps
- **Google Satellite** - Aerial photos
- **Google Hybrid** - Satellite + labels
- **Google Terrain** - Topographic view

### Toggle Data Layers (Bottom Right)
Turn on/off different overlays:
- **HXL** - Administrative zones (cyan boundaries)
- **Hospitals** - Hospital locations (orange dots)
- **Population Density** - Heat map (yellow to black)
- **EpiCollect** - Your surveys (blue dots)

### Navigate the Map
- **Scroll** - Zoom in/out
- **Click + Drag** - Pan around
- **Click dots** - View details in sidebar

---

## 📋 Common Tasks

### "I want to see all my surveys"
1. Click **"Open"** button
2. Table appears with all survey data
3. Scroll right to see GPS validation columns

### "How accurate are my surveys?"
Check the **GPS Evaluation** column:
- 🟢 **Green** = Very accurate, at real hospital
- 🟠 **Orange** = Check this one manually

### "A survey shows 'Need Manual Review' - what does this mean?"
This means one of these:
- GPS is more than 1km from any known hospital
- Facility name doesn't match hospital records
- Not enough confidence in the match

**What to do:**
- Look at **GPS Notes** column to see why
- Check the distance shown
- If it seems wrong, review the GPS coordinates manually

### "When did I last update the data?"
Look below the **Refresh** button - it shows:
- "Last synced: May 4 at 20:30"

### "Can I see where each survey is on the map?"
Yes! Blue dots on the map = survey locations
- Click a blue dot to see its details
- Use the table to review all surveys at once

---

## 🔄 Typical Workflow

**Scenario:** Collecting hospital data in Kampala

1. **Field teams submit surveys** using EpiCollect app
2. **You click "Refresh"** → New surveys appear on map
3. **You click "Validate"** → System checks GPS accuracy
4. **You review results:**
   - Green ✓ = Ready to use
   - Orange ⚠️ = Needs manual checking
5. **You can now:**
   - See coverage gaps
   - Prioritize field teams to new areas
   - Identify hospitals needing follow-up

---

## 💡 Tips for Best Results

✅ **Do this:**
- Refresh after each batch of surveys
- Validate immediately to catch errors early
- Review orange-flagged surveys promptly
- Use the map to see coverage gaps

❌ **Avoid this:**
- Trusting surveys with <20% confidence
- Ignoring orange "Need Manual Review" flags
- Assuming GPS is always accurate
- Forgetting to validate before analysis

---

## ❓ FAQ

**Q: A hospital shows green but I think the location is wrong.**
A: The system validates against known hospital coordinates. If you believe the data is incorrect, you can manually review the GPS coordinates in the GPS Notes column.

**Q: Can I edit survey responses?**
A: This dashboard is view-only. To edit surveys, go back to EpiCollect app. Changes will appear here after you click Refresh.

**Q: Why does a survey show "No facilities found within 1km"?**
A: The GPS coordinate is too far from any known hospital. Either the surveyor was lost, the GPS was inaccurate, or there's a facility not in our database. Needs manual review.

**Q: How often should I refresh?**
A: Refresh whenever field teams submit new surveys, typically daily or after each field session.

**Q: What if I see duplicate surveys?**
A: This can happen if surveys are submitted multiple times. Contact your field coordinator to deduplicate the EpiCollect database.

---

## 🆘 Troubleshooting

**Map won't load?**
- Check internet connection
- Try a different map layer (e.g., Google Maps instead of OpenStreetMap)
- Refresh the page

**No surveys appear?**
- Click "Refresh" to sync from EpiCollect
- Ask field coordinator: "Have any surveys been submitted?"

**Validation not working?**
- Ensure both survey lat/lng columns are filled
- Check that hospital database file exists in Uganda/ folder

**Can't see GPS columns?**
- Click "Open" to view survey table
- Scroll table to the right
- Make sure you've run Validate first

---

## 📞 Need Help?

1. Check the Troubleshooting section above
2. Hover over map elements for tooltips
3. Read the GPS Notes column for validation details
4. Contact your project coordinator

---

## 🎓 About This Project

Hospital Infrastructure Mapping Project
- **Purpose:** Monitor hospital conditions and infrastructure across Uganda
- **Data:** Field surveys using EpiCollect platform
- **Coverage:** 7,463 hospitals nationwide, 2,447 in Kampala
- **Validation:** GPS accuracy checking against hospital database

---

**Last Updated:** May 2026  
**Status:** Active & In Use  
**Data:** Live survey responses from field teams
