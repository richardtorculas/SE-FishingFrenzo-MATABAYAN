/**
 * Seed script: Realistic PHIVOLCS-style earthquake data
 * Run: node scripts/seedEarthquakes.js
 */

require('dotenv').config({ path: '../src/backend/.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/matabayan';

const calculateThreatLevel = (magnitude, depth) => {
  const isShallow = depth < 70;
  if (magnitude >= 7.0) return { level: 'Critical', severity: 5 };
  if (magnitude >= 6.0) return { level: 'High', severity: 4 };
  if (magnitude >= 5.0) return { level: 'Moderate', severity: 3 };
  if (magnitude >= 4.0) return { level: 'Low', severity: 2 };
  return { level: 'Minor', severity: 1 };
};

const rawData = [
  { magnitude: 6.7, depth: 10, location: '05 km S 10° W of Cataingan, Masbate', province: 'Masbate', lat: 11.97, lon: 123.82, hoursAgo: 1 },
  { magnitude: 5.4, depth: 33, location: '12 km SE of Mabini, Batangas', province: 'Batangas', lat: 13.65, lon: 120.95, hoursAgo: 3 },
  { magnitude: 4.8, depth: 55, location: '08 km NE of Calatagan, Batangas', province: 'Batangas', lat: 13.88, lon: 120.72, hoursAgo: 5 },
  { magnitude: 7.2, depth: 15, location: '30 km NW of Davao City, Davao del Sur', province: 'Davao del Sur', lat: 7.21, lon: 125.35, hoursAgo: 8 },
  { magnitude: 3.9, depth: 20, location: '04 km NW of Tagaytay City, Cavite', province: 'Cavite', lat: 14.12, lon: 120.93, hoursAgo: 10 },
  { magnitude: 5.1, depth: 90, location: '22 km SE of Surigao City, Surigao del Norte', province: 'Surigao del Norte', lat: 9.65, lon: 125.65, hoursAgo: 14 },
  { magnitude: 6.1, depth: 25, location: '15 km NE of Legazpi City, Albay', province: 'Albay', lat: 13.22, lon: 123.85, hoursAgo: 20 },
  { magnitude: 4.2, depth: 40, location: '10 km SW of Baguio City, Benguet', province: 'Benguet', lat: 16.35, lon: 120.52, hoursAgo: 26 },
  { magnitude: 5.8, depth: 60, location: '18 km W of Cebu City, Cebu', province: 'Cebu', lat: 10.32, lon: 123.72, hoursAgo: 30 },
  { magnitude: 3.5, depth: 12, location: '06 km NE of Taal Volcano Island, Batangas', province: 'Batangas', lat: 14.01, lon: 120.99, hoursAgo: 36 },
];

const alerts = rawData.map(eq => {
  const threat = calculateThreatLevel(eq.magnitude, eq.depth);
  const descriptions = {
    Critical: 'Major earthquake - Severe damage expected. Tsunami warning may be issued.',
    High: 'Strong earthquake - Significant damage possible in affected areas.',
    Moderate: 'Moderate earthquake - Minor damage possible. Residents advised to stay alert.',
    Low: 'Light earthquake - Generally felt by people. Minimal damage expected.',
    Minor: 'Minor earthquake - Rarely felt. No damage expected.'
  };
  return {
    type: 'Earthquake',
    severity: threat.level,
    location: eq.location,
    province: eq.province,
    description: `Magnitude ${eq.magnitude} earthquake at depth of ${eq.depth}km. ${descriptions[threat.level]}`,
    source: 'PHIVOLCS',
    timestamp: new Date(Date.now() - eq.hoursAgo * 60 * 60 * 1000),
    metadata: {
      magnitude: eq.magnitude,
      depth: eq.depth,
      latitude: eq.lat,
      longitude: eq.lon,
      threatLevel: threat.level,
      threatSeverity: threat.severity
    }
  };
});

mongoose.connect(MONGO_URI).then(async () => {
  const Alert = require('../src/backend/src/models/Alert');
  await Alert.deleteMany({ type: 'Earthquake' });
  await Alert.insertMany(alerts);
  console.log(`✅ Seeded ${alerts.length} earthquake records`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
