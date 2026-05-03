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
    const savedEarthquakes = await Earthquake.insertMany(earthquakeData);

    // Trigger alerts for new earthquakes (with their MongoDB IDs)
    const alertResults = [];
    for (const earthquake of savedEarthquakes) {
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
      message: `PHIVOLCS data updated — ${savedEarthquakes.length} latest earthquakes loaded`,
      count: savedEarthquakes.length,
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

const addMockEarthquake = async (req, res) => {
  try {
    const mockEarthquakes = [
      {
        severity: 'High',
        location: '45 km NE of Batangas City (Batangas)',
        province: 'Batangas',
        description: 'Magnitude 5.2 earthquake at depth of 15km. Strong shallow earthquake — Significant damage possible.',
        source: 'PHIVOLCS',
        timestamp: new Date(),
        metadata: {
          magnitude: 5.2,
          depth: 15,
          latitude: 13.7381,
          longitude: 121.0475,
          threatLevel: 'High',
          threatSeverity: 4,
          phivolcsId: 'mock-001'
        }
      },
      {
        severity: 'Moderate',
        location: '32 km S 45° W of Quezon City (Metro Manila)',
        province: 'Metro Manila',
        description: 'Magnitude 4.8 earthquake at depth of 22km. Moderate earthquake — Minor damage possible. Stay alert.',
        source: 'PHIVOLCS',
        timestamp: new Date(Date.now() - 3600000),
        metadata: {
          magnitude: 4.8,
          depth: 22,
          latitude: 14.5994,
          longitude: 121.0347,
          threatLevel: 'Moderate',
          threatSeverity: 3,
          phivolcsId: 'mock-002'
        }
      },
      {
        severity: 'Low',
        location: '28 km E of Cebu City (Cebu)',
        province: 'Cebu',
        description: 'Magnitude 4.1 earthquake at depth of 18km. Light earthquake — Generally felt. Minimal damage expected.',
        source: 'PHIVOLCS',
        timestamp: new Date(Date.now() - 7200000),
        metadata: {
          magnitude: 4.1,
          depth: 18,
          latitude: 10.3157,
          longitude: 123.8854,
          threatLevel: 'Low',
          threatSeverity: 2,
          phivolcsId: 'mock-003'
        }
      }
    ];

    await Earthquake.insertMany(mockEarthquakes);
    res.json({
      status: 'success',
      message: `${mockEarthquakes.length} mock earthquakes added for testing`,
      count: mockEarthquakes.length,
      data: mockEarthquakes
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getEarthquakes, getEarthquakeById, updateEarthquakeData, getEarthquakeStats, clearEarthquakes, addMockEarthquake };
