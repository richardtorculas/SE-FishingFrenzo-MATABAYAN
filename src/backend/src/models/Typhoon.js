/**
 * ============================================
 * TYPHOON MODEL
 * ============================================
 * Collection: typhoons
 * Source: PAGASA / JTWC
 * ============================================
 */

const mongoose = require('mongoose');

const typhoonSchema = new mongoose.Schema({
  severity:    { type: String, required: true },
  location:    { type: String, required: true },
  province:    { type: String, required: true },
  description: { type: String, required: true },
  source:      { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
  metadata: {
    type: Object,
    // name, category, signal, severity_num, windKph,
    // latitude, longitude, movementDirection, movementSpeedKph,
    // affectedArea, pagasaId, jtwcId
  }
});

typhoonSchema.index({ province: 1, timestamp: -1 });

module.exports = mongoose.model('Typhoon', typhoonSchema);
