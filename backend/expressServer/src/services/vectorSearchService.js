import { getWeatherCollection } from '../config/db.js';
import { generateQueryEmbedding } from '../embedding/extractor.js';

export async function searchWeatherSemantic(queryText, limit = 20) {
  const collection = getWeatherCollection();
  if (!collection) return [];

  const queryVector = await generateQueryEmbedding(queryText);

  try {
    // Attempt MongoDB Atlas $vectorSearch aggregation pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: limit * 5,
          limit: limit
        }
      },
      {
        $project: {
          _id: 1,
          translated_text: 1,
          original_text: 1,
          event_category: 1,
          severity: 1,
          verification_status: 1,
          trust_score: 1,
          image_url: 1,
          location: 1,
          timestamps: 1,
          source_type: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    if (results && results.length > 0) {
      return results;
    }
  } catch (err) {
    console.warn('[VECTOR SEARCH] Atlas $vectorSearch index not active, using semantic regex fallback:', err.message);
  }

  // Resilient Regex & Keyword Fallback
  try {
    const terms = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 1);
    const searchConditions = [];
    for (const term of terms) {
      const reg = new RegExp(term, "i");
      searchConditions.push(
        { translated_text: reg },
        { original_text: reg },
        { event_category: reg },
        { "location.city": reg },
        { "location.district": reg },
        { "location.state": reg },
        { "location.landmark": reg }
      );
    }

    if (searchConditions.length === 0) {
      searchConditions.push({ "location.state": new RegExp(queryText, "i") });
    }

    return await collection
      .find({ $or: searchConditions })
      .sort({ "timestamps.event_time": -1 })
      .limit(limit)
      .toArray();
  } catch (err) {
    console.error('[SEARCH FALLBACK ERROR]', err);
    return [];
  }
}
