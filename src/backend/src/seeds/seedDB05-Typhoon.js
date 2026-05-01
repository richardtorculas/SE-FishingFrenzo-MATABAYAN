/**
 * ============================================
 * SEED RUNNER - DB-05
 * ============================================
 * Commit: DB-05 - Typhoon Dashboard Data References
 * Usage: node src/seeds/seedDB05-Typhoon.js
 * Purpose: Populate database with typhoon dashboard references
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DataReference = require('../models/DataReference');
const typhoonReferences = require('./typhoonReferences');

const seedTyphoonDashboard = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matabayan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing typhoon references
    await DataReference.deleteMany({ dashboardType: 'Typhoon' });
    console.log('✓ Cleared existing typhoon references');

    // Seed Typhoon Dashboard References
    console.log('\n📊 Seeding Typhoon Dashboard References (DB-05)...');
    const typhoonResult = await DataReference.insertMany(typhoonReferences);
    console.log(`✓ Inserted ${typhoonResult.length} typhoon reference(s)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✓ DB-05 Seeding completed successfully!');
    console.log('='.repeat(50));
    console.log('\nCommit: DB-05 - Typhoon Dashboard Data References');
    console.log('References inserted:');
    typhoonResult.forEach((ref, idx) => {
      console.log(`  ${idx + 1}. ${ref.dashboardType} - ${ref.guideType}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedTyphoonDashboard();
