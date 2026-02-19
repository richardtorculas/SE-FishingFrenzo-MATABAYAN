/**
 * ============================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================
 * Purpose: Protect routes by verifying JWT tokens
 * Used by: Protected routes (e.g., /api/auth/me)
 * ============================================
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware - Verify user authentication
 * Checks for valid JWT token in cookies or Authorization header
 * Attaches user object to request if authenticated
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies (primary method)
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } 
    // Check for token in Authorization header (fallback)
    else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found - user not authenticated
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to access this resource.'
      });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists in database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists'
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    
    // Continue to next middleware/route handler
    next();
    
  } catch (error) {
    // Token verification failed (invalid or expired)
    res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};
