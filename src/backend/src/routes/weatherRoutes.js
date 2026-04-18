/**
 * ============================================
 * WEATHER ROUTES
 * ============================================
 * Base URL: /api/weather
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');

// GET /api/weather?latitude=14.5995&longitude=120.9842&location=Manila
router.get('/', getWeather);

module.exports = router;
