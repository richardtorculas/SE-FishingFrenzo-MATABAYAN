/**
 * ============================================
 * DUPLICATE DETECTION UTILITY
 * ============================================
 * Purpose: Prevent duplicate alerts for same earthquake
 * ============================================
 */

const Alert = require('../models/Alert');

/**
 * Check if alert already sent for this earthquake to this user
 * @param {string} userId - User ID
 * @param {string} earthquakeId - Earthquake ID
 * @returns {Promise<boolean>} True if alert already sent
 */
const isDuplicateAlert = async (userId, earthquakeId) => {
  try {
    const existingAlert = await Alert.findOne({
      userId,
      earthquakeId
    });
    return !!existingAlert;
  } catch (error) {
    console.error('Error checking duplicate alert:', error);
    return false;
  }
};

/**
 * Check if alert was sent recently for same earthquake location
 * Prevents duplicate alerts within a time window
 * @param {string} userId - User ID
 * @param {number} epicenterLat - Earthquake epicenter latitude
 * @param {number} epicenterLon - Earthquake epicenter longitude
 * @param {number} timeWindowMinutes - Time window in minutes (default: 60)
 * @returns {Promise<boolean>} True if similar alert sent recently
 */
const isRecentDuplicateAlert = async (userId, epicenterLat, epicenterLon, timeWindowMinutes = 60) => {
  try {
    const timeThreshold = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    const recentAlert = await Alert.findOne({
      userId,
      epicenterLat: {
        $gte: epicenterLat - 0.5,
        $lte: epicenterLat + 0.5
      },
      epicenterLon: {
        $gte: epicenterLon - 0.5,
        $lte: epicenterLon + 0.5
      },
      sentAt: { $gte: timeThreshold }
    });
    
    return !!recentAlert;
  } catch (error) {
    console.error('Error checking recent duplicate alert:', error);
    return false;
  }
};

/**
 * Get alert history for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of alerts to retrieve (default: 50)
 * @returns {Promise<array>} Array of alerts
 */
const getUserAlertHistory = async (userId, limit = 50) => {
  try {
    const alerts = await Alert.find({ userId })
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean();
    return alerts;
  } catch (error) {
    console.error('Error retrieving alert history:', error);
    return [];
  }
};

/**
 * Get alert count for a user in last N hours
 * @param {string} userId - User ID
 * @param {number} hours - Number of hours to look back (default: 24)
 * @returns {Promise<number>} Count of alerts
 */
const getAlertCountInHours = async (userId, hours = 24) => {
  try {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const count = await Alert.countDocuments({
      userId,
      sentAt: { $gte: timeThreshold }
    });
    
    return count;
  } catch (error) {
    console.error('Error counting alerts:', error);
    return 0;
  }
};

module.exports = {
  isDuplicateAlert,
  isRecentDuplicateAlert,
  getUserAlertHistory,
  getAlertCountInHours
};
