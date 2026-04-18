/**
 * ============================================
 * TYPHOON ROUTES
 * ============================================
 * Base URL: /api/typhoons
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { getTyphoons, updateTyphoonData, getTyphoonStats, clearTyphoons } = require('../controllers/typhoonController');

router.get('/', getTyphoons);
router.get('/stats', getTyphoonStats);
router.post('/update', updateTyphoonData);
router.delete('/clear', clearTyphoons);

module.exports = router;
