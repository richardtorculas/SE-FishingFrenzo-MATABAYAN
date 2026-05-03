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
 * Get all alerts for logged-in user with pagination and filtering
 */
const getUserAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const magnitude = req.query.magnitude;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let filter = { userId: req.user.id };

    if (magnitude) {
      filter.magnitude = { $gte: parseFloat(magnitude) };
    }
    if (status) {
      filter.status = status;
    }
    if (startDate || endDate) {
      filter.sentAt = {};
      if (startDate) filter.sentAt.$gte = new Date(startDate);
      if (endDate) filter.sentAt.$lte = new Date(endDate);
    }

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(filter)
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

/**
 * Get alert logs with pagination and filtering
 */
const getAlertLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const magnitude = req.query.magnitude;
    const location = req.query.location;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let filter = { userId: req.user.id };

    if (magnitude) {
      filter.magnitude = { $gte: parseFloat(magnitude) };
    }
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (startDate || endDate) {
      filter.sentAt = {};
      if (startDate) filter.sentAt.$gte = new Date(startDate);
      if (endDate) filter.sentAt.$lte = new Date(endDate);
    }

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(filter)
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
