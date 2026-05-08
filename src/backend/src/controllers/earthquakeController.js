/**
 * ============================================
 * EARTHQUAKE CONTROLLER
 * ============================================
 * Purpose: Handle real-time earthquake data from USGS/PHIVOLCS
 * Routes: /api/earthquakes
 * ============================================
 */

const Earthquake = require('../models/Earthquake');
const { fetchEarthquakeData } = require('../services/phivolcsService');
const { triggerEarthquakeAlerts } = require('../services/earthquakeAlertTrigger');
const { processAlertNotifications } = require('../services/notificationService');

const getEarthquakes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const magnitude = req.query.magnitude;
    const province = req.query.province;

    let filter = {};
    if (magnitude) {
      filter['metadata.magnitude'] = { $gte: parseFloat(magnitude) };
    }
    if (province) {
      filter.province = province;
    }

    const [earthquakes, total] = await Promise.all([
      Earthquake.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      Earthquake.countDocuments(filter)
    ]);

    res.json({
      status: 'success',
      count: earthquakes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: earthquakes
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getEarthquakeById = async (req, res) => {
  try {
    const { id } = req.params;
    const earthquake = await Earthquake.findById(id);

    if (!earthquake) {
      return res.status(404).json({ status: 'error', message: 'Earthquake not found' });
    }

    res.json({
      status: 'success',
      data: earthquake
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateEarthquakeData = async (req, res) => {
  try {
    const earthquakeData = await fetchEarthquakeData(50);

    // Replace DB with latest 50 — clear old, insert fresh
    await Earthquake.deleteMany({});
    const savedEarthquakes = await Earthquake.insertMany(earthquakeData);

    // Trigger alerts for new earthquakes
    let alertStats = { created: 0, skipped: 0 };
    let notificationStats = { processed: 0, successful: 0, failed: 0 };

    for (const earthquake of savedEarthquakes) {
      const stats = await triggerEarthquakeAlerts(earthquake);
      alertStats.created += stats.created;
      alertStats.skipped += stats.skipped;
    }

    // Process notifications for all pending alerts
    notificationStats = await processAlertNotifications();

    res.json({
      status: 'success',
      message: `PHIVOLCS data updated — ${savedEarthquakes.length} latest earthquakes loaded`,
      count: savedEarthquakes.length,
      alerts: alertStats,
      notifications: notificationStats
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getEarthquakeStats = async (req, res) => {
  try {
    // Calculate today's date range (midnight to now)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    console.log('📊 Earthquake Stats Query:');
    console.log(`   Current time: ${now.toISOString()}`);
    console.log(`   Today start: ${todayStart.toISOString()}`);

    const [total, todayCount, bySeverity, tsunamiCount] = await Promise.all([
      Earthquake.countDocuments(),
      Earthquake.countDocuments({ timestamp: { $gte: todayStart } }),
      Earthquake.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Earthquake.countDocuments({ 'metadata.tsunami': true })
    ]);

    console.log(`   Total earthquakes: ${total}`);
    console.log(`   Recorded today: ${todayCount}`);
    console.log(`   Tsunami alerts: ${tsunamiCount}`);

    res.json({
      status: 'success',
      data: { 
        total, 
        recordedToday: todayCount, 
        bySeverity, 
        tsunamiCount,
        queryTime: {
          now: now.toISOString(),
          todayStart: todayStart.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('❌ Error in getEarthquakeStats:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const clearEarthquakes = async (req, res) => {
  try {
    await Earthquake.deleteMany({});
    res.json({ status: 'success', message: 'All earthquake records cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getEarthquakes, getEarthquakeById, updateEarthquakeData, getEarthquakeStats, clearEarthquakes };
