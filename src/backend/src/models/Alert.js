/**
 * ============================================
 * ALERT MODEL (DATABASE SCHEMA)
 * ============================================
 * Purpose: Defines disaster alert data structure
 * Collections: alerts
 * Used by: alertController, alertRoutes
 * Data Sources: PAGASA, PHIVOLCS, NDRRMC
 * ============================================
 */

const mongoose = require('mongoose');

/**
 * Alert Schema Definition
 * Stores real-time disaster alerts from government agencies
 */
const alertSchema = new mongoose.Schema({
  // ========== ALERT CLASSIFICATION ==========
  type: {
    type: String,
    required: true,
    // Examples: 'Typhoon', 'Earthquake', 'Flood', 'Volcanic Eruption'
  },
  
  severity: {
    type: String,
    required: true,
    // Examples: 'Low', 'Medium', 'High', 'Critical'
  },

  // ========== LOCATION INFORMATION ==========
  location: {
    type: String,
    required: true,
    // Specific area affected (e.g., 'Metro Manila', 'Taal Volcano')
  },
  
  province: {
    type: String,
    required: true,
    // Province for filtering location-based alerts
  },

  // ========== ALERT DETAILS ==========
  description: {
    type: String,
    required: true,
    // Detailed information about the disaster
  },
  
  source: {
    type: String,
    required: true,
    // Government agency source (e.g., 'PAGASA', 'PHIVOLCS', 'NDRRMC')
  },

  // ========== METADATA ==========
  timestamp: {
    type: Date,
    default: Date.now,
    // When the alert was created/received
  }
});

// Create index on province for faster location-based queries
alertSchema.index({ province: 1, timestamp: -1 });

// Export Alert model
module.exports = mongoose.model('Alert', alertSchema);
