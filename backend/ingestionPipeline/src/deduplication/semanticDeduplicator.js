import { getWeatherCollection } from '../config/db.js';

/**
 * Tier 3 Deduplication: Semantic Vector Cosine Similarity
 * Compares incoming 384-dimensional vector embedding against recent posts in the same district.
 * If cosine similarity >= 0.88, links it to an existing parent rather than creating duplicate spam.
 */

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findSemanticDuplicate(embedding, district, hoursWindow = 2) {
  if (!embedding || !district) return null;

  const collection = getWeatherCollection();
  if (!collection) return null;

  try {
    const cutoffTime = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);

    // Fetch recent events in the same district
    const recentEvents = await collection
      .find({
        "location.district": district,
        "timestamps.event_time": { $gte: cutoffTime },
        "embedding": { $exists: true }
      })
      .limit(30)
      .toArray();

    for (const event of recentEvents) {
      if (event.embedding) {
        const sim = cosineSimilarity(embedding, event.embedding);
        if (sim >= 0.88) {
          return {
            isDuplicate: true,
            parentEventId: event._id,
            similarityScore: sim,
            parentClusterId: event.cluster_id || event._id.toString()
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.warn('[DEDUP TIER-3] Error checking semantic duplicate:', err.message);
    return null;
  }
}
