const User = require('../models/User');
const EarthquakeAlert = require('../models/EarthquakeAlert');
const { isUserWithinAlertRadius, getAlertRadius } = require('./distanceCalculator');

// Determine severity level based on magnitude
const getSeverity = (magnitude) => {
  if (magnitude >= 7.0) return 'critical';
  if (magnitude >= 6.0) return 'high';
  if (magnitude >= 5.0) return 'medium';
  if (magnitude >= 4.0) return 'low';
  return 'info';
};

// Process earthquake and create alerts for eligible users
const triggerEarthquakeAlerts = async (earthquake) => {
  try {
    // Use phivolcsId as the unique identifier (not MongoDB _id which changes on reload)
    const earthquakeId = earthquake.metadata?.phivolcsId || earthquake._id.toString();
    const magnitude = earthquake.metadata?.magnitude;
    const depth = earthquake.metadata?.depth;
    const latitude = earthquake.metadata?.latitude;
    const longitude = earthquake.metadata?.longitude;
    const location = earthquake.location;

    if (!magnitude || !depth || !latitude || !longitude) {
      console.log(`Skipping earthquake: missing required metadata`);
      return { created: 0, skipped: 0 };
    }

    // Get all users with earthquake alerts enabled
    const users = await User.find({
      'preferences.alertTypes.earthquake': true,
    });

    console.log(`\n=== EARTHQUAKE ALERT TRIGGER ===`);
    console.log(`Processing earthquake ${earthquakeId}: ${location}`);
    console.log(`Magnitude: ${magnitude}, Depth: ${depth}km`);
    console.log(`Epicenter: ${latitude}, ${longitude}`);
    console.log(`Found ${users.length} users with earthquake alerts enabled`);
    
    // Debug: Log first few users
    if (users.length > 0) {
      console.log(`\nFirst user details:`);
      console.log(`  ID: ${users[0]._id}`);
      console.log(`  Province: ${users[0].preferences?.province}`);
      console.log(`  Alert Types: ${JSON.stringify(users[0].preferences?.alertTypes)}`);
      console.log(`  Notification Prefs: ${JSON.stringify(users[0].notificationPreferences)}`);
    }

    if (users.length === 0) return { created: 0, skipped: 0 };

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Check if user has province set
        if (!user.province) {
          console.log(`Skipping user ${user._id}: no province set`);
          skipped++;
          continue;
        }

        // Check if alert already exists for this earthquake and user
        const existingAlert = await EarthquakeAlert.findOne({
          earthquakeId,
          userId: user._id,
        });

        if (existingAlert) {
          skipped++;
          continue;
        }

        // Check if user is within alert radius
        if (!isUserWithinAlertRadius(user.province, latitude, longitude, magnitude)) {
          console.log(`User ${user._id} (${user.province}) outside alert radius`);
          skipped++;
          continue;
        }

        // Calculate distance for record
        const { calculateHaversineDistance } = require('./distanceCalculator');
        const { getUserCoordinates } = require('./distanceCalculator');
        const userCoords = getUserCoordinates(user.province);
        const distance = calculateHaversineDistance(
          userCoords.lat,
          userCoords.lng,
          latitude,
          longitude
        );

        // Create alert
        const alert = new EarthquakeAlert({
          earthquakeId,
          userId: user._id,
          magnitude,
          depth,
          location,
          severity: getSeverity(magnitude),
          distance: Math.round(distance * 10) / 10,
          userProvince: user.province,
          notificationSent: false,
          smsSent: false,
          smsDeliveryStatus: 'pending',
        });

        await alert.save();
        console.log(`✓ Alert created for user ${user._id} (${user.province}): ${distance.toFixed(1)}km away`);
        created++;
      } catch (error) {
        console.error(`Error creating alert for user ${user._id}:`, error.message);
      }
    }

    console.log(`Earthquake ${earthquakeId} processing complete: ${created} created, ${skipped} skipped`);
    return { created, skipped };
  } catch (error) {
    console.error('Error in triggerEarthquakeAlerts:', error);
    throw error;
  }
};

module.exports = {
  triggerEarthquakeAlerts,
  getSeverity,
};
