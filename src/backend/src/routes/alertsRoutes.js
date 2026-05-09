/**
 * ============================================
 * ALERTS ROUTES
 * ============================================
 * Base URL: /api/alerts
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAlertLogs,
  markAlertAsRead,
  dismissAlert,
  getAlertStats
} = require('../controllers/alertsController');

// All routes require authentication
router.use(protect);

router.get('/logs', getAlertLogs);
router.get('/stats', getAlertStats);
router.patch('/:alertId/read', markAlertAsRead);
router.patch('/:alertId/dismiss', dismissAlert);

module.exports = router;
