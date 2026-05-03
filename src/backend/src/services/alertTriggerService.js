/**
 * ============================================
 * ALERT TRIGGER SERVICE
 * ============================================
 * Purpose: Create alerts and trigger notifications
 * ============================================
 */

const Alert = require('../models/Alert');
const { processEarthquakeAlerts, isSignificantEarthquake } = require('./earthquakeAlertService');

/**
 * Trigger alerts for an earthquake
 * @param {object} earthquake - Earthquake data from PHIVOLCS
 * @returns {Promise<object>} Result with count of alerts created
 */
const triggerEarthquakeAlerts = async (earthquake) => {
  try {
    // Check if earthquake is significant enough
    if (!isSignificantEarthquake(earthquake)) {
      console.log(`Earthquake magnitude ${earthquake.metadata?.magnitude} below threshold, skipping alerts`);
      return {
        success: true,
        alertsCreated: 0,
        reason: 'Earthquake below minimum magnitude threshold'
      };
    }

    // Get users to alert
    const usersToAlert = await processEarthquakeAlerts(earthquake);

    if (usersToAlert.length === 0) {
      console.log('No users to alert for this earthquake');
      return {
        success: true,
        alertsCreated: 0,
        reason: 'No users within alert range'
      };
    }

    // Create alert records for each user
    const alertsCreated = [];
    const alertsFailed = [];

    for (const userAlert of usersToAlert) {
      try {
        const alert = await Alert.create({
          userId: userAlert.userId,
          earthquakeId: userAlert.earthquakeId,
          magnitude: userAlert.magnitude,
          depth: userAlert.depth,
          location: userAlert.location,
          epicenterLat: userAlert.epicenterLat,
          epicenterLon: userAlert.epicenterLon,
          distance: userAlert.distance,
          channelsSent: {
            sms: userAlert.notificationPreferences.smsEnabled,
            email: userAlert.notificationPreferences.emailEnabled,
            inApp: userAlert.notificationPreferences.inAppEnabled
          },
          status: 'sent'
        });

        alertsCreated.push({
          userId: userAlert.userId,
          alertId: alert._id,
          severity: userAlert.severity
        });

        // TODO: Trigger actual notifications (SMS, Email, In-app)
        // This will be implemented in Batch 4
        console.log(`Alert created for user ${userAlert.userId}: ${alert._id}`);

      } catch (error) {
        console.error(`Failed to create alert for user ${userAlert.userId}:`, error);
        alertsFailed.push({
          userId: userAlert.userId,
          error: error.message
        });
      }
    }

    return {
      success: true,
      alertsCreated: alertsCreated.length,
      alertsFailed: alertsFailed.length,
      details: {
        created: alertsCreated,
        failed: alertsFailed
      }
    };

  } catch (error) {
    console.error('Error in triggerEarthquakeAlerts:', error);
    return {
      success: false,
      alertsCreated: 0,
      error: error.message
    };
  }
};

/**
 * Manually trigger alerts for testing
 * @param {string} earthquakeId - Earthquake ID to trigger alerts for
 * @returns {Promise<object>} Result of alert triggering
 */
const manuallyTriggerAlerts = async (earthquakeId) => {
  try {
    const Earthquake = require('../models/Earthquake');
    const earthquake = await Earthquake.findById(earthquakeId);

    if (!earthquake) {
      return {
        success: false,
        error: 'Earthquake not found'
      };
    }

    return await triggerEarthquakeAlerts(earthquake);

  } catch (error) {
    console.error('Error in manuallyTriggerAlerts:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  triggerEarthquakeAlerts,
  manuallyTriggerAlerts
};
