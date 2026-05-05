/**
 * Direct MongoDB query to check user fields
 */

require('dotenv').config({ path: './src/backend/.env' });
const { MongoClient } = require('mongodb');

async function debugUsers() {
  const client = new MongoClient(process.env.MONGODB_URI, { 
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  });

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected!\n');

    const db = client.db('matabayan');
    const users = await db.collection('users').find({}).limit(3).toArray();

    console.log(`Found ${users.length} users:\n`);

    for (const user of users) {
      console.log(`\n=== User ${user._id} ===`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Province: ${user.province}`);
      console.log(`CityMunicipality: ${user.cityMunicipality}`);
      console.log(`Preferences:`, JSON.stringify(user.preferences, null, 2));
      console.log(`All fields:`, Object.keys(user).join(', '));
    }

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugUsers();
