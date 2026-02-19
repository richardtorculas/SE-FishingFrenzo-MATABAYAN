/**
 * ============================================
 * DATABASE CONFIGURATION
 * ============================================
 * Purpose: Centralized MongoDB connection setup
 * Used by: server.js (main entry point)
 * ============================================
 */

const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database
 * @returns {Promise} MongoDB connection promise
 */
const connectDB = async () => {
  try {
    // Connection options for MongoDB
    const options = {
      useNewUrlParser: true,      // Use new URL parser
      useUnifiedTopology: true    // Use new topology engine
    };

    // Connect to MongoDB using URI from environment variables
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
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
