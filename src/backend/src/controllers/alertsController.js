/**
 * ============================================
 * ALERTS CONTROLLER
 * ============================================
 * Purpose: Handle earthquake alert logs and history
 * Routes: /api/alerts
 * ============================================
 */

const EarthquakeAlert = require('../models/EarthquakeAlert');

// Get alert logs for authenticated user
const getAlertLogs = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // 'active', 'dismissed', 'read'

    let filter = { userId };

    if (status === 'active') {
      filter.dismissed = false;
    } else if (status === 'dismissed') {
      filter.dismissed = true;
    } else if (status === 'read') {
      filter.read = true;
    }

    const [alerts, total] = await Promise.all([
      EarthquakeAlert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EarthquakeAlert.countDocuments(filter)
    ]);

    res.json({
      status: 'success',
      count: alerts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Mark alert as read
const markAlertAsRead = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await EarthquakeAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { read: true, readAt: new Date() },
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

// Mark alert as dismissed
const dismissAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user._id;

    const alert = await EarthquakeAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { dismissed: true, dismissedAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ status: 'error', message: 'Alert not found' });
    }

    res.json({
      status: 'success',
      message: 'Alert dismissed',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get alert statistics
const getAlertStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, active, last24h, bySeverity] = await Promise.all([
      EarthquakeAlert.countDocuments({ userId }),
      EarthquakeAlert.countDocuments({ userId, dismissed: false }),
      EarthquakeAlert.countDocuments({ userId, createdAt: { $gte: last24Hours } }),
      EarthquakeAlert.aggregate([
        { $match: { userId } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        active,
        last24Hours: last24h,
        bySeverity
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAlertLogs,
  markAlertAsRead,
  dismissAlert,
  getAlertStats
};
