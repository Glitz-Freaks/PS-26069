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
    console.warn('[EXPRESS DB WARNING] MONGO_URI is not configured in .env. Running in offline fallback mode.');
    return null;
  }

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`[EXPRESS DB] Connected to MongoDB Atlas (${DB_NAME})`);
    return db;
  } catch (err) {
    console.error('[EXPRESS DB ERROR]', err.message);
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
