const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

module.exports = router;
