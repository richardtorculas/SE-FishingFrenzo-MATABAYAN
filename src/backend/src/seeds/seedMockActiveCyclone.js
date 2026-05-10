/**
 * ============================================
 * MOCK ACTIVE CYCLONE SEEDER
 * ============================================
 * Purpose: Create mock active cyclone data for testing
 * Usage: node src/seeds/seedMockActiveCyclone.js
 * Tests: Dashboard display, alert triggers, SMS generation
 * ============================================
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Typhoon = require('../models/Typhoon');
const CycloneAlert = require('../models/CycloneAlert');
const { triggerCycloneAlerts } = require('../services/cycloneAlertTrigger');
const { processAlertNotifications } = require('../services/cycloneNotificationService');

// Mock cyclone data - Active (not historical) with detailed information
const mockActiveCyclones = [
  {
    name: 'TOTO',
    category: 'Typhoon',
    severity: 'High',
    signal: 3,
    location: 'Pacific Ocean, East of Philippines',
    province: 'Philippines',
    latitude: 18.5,
    longitude: 135.0,
    windKph: 130,
    movementDirection: 'UNKNOWN',
    movementSpeedKph: 0,
    trajectory: [
      {
        latitude: 19.2,
        longitude: 136.5,
        timestamp: new Date(Date.now() - 14400000),
        windKph: 115
      },
      {
        latitude: 18.9,
        longitude: 135.8,
        timestamp: new Date(Date.now() - 10800000),
        windKph: 120
      },
      {
        latitude: 18.7,
        longitude: 135.4,
        timestamp: new Date(Date.now() - 7200000),
        windKph: 125
      },
      {
        latitude: 18.6,
        longitude: 135.2,
        timestamp: new Date(Date.now() - 3600000),
        windKph: 128
      },
      {
        latitude: 18.5,
        longitude: 135.0,
        timestamp: new Date(),
        windKph: 130
      }
    ],
    description: 'Typhoon TOTO — Max sustained winds 130 km/h with gusts up to 160 km/h. Just entered the Philippine Area of Responsibility. Currently over the Pacific Ocean east of the Philippines. Expected to move toward Central Luzon in the coming days. PAGASA Signal No. 3 raised over Central Luzon.',
    source: 'PAGASA',
    affectedArea: 'Central Luzon, CALABARZON, Mimaropa',
    isHistorical: false,
    timestamp: new Date(),
    parEntryDate: new Date().toISOString().split('T')[0],
    parExitDate: null
  }
];

const seedMockActiveCyclone = async () => {
  try {
    // Connect to MongoDB using .env MONGODB_URI
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI not found in .env file');
      console.error('Make sure .env file exists in src/backend directory');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB\n');

    // Clear existing active cyclones (keep historical)
    const deletedCount = await Typhoon.deleteMany({ isHistorical: false });
    console.log(`✓ Cleared ${deletedCount.deletedCount} existing active cyclone(s)\n`);

    // Clear related alerts
    await CycloneAlert.deleteMany({});
    console.log('✓ Cleared existing cyclone alerts\n');

    console.log('='.repeat(60));
    console.log('📊 SEEDING MOCK ACTIVE CYCLONE FOR TESTING');
    console.log('='.repeat(60) + '\n');

    let totalAlertsCreated = 0;
    let totalNotificationsSent = 0;

    // Insert mock cyclone
    for (const mockData of mockActiveCyclones) {
      try {
        // Build storm key
        const hour = new Date();
        hour.setMinutes(0, 0, 0);
        const latR = parseFloat(mockData.latitude.toFixed(1));
        const lonR = parseFloat(mockData.longitude.toFixed(1));
        const stormKey = `${mockData.name.toUpperCase()}-${latR}-${lonR}-${hour.getTime()}`;

        const cycloneData = {
          ...mockData,
          stormKey
        };

        // Create cyclone
        const cyclone = await Typhoon.create(cycloneData);
        console.log(`\n✅ Created cyclone: ${cyclone.name}`);
        console.log(`   Category: ${cyclone.category}`);
        console.log(`   Wind Speed: ${cyclone.windKph} km/h`);
        console.log(`   Current Location: ${cyclone.location}`);
        console.log(`   Coordinates: ${cyclone.latitude}°N, ${cyclone.longitude}°E`);
        console.log(`   Signal: ${cyclone.signal}`);
        console.log(`   Trajectory Points: ${cyclone.trajectory.length}`);
        console.log(`   Expected Affected Area: ${cyclone.affectedArea}`);
        console.log(`   Movement Speed: ${cyclone.movementSpeedKph} km/h (STATIONARY)`);

        // Trigger alerts
        const alertStats = await triggerCycloneAlerts(cyclone);
        console.log(`   Alerts Created: ${alertStats.created}`);
        console.log(`   Alerts Skipped: ${alertStats.skipped}`);
        totalAlertsCreated += alertStats.created;

      } catch (err) {
        console.error(`❌ Error creating cyclone:`, err.message);
      }
    }

    // Process all pending notifications (SMS)
    console.log('\n' + '='.repeat(60));
    console.log('📱 PROCESSING NOTIFICATIONS (SMS)');
    console.log('='.repeat(60) + '\n');

    const notificationStats = await processAlertNotifications();
    console.log(`✅ Notifications Processed: ${notificationStats.processed}`);
    console.log(`   Successful: ${notificationStats.successful}`);
    console.log(`   Failed: ${notificationStats.failed}`);
    totalNotificationsSent = notificationStats.successful;

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ MOCK CYCLONE SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nSummary:`);
    console.log(`  • Cyclones Created: ${mockActiveCyclones.length}`);
    console.log(`  • Alerts Triggered: ${totalAlertsCreated}`);
    console.log(`  • SMS Notifications Sent: ${totalNotificationsSent}`);
    console.log(`\nAlert Trigger Condition:`);
    console.log(`  ✅ PAR Entry - TOTO just entered PAR`);
    console.log(`  Current Location: Pacific Ocean, East of Philippines`);
    console.log(`  SMS Message: "🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!"`);
    console.log(`\nYou can now:`);
    console.log(`  1. View cyclone on Typhoon Dashboard`);
    console.log(`  2. Check Overview tab for active cyclone`);
    console.log(`  3. View Charts tab for wind speed`);
    console.log(`  4. Check Map tab for cyclone location`);
    console.log(`  5. Verify SMS message was sent to users`);
    console.log(`  6. Check Alert History for created alert\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedMockActiveCyclone();
