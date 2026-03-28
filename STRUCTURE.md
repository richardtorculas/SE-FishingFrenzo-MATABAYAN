# ✅ MataBayan - Clean Professional Structure

## Final Directory Tree

```
MataBayan/
├── .github/                      # GitHub configuration
│   └── workflows/
│       └── ci.yml                # CI/CD pipeline (automated testing)
│
├── src/                          # Source code
│   ├── backend/                  # Node.js/Express API
│   │   ├── src/
│   │   │   ├── config/           # Database configuration
│   │   │   │   └── database.js
│   │   │   ├── controllers/      # Business logic
│   │   │   │   ├── authController.js
│   │   │   │   ├── earthquakeController.js
│   │   │   │   └── userController.js
│   │   │   ├── middleware/       # Auth middleware
│   │   │   │   └── authMiddleware.js
│   │   │   ├── models/           # MongoDB schemas
│   │   │   │   ├── Alert.js
│   │   │   │   └── User.js
│   │   │   ├── routes/           # API endpoints
│   │   │   │   ├── alertRoutes.js
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── earthquakeRoutes.js
│   │   │   │   └── userRoutes.js
│   │   │   └── services/         # External services
│   │   │       └── phivolcsService.js
│   │   ├── .env                  # Environment variables (local)
│   │   ├── server.js             # Entry point
│   │   ├── package.json          # Dependencies
│   │   └── README.md             # Backend documentation
│   │
│   └── frontend/                 # React application
│       ├── public/               # Static files
│       │   └── index.html
│       ├── src/
│       │   ├── components/       # Reusable components
│       │   │   ├── AlertCard.js
│       │   │   ├── Navbar.js
│       │   │   ├── ProtectedRoute.js
│       │   │   └── auth/         # Auth components
│       │   │       ├── Login.js
│       │   │       └── SignUp.js
│       │   ├── context/          # State management
│       │   │   └── AuthContext.js
│       │   ├── pages/            # Route pages
│       │   │   ├── AdminUsers.js
│       │   │   ├── AlertDashboard.js
│       │   │   ├── Dashboard.js
│       │   │   ├── EarthquakeDashboard.js
│       │   │   └── Home.js
│       │   ├── utils/            # Helper functions
│       │   │   ├── phLocations.js
│       │   │   └── validation.js
│       │   ├── App.js
│       │   ├── index.js
│       │   └── index.css
│       ├── package.json          # Dependencies
│       ├── tailwind.config.js    # Tailwind CSS config
│       └── README.md             # Frontend documentation
│
├── docs/                         # Documentation
│   ├── architecture/             # System design docs
│   │   └── README.md
│   ├── uml/                      # UML diagrams
│   │   └── README.md
│   ├── API.md                    # API documentation
│   ├── SETUP.md                  # Setup & installation guide
│   ├── GIT_WORKFLOW.md           # Git workflow guidelines
│   ├── Earthquake Dashboard Process.md
│   └── README.md                 # Documentation index
│
├── tests/                        # Testing suite
│   ├── automation/               # Automated UI tests (Selenium + Pytest)
│   │   ├── conftest.py           # Pytest fixtures & configuration
│   │   ├── pytest.ini            # Pytest settings
│   │   ├── test_landing.py       # Landing page tests
│   │   ├── test_login.py         # Login flow tests (5 test cases)
│   │   ├── test_signup.py        # Signup flow tests
│   │   ├── __pycache__/          # Compiled Python cache
│   │   └── .gitkeep
│   └── README.md                 # Testing documentation
│
├── scripts/                      # Utility scripts
│   ├── dev.bat                   # Start development (Windows)
│   ├── install.bat               # Install dependencies (Windows)
│   ├── view-db.bat               # View database (Windows)
│   └── seedEarthquakes.js        # Seed test data into database
│
├── .gitignore                    # Git ignore rules
├── package.json                  # Root monorepo configuration
├── QUICKSTART.md                 # Quick start guide
├── README.md                     # Main project documentation
├── STRUCTURE.md                  # This file
└── START.bat                     # Quick start batch file (Windows)
```

## Project Highlights

### Backend (Node.js/Express)
- **MVC Architecture** - Models, Views (React), Controllers
- **MongoDB Integration** - Mongoose ODM with schemas for Users and Alerts
- **JWT Authentication** - Secure user sessions with bcrypt password hashing
- **RESTful API** - Organized routes for auth, alerts, users, earthquakes
- **External Services** - PHIVOLCS earthquake data integration

### Frontend (React)
- **Component-Based UI** - Reusable components with props-driven logic
- **Context API** - Global state management for authentication
- **Protected Routes** - Private pages requiring authentication
- **Tailwind CSS** - Utility-first styling framework
- **Responsive Design** - Works on desktop and mobile devices

### Testing
- **Automation Tests** - Selenium + Pytest for UI testing
- **CI/CD Pipeline** - Automatic testing on every push to main/develop
- **Test Coverage** - Landing page, login, and signup flows
- **Edge Cases** - Invalid credentials, empty fields, format validation

## One-Command Startup

```bash
# Install everything
npm run install:all

# Start both servers
npm run dev

# Or use the batch script (Windows)
START.bat
```

## Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Documentation:** [docs/API.md](docs/API.md)
- **Setup Guide:** [docs/SETUP.md](docs/SETUP.md)

---

**Status:** ✅ Clean, professional, production-ready structure with CI/CD automation and comprehensive testing

## One-Command Startup

```bash
# Install everything
npm run install:all

# Start both servers
npm run dev
```

## Access Points

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

**Status:** ✅ Clean, professional, production-ready structure
