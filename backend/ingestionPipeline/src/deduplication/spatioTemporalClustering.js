import { getWeatherCollection } from '../config/db.js';

/**
 * Haversine formula to compute great-circle distance between two [lng, lat] points in km
 */
export function calculateDistanceKm(coord1, coord2) {
  if (!coord1 || !coord2) return 999999;
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Tier 4 Deduplication & Clustering: Spatio-Temporal Event Clustering
 * Groups events occurring within radiusKm (default 3 km) and timeWindowMinutes (default 60 mins).
 */
export async function findSpatioTemporalCluster(coordinates, category, eventTime = new Date(), radiusKm = 3, timeWindowMinutes = 60) {
  if (!coordinates || !category) return null;

  const collection = getWeatherCollection();
  if (!collection) return null;

  try {
    const cutoffTime = new Date(new Date(eventTime).getTime() - timeWindowMinutes * 60 * 1000);

    const candidates = await collection
      .find({
        "event_category": category,
        "timestamps.event_time": { $gte: cutoffTime }
      })
      .limit(50)
      .toArray();

    for (const candidate of candidates) {
      if (candidate.location?.coordinates) {
        const dist = calculateDistanceKm(coordinates, candidate.location.coordinates);
        if (dist <= radiusKm) {
          return {
            cluster_id: candidate.cluster_id || candidate._id.toString(),
            parent_id: candidate._id,
            distance_km: dist
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.warn('[DEDUP TIER-4] Error checking spatio-temporal cluster:', err.message);
    return null;
  }
}
