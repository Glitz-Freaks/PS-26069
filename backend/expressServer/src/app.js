import express from 'express';
import cors from 'cors';
import path from 'path';
import weatherRoutes from './routes/weatherRoutes.js';
import citizenRoutes from './routes/citizenRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded citizen images statically
app.use('/uploads', express.static(path.resolve('src/uploads')));

// Mount API Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'National Weather Analytics API Gateway',
    version: '1.0.0',
    timestamp: new Date()
  });
});

export default app;
