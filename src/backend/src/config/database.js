/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * Purpose: Centralized MongoDB connection setup
 * Used by: server.js (main entry point)
 * ============================================
 */

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (process.env.NODE_ENV !== 'production') process.exit(1);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

module.exports = connectDB;
