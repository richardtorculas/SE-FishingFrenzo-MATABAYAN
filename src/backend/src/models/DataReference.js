/**
 * ============================================
 * DATA REFERENCE MODEL
 * ============================================
 * Collection: datareferences
 * Purpose: Store data sources, threat/category guides, and code implementations
 * Commit: DB-03
 * ============================================
 */

const mongoose = require('mongoose');

const guideItemSchema = new mongoose.Schema({
  label:       { type: String, required: true },
  range:       { type: String, required: true },
  color:       { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: false });

const dataReferenceSchema = new mongoose.Schema({
  // ── Dashboard Type ────────────────────────────────────────────────────────
  dashboardType: {
    type: String,
    required: true,
    enum: ['Weather', 'Earthquake', 'Typhoon'],
    index: true
  },

  // ── Primary Data Source ───────────────────────────────────────────────────
  primarySource: {
    name:        { type: String, required: true },
    url:         { type: String, required: true },
    description: { type: String, required: true },
    organization: { type: String, required: true }
  },

  // ── Fallback Data Source ──────────────────────────────────────────────────
  fallbackSource: {
    name:        { type: String, required: true },
    url:         { type: String, default: '' },
    description: { type: String, required: true },
    organization: { type: String, required: true }
  },

  // ── Guide Type (Threat Level, Category, Weather Code, etc.) ──────────────
  guideType: {
    type: String,
    required: true,
    enum: ['Threat Level', 'Category', 'Weather Code', 'Signal Number']
  },

  // ── Guide Items (Array of classifications) ────────────────────────────────
  guideItems: {
    type: [guideItemSchema],
    required: true
  },

  // ── Code Implementation ───────────────────────────────────────────────────
  codeImplementation: {
    language:     { type: String, required: true, default: 'JavaScript' },
    fileName:     { type: String, required: true },
    filePath:     { type: String, required: true },
    code:         { type: String, required: true },
    description:  { type: String, required: true }
  },

  // ── Update Frequency ──────────────────────────────────────────────────────
  updateFrequency: {
    interval:     { type: Number, required: true },
    unit:         { type: String, required: true, enum: ['minutes', 'hours', 'days'] }
  },

  // ── Reference & Standards ────────────────────────────────────────────────
  standards: {
    type: [String],
    default: []
  },

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
  createdBy:   { type: String, default: 'System' },
  notes:       { type: String, default: '' }
});

// Index for fast queries
dataReferenceSchema.index({ dashboardType: 1, guideType: 1 });

module.exports = mongoose.model('DataReference', dataReferenceSchema);
