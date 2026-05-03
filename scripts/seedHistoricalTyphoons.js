#!/usr/bin/env node
/**
 * Seed historical typhoon data from PAGASA preliminary reports (2026)
 * Usage: node seedHistoricalTyphoons.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/typhoons/historical';

const seedHistoricalData = async () => {
  try {
    console.log('🌀 Seeding historical typhoon data from PAGASA...');
    const response = await axios.post(API_URL);
    
    console.log('\n✅ Success!');
    console.log(`   ${response.data.newCount} new typhoon records added`);
    console.log(`   ${response.data.skippedCount} duplicates skipped`);
    console.log('\n📊 Historical data is now available in the dashboard!');
    console.log('   Visit: http://localhost:3000/typhoons');
  } catch (error) {
    console.error('\n❌ Error seeding data:');
    console.error(`   ${error.response?.data?.message || error.message}`);
    process.exit(1);
  }
};

seedHistoricalData();
