/**
 * ============================================
 * AUTHENTICATION ROUTES
 * ============================================
 * Purpose: Define API endpoints for user authentication
 * Base URL: /api/auth
 * Controller: authController
 * ============================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ========== PUBLIC ROUTES (No authentication required) ==========

/**
 * POST /api/auth/signup
 * Register a new user account
 * Body: { name, email, password, preferences }
 */
router.post('/signup', authController.signup);

/**
 * POST /api/auth/login
 * Login with existing credentials
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Logout current user (clear JWT cookie)
 */
router.post('/logout', authController.logout);

// ========== PROTECTED ROUTES (Authentication required) ==========

/**
 * GET /api/auth/me
 * Get current user profile
 * Requires: Valid JWT token
 */
router.get('/me', protect, authController.getMe);

module.exports = router;
