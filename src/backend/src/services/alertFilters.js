/**
 * ============================================
 * ALERT FILTERS UTILITY
 * ============================================
 * Purpose: Determine if earthquake meets alert criteria
 * ============================================
 */

const { getProximityZone } = require('./proximityThresholds');

/**
 * Alert criteria rules
 */
const ALERT_RULES = {
  // Magnitude-based rules
  CRITICAL: {
    minMagnitude: 6.0,
    maxDistance: Infinity, // Alert regardless of distance
    description: 'Critical earthquake (M6.0+)'
  },
  HIGH: {
    minMagnitude: 5.0,
    maxDistance: 300,
    description: 'High magnitude earthquake (M5.0-5.9) within 300km'
  },
  MEDIUM: {
    minMagnitude: 4.0,
    maxDistance: 200,
    description: 'Medium magnitude earthquake (M4.0-4.9) within 200km'
  },
  LOW: {
    minMagnitude: 3.0,
    maxDistance: 100,
    description: 'Low magnitude earthquake (M3.0-3.9) within 100km'
  }
};

/**
 * Determine if earthquake should trigger an alert
 * @param {number} magnitude - Earthquake magnitude
 * @param {number} distance - Distance from user in kilometers
 * @returns {object} Alert decision {shouldAlert: boolean, reason: string, severity: string}
 */
const shouldTriggerAlert = (magnitude, distance) => {
  // Check CRITICAL rule first (highest priority)
  if (magnitude >= ALERT_RULES.CRITICAL.minMagnitude) {
    return {
      shouldAlert: true,
      reason: ALERT_RULES.CRITICAL.description,
      severity: 'critical',
      rule: 'CRITICAL'
    };
  }

  // Check HIGH rule
  if (magnitude >= ALERT_RULES.HIGH.minMagnitude && distance <= ALERT_RULES.HIGH.maxDistance) {
    return {
      shouldAlert: true,
      reason: ALERT_RULES.HIGH.description,
      severity: 'high',
      rule: 'HIGH'
    };
  }

  // Check MEDIUM rule
  if (magnitude >= ALERT_RULES.MEDIUM.minMagnitude && distance <= ALERT_RULES.MEDIUM.maxDistance) {
    return {
      shouldAlert: true,
      reason: ALERT_RULES.MEDIUM.description,
      severity: 'medium',
      rule: 'MEDIUM'
    };
  }

  // Check LOW rule
  if (magnitude >= ALERT_RULES.LOW.minMagnitude && distance <= ALERT_RULES.LOW.maxDistance) {
    return {
      shouldAlert: true,
      reason: ALERT_RULES.LOW.description,
      severity: 'low',
      rule: 'LOW'
    };
  }

  // No alert triggered
  return {
    shouldAlert: false,
    reason: `Earthquake does not meet alert criteria (M${magnitude} at ${distance}km)`,
    severity: 'none',
    rule: 'NONE'
  };
};

/**
 * Get alert severity based on magnitude and distance
 * @param {number} magnitude - Earthquake magnitude
 * @param {number} distance - Distance from user in kilometers
 * @returns {string} Severity level: 'critical', 'high', 'medium', 'low', 'none'
 */
const getAlertSeverity = (magnitude, distance) => {
  const decision = shouldTriggerAlert(magnitude, distance);
  return decision.severity;
};

/**
 * Check if earthquake meets minimum criteria for any alert
 * @param {number} magnitude - Earthquake magnitude
 * @param {number} distance - Distance from user in kilometers
 * @returns {boolean} True if earthquake meets minimum criteria
 */
const meetsMinimumCriteria = (magnitude, distance) => {
  return magnitude >= ALERT_RULES.LOW.minMagnitude && distance <= ALERT_RULES.LOW.maxDistance;
};

module.exports = {
  ALERT_RULES,
  shouldTriggerAlert,
  getAlertSeverity,
  meetsMinimumCriteria
};
