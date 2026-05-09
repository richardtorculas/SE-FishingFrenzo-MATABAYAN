/**
 * ============================================
 * MATABAYAN BACKEND SERVER
 * ============================================
 * Real-Time Disaster Alert and Preparedness System
 * 
 * Purpose: Main entry point for Express.js backend
 * Architecture: MVC (Model-View-Controller)
 * Database: MongoDB (via Mongoose ODM)
 * 
 * Tech Stack:
 * - Node.js + Express.js (Backend framework)
 * - MongoDB (NoSQL database)
 * - JWT (Authentication)
 * - bcrypt (Password hashing)
 * ============================================
 */

// ========== DEPENDENCIES ==========
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();                    // Load environment variables

// Database connection
const connectDB = require('./src/config/database');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const earthquakeRoutes = require('./src/routes/earthquakeRoutes');
const typhoonRoutes = require('./src/routes/typhoonRoutes');
const weatherRoutes = require('./src/routes/weatherRoutes');
const alertsRoutes = require('./src/routes/alertsRoutes');
const cycloneAlertsRoutes = require('./src/routes/cycloneAlertsRoutes');

// Services (cron disabled on Vercel — data is fetched on-demand via API routes)
const { triggerCycloneAlerts } = require('./src/services/cycloneAlertTrigger');
const { processAlertNotifications } = require('./src/services/cycloneNotificationService');

// ========== EXPRESS APP INITIALIZATION ==========
const app = express();

// ========== MIDDLEWARE CONFIGURATION ==========

/**
 * CORS - Enable cross-origin requests from frontend
 * Allows frontend (localhost:3000) to communicate with backend (localhost:5000)
 */
const allowedOrigins = [
  'http://localhost:3000',
  'https://matabayan.vercel.app',
  'https://matabayan-backend.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(cors({ origin: allowedOrigins, credentials: true }));

/**
 * Body Parser - Parse incoming JSON requests
 */
app.use(express.json());

/**
 * Cookie Parser - Parse cookies from requests
 * Used for JWT authentication
 */
app.use(cookieParser());

// ========== DATABASE CONNECTION ==========
connectDB();

// ========== API ROUTES ==========

/**
 * Authentication Routes
 * Base: /api/auth
 * Endpoints: /signup, /login, /logout, /me
 */
app.use('/api/auth', authRoutes);

/**
 * User Routes
 * Base: /api/users
 * Endpoints: / (get all users)
 */
app.use('/api/users', userRoutes);

app.use('/api/earthquakes', earthquakeRoutes);
app.use('/api/typhoons', typhoonRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/cyclone-alerts', cycloneAlertsRoutes);


// ========== HEALTH CHECK ENDPOINT ==========
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'MataBayan API is running',
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLING ==========

/**
 * 404 Handler - Route not found
 */
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.originalUrl} not found`
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// ========== START SERVER (local) / EXPORT (Vercel) ==========
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 MataBayan Backend Server');
    console.log('========================================');
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
    console.log('========================================');
  });

  process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });
}

module.exports = app;
