/**
 * ============================================
 * ALERT ROUTES
 * ============================================
 * Purpose: Define API endpoints for disaster alerts
 * Base URL: /api/alerts
 * Database: Alert model
 * ============================================
 */

const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

/**
 * ========================================
 * GET ALL ALERTS
 * ========================================
 * GET /api/alerts
 * Returns all disaster alerts sorted by most recent
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all alerts, sorted by timestamp (newest first)
    const alerts = await Alert.find().sort({ timestamp: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

/**
 * ========================================
 * GET ALERTS BY LOCATION
 * ========================================
 * GET /api/alerts/location/:province
 * Returns alerts filtered by province
 * Example: /api/alerts/location/Manila
 */
router.get('/location/:province', async (req, res) => {
  try {
    const { province } = req.params;
    
    // Find alerts matching the province
    const alerts = await Alert.find({ province }).sort({ timestamp: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

/**
 * ========================================
 * CREATE NEW ALERT
 * ========================================
 * POST /api/alerts
 * Body: { type, severity, location, province, description, source }
 * Note: This will be automated via data aggregation service
 */
router.post('/', async (req, res) => {
  try {
    const { type, severity, location, province, description, source } = req.body;
    
    // Create new alert
    const newAlert = await Alert.create({
      type,
      severity,
      location,
      province,
      description,
      source
    });
    
    res.status(201).json({
      status: 'success',
      data: newAlert
    });
  } catch (error) {
    res.status(400).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

module.exports = router;
