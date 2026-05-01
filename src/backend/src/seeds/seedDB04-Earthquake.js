/**
 * ============================================
 * SEED RUNNER - DB-04
 * ============================================
 * Commit: DB-04 - Earthquake Dashboard Data References
 * Usage: node src/seeds/seedDB04-Earthquake.js
 * Purpose: Populate database with earthquake dashboard references
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DataReference = require('../models/DataReference');
const earthquakeReferences = require('./earthquakeReferences');

const seedEarthquakeDashboard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matabayan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing earthquake references
    await DataReference.deleteMany({ dashboardType: 'Earthquake' });
    console.log('✓ Cleared existing earthquake references');

    // Seed Earthquake Dashboard References
    console.log('\n📊 Seeding Earthquake Dashboard References (DB-04)...');
    const earthquakeResult = await DataReference.insertMany(earthquakeReferences);
    console.log(`✓ Inserted ${earthquakeResult.length} earthquake reference(s)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✓ DB-04 Seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\nCommit: DB-04 - Earthquake Dashboard Data References');
    console.log('References inserted:');
    earthquakeResult.forEach((ref, idx) => {
      console.log(`  ${idx + 1}. ${ref.dashboardType} - ${ref.guideType}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedEarthquakeDashboard();
