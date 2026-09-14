import { getWeatherCollection } from '../config/db.js';
import { generateQueryEmbedding } from '../embedding/extractor.js';

export async function submitCitizenReport(req, res) {
  try {
    const {
      description,
      event_category = 'RAINFALL',
      severity = 'MODERATE',
      latitude,
      longitude,
      landmark,
      city = 'Mumbai',
      district = 'Mumbai Suburban',
      state = 'Maharashtra'
    } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required.' });
    }

    const lat = latitude ? parseFloat(latitude) : 19.0178;
    const lng = longitude ? parseFloat(longitude) : 72.8426;

    let imageUrl = null;
    if (req.file) {
      // Local static URL served by Express
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const embedding = await generateQueryEmbedding(description);

    const newReport = {
      cluster_id: `citizen_${Date.now()}`,
      is_cluster_parent: true,
      mentions_count: 1,
      source_type: 'citizen',
      source_platform: 'web_portal',
      original_language: 'en',
      language_name: 'English',
      original_text: description,
      translated_text: description,
      event_category: event_category.toUpperCase(),
      severity: severity.toUpperCase(),
      verification_status: 'UNVERIFIED',
      trust_score: 65,
      image_url: imageUrl || "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80",
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        landmark: landmark || city,
        city: city,
        district: district,
        state: state
      },
      timestamps: {
        event_time: new Date(),
        ingested_at: new Date()
      },
      embedding: embedding
    };

    const collection = getWeatherCollection();
    if (collection) {
      const result = await collection.insertOne(newReport);
      newReport._id = result.insertedId;
    }

    console.log('[CITIZEN REPORT] Ingested new citizen weather observation:', newReport.location.landmark);

    res.status(201).json({
      success: true,
      message: 'Citizen report recorded successfully.',
      report: newReport
    });
  } catch (err) {
    console.error('[CITIZEN REPORT ERROR]', err);
    res.status(500).json({ error: err.message });
  }
}
