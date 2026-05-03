/**
 * ============================================
 * SMS SERVICE
 * ============================================
 * Purpose: Send SMS notifications for earthquake alerts via SMS API PH
 * ============================================
 */

const axios = require('axios');

const SMS_API_ENDPOINT = 'https://smsapiph.onrender.com/api/v1/send/sms';
const SMS_API_KEY = process.env.SMS_API_KEY;

/**
 * Format earthquake alert SMS message
 * @param {object} alertData - Alert data with earthquake details
 * @returns {string} SMS message content
 */
const formatEarthquakeSMS = (alertData) => {
  const {
    magnitude,
    location,
    distance,
    userProvince
  } = alertData;

  return `🌍 EARTHQUAKE ALERT: Magnitude ${magnitude} earthquake detected ${distance}km from ${userProvince}. Location: ${location}. Take cover immediately. Stay safe! - MataBayan`;
};

/**
 * Send earthquake alert SMS
 * @param {string} phoneNumber - Recipient phone number (format: +639XXXXXXXXX)
 * @param {object} alertData - Alert data with earthquake details
 * @returns {Promise<object>} SMS send result
 */
const sendEarthquakeAlertSMS = async (phoneNumber, alertData) => {
  try {
    // Validate phone number
    if (!phoneNumber || !/^\+63\d{9,10}$/.test(phoneNumber)) {
      console.warn(`Invalid phone number format: ${phoneNumber}`);
      return {
        success: false,
        phoneNumber,
        error: 'Invalid phone number format'
      };
    }

    // Validate API key
    if (!SMS_API_KEY) {
      console.error('SMS_API_KEY not configured in environment variables');
      return {
        success: false,
        phoneNumber,
        error: 'SMS API key not configured'
      };
    }

    const message = formatEarthquakeSMS(alertData);

    const response = await axios.post(
      SMS_API_ENDPOINT,
      {
        recipient: phoneNumber,
        message: message
      },
      {
        headers: {
          'x-api-key': SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log(`SMS sent to ${phoneNumber}:`, response.data);
    return {
      success: true,
      phoneNumber,
      messageId: response.data.messageId || response.data.id,
      response: response.data
    };

  } catch (error) {
    console.error(`Failed to send SMS to ${phoneNumber}:`, error.message);
    return {
      success: false,
      phoneNumber,
      error: error.message,
      status: error.response?.status
    };
  }
};

/**
 * Send test SMS
 * @param {string} phoneNumber - Test phone number
 * @returns {Promise<object>} Test result
 */
const sendTestSMS = async (phoneNumber) => {
  try {
    if (!phoneNumber || !/^\+63\d{9,10}$/.test(phoneNumber)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    if (!SMS_API_KEY) {
      return {
        success: false,
        error: 'SMS API key not configured'
      };
    }

    const response = await axios.post(
      SMS_API_ENDPOINT,
      {
        recipient: phoneNumber,
        message: 'Test SMS from MataBayan - Real-Time Disaster Alert System'
      },
      {
        headers: {
          'x-api-key': SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return {
      success: true,
      messageId: response.data.messageId || response.data.id,
      response: response.data
    };

  } catch (error) {
    console.error('Failed to send test SMS:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendEarthquakeAlertSMS,
  sendTestSMS
};
