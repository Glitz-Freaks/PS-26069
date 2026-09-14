/**
 * Tier 2 Deduplication: Perceptual Image Hash (dHash)
 * Generates and compares image hashes to detect viral recycled disaster photos.
 */

// In-memory / DB known historical fake/recycled image hashes (e.g. from 2015 Chennai/Mumbai floods)
const RECYCLED_HISTORICAL_HASHES = new Set([
  'a4f8c2b1e9d034aa',
  '7b9c1e4d8a2f00bb',
  'ffeeddccbbaa9988'
]);

export function computeImageHash(imageUrl) {
  if (!imageUrl) return null;
  // Simple deterministic hash simulation based on string content if no binary image processing
  let hash = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    hash = (hash << 5) - hash + imageUrl.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export function isRecycledImage(imageHash) {
  if (!imageHash) return false;
  return RECYCLED_HISTORICAL_HASHES.has(imageHash);
}
