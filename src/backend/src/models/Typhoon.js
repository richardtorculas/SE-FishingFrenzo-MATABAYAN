/**
 * ============================================
 * TYPHOON MODEL
 * ============================================
 * Collection: typhoons
 * Source: PAGASA / JTWC
 * ============================================
 */

const mongoose = require('mongoose');

const trajectoryPointSchema = new mongoose.Schema({
  latitude:  { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date,   required: true },
  windKph:   { type: Number, default: 0 }
}, { _id: false });

const typhoonSchema = new mongoose.Schema({
  // ── Core fields ──────────────────────────────────────────────────────────
  name:        { type: String, required: true, trim: true, uppercase: true },
  category:    {
    type: String,
    required: true,
    enum: ['Super Typhoon', 'Typhoon', 'Severe Tropical Storm', 'Tropical Storm', 'Tropical Depression', 'Low Pressure Area']
  },
  severity:    {
    type: String,
    required: true,
    enum: ['Critical', 'High', 'Moderate', 'Low']
  },
  signal:      { type: Number, min: 0, max: 5, default: 0 },

  // ── Location ─────────────────────────────────────────────────────────────
  location:    { type: String, required: true, trim: true },
  province:    { type: String, required: true, trim: true, default: 'Philippines' },
  latitude:    { type: Number, min: -90,  max: 90  },
  longitude:   { type: Number, min: -180, max: 180 },

  // ── Wind & Movement ───────────────────────────────────────────────────────
  windKph:             { type: Number, required: true, min: 0 },
  movementDirection:   { type: String, trim: true, default: 'Unknown' },
  movementSpeedKph:    { type: Number, min: 0, default: null },

  // ── Trajectory (array of past/forecast positions) ────────────────────────
  trajectory: { type: [trajectoryPointSchema], default: [] },

  // ── Description & Source ─────────────────────────────────────────────────
  description: { type: String, required: true, trim: true },
  source:      { type: String, required: true, enum: ['PAGASA', 'JTWC'], default: 'PAGASA' },
  affectedArea: { type: String, trim: true, default: 'Philippine Area of Responsibility' },

  // ── Duplicate detection key ───────────────────────────────────────────────
  // Composed of: name + rounded lat/lon + hour-truncated timestamp
  // This ensures the same storm at the same position within the same hour = duplicate
  stormKey:    { type: String, required: true, unique: true, index: true },

  timestamp:   { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Compound index for fast queries by severity and time
typhoonSchema.index({ severity: 1, timestamp: -1 });
typhoonSchema.index({ name: 1, timestamp: -1 });

module.exports = mongoose.model('Typhoon', typhoonSchema);
