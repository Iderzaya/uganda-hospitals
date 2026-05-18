/**
 * Duplicate Photo Detection Module
 * Uses perceptual hashing to detect exact and near-duplicate images
 */

const { imageHash } = require('image-hash');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const HASH_SIZE = 16;
const EXACT_MATCH_THRESHOLD = 0; // 0 differences = exact duplicate
const NEAR_DUPLICATE_THRESHOLD = 5; // 0-5 bit differences = near duplicate

/**
 * Download image from URL and save temporarily
 * @param {string} imageUrl - EpiCollect image URL
 * @param {string} fileName - Temporary file name
 * @returns {Promise<string>} Path to downloaded file
 */
async function downloadImage(imageUrl, fileName) {
  try {
    if (!imageUrl) {
      return null;
    }

    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream',
      timeout: 10000,
    });

    const tempPath = path.join(__dirname, '../.temp', fileName);

    // Create temp directory if it doesn't exist
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(tempPath);
      response.data.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(tempPath);
      });

      file.on('error', (err) => {
        fs.unlink(tempPath, () => {}); // Delete partially downloaded file
        reject(err);
      });

      response.data.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image:', error.message);
    return null;
  }
}

/**
 * Generate perceptual hash for an image
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string|null>} Perceptual hash or null if error
 */
async function generateHash(imagePath) {
  try {
    if (!imagePath || !fs.existsSync(imagePath)) {
      return null;
    }

    return new Promise((resolve, reject) => {
      imageHash(
        imagePath,
        HASH_SIZE,
        false,
        (error, data) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error generating hash:', error.message);
    return null;
  }
}

/**
 * Calculate Hamming distance between two hashes
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} Hamming distance (0 = identical)
 */
function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return 999; // Return large number if hashes invalid
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++;
    }
  }
  return distance;
}

/**
 * Compare two hashes and determine if they're duplicates
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {object} {type: 'exact'|'near'|'unique', distance: number}
 */
function compareHashes(hash1, hash2) {
  const distance = hammingDistance(hash1, hash2);

  if (distance === EXACT_MATCH_THRESHOLD) {
    return { type: 'exact', distance };
  } else if (distance <= NEAR_DUPLICATE_THRESHOLD) {
    return { type: 'near', distance };
  } else {
    return { type: 'unique', distance };
  }
}

/**
 * Detect duplicates in a list of entries
 * @param {Array} entries - Survey entries with image URLs
 * @returns {Promise<Array>} Entries with duplicate detection results
 */
async function detectDuplicates(entries) {
  const results = [];
  const hashes = new Map(); // Map of hash -> [entries with this hash]
  let processedCount = 0;

  console.log(`Starting duplicate detection for ${entries.length} entries...`);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const imageUrl = entry['3_Take_a_picture_of_'];

    // Skip if no image
    if (!imageUrl) {
      entry['Photo Hash'] = '';
      entry['Duplicate Status'] = 'No Image';
      results.push(entry);
      continue;
    }

    // Check if already have hash stored
    if (entry['Photo Hash'] && entry['Photo Hash'].length > 10) {
      // Use existing hash (must be at least 10 chars for valid hex hash)
      console.log(`Using cached hash for entry ${i + 1}/${entries.length}`);
      results.push(entry);
      processedCount++;

      // Track for duplicate detection
      const hash = entry['Photo Hash'];
      if (!hashes.has(hash)) {
        hashes.set(hash, []);
      }
      hashes.get(hash).push(entry);
      continue;
    }

    // Download and hash image
    console.log(`Processing image ${i + 1}/${entries.length}...`);
    const fileName = `temp_${Date.now()}_${i}.jpg`;

    try {
      const imagePath = await downloadImage(imageUrl, fileName);
      if (!imagePath) {
        entry['Photo Hash'] = '';
        entry['Duplicate Status'] = 'Download Failed';
        results.push(entry);
        continue;
      }

      const hash = await generateHash(imagePath);

      // Clean up temp file
      fs.unlink(imagePath, () => {});

      if (!hash) {
        entry['Photo Hash'] = '';
        entry['Duplicate Status'] = 'Hash Failed';
        results.push(entry);
        continue;
      }

      // Convert hash to hex string if it's a Buffer
      const hashHex = Buffer.isBuffer(hash) ? hash.toString('hex') : hash;

      // Store hash in entry
      entry['Photo Hash'] = hashHex;

      // Track for duplicate detection
      if (!hashes.has(hash)) {
        hashes.set(hash, []);
      }
      hashes.get(hash).push(entry);

      results.push(entry);
      processedCount++;
    } catch (error) {
      console.error(`Error processing entry ${i + 1}:`, error.message);
      entry['Photo Hash'] = '';
      entry['Duplicate Status'] = 'Error';
      results.push(entry);
    }
  }

  // Now determine duplicate status for each entry
  for (const entry of results) {
    if (!entry['Photo Hash'] || entry['Photo Hash'].length === 0) {
      if (entry['Duplicate Status'] !== 'No Image') {
        entry['Duplicate Status'] = entry['Duplicate Status'] || 'No Hash';
      }
      continue;
    }

    const hash = entry['Photo Hash'];
    const duplicateEntries = hashes.get(hash) || [];

    if (duplicateEntries.length === 1) {
      // Only this entry has this hash
      entry['Duplicate Status'] = 'Unique';
    } else {
      // Find other entries with same or similar hashes
      let hasDuplicate = false;
      let duplicateCount = 0;

      for (const otherEntry of duplicateEntries) {
        if (otherEntry === entry) continue;

        const comparison = compareHashes(hash, otherEntry['Photo Hash']);

        if (comparison.type === 'exact') {
          hasDuplicate = true;
          duplicateCount++;
        }
      }

      if (hasDuplicate) {
        entry['Duplicate Status'] = `Exact Duplicate (${duplicateCount} others)`;
      } else {
        entry['Duplicate Status'] = 'Unique';
      }
    }

    // Now check against ALL hashes for near-duplicates
    if (entry['Duplicate Status'] === 'Unique') {
      let hasNearDuplicate = false;
      let nearDuplicateCount = 0;

      for (const [otherHash, otherEntries] of hashes) {
        if (otherHash === hash) continue;

        const comparison = compareHashes(hash, otherHash);
        if (comparison.type === 'near') {
          hasNearDuplicate = true;
          nearDuplicateCount += otherEntries.length;
        }
      }

      if (hasNearDuplicate) {
        entry['Duplicate Status'] = `Near Duplicate (${nearDuplicateCount} similar) - Review`;
      }
    }
  }

  console.log(`Duplicate detection complete. Processed: ${processedCount}/${entries.length}`);

  return results;
}

/**
 * Clean up temporary files
 */
function cleanupTempFiles() {
  const tempDir = path.join(__dirname, '../.temp');
  if (fs.existsSync(tempDir)) {
    try {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
      console.log('Temp files cleaned up');
    } catch (error) {
      console.error('Error cleaning temp files:', error.message);
    }
  }
}

module.exports = {
  generateHash,
  compareHashes,
  detectDuplicates,
  hammingDistance,
  cleanupTempFiles,
  EXACT_MATCH_THRESHOLD,
  NEAR_DUPLICATE_THRESHOLD,
};
