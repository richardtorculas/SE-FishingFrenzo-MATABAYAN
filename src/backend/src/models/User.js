/**
 * ============================================
 * USER MODEL (DATABASE SCHEMA)
 * ============================================
 * Purpose: Defines user data structure and authentication logic
 * Collections: users
 * Used by: authController, userRoutes
 * ============================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema Definition
 * Stores user account information and preferences
 */
const userSchema = new mongoose.Schema({
  // ========== BASIC INFORMATION ==========
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },

  phoneNumber: {
    type: String,
    match: [/^\+63\d{9,10}$/, 'Please provide a valid Philippine phone number (e.g., +639123456789)'],
    default: null
  },

  // ========== LOCATION ==========
  province: {
    type: String,
    default: null
  },
  cityMunicipality: {
    type: String,
    default: null
  },

  // ========== USER PREFERENCES ==========
  preferences: {
    language: {
      type: String,
      enum: ['en', 'fil'],
      default: 'en'
    },
    alertTypes: {
      typhoon: { type: Boolean, default: true },
      earthquake: { type: Boolean, default: true },
      volcano: { type: Boolean, default: true },
      flood: { type: Boolean, default: true }
    }
  },

  // ========== NOTIFICATION PREFERENCES ==========
  notificationPreferences: {
    smsEnabled: { type: Boolean, default: false },
    inAppEnabled: { type: Boolean, default: true }
  },

  // ========== METADATA ==========
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * PRE-SAVE MIDDLEWARE
 * Automatically hash password before saving to database
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * INSTANCE METHOD
 * Compare provided password with hashed password in database
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} True if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export User model
module.exports = mongoose.model('User', userSchema);
