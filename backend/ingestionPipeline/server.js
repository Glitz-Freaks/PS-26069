import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { ingest } from './main.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
let isIngesting = false;

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Weather Ingestion Pipeline',
    timestamp: new Date()
  });
});

app.post('/api/ingest', async (req, res) => {
  if (isIngesting) {
    return res.status(429).json({ message: 'Ingestion job is already running in background.' });
  }

  isIngesting = true;
  res.json({ message: 'Ingestion job started asynchronously.' });

  try {
    const stats = await ingest();
    console.log('[WEBHOOK] Ingestion completed via webhook trigger:', stats);
  } catch (err) {
    console.error('[WEBHOOK ERROR] Ingestion failed:', err.message);
  } finally {
    isIngesting = false;
  }
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[INGESTION SERVER] Running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('[INGESTION SERVER FATAL]', err.message);
  });
