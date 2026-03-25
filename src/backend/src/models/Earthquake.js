/**
 * ============================================
 * EARTHQUAKE MODEL
 * ============================================
 * Collection: earthquakes
 * Source: PHIVOLCS / USGS
 * ============================================
 */

const mongoose = require('mongoose');

const earthquakeSchema = new mongoose.Schema({
  severity:    { type: String, required: true },
  location:    { type: String, required: true },
  province:    { type: String, required: true },
  description: { type: String, required: true },
  source:      { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
  metadata: {
    type: Object,
    // magnitude, depth, latitude, longitude, threatLevel, threatSeverity,
    // phivolcsId, tsunami, felt, usgsId, usgsUrl
  }
});

earthquakeSchema.index({ province: 1, timestamp: -1 });

module.exports = mongoose.model('Earthquake', earthquakeSchema);
