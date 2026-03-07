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
    { id },                                    // Payload: user ID
    process.env.JWT_SECRET,                    // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }  // Token expires in 7 days
  );
};

/**
 * Create JWT token and send response with cookie
 * @param {Object} user - User document from database
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 */
const createSendToken = (user, statusCode, res) => {
  // Generate JWT token
  const token = signToken(user._id);
  
  // Cookie configuration
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,                          // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict'                       // CSRF protection
  };

  // Send token as HTTP-only cookie
  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // Send success response
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
 * Body: { name, email, password, preferences }
 */
exports.signup = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email);
    
    const { name, email, password, preferences } = req.body;

    // Validate required fields
    if (!name || !email || !password || !preferences) {
      return res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already registered'
      });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const newUser = await User.create({
      name,
      email,
      password,
      preferences
    });

    console.log('✅ User registered:', newUser.email);
    
    // Send token and user data
    createSendToken(newUser, 201, res);
    
  } catch (error) {
    console.error('❌ Registration error:', error.message);
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');

    // Verify user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    console.log('✅ User logged in:', user.email);
    
    // Send token and user data
    createSendToken(user, 200, res);
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
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
  // Overwrite JWT cookie with dummy value
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
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
    // req.user is set by protect middleware
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
