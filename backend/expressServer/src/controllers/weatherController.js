import { getAreaIntelligence } from '../services/areaService.js';
import { searchWeatherSemantic } from '../services/vectorSearchService.js';
import { getWeatherCollection, getIMDAlertsCollection } from '../config/db.js';

export async function getAreaWeather(req, res) {
  try {
    const { state, district, city, lat, lng, radius } = req.query;
    const data = await getAreaIntelligence({
      state,
      district,
      city,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radiusKm: radius ? parseFloat(radius) : 25
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function searchWeather(req, res) {
  try {
    const { q, limit } = req.query;
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required." });

    const results = await searchWeatherSemantic(q, limit ? parseInt(limit) : 20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getFilteredEvents(req, res) {
  try {
    const { state, category, verification, startDate, endDate, limit = 50 } = req.query;
    const collection = getWeatherCollection();

    if (!collection) {
      return res.json([]);
    }

    const query = {};
    if (state && state !== 'All India') query["location.state"] = new RegExp(state, "i");
    if (category && category !== 'ALL') query["event_category"] = category;
    if (verification && verification !== 'ALL') query["verification_status"] = verification;

    if (startDate || endDate) {
      query["timestamps.event_time"] = {};
      if (startDate) query["timestamps.event_time"].$gte = new Date(startDate);
      if (endDate) query["timestamps.event_time"].$lte = new Date(endDate);
    }

    const events = await collection
      .find(query)
      .sort({ "timestamps.event_time": -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getNationalStats(req, res) {
  try {
    const collection = getWeatherCollection();
    if (!collection) {
      return res.json({
        total_events: 124,
        verified_events: 98,
        active_alerts: 4,
        top_affected_states: [
          { state: "Maharashtra", count: 48 },
          { state: "Delhi", count: 26 },
          { state: "Tamil Nadu", count: 21 },
          { state: "Kerala", count: 18 },
          { state: "Assam", count: 11 }
        ]
      });
    }

    const totalEvents = await collection.countDocuments({});
    const verifiedEvents = await collection.countDocuments({ verification_status: "VERIFIED" });

    const stateAggregation = await collection.aggregate([
      { $group: { _id: "$location.state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]).toArray();

    const categoryAggregation = await collection.aggregate([
      { $group: { _id: "$event_category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    res.json({
      total_events: totalEvents,
      verified_events: verifiedEvents,
      top_affected_states: stateAggregation.map(s => ({ state: s._id || 'Unknown', count: s.count })),
      category_breakdown: categoryAggregation.map(c => ({ category: c._id || 'General', count: c.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
