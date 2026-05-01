/**
 * ============================================
 * TYPHOON CONTROLLER
 * ============================================
 * Purpose: Handle tropical cyclone data from PAGASA/JTWC
 * Routes: /api/typhoons
 * ============================================
 */

const Typhoon = require('../models/Typhoon');
const { fetchTyphoonData } = require('../services/pagasaService');

// GET /api/typhoons
const getTyphoons = async (req, res) => {
  try {
    const typhoons = await Typhoon.find()
      .sort({ timestamp: -1 })
      .limit(20);
    res.json({ status: 'success', count: typhoons.length, data: typhoons });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/typhoons/update
const updateTyphoonData = async (req, res) => {
  try {
    const typhoonData = await fetchTyphoonData();

    if (typhoonData.length === 0) {
      return res.json({
        status: 'success',
        message: 'No active tropical cyclones in the Philippine Area of Responsibility',
        count: 0
      });
    }

    let newCount      = 0;
    let updatedCount  = 0;
    let skippedCount  = 0;

    for (const cyclone of typhoonData) {
      try {
        // Duplicate detection: check by stormKey (name + position + hour)
        const existing = await Typhoon.findOne({ stormKey: cyclone.stormKey });

        if (existing) {
          skippedCount++;
          continue; // exact duplicate — same storm, same position, same hour
        }

        // Check if same storm name exists with a different position (storm moved)
        // → update trajectory, keep as new record
        const sameStorm = await Typhoon.findOne({ name: cyclone.name })
          .sort({ timestamp: -1 });

        if (sameStorm) {
          // Append current position to existing storm's trajectory
          await Typhoon.findByIdAndUpdate(sameStorm._id, {
            $push: {
              trajectory: {
                latitude:  cyclone.latitude,
                longitude: cyclone.longitude,
                timestamp: cyclone.timestamp,
                windKph:   cyclone.windKph
              }
            },
            // Update current position and wind data
            $set: {
              latitude:          cyclone.latitude,
              longitude:         cyclone.longitude,
              windKph:           cyclone.windKph,
              severity:          cyclone.severity,
              category:          cyclone.category,
              signal:            cyclone.signal,
              location:          cyclone.location,
              movementDirection: cyclone.movementDirection,
              movementSpeedKph:  cyclone.movementSpeedKph,
              description:       cyclone.description,
              timestamp:         cyclone.timestamp,
              stormKey:          cyclone.stormKey
            }
          });
          updatedCount++;
        } else {
          // Brand new storm — insert
          await Typhoon.create(cyclone);
          newCount++;
        }
      } catch (err) {
        // Handle unique index violation (race condition) gracefully
        if (err.code === 11000) {
          skippedCount++;
        } else {
          console.error('❌ Error saving cyclone:', err.message);
        }
      }
    }

    res.json({
      status: 'success',
      message: `PAGASA data updated — ${newCount} new, ${updatedCount} updated, ${skippedCount} duplicate(s) skipped`,
      newCount,
      updatedCount,
      skippedCount
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/typhoons/stats
const getTyphoonStats = async (req, res) => {
  try {
    const [total, bySeverity, highestWind] = await Promise.all([
      Typhoon.countDocuments(),
      Typhoon.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      Typhoon.findOne().sort({ windKph: -1 })
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        bySeverity,
        highestWindKph:   highestWind?.windKph    ?? 0,
        highestCategory:  highestWind?.category   ?? 'None',
        highestStormName: highestWind?.name        ?? 'None'
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/typhoons/clear
const clearTyphoons = async (req, res) => {
  try {
    await Typhoon.deleteMany({});
    res.json({ status: 'success', message: 'All typhoon records cleared' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getTyphoons, updateTyphoonData, getTyphoonStats, clearTyphoons };
