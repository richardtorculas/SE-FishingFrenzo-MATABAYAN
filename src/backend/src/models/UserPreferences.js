/**
 * ============================================
 * USER PREFERENCES MODEL
 * ============================================
 * Collection: userpreferences
 * Purpose: Store detailed user notification preferences and location data
 * ============================================
 */

const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // ========== NOTIFICATION CHANNELS ==========
  notificationChannels: {
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  },

  // ========== ALERT TYPES ==========
  alertTypes: {
    earthquake: { type: Boolean, default: true },
    typhoon: { type: Boolean, default: true },
    volcano: { type: Boolean, default: true },
    flood: { type: Boolean, default: true }
  },

  // ========== LOCATION DATA ==========
  location: {
    province: { type: String, required: true },
    cityMunicipality: { type: String, required: true }
  },

  // ========== EARTHQUAKE ALERT SETTINGS ==========
  earthquakeSettings: {
    minMagnitude: { type: Number, default: 3.0 },
    maxDistance: { type: Number, default: 200 } // in kilometers
  },

  // ========== METADATA ==========
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userPreferencesSchema.index({ userId: 1 });

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
