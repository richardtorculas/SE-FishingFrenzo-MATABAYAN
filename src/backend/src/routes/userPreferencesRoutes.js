/**
 * ============================================
 * USER PREFERENCES ROUTES
 * ============================================
 * Endpoints for managing user notification preferences
 * ============================================
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const { protect } = require('../middleware/authMiddleware');

// ========== GET USER PREFERENCES ==========
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const preferences = await UserPreferences.findOne({ userId: req.user.id });

    res.json({
      status: 'success',
      data: {
        phoneNumber: user.phoneNumber,
        email: user.email,
        notificationPreferences: user.notificationPreferences,
        preferences: preferences || null
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ========== UPDATE USER PREFERENCES ==========
router.put('/preferences', protect, async (req, res) => {
  try {
    const { phoneNumber, notificationPreferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        phoneNumber,
        notificationPreferences
      },
      { new: true, runValidators: true }
    );

    // Update or create UserPreferences
    let userPrefs = await UserPreferences.findOne({ userId: req.user.id });
    if (!userPrefs) {
      userPrefs = new UserPreferences({
        userId: req.user.id,
        notificationChannels: notificationPreferences,
        location: {
          province: user.preferences.province,
          cityMunicipality: user.preferences.cityMunicipality
        }
      });
    } else {
      userPrefs.notificationChannels = notificationPreferences;
      userPrefs.location = {
        province: user.preferences.province,
        cityMunicipality: user.preferences.cityMunicipality
      };
      userPrefs.updatedAt = Date.now();
    }
    await userPrefs.save();

    res.json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        phoneNumber: user.phoneNumber,
        notificationPreferences: user.notificationPreferences
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
