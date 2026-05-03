/**
 * ============================================
 * EARTHQUAKE ROUTES
 * ============================================
 * Base URL: /api/earthquakes
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { getEarthquakes, getEarthquakeById, updateEarthquakeData, getEarthquakeStats, clearEarthquakes } = require('../controllers/earthquakeController');

router.get('/', getEarthquakes);
router.post('/mock', require('../controllers/earthquakeController').addMockEarthquake);
router.get('/stats', getEarthquakeStats);
router.post('/update', updateEarthquakeData);
router.get('/:id', getEarthquakeById);
router.delete('/clear', clearEarthquakes);

module.exports = router;
