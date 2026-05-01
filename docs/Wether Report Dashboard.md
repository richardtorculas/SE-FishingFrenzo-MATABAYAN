# Weather Dashboard & Manual Location Input Process

## Overview

This document covers two connected features built for MataBayan:

1. **Weather Dashboard** — shows real-time weather for a selected Philippine location using Open-Meteo
2. **Manual Location Input** — lets users update their saved province and city from the dashboard, which automatically drives the weather data shown

---

## Tools Used

| Tool | Purpose |
|------|---------|
| **Express.js** | Backend API |
| **Mongoose** | Update user location in MongoDB |
| **JWT Cookie** | Protect the location update endpoint |
| **React 18** | Frontend UI for both features |
| **Axios** | API calls |
| **Tailwind CSS** | Styling |
| **Lucide React** | Icons |
| **philippines** npm package | Source of all PH provinces and cities for the dropdowns |
| **Open-Meteo Geocoding API** | Converts city name to coordinates — no API key needed |
| **Open-Meteo Forecast API** | Fetches real-time weather using coordinates — no API key needed |

---

## Step-by-Step Process

---

### Step 1 — Check the User Model
**File:** `src/backend/src/models/User.js`

Confirmed `province` and `cityMunicipality` already exist under `preferences`. No changes needed to the model.

---

### Step 2 — Create the Weather Controller
**File:** `src/backend/src/controllers/weatherController.js`

Receives `latitude` and `longitude` as query parameters, calls the Open-Meteo Forecast API, and returns temperature, humidity, chance of rain, and weather condition.

WMO weather codes are mapped to readable labels:
```
0  → Clear Sky
63 → Moderate Rain
95 → Thunderstorm
```

---

### Step 3 — Create the Weather Route
**File:** `src/backend/src/routes/weatherRoutes.js`

```
GET /api/weather?latitude=&longitude=&location=  →  getWeather
```

---

### Step 4 — Register Weather Route in Server
**File:** `src/backend/server.js`

```js
const weatherRoutes = require('./src/routes/weatherRoutes');
app.use('/api/weather', weatherRoutes);
```

---

### Step 5 — Build the Weather Dashboard
**File:** `src/frontend/src/pages/WeatherDashboard.js`

- Province and city dropdowns populated from `philippines` npm package via `src/frontend/src/utils/phLocations.js`
- On load, reads the user's saved location from `AuthContext` and auto-fetches weather for that location
- Fetch flow: city name → Open-Meteo Geocoding API → coordinates → `GET /api/weather` → Open-Meteo Forecast API → weather data
- Displays temperature, humidity, chance of rain, weather condition, and weather icon
- Shows a rain warning banner when chance of rain is 70% or higher
- Fetch Weather button for manual refresh

---

### Step 6 — Wire Weather into App Router and Navbar
**File:** `src/frontend/src/App.js`
```js
import WeatherDashboard from './pages/WeatherDashboard';
<Route path="/weather" element={<WeatherDashboard />} />
```

**File:** `src/frontend/src/components/Navbar.js`
```jsx
<Link to="/weather">☁️ Weather</Link>
```

---

### Step 7 — Add Update Location Endpoint
**File:** `src/backend/src/controllers/authController.js`

Added `updateLocation` — validates `province` and `cityMunicipality` from request body, then updates only those two fields on the user document using `findByIdAndUpdate`.

**File:** `src/backend/src/routes/authRoutes.js`
```
PATCH /api/auth/location  →  updateLocation  (protected)
```

---

### Step 8 — Add `updateUser` to AuthContext
**File:** `src/frontend/src/context/AuthContext.js`

Added `updateUser(updatedUser)` so the UI reflects the new location immediately after saving — no re-login needed. Since `user` is global context, the Weather Dashboard also re-fetches automatically when location changes.

---

### Step 9 — Build the Location Edit Form in Dashboard
**File:** `src/frontend/src/pages/Dashboard.js`

- Edit button toggles the form on the Your Location card
- Province dropdown → city dropdown (populated based on selected province)
- Both fields required — shows error if either is missing
- On save — calls `PATCH /api/auth/location`, updates context, shows success message
- Cancel resets back to current saved values

---

## How Data Flows End-to-End

```
User opens /weather
        ↓
WeatherDashboard reads user.preferences from AuthContext
        ↓
fetchWeather(city) called automatically
        ↓
Open-Meteo Geocoding API → city name → coordinates
        ↓
GET /api/weather?latitude=&longitude= → weatherController
        ↓
Open-Meteo Forecast API → temperature, humidity, rain chance
        ↓
Weather Dashboard renders

─────────────────────────────────────

User clicks Edit on Dashboard → updates province + city
        ↓
PATCH /api/auth/location → User.findByIdAndUpdate()
        ↓
updateUser(res.data.user) → AuthContext updated globally
        ↓
WeatherDashboard detects change → re-fetches for new location
```

---

## Files Modified / Created

| File | What changed |
|------|-------------|
| `src/backend/src/controllers/weatherController.js` | Created — fetches Open-Meteo weather data |
| `src/backend/src/routes/weatherRoutes.js` | Created — `GET /api/weather` |
| `src/backend/server.js` | Registered weather route |
| `src/frontend/src/pages/WeatherDashboard.js` | Created — full weather UI |
| `src/backend/src/controllers/authController.js` | Added `updateLocation` |
| `src/backend/src/routes/authRoutes.js` | Added `PATCH /api/auth/location` |
| `src/frontend/src/context/AuthContext.js` | Added `updateUser` |
| `src/frontend/src/pages/Dashboard.js` | Added location edit form |

---

## Data Sources

- **Philippines provinces & cities** — `philippines` npm package → `src/frontend/src/utils/phLocations.js`
- **Geocoding** — `https://geocoding-api.open-meteo.com/v1/search`
- **Weather** — `https://api.open-meteo.com/v1/forecast`
