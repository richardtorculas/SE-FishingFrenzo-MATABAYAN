# MataBayan - Setup Guide

## Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** v7+ ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### Verify Installation
```bash
node --version    # Should show v18 or higher
npm --version     # Should show v9 or higher
mongod --version  # Should show v7 or higher
```

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/Gojatora/SE-FishingFrenzo-MATABAYAN.git
cd SE-FishingFrenzo-MATABAYAN
```

### 2. Install Dependencies

**Option A: Automated (Windows)**
```bash
scripts\install.bat
```

**Option B: Manual**
```bash
npm run install:all
```

### 3. Configure Environment

Create `src/backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matabayan
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
```

### 4. Start MongoDB
```bash
# Windows (as service)
net start MongoDB

# Or manually
mongod
```

## Running the Application

### Development Mode

**Option A: Automated (Windows)**
```bash
scripts\dev.bat
```

**Option B: Manual**
```bash
npm run dev
```

**Option C: Separate Terminals**
```bash
# Terminal 1 - Backend
cd src/backend
npm run dev

# Terminal 2 - Frontend
cd src/frontend
npm start
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api-docs

## Project Structure

```
MataBayan/
├── src/
│   ├── backend/              # Express.js API
│   │   ├── controllers/      # Business logic
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth & validation
│   │   └── server.js         # Entry point
│   └── frontend/             # React app
│       ├── src/
│       │   ├── components/   # Reusable UI
│       │   ├── pages/        # Route pages
│       │   ├── context/      # State management
│       │   └── utils/        # Helpers
│       └── public/           # Static assets
├── docs/                     # Documentation
├── tests/                    # Test suites
└── scripts/                  # Automation scripts
```

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Backend: `src/backend/`
- Frontend: `src/frontend/`

### 3. Test Changes
```bash
npm test
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
net start MongoDB
```

### Module Not Found
```bash
# Reinstall dependencies
npm run install:all
```

## Database Management

### View Users
```bash
scripts\view-db.bat
```

### Reset Database
```bash
mongosh mongodb://localhost:27017/matabayan --eval "db.dropDatabase()"
```

## Testing

### Run All Tests
```bash
npm test
```

### Backend Tests Only
```bash
npm run test:backend
```

### Frontend Tests Only
```bash
npm run test:frontend
```

## Production Build

### Build Frontend
```bash
npm run build:frontend
```

Output: `src/frontend/build/`

## Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/Gojatora/SE-FishingFrenzo-MATABAYAN/issues)
- **Team:** See [README.md](README.md#team)

---

**Need help?** Contact the development team or check the documentation.
