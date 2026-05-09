/**
 * ============================================
 * CYCLONE ALERTS ROUTES
 * ============================================
 * Base URL: /api/cyclone-alerts
 * ============================================
 */

const express = require('express');
const router = express.Router();
const CycloneAlert = require('../models/CycloneAlert');
const { protect } = require('../middleware/authMiddleware');

// GET /api/cyclone-alerts - Get user's cyclone alerts (paginated)
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const read = req.query.read;

    let filter = { userId: req.user._id };
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const [alerts, total] = await Promise.all([
      CycloneAlert.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CycloneAlert.countDocuments(filter)
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
});

// GET /api/cyclone-alerts/active - Get active cyclone alerts (last 24h)
router.get('/active', protect, async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const alerts = await CycloneAlert.find({
      userId: req.user._id,
      createdAt: { $gte: last24Hours },
      dismissed: false
    }).sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PATCH /api/cyclone-alerts/:alertId/read - Mark alert as read
router.patch('/:alertId/read', protect, async (req, res) => {
  try {
    const alert = await CycloneAlert.findByIdAndUpdate(
      req.params.alertId,
      {
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ status: 'error', message: 'Alert not found' });
    }

    res.json({ status: 'success', data: alert });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PATCH /api/cyclone-alerts/:alertId/dismiss - Dismiss alert
router.patch('/:alertId/dismiss', protect, async (req, res) => {
  try {
    const alert = await CycloneAlert.findByIdAndUpdate(
      req.params.alertId,
      {
        dismissed: true,
        dismissedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ status: 'error', message: 'Alert not found' });
    }

    res.json({ status: 'success', data: alert });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /api/cyclone-alerts/:alertId - Delete alert
router.delete('/:alertId', protect, async (req, res) => {
  try {
    const alert = await CycloneAlert.findByIdAndDelete(req.params.alertId);

    if (!alert) {
      return res.status(404).json({ status: 'error', message: 'Alert not found' });
    }

    res.json({ status: 'success', message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
