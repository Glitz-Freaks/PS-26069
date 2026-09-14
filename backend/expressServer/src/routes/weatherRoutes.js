import express from 'express';
import { getAreaWeather, searchWeather, getFilteredEvents, getNationalStats } from '../controllers/weatherController.js';

const router = express.Router();

router.get('/area', getAreaWeather);
router.get('/search', searchWeather);
router.get('/events', getFilteredEvents);
router.get('/stats', getNationalStats);

export default router;
