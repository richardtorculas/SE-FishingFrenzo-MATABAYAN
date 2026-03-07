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
 * Stores user account information and location preferences
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
    unique: true,                              // Prevent duplicate emails
    lowercase: true,                           // Store in lowercase
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,                              // Minimum 8 characters
    select: false                              // Don't return password in queries by default
  },

  // ========== LOCATION & ALERT PREFERENCES ==========
  preferences: {
    province: {
      type: String,
      required: [true, 'Province is required']  // For location-based alerts
    },
    cityMunicipality: {
      type: String,
      required: [true, 'City/Municipality is required']
    },
    language: {
      type: String,
      enum: ['en', 'fil'],                      // English or Filipino
      default: 'en'
    },
    // Alert type subscriptions
    alertTypes: {
      typhoon: { type: Boolean, default: true },
      earthquake: { type: Boolean, default: true },
      volcano: { type: Boolean, default: true },
      flood: { type: Boolean, default: true }
    }
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
  // Only hash if password is modified
  if (!this.isModified('password')) return next();
  
  // Hash password with bcrypt (12 salt rounds)
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
