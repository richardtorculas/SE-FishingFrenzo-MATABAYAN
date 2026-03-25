/**
 * ============================================
 * TYPHOON CONTROLLER
 * ============================================
 * Purpose: Handle tropical cyclone data from PAGASA/JTWC
 * Routes: /api/typhoons
 * ============================================
 */

const Alert = require('../models/Alert');
const { fetchTyphoonData } = require('../services/pagasaService');

const getTyphoons = async (req, res) => {
  try {
    const typhoons = await Alert.find({ type: 'Typhoon' }).sort({ timestamp: -1 }).limit(20);
    res.json({ status: 'success', count: typhoons.length, data: typhoons });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const updateTyphoonData = async (req, res) => {
  try {
    const typhoonData = await fetchTyphoonData();

    // Replace DB with latest — clear old, insert fresh
    await Alert.deleteMany({ type: 'Typhoon' });
    if (typhoonData.length > 0) await Alert.insertMany(typhoonData);

    res.json({
      status: 'success',
      message: typhoonData.length > 0
        ? `PAGASA data updated — ${typhoonData.length} active cyclone(s) loaded`
        : 'No active tropical cyclones in the Philippine Area of Responsibility',
      count: typhoonData.length
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const getTyphoonStats = async (req, res) => {
  try {
    const [total, bySeverity, highestWind] = await Promise.all([
      Alert.countDocuments({ type: 'Typhoon' }),
      Alert.aggregate([
        { $match: { type: 'Typhoon' } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Alert.findOne({ type: 'Typhoon' }).sort({ 'metadata.windKph': -1 })
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        bySeverity,
        highestWindKph: highestWind?.metadata?.windKph ?? 0,
        highestCategory: highestWind?.metadata?.category ?? 'None'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

const clearTyphoons = async (req, res) => {
  try {
    await Alert.deleteMany({ type: 'Typhoon' });
    res.json({ status: 'success', message: 'All typhoon records cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getTyphoons, updateTyphoonData, getTyphoonStats, clearTyphoons };
