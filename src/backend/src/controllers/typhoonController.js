/**
 * ============================================
 * TYPHOON CONTROLLER
 * ============================================
 * Purpose: Handle tropical cyclone data from PAGASA/JTWC
 * Routes: /api/typhoons
 * ============================================
 */

const Typhoon = require('../models/Typhoon');
const { fetchTyphoonData, fetchHistoricalTyphoons } = require('../services/pagasaService');

// GET /api/typhoons
const getTyphoons = async (req, res) => {
  try {
    const typhoons = await Typhoon.find()
      .sort({ parEntryDate: -1, timestamp: -1 })
      .limit(10);
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
              isHistorical:      cyclone.isHistorical,
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
    const [total, highestWind, activeCyclone] = await Promise.all([
      Typhoon.countDocuments(),
      Typhoon.findOne().sort({ windKph: -1 }),
      Typhoon.findOne({ isHistorical: false }).sort({ parEntryDate: -1, timestamp: -1 })
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        highestWindKph:   highestWind?.windKph    ?? null,
        highestStormName: highestWind?.name        ?? null,
        highestStormCategory: highestWind?.category ?? null,
        activeCycloneName: activeCyclone?.name ?? null,
        activeCycloneCategory: activeCyclone?.category ?? null
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/typhoons/clear
const clearTyphoons = async (req, res) => {
  try {
    const result = await Typhoon.deleteMany({});
    res.json({ status: 'success', message: `Cleared ${result.deletedCount} typhoon records` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// POST /api/typhoons/historical
const seedHistoricalTyphoons = async (req, res) => {
  try {
    console.log('📚 Starting historical typhoon seeding...');
    const historicalData = await fetchHistoricalTyphoons();
    console.log(`📊 Fetched ${historicalData.length} historical typhoons`);

    if (historicalData.length === 0) {
      return res.json({
        status: 'success',
        message: 'No historical typhoon data found',
        count: 0
      });
    }

    let newCount = 0;
    const limitedData = historicalData.slice(0, 10);

    for (const cyclone of limitedData) {
      try {
        console.log(`🔍 Processing ${cyclone.name}...`);
        
        const result = await Typhoon.updateOne(
          { stormKey: cyclone.stormKey },
          { $set: cyclone },
          { upsert: true }
        );
        
        if (result.upsertedId) {
          console.log(`✅ Created ${cyclone.name}`);
          newCount++;
        } else if (result.modifiedCount > 0) {
          console.log(`🔄 Updated ${cyclone.name}`);
        } else {
          console.log(`⏭️  ${cyclone.name} unchanged`);
        }
      } catch (err) {
        console.error(`❌ Error saving ${cyclone.name}:`, err.message);
      }
    }

    // Keep only 10 most recent records by timestamp
    const allTyphoons = await Typhoon.find().sort({ timestamp: -1 }).limit(10);
    const keepIds = allTyphoons.map(t => t._id);
    await Typhoon.deleteMany({ _id: { $nin: keepIds } });
    console.log(`🗑️  Cleaned up old records, keeping only 10 most recent`);

    console.log(`📈 Historical seeding complete: ${newCount} records processed (limited to 10 most recent)`);
    res.json({
      status: 'success',
      message: `Historical data seeded — ${newCount} record(s) processed (limited to 10 most recent)`,
      newCount
    });
  } catch (error) {
    console.error('❌ Historical seeding error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { getTyphoons, updateTyphoonData, getTyphoonStats, clearTyphoons, seedHistoricalTyphoons };
