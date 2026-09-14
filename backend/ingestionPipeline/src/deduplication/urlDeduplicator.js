import { getWeatherCollection } from '../config/db.js';

/**
 * Tier 1 Deduplication: Exact URL / Source ID check (O(1))
 * Pre-filters existing documents prior to expensive AI processing.
 */
export async function isDuplicateURL(sourceUrl, sourceId) {
  if (!sourceUrl && !sourceId) return false;

  const collection = getWeatherCollection();
  if (!collection) return false; // Offline mode fallback

  try {
    const query = [];
    if (sourceUrl) query.push({ source_url: sourceUrl });
    if (sourceId) query.push({ source_id: sourceId });

    const existing = await collection.findOne({ $or: query }, { projection: { _id: 1 } });
    return !!existing;
  } catch (err) {
    console.warn('[DEDUP TIER-1] Error checking URL duplicate:', err.message);
    return false;
  }
}
