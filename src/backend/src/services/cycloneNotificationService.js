const axios = require('axios');
const CycloneAlert = require('../models/CycloneAlert');
const User = require('../models/User');

const SMS_API_BASE = 'https://api.textbee.dev/api/v1/gateway/devices';
const SMS_API_KEY = process.env.SMS_API_KEY || 'your-api-key';
const DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || 'default-device';

// Format cyclone alert message with location
const formatCycloneAlertMessage = (alert) => {
  const triggerText = {
    'par_entry': 'entered PAR',
    'status_change': 'status changed',
    'approaching_24h': 'approaching'
  };

  return `🌀 MATABAYAN ALERT: Typhoon ${alert.cycloneName} (${alert.category}) has ${triggerText[alert.triggerReason] || 'updated'}. Location: ${alert.location}. Wind: ${alert.windKph} km/h. Stay safe!`;
};

// Send SMS notification via TextBee
const sendSMS = async (phoneNumber, message) => {
  try {
    const SMS_API_URL = `${SMS_API_BASE}/${DEVICE_ID}/send-sms`;
    
    const response = await axios.post(
      SMS_API_URL,
      {
        recipients: [phoneNumber],
        message: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SMS_API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log(`✓ SMS sent to ${phoneNumber}`);
    return {
      success: response.status === 200 || response.status === 201,
      status: response.data?.status || 'sent',
      messageId: response.data?.id || response.data?.messageId,
    };
  } catch (error) {
    console.error(`✗ SMS send error to ${phoneNumber}:`, error.message);
    return {
      success: false,
      status: 'failed',
      error: error.message,
    };
  }
};

// Send in-app notification (mark alert as notificationSent)
const sendInAppNotification = async (alertId) => {
  try {
    const result = await CycloneAlert.findByIdAndUpdate(
      alertId,
      {
        notificationSent: true,
        notificationSentAt: new Date(),
      },
      { new: true }
    );
    return { success: true, alert: result };
  } catch (error) {
    console.error('In-app notification error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send notification: SMS + In-App (always)
const sendNotificationWithFallback = async (alert, user) => {
  const message = formatCycloneAlertMessage(alert);
  let smsSent = false;
  let smsDeliveryStatus = 'pending';

  // Send SMS if user has phone number
  if (user.phoneNumber) {
    const smsResult = await sendSMS(user.phoneNumber, message);
    if (smsResult.success) {
      smsSent = true;
      smsDeliveryStatus = smsResult.status;
    } else {
      smsDeliveryStatus = 'failed';
    }
  }

  // In-app notification is mandatory (alert always created for Alert History)
  const inAppResult = await sendInAppNotification(alert._id);

  // Update alert with notification status
  await CycloneAlert.findByIdAndUpdate(alert._id, {
    notificationSent: inAppResult.success,
    smsSent,
    smsDeliveryStatus,
    notificationSentAt: inAppResult.success ? new Date() : null,
  });

  return {
    alertId: alert._id,
    notificationSent: inAppResult.success,
    smsSent,
    smsDeliveryStatus,
  };
};

// Process all pending cyclone alerts and send notifications
const processAlertNotifications = async () => {
  try {
    // Get all alerts that haven't been notified yet
    const pendingAlerts = await CycloneAlert.find({
      notificationSent: false,
    }).populate('userId', 'phoneNumber notificationPreferences');

    if (pendingAlerts.length === 0) {
      return { processed: 0, successful: 0, failed: 0 };
    }

    console.log(`\nProcessing ${pendingAlerts.length} pending alert(s)...`);

    let successful = 0;
    let failed = 0;

    for (const alert of pendingAlerts) {
      try {
        if (!alert.userId) {
          console.log(`⚠️  Alert ${alert._id}: User not found`);
          failed++;
          continue;
        }

        const result = await sendNotificationWithFallback(alert, alert.userId);
        if (result.notificationSent) {
          console.log(`✓ Alert notification sent for ${alert.cycloneName}`);
          successful++;
        } else {
          console.log(`✗ Alert notification failed for ${alert.cycloneName}`);
          failed++;
        }
      } catch (error) {
        console.error(`Error processing alert ${alert._id}:`, error.message);
        failed++;
      }
    }

    return {
      processed: pendingAlerts.length,
      successful,
      failed,
    };
  } catch (error) {
    console.error('Error in processAlertNotifications:', error);
    throw error;
  }
};

module.exports = {
  sendSMS,
  sendInAppNotification,
  sendNotificationWithFallback,
  processAlertNotifications,
  formatCycloneAlertMessage,
};
