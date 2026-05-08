/**
 * ============================================
 * CYCLONE ALERT MODEL
 * ============================================
 * Purpose: Store cyclone alerts sent to users
 * Prevents duplicates and tracks notification delivery
 * ============================================
 */

const mongoose = require('mongoose');

const cycloneAlertSchema = new mongoose.Schema(
  {
    // ========== REFERENCES ==========
    cycloneId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // ========== CYCLONE DATA ==========
    cycloneName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Super Typhoon', 'Typhoon', 'Severe Tropical Storm', 'Tropical Storm', 'Tropical Depression', 'Low Pressure Area'],
      required: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    },
    windKph: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    cycloneTimestamp: {
      type: Date,
      required: true,
      description: 'Time when the cyclone data was recorded'
    },

    // ========== USER INFO ==========
    userProvince: {
      type: String,
      default: 'Philippines'
    },

    // ========== ALERT TRIGGER REASON ==========
    triggerReason: {
      type: String,
      enum: ['par_entry', 'status_change', 'approaching_24h'],
      required: true,
      description: 'Why the alert was triggered'
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
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true
    }
  },
  { timestamps: true }
);

// Compound index to prevent duplicates
cycloneAlertSchema.index({ cycloneId: 1, userId: 1 }, { unique: true });

// Auto-delete alerts after 30 days
cycloneAlertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CycloneAlert', cycloneAlertSchema);
