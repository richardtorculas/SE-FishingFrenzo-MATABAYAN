# MataBayan Backend

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   ├── models/
│   │   ├── User.js              # User schema (authentication & preferences)
│   │   └── Alert.js             # Alert schema (disaster data)
│   ├── controllers/
│   │   └── authController.js    # Authentication business logic
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification middleware
│   └── routes/
│       ├── authRoutes.js        # Authentication endpoints
│       └── alertRoutes.js       # Alert endpoints
├── .env                         # Environment variables (DO NOT COMMIT)
├── server.js                    # Main application entry point
└── package.json                 # Dependencies and scripts
```

## 🗄️ Database Architecture

### Collections

#### **users**
- Stores user accounts and location preferences
- Fields: name, email, password (hashed), preferences, createdAt
- Indexes: email (unique)

#### **alerts**
- Stores real-time disaster alerts
- Fields: type, severity, location, province, description, source, timestamp
- Indexes: province + timestamp (for location-based queries)

## 🔐 Authentication Flow

1. **Registration** (`POST /api/auth/signup`)
   - User submits: name, email, password, preferences
   - Password hashed with bcrypt (12 rounds)
   - User saved to database
   - JWT token generated and sent

2. **Login** (`POST /api/auth/login`)
   - User submits: email, password
   - Password verified with bcrypt
   - JWT token generated and sent

3. **Protected Routes**
   - Token verified by `protect` middleware
   - User object attached to request
   - Route handler executes

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/location/:province` - Get alerts by province
- `POST /api/alerts` - Create new alert

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matabayan
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **cookie-parser** - Parse cookies
- **dotenv** - Environment variables

## 🏗️ MVC Architecture

- **Model** (src/models/) - Data structure and database logic
- **View** (Frontend) - User interface (React)
- **Controller** (src/controllers/) - Business logic and request handling
