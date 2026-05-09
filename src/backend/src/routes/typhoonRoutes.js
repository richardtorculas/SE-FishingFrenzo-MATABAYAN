/**
 * ============================================
 * TYPHOON ROUTES
 * ============================================
 * Base URL: /api/typhoons
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { getTyphoons, updateTyphoonData, getTyphoonStats, clearTyphoons, seedHistoricalTyphoons } = require('../controllers/typhoonController');

router.get('/', getTyphoons);
router.get('/stats', getTyphoonStats);
router.post('/update', updateTyphoonData);
router.post('/historical', seedHistoricalTyphoons);
router.delete('/clear', clearTyphoons);

module.exports = router;
