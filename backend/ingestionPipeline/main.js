import { connectDB, getWeatherCollection, getIMDAlertsCollection } from './src/config/db.js';
import { fetchSocialWeatherPosts } from './src/scrapers/twitterScraper.js';
import { fetchNewsFeeds } from './src/scrapers/newsRssScraper.js';
import { fetchIMDAlerts } from './src/scrapers/imdScraper.js';
import { translateToEnglish } from './src/translation/indicTranslator.js';
import { classifyWeatherEvent, computeTrustScore } from './src/categorization/classifier.js';
import { isDuplicateURL } from './src/deduplication/urlDeduplicator.js';
import { computeImageHash, isRecycledImage } from './src/deduplication/imageHashDeduplicator.js';
import { findSemanticDuplicate } from './src/deduplication/semanticDeduplicator.js';
import { findSpatioTemporalCluster } from './src/deduplication/spatioTemporalClustering.js';
import { generateEmbedding } from './src/embedding/extractor.js';

export async function ingest() {
  console.log('\n======================================================');
  console.log('🚀 [INGESTION] Starting 5-Minute Weather Ingestion Job...');
  console.log('======================================================');

  await connectDB();
  const weatherCollection = getWeatherCollection();
  const imdCollection = getIMDAlertsCollection();

  const stats = {
    totalFetched: 0,
    inserted: 0,
    urlDuplicatesSkipped: 0,
    semanticDuplicatesClustered: 0,
    spatioTemporalClustered: 0,
    recycledImagesFlagged: 0,
    imdAlertsSynced: 0
  };

  // 1. Sync Ground Truth IMD Alerts
  try {
    const imdAlerts = await fetchIMDAlerts();
    if (imdCollection) {
      for (const alert of imdAlerts) {
        await imdCollection.updateOne(
          { bulletin_code: alert.bulletin_code },
          { $set: alert },
          { upsert: true }
        );
        stats.imdAlertsSynced++;
      }
      console.log(`[IMD SYNC] Synced ${stats.imdAlertsSynced} official IMD bulletins.`);
    }
  } catch (err) {
    console.warn('[IMD SYNC WARNING]', err.message);
  }

  // 2. Fetch Social Posts & News Feeds in Parallel
  const [socialPosts, newsArticles] = await Promise.all([
    fetchSocialWeatherPosts(),
    fetchNewsFeeds()
  ]);

  const rawItems = [
    ...socialPosts.map(p => ({
      raw_text: p.text,
      source_type: p.source_type,
      source_platform: p.source_platform,
      source_url: p.source_url,
      author: p.author,
      landmark: p.landmark,
      city: p.city,
      district: p.district,
      state: p.state,
      coordinates: p.coordinates,
      image_url: p.image_url,
      event_time: p.timestamp
    })),
    ...newsArticles.map(a => ({
      raw_text: `${a.title}. ${a.summary}`,
      source_type: a.source_type,
      source_platform: a.source_name,
      source_url: a.source_url,
      author: { handle: a.source_name, is_verified: true },
      landmark: a.landmark || a.city,
      city: a.city,
      district: a.district,
      state: a.state,
      coordinates: a.coordinates,
      image_url: a.image_url,
      event_time: a.timestamp
    }))
  ];

  stats.totalFetched = rawItems.length;
  console.log(`[INGESTION] Fetched ${rawItems.length} raw weather items across India.`);

  // 3. Process Each Item Through The Pipeline
  for (const item of rawItems) {
    // Gate 1: Exact URL Deduplication (O(1))
    const isUrlDup = await isDuplicateURL(item.source_url);
    if (isUrlDup) {
      stats.urlDuplicatesSkipped++;
      continue;
    }

    // Gate 2: Media Perceptual Hash Check
    const imageHash = computeImageHash(item.image_url);
    const isRecycled = isRecycledImage(imageHash);
    if (isRecycled) {
      stats.recycledImagesFlagged++;
    }

    // Step A: Indic Translation & Normalization
    const translationResult = await translateToEnglish(item.raw_text);
    const englishText = translationResult.translated_text;

    // Step B: Event Categorization & Severity
    const classification = classifyWeatherEvent(englishText);

    // Step C: Generate ONNX Dense Vector (384-dim)
    const embedding = await generateEmbedding(englishText);

    // Gate 3: Semantic Vector Cosine Similarity Check (>= 0.88)
    const semanticDup = await findSemanticDuplicate(embedding, item.district);

    // Gate 4: Spatio-Temporal Event Clustering (3 km & 60 min)
    const spatioCluster = await findSpatioTemporalCluster(item.coordinates, classification.category, item.event_time);

    let clusterId = `cluster_${item.district.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    let isClusterParent = true;

    if (semanticDup) {
      clusterId = semanticDup.parentClusterId;
      isClusterParent = false;
      stats.semanticDuplicatesClustered++;
    } else if (spatioCluster) {
      clusterId = spatioCluster.cluster_id;
      isClusterParent = false;
      stats.spatioTemporalClustered++;
    }

    // Trust & Verification Score
    const hasIMD = item.raw_text.toLowerCase().includes('imd') || classification.severity === 'CRITICAL';
    const trustScore = computeTrustScore(item.source_type, item.author?.is_verified, !!item.image_url, hasIMD);

    const doc = {
      cluster_id: clusterId,
      is_cluster_parent: isClusterParent,
      mentions_count: 1,
      source_type: item.source_type,
      source_platform: item.source_platform,
      source_url: item.source_url,
      source_author: item.author,
      original_language: translationResult.original_language,
      language_name: translationResult.language_name,
      original_text: item.raw_text,
      translated_text: englishText,
      event_category: classification.category,
      event_categories: classification.categories,
      severity: classification.severity,
      severity_score: classification.severity_score,
      verification_status: trustScore >= 70 ? 'VERIFIED' : 'UNVERIFIED',
      trust_score: trustScore,
      image_url: item.image_url,
      image_dhash: imageHash,
      is_recycled_media: isRecycled,
      location: {
        type: 'Point',
        coordinates: item.coordinates, // [longitude, latitude]
        landmark: item.landmark,
        city: item.city,
        district: item.district,
        state: item.state
      },
      timestamps: {
        event_time: item.event_time || new Date(),
        ingested_at: new Date()
      },
      embedding: embedding
    };

    if (weatherCollection) {
      await weatherCollection.insertOne(doc);
      stats.inserted++;
    } else {
      // Offline mode
      stats.inserted++;
    }
  }

  console.log('\n======================================================');
  console.log('✅ [INGESTION COMPLETE] Pipeline Summary:');
  console.log(`   • Total Items Fetched:            ${stats.totalFetched}`);
  console.log(`   • Clean Events Inserted:          ${stats.inserted}`);
  console.log(`   • Tier-1 URL Duplicates Skipped:  ${stats.urlDuplicatesSkipped}`);
  console.log(`   • Tier-3 Semantic Duplicates:     ${stats.semanticDuplicatesClustered}`);
  console.log(`   • Tier-4 Spatio-Temporal Clusters:${stats.spatioTemporalClustered}`);
  console.log(`   • Tier-2 Recycled Photos Flagged: ${stats.recycledImagesFlagged}`);
  console.log('======================================================\n');

  return stats;
}

// Direct execution when called via `node main.js`
if (process.argv[1]?.endsWith('main.js')) {
  ingest()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[INGESTION FATAL]', err);
      process.exit(1);
    });
}
