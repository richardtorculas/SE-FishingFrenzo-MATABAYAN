/**
 * ============================================
 * EARTHQUAKE CONTROLLER
 * ============================================
 * Purpose: Handle real-time earthquake data from USGS/PHIVOLCS
 * Routes: /api/earthquakes
 * ============================================
 */

const Alert = require('../models/Alert');
const { fetchEarthquakeData } = require('../services/phivolcsService');

const getEarthquakes = async (req, res) => {
  try {
    const earthquakes = await Alert.find({ type: 'Earthquake' })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ status: 'success', count: earthquakes.length, data: earthquakes });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateEarthquakeData = async (req, res) => {
  try {
    const earthquakeData = await fetchEarthquakeData(50);

    // Replace DB with latest 50 — clear old, insert fresh
    await Alert.deleteMany({ type: 'Earthquake' });
    await Alert.insertMany(earthquakeData);

    res.json({
      status: 'success',
      message: `PHIVOLCS data updated — ${earthquakeData.length} latest earthquakes loaded`,
      count: earthquakeData.length
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getEarthquakeStats = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, last24h, bySeverity, tsunamiCount] = await Promise.all([
      Alert.countDocuments({ type: 'Earthquake' }),
      Alert.countDocuments({ type: 'Earthquake', timestamp: { $gte: last24Hours } }),
      Alert.aggregate([
        { $match: { type: 'Earthquake' } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.countDocuments({ type: 'Earthquake', 'metadata.tsunami': true })
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
    await Alert.deleteMany({ type: 'Earthquake' });
    res.json({ status: 'success', message: 'All earthquake records cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getEarthquakes, updateEarthquakeData, getEarthquakeStats, clearEarthquakes };
