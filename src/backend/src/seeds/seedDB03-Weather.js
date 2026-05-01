/**
 * ============================================
 * SEED RUNNER - DB-03
 * ============================================
 * Commit: DB-03 - Weather Dashboard Data References
 * Usage: node src/seeds/seedDB03-Weather.js
 * Purpose: Populate database with weather dashboard references
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DataReference = require('../models/DataReference');
const weatherReferences = require('./weatherReferences');

const seedWeatherDashboard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matabayan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing weather references
    await DataReference.deleteMany({ dashboardType: 'Weather' });
    console.log('✓ Cleared existing weather references');

    // Seed Weather Dashboard References
    console.log('\n📊 Seeding Weather Dashboard References (DB-03)...');
    const weatherResult = await DataReference.insertMany(weatherReferences);
    console.log(`✓ Inserted ${weatherResult.length} weather reference(s)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✓ DB-03 Seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\nCommit: DB-03 - Weather Dashboard Data References');
    console.log('References inserted:');
    weatherResult.forEach((ref, idx) => {
      console.log(`  ${idx + 1}. ${ref.dashboardType} - ${ref.guideType}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedWeatherDashboard();
