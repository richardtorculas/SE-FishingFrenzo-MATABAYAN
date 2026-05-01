/**
 * ============================================
 * SEED RUNNER
 * ============================================
 * Usage: node src/seeds/seedRunner.js
 * Purpose: Populate database with data references
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DataReference = require('../models/DataReference');
const weatherReferences = require('./weatherReferences');
const earthquakeReferences = require('./earthquakeReferences');
const typhoonReferences = require('./typhoonReferences');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matabayan', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing data references
    await DataReference.deleteMany({});
    console.log('✓ Cleared existing data references');

    // Seed Weather Dashboard References (DB-03)
    console.log('\n📊 Seeding Weather Dashboard References (DB-03)...');
    const weatherResult = await DataReference.insertMany(weatherReferences);
    console.log(`✓ Inserted ${weatherResult.length} weather reference(s)`);

    // Seed Earthquake Dashboard References (DB-04)
    console.log('\n📊 Seeding Earthquake Dashboard References (DB-04)...');
    const earthquakeResult = await DataReference.insertMany(earthquakeReferences);
    console.log(`✓ Inserted ${earthquakeResult.length} earthquake reference(s)`);

    // Seed Typhoon Dashboard References (DB-05)
    console.log('\n📊 Seeding Typhoon Dashboard References (DB-05)...');
    const typhoonResult = await DataReference.insertMany(typhoonReferences);
    console.log(`✓ Inserted ${typhoonResult.length} typhoon reference(s)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✓ Database seeding completed successfully!');
    console.log('='.repeat(50));
    console.log(`Total references inserted: ${weatherResult.length + earthquakeResult.length + typhoonResult.length}`);
    console.log('\nCommits:');
    console.log('  • DB-03: Weather Dashboard Data References');
    console.log('  • DB-04: Earthquake Dashboard Data References');
    console.log('  • DB-05: Typhoon Dashboard Data References');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
