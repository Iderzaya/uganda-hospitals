# 📸 Photo Duplicate Detection Guide

## What It Does

The Duplicate Detection system identifies fraudulent or recycled photos in your survey data using **perceptual hashing** - a technique that compares images based on their visual content, not file comparison.

### Detection Types:

| Type | What It Is | Action |
|------|-----------|--------|
| 🟢 **Unique** | Original photo, no duplicates | ✓ Keep - No action needed |
| 🟠 **Near Duplicate** | Very similar photos (different angle/crop) | ⚠️ Review - Might be same visit or fraud |
| 🔴 **Exact Duplicate** | Identical photo submitted multiple times | ✗ Remove - Definite fraud |

---

## How to Use

### Step 1: Run Duplicate Detection
Click **"Check Photos"** button in the sidebar under "Detect Duplicates"

**What happens:**
- System downloads all survey photos
- Generates a fingerprint (perceptual hash) for each photo
- Compares fingerprints to find matches
- Stores hashes in CSV so they're cached for next run

### Step 2: Wait for Results
- First run: Takes 1-5 minutes (depends on number of photos)
- Subsequent runs: Much faster (uses cached hashes)
- Status shows: "⏳ Analyzing photos..."
- When done: "✓ X duplicates detected"

### Step 3: Review Results in Table
Click **"Open"** to view survey table with new **"Duplicate Status"** column

**Column shows:**
- 🟢 **Unique** - Safe to use
- 🟠 **Near Duplicate (3 similar)** - Review manually
- 🔴 **Exact Duplicate (2 others)** - Likely fraud

### Step 4: Investigate Flagged Surveys

**For Orange (Near Duplicates):**
1. Click on the survey point on the map
2. Look at the photo in the popup
3. Check GPS coordinates
4. Is it the same facility visited twice? Same photo angle? → Probably OK
5. Is it a cropped version of another photo? → Possible fraud

**For Red (Exact Duplicates):**
1. Check which other surveys have the same photo
2. Compare GPS coordinates:
   - If same location = duplicate submission (remove one)
   - If different location = fraud (investigate user)
3. Check submitter/user IDs
4. Check timestamps - when were they submitted?

---

## Understanding Confidence Levels

The system calculates how similar two photos are on a scale:

- **0-5 differences** = Exact/Near duplicate (very similar)
- **5-20 differences** = Possibly related
- **20+ differences** = Different photos (unique)

### Why Near-Duplicates Happen:

✓ **Legitimate:**
- Photographer takes multiple shots of same facility
- Slight angle changes between photos
- Different zoom levels
- Quality variations from same location

✗ **Fraudulent:**
- Cropped version of earlier photo
- Same photo submitted from different GPS coordinate
- Reused photo from different building
- Submitted with fake location to inflate survey count

---

## Best Practices

### Before Deployment
1. Run detection on all existing surveys
2. Review all flagged duplicates
3. Remove confirmed frauds
4. Document your findings

### During Ongoing Collection
1. Run detection weekly
2. Review new duplicates immediately
3. Talk to field teams about duplicates
4. Build baseline of "normal" near-duplicates for your region

### For Analysis
- Filter out "Exact Duplicates" completely
- For "Near Duplicates": Manual review or set policy
  - Policy A: Trust them (assume same-visit photos)
  - Policy B: Remove them (strict deduplication)
  - Policy C: Keep one per cluster (deduplicate by location)

---

## Technical Details

### How Perceptual Hashing Works

Instead of comparing pixel-by-pixel, the system:
1. Converts image to 16x16 grayscale
2. Computes average brightness
3. Marks each pixel as darker/lighter than average
4. Creates 256-bit "fingerprint"
5. Compares fingerprints (Hamming distance)

**Advantages:**
- Works with JPEG compression
- Handles slight rotations/crops
- Fast (can hash 1000s of images)
- Low false positives

**Limitations:**
- Won't catch heavily edited photos
- Might miss rotated photos (depends on angle)
- Near-duplicate detection is probabilistic (review required)

### Storage

Hashes are stored in CSV:
- **Photo Hash** column = 256-character hex string
- **Duplicate Status** column = Results
- Cached so subsequent runs are instant
- Only re-hashes if photo URL changed

---

## Troubleshooting

### "Detection is very slow"
- First run always processes all images
- Each photo must be downloaded from EpiCollect
- Typical: 100 photos = 2-5 minutes
- Solution: Run overnight or during off-peak hours

### "Getting memory error"
- Too many photos at once
- Solution: Split surveys into batches, process separately
- Or increase server memory

### "Some photos show 'Download Failed'"
- Bad photo URL in EpiCollect
- Network timeout (server/EpiCollect down)
- Solution: Fix URLs in EpiCollect, try again

### "Hash looks suspicious but flagged as 'Unique'"
- Hashing is probabilistic - not 100% accurate
- Can have false negatives (especially with heavy edits)
- Solution: Manual visual inspection of suspicious photos

### "Same photo with different GPS showing 'Unique'"
- Different compression/quality = different hash
- Might not be exact duplicate
- Shows as "Near Duplicate" if similar enough
- Solution: Review manually

---

## Data Quality Impact

### Before Duplicate Detection
- Unknown number of recycled photos
- Can't trust location accuracy
- Inflated survey counts

### After Duplicate Detection
- 🟢 Unique photos = High confidence data
- 🟠 Near duplicates = Requires manual review
- 🔴 Exact duplicates = Can be removed with confidence

### Expected Results
- Most surveys: Unique (90%+)
- Near duplicates: 2-10% (depends on field team training)
- Exact duplicates: <1% (if fraud is rare)

---

## Integration with GPS Validation

**GPS Validation** checks: "Is the location at a real hospital?"
**Duplicate Detection** checks: "Is the photo real/original?"

Both are important:
- Valid GPS + Unique Photo = Trusted data ✓
- Valid GPS + Duplicate Photo = Location right, but photo is recycled ⚠️
- Invalid GPS + Unique Photo = Location questionable, but photo is original ⚠️
- Invalid GPS + Duplicate Photo = Don't trust this data ✗

---

## FAQ

**Q: Does this detect AI-generated images?**
A: Not specifically. AI images might be detected as "unusual" through manual review if they don't match facility appearance.

**Q: Can I trust "Unique" status completely?**
A: Not 100%. It means the photo wasn't found in your database. But it could still be fraud if:
- Heavily edited from original
- Photo of completely different facility
- Test/placeholder image

Manual spot-checks recommended.

**Q: How do I handle near-duplicates?**
A: Context matters:
- Same facility, different angles = Usually OK
- Different facilities, same photo = Fraud
- GPS location changed for same photo = Fraud

Review the GPS location and facility name together.

**Q: Can I edit or remove detected duplicates?**
A: Not directly in this dashboard. You can:
1. Mark them for deletion (document which ones)
2. Go back to EpiCollect to delete them
3. Re-run detection to confirm they're gone

**Q: How often should I run duplicate detection?**
A: 
- Initial: Always run on full dataset
- Weekly: Run on new submissions
- Or: Run before any data analysis/export

---

## Next Steps

1. ✓ Install and run system (npm install done)
2. Click **"Check Photos"** button
3. Wait for completion
4. Click **"Open"** to view results
5. Review flagged surveys (orange/red)
6. Decide: Keep, Review, or Remove
7. Document your policy for field team

---

**Last Updated:** May 2026
**Version:** 1.0
**Status:** Ready to use
