/**
 * ============================================
 * ALERT MODEL
 * ============================================
 * Collection: alerts
 * Purpose: Track sent alerts to prevent duplicates and maintain alert history
 * ============================================
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  earthquakeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Earthquake',
    required: true
  },

  // ========== ALERT DETAILS ==========
  magnitude: { type: Number, required: true },
  depth: { type: Number, required: true },
  location: { type: String, required: true },
  epicenterLat: { type: Number, required: true },
  epicenterLon: { type: Number, required: true },
  distance: { type: Number, required: true }, // in kilometers

  // ========== NOTIFICATION CHANNELS SENT ==========
  channelsSent: {
    sms: { type: Boolean, default: false },
    email: { type: Boolean, default: false },
    inApp: { type: Boolean, default: false }
  },

  // ========== DELIVERY STATUS ==========
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },

  // ========== METADATA ==========
  sentAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

alertSchema.index({ userId: 1, earthquakeId: 1 });
alertSchema.index({ earthquakeId: 1 });
alertSchema.index({ sentAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
