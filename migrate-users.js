/**
 * Migration script to move province and cityMunicipality from preferences to top-level
 * Run this once to update all existing users
 */

const mongoose = require('mongoose');
const User = require('./src/backend/src/models/User');

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/matabayan');
    console.log('Connected to MongoDB');

    // Find all users with province in preferences
    const usersToMigrate = await User.find({
      'preferences.province': { $exists: true, $ne: null }
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    let migrated = 0;
    for (const user of usersToMigrate) {
      try {
        user.province = user.preferences.province;
        user.cityMunicipality = user.preferences.cityMunicipality || null;
        
        // Remove old fields from preferences
        delete user.preferences.province;
        delete user.preferences.cityMunicipality;
        
        await user.save();
        migrated++;
        console.log(`✓ Migrated user ${user._id}: ${user.province}`);
      } catch (error) {
        console.error(`✗ Error migrating user ${user._id}:`, error.message);
      }
    }

    console.log(`\nMigration complete: ${migrated}/${usersToMigrate.length} users updated`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers();
