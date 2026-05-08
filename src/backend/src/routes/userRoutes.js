const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      status: 'success',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
router.patch('/preferences', protect, async (req, res) => {
  try {
    const { province, cityMunicipality, alertTypes, notificationPreferences, phoneNumber } = req.body;

    const updateData = {};
    if (province) updateData['province'] = province;
    if (cityMunicipality) updateData['cityMunicipality'] = cityMunicipality;
    if (alertTypes) updateData['preferences.alertTypes'] = alertTypes;
    if (notificationPreferences) updateData['notificationPreferences'] = notificationPreferences;
    if (phoneNumber) updateData['phoneNumber'] = phoneNumber;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: 'Preferences updated',
      data: user
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
