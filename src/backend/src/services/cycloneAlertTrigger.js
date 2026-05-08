const User = require('../models/User');
const Typhoon = require('../models/Typhoon');
const CycloneAlert = require('../models/CycloneAlert');

// Determine severity level based on wind speed
const getSeverity = (windKph) => {
  if (windKph >= 150) return 'critical';
  if (windKph >= 118) return 'high';
  if (windKph >= 62) return 'medium';
  return 'low';
};

// Check if cyclone is approaching within 24 hours
const isApproaching24h = (cyclone) => {
  if (!cyclone.movementSpeedKph || !cyclone.latitude || !cyclone.longitude) {
    return false;
  }

  // If moving at >0 speed, consider it approaching
  return cyclone.movementSpeedKph > 0;
};

// Get previous cyclone state to detect changes
const getPreviousCycloneState = async (cycloneName) => {
  const previous = await Typhoon.findOne({ name: cycloneName })
    .sort({ timestamp: -1 })
    .skip(1); // Skip the current one

  return previous;
};

// Determine trigger reason for the alert
const determineTriggerReason = async (cyclone, previousCyclone) => {
  const reasons = [];

  // Check if entering PAR (new cyclone)
  if (!previousCyclone) {
    reasons.push('par_entry');
  }

  // Check if status changed
  if (previousCyclone && previousCyclone.category !== cyclone.category) {
    reasons.push('status_change');
  }

  // Check if approaching within 24 hours
  if (isApproaching24h(cyclone)) {
    reasons.push('approaching_24h');
  }

  return reasons.length > 0 ? reasons[0] : null;
};

// Process cyclone and create alerts for eligible users
const triggerCycloneAlerts = async (cyclone) => {
  try {
    const cycloneId = cyclone._id.toString();
    const cycloneName = cyclone.name;
    const windKph = cyclone.windKph;
    const location = cyclone.location;
    const cycloneTimestamp = cyclone.timestamp;

    // Get previous cyclone state to detect changes
    const previousCyclone = await getPreviousCycloneState(cycloneName);

    // Determine trigger reason
    const triggerReason = await determineTriggerReason(cyclone, previousCyclone);

    if (!triggerReason) {
      console.log(`Cyclone ${cycloneName}: no alert trigger reason found`);
      return { created: 0, skipped: 0 };
    }

    // Get all users with cyclone alerts enabled
    const users = await User.find({
      'preferences.alertTypes.typhoon': true,
      'notificationPreferences.smsEnabled': true
    });

    console.log(`\n=== Processing cyclone ${cycloneName}: ${location} ===`);
    console.log(`Trigger reason: ${triggerReason}`);
    console.log(`Found ${users.length} users with cyclone alerts enabled`);

    if (users.length === 0) return { created: 0, skipped: 0 };

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        if (!user.phoneNumber) {
          console.log(`  ✗ User ${user._id}: no phone number`);
          skipped++;
          continue;
        }

        // Check if alert already exists for this cyclone and user
        const existingAlert = await CycloneAlert.findOne({
          cycloneId,
          userId: user._id,
        });

        if (existingAlert) {
          skipped++;
          continue;
        }

        // Create alert
        const alert = new CycloneAlert({
          cycloneId,
          userId: user._id,
          cycloneName,
          category: cyclone.category,
          severity: getSeverity(windKph),
          windKph,
          location,
          cycloneTimestamp,
          userProvince: user.province || 'Philippines',
          triggerReason,
          notificationSent: false,
          smsSent: false,
          smsDeliveryStatus: 'pending',
        });

        await alert.save();
        console.log(`  ✓ Alert created for ${user._id}`);
        created++;
      } catch (error) {
        console.error(`  ✗ Error for user ${user._id}:`, error.message);
      }
    }

    console.log(`Result: ${created} created, ${skipped} skipped\n`);
    return { created, skipped };
  } catch (error) {
    console.error('Error in triggerCycloneAlerts:', error);
    throw error;
  }
};

module.exports = {
  triggerCycloneAlerts,
  getSeverity,
  determineTriggerReason,
};
