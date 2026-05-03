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
const { triggerEarthquakeAlerts } = require('../services/alertTriggerService');

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
    await Earthquake.insertMany(earthquakeData);

    // Trigger alerts for new earthquakes
    const alertResults = [];
    for (const earthquake of earthquakeData) {
      const result = await triggerEarthquakeAlerts(earthquake);
      alertResults.push({
        earthquakeId: earthquake._id,
        location: earthquake.location,
        magnitude: earthquake.metadata?.magnitude,
        alertsCreated: result.alertsCreated
      });
    }

    res.json({
      status: 'success',
      message: `PHIVOLCS data updated — ${earthquakeData.length} latest earthquakes loaded`,
      count: earthquakeData.length,
      alerts: alertResults
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getEarthquakeStats = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, last24h, bySeverity, tsunamiCount] = await Promise.all([
      Earthquake.countDocuments(),
      Earthquake.countDocuments({ timestamp: { $gte: last24Hours } }),
      Earthquake.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Earthquake.countDocuments({ 'metadata.tsunami': true })
    ]);

    res.json({
      status: 'success',
      data: { total, last24Hours: last24h, bySeverity, tsunamiCount }
    });
  } catch (error) {
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
