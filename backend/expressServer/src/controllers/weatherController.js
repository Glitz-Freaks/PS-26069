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
    const weatherCol = getWeatherCollection();
    const imdCol = getIMDAlertsCollection();

    if (!weatherCol) {
      return res.status(503).json({ error: "Database not connected." });
    }

    // 1. Basic Count Aggregations
    const totalEvents = await weatherCol.countDocuments({});
    const verifiedEvents = await weatherCol.countDocuments({ verification_status: "VERIFIED" });
    const unverifiedEvents = totalEvents - verifiedEvents;
    const activeAlerts = imdCol ? await imdCol.countDocuments({}) : 0;

    // 2. Top Impacted States
    const stateAggregation = await weatherCol.aggregate([
      { $match: { "location.state": { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$location.state", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]).toArray();

    const maxStateCount = stateAggregation[0]?.count || 1;
    const topStates = stateAggregation.map(s => ({
      state: s._id || 'Unknown',
      count: s.count,
      percentage: Math.round((s.count / maxStateCount) * 100),
      shareOfTotal: totalEvents > 0 ? ((s.count / totalEvents) * 100).toFixed(1) : 0
    }));

    // 3. Category Breakdown
    const categoryAggregation = await weatherCol.aggregate([
      { $group: { _id: "$event_category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const categoryColors = {
      FLOODING: "bg-[#002b5b]",
      RAINFALL: "bg-sky-700",
      THUNDERSTORM: "bg-amber-600",
      CYCLONE: "bg-rose-700",
      HEATWAVE: "bg-orange-600",
      COLDWAVE: "bg-indigo-600",
      FOG: "bg-slate-600",
      LANDSLIDE: "bg-emerald-700"
    };

    const categories = categoryAggregation.map(c => ({
      category: c._id || 'GENERAL',
      count: c.count,
      percentage: totalEvents > 0 ? ((c.count / totalEvents) * 100).toFixed(1) : 0,
      color: categoryColors[c._id] || "bg-slate-700"
    }));

    // 4. Severity Distribution
    const severityAggregation = await weatherCol.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const severities = {
      CRITICAL: 0,
      HIGH: 0,
      MODERATE: 0,
      LOW: 0
    };
    severityAggregation.forEach(s => {
      if (s._id && severities.hasOwnProperty(s._id)) {
        severities[s._id] = s.count;
      }
    });

    // 5. Ingestion Source Distribution
    const sourceAggregation = await weatherCol.aggregate([
      { $group: { _id: "$source_type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    const sources = sourceAggregation.map(s => ({
      source: s._id || 'other',
      count: s.count,
      percentage: totalEvents > 0 ? ((s.count / totalEvents) * 100).toFixed(1) : 0
    }));

    // 6. Cluster & Deduplication Metrics
    const clusterCountAgg = await weatherCol.aggregate([
      { $group: { _id: "$cluster_id" } },
      { $count: "totalClusters" }
    ]).toArray();

    const totalClusters = clusterCountAgg[0]?.totalClusters || totalEvents;
    const dedupRatio = totalClusters > 0 ? (totalEvents / totalClusters).toFixed(2) : "1.00";

    // 7. Latest Live Incident Feed
    const latestEvents = await weatherCol
      .find({})
      .sort({ "timestamps.event_time": -1 })
      .limit(6)
      .project({
        _id: 1,
        translated_text: 1,
        original_text: 1,
        event_category: 1,
        severity: 1,
        verification_status: 1,
        trust_score: 1,
        location: 1,
        source_type: 1,
        timestamps: 1
      })
      .toArray();

    res.json({
      total_events: totalEvents,
      verified_events: verifiedEvents,
      unverified_events: unverifiedEvents,
      active_alerts: activeAlerts,
      accuracy_rate: totalEvents > 0 ? ((verifiedEvents / totalEvents) * 100).toFixed(1) : "100.0",
      deduplication_ratio: `${dedupRatio} : 1`,
      total_clusters: totalClusters,
      top_affected_states: topStates,
      category_breakdown: categories,
      severity_breakdown: severities,
      source_breakdown: sources,
      latest_events: latestEvents
    });
  } catch (err) {
    console.error("[NATIONAL STATS ERROR]", err);
    res.status(500).json({ error: err.message });
  }
}
