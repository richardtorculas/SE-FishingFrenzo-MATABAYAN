/**
 * ============================================
 * EARTHQUAKE ALERT SERVICE
 * ============================================
 * Purpose: Process earthquakes and determine which users should be alerted
 * ============================================
 */

const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const { calculateDistance } = require('./distanceCalculator');
const { getProvinceCoordinates } = require('./proximityThresholds');
const { shouldTriggerAlert } = require('./alertFilters');
const { isDuplicateAlert } = require('./duplicateDetection');

/**
 * Process earthquake and get list of users to alert
 * @param {object} earthquake - Earthquake data from PHIVOLCS
 * @returns {Promise<array>} Array of users to alert with alert details
 */
const processEarthquakeAlerts = async (earthquake) => {
  try {
    // Validate earthquake data
    if (!earthquake.metadata?.latitude || !earthquake.metadata?.longitude || !earthquake.metadata?.magnitude) {
      console.error('Invalid earthquake data:', earthquake);
      return [];
    }

    const epicenterLat = earthquake.metadata.latitude;
    const epicenterLon = earthquake.metadata.longitude;
    const magnitude = earthquake.metadata.magnitude;
    const depth = earthquake.metadata.depth || 0;
    const location = earthquake.location;

    // Get all users with earthquake alerts enabled
    const users = await User.find({
      'preferences.alertTypes.earthquake': true
    }).lean();

    if (users.length === 0) {
      console.log('No users with earthquake alerts enabled');
      return [];
    }

    const usersToAlert = [];

    // Process each user
    for (const user of users) {
      try {
        // Get user's location coordinates
        const userProvince = user.preferences?.province;
        if (!userProvince) {
          console.warn(`User ${user._id} has no province set`);
          continue;
        }

        const userCoordinates = getProvinceCoordinates(userProvince);
        if (!userCoordinates) {
          console.warn(`No coordinates found for province: ${userProvince}`);
          continue;
        }

        // Calculate distance from epicenter to user location
        const distance = calculateDistance(
          epicenterLat,
          epicenterLon,
          userCoordinates.lat,
          userCoordinates.lon
        );

        // Check if earthquake meets alert criteria
        const alertDecision = shouldTriggerAlert(magnitude, distance);
        if (!alertDecision.shouldAlert) {
          continue;
        }

        // Check for duplicate alerts
        const isDuplicate = await isDuplicateAlert(user._id, earthquake._id);
        if (isDuplicate) {
          console.log(`Duplicate alert detected for user ${user._id} and earthquake ${earthquake._id}`);
          continue;
        }

        // Get user notification preferences
        const userPrefs = user.notificationPreferences || {
          smsEnabled: false,
          emailEnabled: true,
          inAppEnabled: true
        };

        // Add to alert list
        usersToAlert.push({
          userId: user._id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          name: user.name,
          province: userProvince,
          distance,
          magnitude,
          depth,
          location,
          epicenterLat,
          epicenterLon,
          severity: alertDecision.severity,
          reason: alertDecision.reason,
          notificationPreferences: userPrefs,
          earthquakeId: earthquake._id
        });

      } catch (error) {
        console.error(`Error processing user ${user._id}:`, error);
        continue;
      }
    }

    console.log(`Earthquake Alert Service: ${usersToAlert.length} users to alert for earthquake at ${location}`);
    return usersToAlert;

  } catch (error) {
    console.error('Error in processEarthquakeAlerts:', error);
    return [];
  }
};

/**
 * Get earthquake details formatted for alerts
 * @param {object} earthquake - Earthquake data
 * @returns {object} Formatted earthquake details
 */
const formatEarthquakeDetails = (earthquake) => {
  return {
    earthquakeId: earthquake._id,
    magnitude: earthquake.metadata?.magnitude || 0,
    depth: earthquake.metadata?.depth || 0,
    latitude: earthquake.metadata?.latitude,
    longitude: earthquake.metadata?.longitude,
    location: earthquake.location,
    timestamp: earthquake.timestamp,
    source: earthquake.source,
    tsunami: earthquake.metadata?.tsunami || false
  };
};

/**
 * Check if earthquake is significant enough to process
 * @param {object} earthquake - Earthquake data
 * @returns {boolean} True if earthquake should be processed
 */
const isSignificantEarthquake = (earthquake) => {
  const magnitude = earthquake.metadata?.magnitude || 0;
  const minMagnitude = 3.0; // Minimum magnitude to process
  
  return magnitude >= minMagnitude;
};

module.exports = {
  processEarthquakeAlerts,
  formatEarthquakeDetails,
  isSignificantEarthquake
};
