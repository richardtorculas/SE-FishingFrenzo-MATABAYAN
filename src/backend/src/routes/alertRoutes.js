/**
 * ============================================
 * ALERT ROUTES
 * ============================================
 * Endpoints for managing alerts
 * ============================================
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserAlerts,
  getAlertLogs,
  getActiveAlerts,
  createAlert,
  markAlertAsRead,
  deleteAlert
} = require('../controllers/alertController');

// Get all alerts for user
router.get('/', protect, getUserAlerts);

// Get alert logs with filtering
router.get('/logs', protect, getAlertLogs);

// Get active alerts (last 24 hours)
router.get('/active', protect, getActiveAlerts);

// Create alert (for testing)
router.post('/', protect, createAlert);

// Mark alert as read
router.patch('/:alertId/read', protect, markAlertAsRead);

// Delete alert
router.delete('/:alertId', protect, deleteAlert);

module.exports = router;
