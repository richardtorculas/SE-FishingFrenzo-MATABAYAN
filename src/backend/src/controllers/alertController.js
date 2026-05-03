/**
 * ============================================
 * ALERT CONTROLLER
 * ============================================
 * Purpose: Handle alert operations and retrieval
 * Routes: /api/alerts
 * ============================================
 */

const Alert = require('../models/Alert');
const { protect } = require('../middleware/authMiddleware');

/**
 * Get all alerts for logged-in user
 */
const getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id })
      .sort({ sentAt: -1 })
      .limit(100);

    res.json({
      status: 'success',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get alert logs (same as getUserAlerts, for compatibility)
 */
const getAlertLogs = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id })
      .sort({ sentAt: -1 })
      .limit(100);

    res.json({
      status: 'success',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Get active alerts (last 24 hours)
 */
const getActiveAlerts = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const alerts = await Alert.find({
      userId: req.user.id,
      sentAt: { $gte: last24Hours }
    }).sort({ sentAt: -1 });

    res.json({
      status: 'success',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Create a new alert (for testing or manual trigger)
 */
const createAlert = async (req, res) => {
  try {
    const { earthquakeId, magnitude, depth, location, epicenterLat, epicenterLon, distance, channelsSent } = req.body;

    const alert = await Alert.create({
      userId: req.user.id,
      earthquakeId,
      magnitude,
      depth,
      location,
      epicenterLat,
      epicenterLon,
      distance,
      channelsSent: channelsSent || { sms: false, email: false, inApp: true },
      status: 'sent'
    });

    res.status(201).json({
      status: 'success',
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Mark alert as read
 */
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { status: 'read' },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ status: 'error', message: 'Alert not found' });
    }

    res.json({
      status: 'success',
      message: 'Alert marked as read',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * Delete alert
 */
const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findByIdAndDelete(alertId);

    if (!alert) {
      return res.status(404).json({ status: 'error', message: 'Alert not found' });
    }

    res.json({
      status: 'success',
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getUserAlerts,
  getAlertLogs,
  getActiveAlerts,
  createAlert,
  markAlertAsRead,
  deleteAlert
};
