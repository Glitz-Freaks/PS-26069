import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'weather_analytics';

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;
  if (!MONGO_URI) {
    console.warn('[DB WARNING] MONGO_URI is not set in .env. Running in offline/memory fallback mode.');
    return null;
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[DB SUCCESS] Connected to MongoDB Atlas (${DB_NAME})`);
    await initIndexes(db);
    return db;
  } catch (err) {
    console.error('[DB ERROR] Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

export function getDB() {
  return db;
}

export function getWeatherCollection() {
  if (!db) return null;
  return db.collection('weather_events');
}

export function getIMDAlertsCollection() {
  if (!db) return null;
  return db.collection('imd_alerts');
}

export async function initIndexes(database) {
  try {
    const weatherEvents = database.collection('weather_events');
    const imdAlerts = database.collection('imd_alerts');

    // 1. 2dsphere index for geospatial location queries
    await weatherEvents.createIndex({ "location.coordinates": "2dsphere" });

    // 2. Unique index on source_url for O(1) Tier-1 deduplication
    await weatherEvents.createIndex({ "source_url": 1 }, { unique: true, sparse: true });

    // 3. Compound index for fast District + Date queries
    await weatherEvents.createIndex({ "location.state": 1, "location.district": 1, "timestamps.event_time": -1 });

    // 4. Index for category and verification filtering
    await weatherEvents.createIndex({ "event_category": 1, "verification_status": 1 });

    // 5. IMD alerts index
    await imdAlerts.createIndex({ "state": 1, "district": 1, "valid_to": -1 });

    console.log('[DB INDEXES] MongoDB indexes verified and initialized.');
  } catch (err) {
    console.warn('[DB INDEXES] Index initialization note:', err.message);
  }
}
