/**
 * ============================================
 * WEATHER ROUTES
 * ============================================
 * Base URL: /api/weather
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { getWeather, getGeocode } = require('../controllers/weatherController');

router.get('/geocode', getGeocode);
router.get('/', getWeather);

module.exports = router;
