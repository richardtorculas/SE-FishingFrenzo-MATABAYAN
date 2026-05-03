/**
 * ============================================
 * NOTIFICATION SERVICE (ORCHESTRATOR)
 * ============================================
 * Purpose: Coordinate SMS and In-app notifications with email fallback
 * ============================================
 */

const { sendEarthquakeAlertSMS } = require('./smsService');
const { sendEarthquakeAlertEmail } = require('./emailService');

/**
 * Send notifications to user based on preferences
 * SMS is primary, Email is fallback if SMS fails, In-app is always sent
 * @param {object} userAlert - User alert data with contact info and preferences
 * @returns {Promise<object>} Notification results
 */
const sendNotifications = async (userAlert) => {
  try {
    const {
      userId,
      email,
      phoneNumber,
      notificationPreferences,
      name,
      province,
      magnitude,
      depth,
      location,
      distance,
      epicenterLat,
      epicenterLon
    } = userAlert;

    const results = {
      userId,
      sms: { sent: false, success: false },
      email: { sent: false, success: false, isfallback: false },
      inApp: { sent: true, success: true } // In-app is always created (stored in Alert model)
    };

    // Prepare alert data for notifications
    const alertData = {
      magnitude,
      depth,
      location,
      distance,
      epicenterLat,
      epicenterLon,
      userProvince: province
    };

    // PRIMARY: Send SMS if enabled
    if (notificationPreferences.smsEnabled && phoneNumber) {
      results.sms.sent = true;
      const smsResult = await sendEarthquakeAlertSMS(phoneNumber, alertData);
      results.sms.success = smsResult.success;
      results.sms.messageId = smsResult.messageId;
      results.sms.error = smsResult.error;

      // If SMS fails, use email as FALLBACK
      if (!smsResult.success && email) {
        console.log(`SMS failed for user ${userId}, sending email as fallback...`);
        results.email.sent = true;
        results.email.isfallback = true;
        const emailResult = await sendEarthquakeAlertEmail(email, alertData);
        results.email.success = emailResult.success;
        results.email.messageId = emailResult.messageId;
        results.email.error = emailResult.error;
      }
    } else if (email) {
      // If SMS not enabled but email enabled, send email as fallback
      console.log(`SMS not enabled for user ${userId}, sending email as fallback...`);
      results.email.sent = true;
      results.email.isfallback = true;
      const emailResult = await sendEarthquakeAlertEmail(email, alertData);
      results.email.success = emailResult.success;
      results.email.messageId = emailResult.messageId;
      results.email.error = emailResult.error;
    }

    console.log(`Notifications sent for user ${userId}:`, results);
    return results;

  } catch (error) {
    console.error('Error in sendNotifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send bulk notifications for multiple users
 * @param {array} usersToAlert - Array of user alert objects
 * @returns {Promise<object>} Bulk notification results
 */
const sendBulkNotifications = async (usersToAlert) => {
  try {
    const results = {
      total: usersToAlert.length,
      successful: 0,
      failed: 0,
      details: []
    };

    for (const userAlert of usersToAlert) {
      try {
        const notificationResult = await sendNotifications(userAlert);
        
        // Successful if SMS sent successfully OR email sent as fallback
        const isSuccessful = 
          notificationResult.sms.success || 
          (notificationResult.email.isfallback && notificationResult.email.success);

        if (isSuccessful) {
          results.successful++;
        } else {
          results.failed++;
        }

        results.details.push({
          userId: userAlert.userId,
          ...notificationResult
        });

      } catch (error) {
        results.failed++;
        results.details.push({
          userId: userAlert.userId,
          error: error.message
        });
      }
    }

    console.log(`Bulk notifications completed: ${results.successful} successful, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('Error in sendBulkNotifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendNotifications,
  sendBulkNotifications
};
