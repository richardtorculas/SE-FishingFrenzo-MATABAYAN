/**
 * ============================================
 * EARTHQUAKE ALERT MODEL
 * ============================================
 * Purpose: Store earthquake alerts sent to users
 * Prevents duplicates and tracks notification delivery
 * ============================================
 */

const mongoose = require('mongoose');

const earthquakeAlertSchema = new mongoose.Schema(
  {
    // ========== REFERENCES ==========
    earthquakeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Earthquake',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // ========== EARTHQUAKE DATA ==========
    magnitude: {
      type: Number,
      required: true
    },
    depth: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Moderate', 'Low', 'Minor'],
      required: true
    },

    // ========== DISTANCE & PROXIMITY ==========
    distance: {
      type: Number,
      required: true,
      description: 'Distance in km from user location to epicenter'
    },
    userProvince: {
      type: String,
      required: true
    },

    // ========== NOTIFICATION TRACKING ==========
    notificationSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    smsDeliveryStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },

    // ========== ALERT STATUS ==========
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    dismissed: {
      type: Boolean,
      default: false
    },
    dismissedAt: {
      type: Date,
      default: null
    },
    notificationSentAt: {
      type: Date,
      default: null
    },

    // ========== METADATA ==========
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true
    }
  },
  { timestamps: true }
);

// Compound index to prevent duplicates
earthquakeAlertSchema.index({ earthquakeId: 1, userId: 1 }, { unique: true });

// Auto-delete alerts after 30 days
earthquakeAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EarthquakeAlert', earthquakeAlertSchema);
