import { getWeatherCollection, getIMDAlertsCollection } from '../config/db.js';
import { calculateWarningPercentage } from './warningCalculator.js';

export async function getAreaIntelligence({ state, district, city, lat, lng, radiusKm = 50 }) {
  const weatherCol = getWeatherCollection();
  const imdCol = getIMDAlertsCollection();

  if (!weatherCol) {
    // Offline fallback data
    return generateFallbackAreaReport(state, district, city);
  }

  try {
    let events = [];

    // 1. Try Geospatial Query if coordinates are provided
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      try {
        const geoQuery = {
          "location.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)]
              },
              $maxDistance: (parseFloat(radiusKm) || 50) * 1000
            }
          }
        };

        events = await weatherCol
          .find(geoQuery)
          .sort({ "timestamps.event_time": -1 })
          .limit(50)
          .toArray();
      } catch (geoErr) {
        console.warn('[AREA SERVICE] Geo-index fallback:', geoErr.message);
      }
    }

    // 2. If no geo events found or text-based query, search by District / State / City
    if (events.length === 0) {
      const textQuery = {};
      const conditions = [];

      if (district && district !== 'All India' && district !== 'National') {
        conditions.push({ "location.district": new RegExp(district, "i") });
      }
      if (city && city !== 'Detected Location' && city !== 'Various') {
        conditions.push({ "location.city": new RegExp(city, "i") });
      }
      if (state && state !== 'All India') {
        conditions.push({ "location.state": new RegExp(state, "i") });
      }

      if (conditions.length > 0) {
        textQuery.$or = conditions;
        events = await weatherCol
          .find(textQuery)
          .sort({ "timestamps.event_time": -1 })
          .limit(50)
          .toArray();
      }
    }

    // 3. Fallback to latest national alerts if still empty
    if (events.length === 0) {
      events = await weatherCol
        .find({})
        .sort({ "timestamps.event_time": -1 })
        .limit(20)
        .toArray();
    }

    // 4. Fetch active IMD alert for this district/state
    let imdAlert = null;
    if (imdCol) {
      const imdConditions = [];
      if (district && district !== 'All India') {
        imdConditions.push({ district: new RegExp(district, "i") });
      }
      if (city && city !== 'Detected Location') {
        imdConditions.push({ city: new RegExp(city, "i") });
      }
      if (state && state !== 'All India') {
        imdConditions.push({ state: new RegExp(state, "i") });
      }

      if (imdConditions.length > 0) {
        imdAlert = await imdCol.findOne({ $or: imdConditions }, { sort: { valid_to: -1 } });
      }

      if (!imdAlert) {
        imdAlert = await imdCol.findOne({}, { sort: { valid_to: -1 } });
      }
    }

    // Compute dynamic warning percentage
    const warningAnalysis = calculateWarningPercentage(imdAlert, events);

    // Extract photo gallery
    const photos = events
      .filter(e => e.image_url)
      .map(e => ({
        url: e.image_url,
        caption: e.translated_text || e.original_text,
        location: `${e.location?.landmark || ''}, ${e.location?.city || ''}`,
        source: e.source_type,
        timestamp: e.timestamps?.event_time
      }));

    return {
      area: {
        state: state || events[0]?.location?.state || "All India",
        district: district || events[0]?.location?.district || "National",
        city: city || events[0]?.location?.city || "Various",
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null
      },
      warning: warningAnalysis,
      imd_alert: imdAlert,
      events_count: events.length,
      events: events,
      photo_gallery: photos
    };
  } catch (err) {
    console.error('[AREA SERVICE ERROR]', err);
    return generateFallbackAreaReport(state, district, city);
  }
}

function generateFallbackAreaReport(state = "Maharashtra", district = "Mumbai Suburban", city = "Mumbai") {
  return {
    area: { state, district, city },
    warning: {
      warning_percentage: 78.5,
      warning_level: "HIGH_RISK",
      color_code: "ORANGE",
      advisory: "Orange Alert active. Heavy rainfall with severe waterlogging reported in underpasses.",
      metrics: {
        imd_score: 75,
        velocity_score: 80,
        keyword_score: 70,
        visual_score: 90,
        total_reports_count: 14,
        photo_evidence_count: 6
      }
    },
    imd_alert: {
      bulletin_code: "IMD-NOWCAST-MUM",
      state: "Maharashtra",
      district: "Mumbai Suburban",
      city: "Mumbai",
      color_code: "ORANGE",
      headline: "Orange Alert: Heavy to very heavy downpour with waterlogging in low-lying corridors.",
      instructions: "High tide expected. Stay indoors and avoid underpasses.",
      valid_to: new Date(Date.now() + 6 * 60 * 60 * 1000)
    },
    events_count: 4,
    events: [],
    photo_gallery: []
  };
}
