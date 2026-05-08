/**
 * Cleanup script to migrate users to clean schema
 * Moves province/cityMunicipality from preferences to top-level
 */

require('dotenv').config({ path: './src/backend/.env' });
const { MongoClient } = require('mongodb');

async function cleanupUsers() {
  const client = new MongoClient(process.env.MONGODB_URI, { 
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected!\n');

    const db = client.db('matabayan');
    const usersCollection = db.collection('users');

    // Find all users
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users to migrate\n`);

    let migrated = 0;
    for (const user of users) {
      try {
        const updateData = {};
        let hasChanges = false;

        // Move province from preferences to top-level
        if (user.preferences?.province && !user.province) {
          updateData.province = user.preferences.province;
          hasChanges = true;
        }

        // Move cityMunicipality from preferences to top-level
        if (user.preferences?.cityMunicipality && !user.cityMunicipality) {
          updateData.cityMunicipality = user.preferences.cityMunicipality;
          hasChanges = true;
        }

        // Clean preferences - remove location fields
        if (user.preferences?.province || user.preferences?.cityMunicipality) {
          updateData['preferences'] = {
            language: user.preferences.language || 'en',
            alertTypes: user.preferences.alertTypes || {
              typhoon: true,
              earthquake: true,
              volcano: true,
              flood: true
            }
          };
          hasChanges = true;
        }

        if (hasChanges) {
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: updateData }
          );
          console.log(`✓ Migrated user ${user._id}`);
          migrated++;
        }
      } catch (error) {
        console.error(`✗ Error migrating user ${user._id}:`, error.message);
      }
    }

    console.log(`\nMigration complete: ${migrated}/${users.length} users updated`);
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupUsers();
