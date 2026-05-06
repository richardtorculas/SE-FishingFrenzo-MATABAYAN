/**
 * ============================================
 * AUTHENTICATION CONTROLLER
 * ============================================
 * Purpose: Handles user registration, login, and authentication
 * Routes: /api/auth/*
 * Database: User model
 * ============================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate JWT token for authenticated user
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Create JWT token and send response with cookie
 * @param {Object} user - User document from database
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
  };

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

/**
 * ========================================
 * SIGNUP - Register new user
 * ========================================
 * POST /api/auth/signup
 * Body: { name, email, password, province, cityMunicipality, phoneNumber, preferences, notificationPreferences }
 */
exports.signup = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);
    
    const { 
      name, 
      email, 
      password, 
      province, 
      cityMunicipality, 
      phoneNumber,
      preferences,
      notificationPreferences 
    } = req.body;

    if (!name || !email || !password || !province || !cityMunicipality) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, email, password, province, and city/municipality are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already registered'
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      province,
      cityMunicipality,
      phoneNumber: phoneNumber || null,
      preferences: {
        language: preferences?.language || 'en',
        alertTypes: preferences?.alertTypes || {
          typhoon: true,
          earthquake: true,
          volcano: true,
          flood: true
        }
      },
      notificationPreferences: {
        smsEnabled: notificationPreferences?.smsEnabled || false,
        inAppEnabled: notificationPreferences?.inAppEnabled !== false
      }
    });

    console.log('User registered:', newUser.email);
    createSendToken(newUser, 201, res);
    
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * ========================================
 * LOGIN - Authenticate existing user
 * ========================================
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    console.log('User logged in:', user.email);
    createSendToken(user, 200, res);
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

/**
 * ========================================
 * LOGOUT - Clear authentication token
 * ========================================
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

/**
 * ========================================
 * GET ME - Get current user profile
 * ========================================
 * GET /api/auth/me
 * Protected route (requires authentication)
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Not authenticated'
    });
  }
};

/**
 * ========================================
 * UPDATE LOCATION - Update user location preferences
 * ========================================
 * PATCH /api/auth/location
 * Body: { province, cityMunicipality }
 */
exports.updateLocation = async (req, res) => {
  try {
    const { province, cityMunicipality } = req.body;

    if (!province || !cityMunicipality) {
      return res.status(400).json({
        status: 'fail',
        message: 'Province and city/municipality are required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { province, cityMunicipality },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
