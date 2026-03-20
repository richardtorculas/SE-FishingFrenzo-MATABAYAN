# Earthquake Dashboard Process

## Overview

This document explains step-by-step how the **PHIVOLCS Earthquake Dashboard** was built for MataBayan, including every file involved, what specific code does what, and the tools used.

---

## The Problem

**PHIVOLCS** has no public API. Their earthquake data only exists as an HTML table on their website at `https://earthquake.phivolcs.dost.gov.ph/`. So instead of calling an API, we scrape the page directly and parse the HTML table to extract real earthquake data.

---

## Tools & Technologies Used

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v16 | Backend runtime |
| **Express.js** | ^4.18.2 | API server and routing |
| **Cheerio** | 1.0.0-rc.12 | HTML parser used to scrape PHIVOLCS page (v1.0.0-rc.12 specifically because the project runs Node v16 — newer cheerio requires Node v20+) |
| **Axios** | ^1.6.0 | HTTP client for fetching the PHIVOLCS page and USGS API |
| **MongoDB + Mongoose** | ^7.6.3 | Storing earthquake records |
| **node-cron** | ^3.0.2 | Auto-refresh every 5 minutes in the background |
| **React 18** | ^18 | Frontend dashboard UI |
| **Tailwind CSS** | — | Styling and layout |
| **Lucide React** | — | Icons (Activity, AlertTriangle, MapPin, Layers, Waves, etc.) |
| **USGS Earthquake API** | — | Fallback data source when PHIVOLCS is unreachable |

---

## Step-by-Step Process

---

### Step 1 — Inspect the PHIVOLCS Website

Before writing any code, we downloaded the raw HTML of `https://earthquake.phivolcs.dost.gov.ph/` and inspected its structure to find which CSS classes hold the earthquake data.

**What we found — each table row uses these classes:**

| Data | CSS Class | Example Value |
|------|-----------|---------------|
| Date & Time (PST) | `td.auto-style91` | `20 March 2026 - 05:24 PM` |
| Latitude | `td.auto-style90` | `18.01` |
| Longitude | `td.auto-style56` (1st occurrence) | `122.16` |
| Depth (km) | `td.auto-style56` (2nd occurrence) | `025` |
| Magnitude | `td.auto-style56` (3rd occurrence) | `2.5` |
| Location | `td.auto-style52` | `033 km N 67° E of Baggao (Cagayan)` |

---

### Step 2 — Install Cheerio

Cheerio was installed as the HTML parsing library.

**File:** `src/backend/package.json`
```
"cheerio": "1.0.0-rc.12"
```

Run via:
```bash
cd src/backend
npm install cheerio@1.0.0-rc.12
```

---

### Step 3 — Create the PHIVOLCS Service

**File:** `src/backend/src/services/phivolcsService.js`

This is the core file. It contains 4 functions:

#### `calculateThreatLevel(magnitude, depth)` — Lines 18–27
Assigns a threat level based on magnitude. Shallow earthquakes (depth < 70km) get a stronger warning on High-level events.

```
magnitude >= 7.0  →  Critical
magnitude >= 6.0  →  High
magnitude >= 5.0  →  Moderate
magnitude >= 4.0  →  Low
below 4.0         →  Minor
```

#### `extractProvince(locationStr)` — Lines 30–33
Extracts the province name from the PHIVOLCS location format.
Example: `"033 km N 67° E of Baggao (Cagayan)"` → `"Cagayan"`
Uses a regex: `/\(([^)]+)\)$/`

#### `scrapePhivolcs(limit = 50)` — Lines 36–87
The main scraper. Steps inside this function:
1. Makes an HTTP GET request to `https://earthquake.phivolcs.dost.gov.ph/` using Axios
2. Uses `httpsAgent: new https.Agent({ rejectUnauthorized: false })` to bypass PHIVOLCS's SSL certificate issue
3. Loads the HTML into Cheerio with `cheerio.load(response.data)`
4. Selects every `td.auto-style91` — each one is the start of an earthquake row
5. Stops after `limit` rows (default 50) using `if (i >= limit) return false`
6. For each row, reads sibling `td` elements at index 1–5 for lat, lon, depth, mag, location
7. Parses the date string `"20 March 2026 - 05:24 PM"` as PST (UTC+8) using `new Date(cleanDate + ' GMT+0800')`
8. Calls `calculateThreatLevel()` to assign severity
9. Builds a `phivolcsId` from `timestamp + lat + lon` for deduplication
10. Returns an array of earthquake objects ready to save to MongoDB

#### `fetchFromUSGS(limit = 50)` — Lines 90–124
Fallback function. Calls the USGS API with the Philippine geographic bounding box:
```
minLat: 4.0, maxLat: 21.5
minLon: 116.0, maxLon: 127.0
```
Returns data in the same format as the PHIVOLCS scraper so the rest of the system doesn't need to know which source was used.

#### `fetchEarthquakeData(limit = 50)` — Lines 127–138 (exported)
The main exported function. Tries `scrapePhivolcs()` first. If it fails or returns 0 records, automatically calls `fetchFromUSGS()` as fallback. Logs which source was used to the console.

---

### Step 4 — Update the Alert Model

**File:** `src/backend/src/models/Alert.js` — bottom of the schema

Added a `metadata` field (flexible Object type) to store earthquake-specific data that doesn't fit the base schema:

```js
metadata: {
  type: Object
  // Stores: magnitude, depth, latitude, longitude,
  //         threatLevel, threatSeverity, phivolcsId,
  //         tsunami (bool), felt (number), usgsId, usgsUrl
}
```

This field is flexible so it can later store typhoon or flood metadata too.

---

### Step 5 — Create the Earthquake Controller

**File:** `src/backend/src/controllers/earthquakeController.js`

Contains 4 controller functions:

#### `getEarthquakes` 
Queries MongoDB for all documents where `type: 'Earthquake'`, sorted by `timestamp` descending, limited to 50. Returns them as JSON.

#### `updateEarthquakeData`
The function triggered by the **Fetch Latest** button on the frontend:
1. Calls `fetchEarthquakeData(50)` from the service
2. Runs `Alert.deleteMany({ type: 'Earthquake' })` — wipes all old earthquake records
3. Runs `Alert.insertMany(earthquakeData)` — inserts the fresh 50
4. This replace strategy keeps the DB lean and always current

#### `getEarthquakeStats`
Runs 4 parallel MongoDB queries using `Promise.all`:
- Total earthquake count
- Count from last 24 hours
- Count grouped by severity level
- Count of tsunami-flagged earthquakes

#### `clearEarthquakes`
Utility function — deletes all earthquake records. Used for resetting the DB.

---

### Step 6 — Create the Earthquake Routes

**File:** `src/backend/src/routes/earthquakeRoutes.js`

Registers 4 API endpoints:

```
GET    /api/earthquakes         →  getEarthquakes
GET    /api/earthquakes/stats   →  getEarthquakeStats
POST   /api/earthquakes/update  →  updateEarthquakeData
DELETE /api/earthquakes/clear   →  clearEarthquakes
```

---

### Step 7 — Register Routes and Cron Job in Server

**File:** `src/backend/server.js`

Two additions were made:

**1. Import and register the earthquake route** (around line 30–31):
```js
const earthquakeRoutes = require('./src/routes/earthquakeRoutes');
app.use('/api/earthquakes', earthquakeRoutes);
```

**2. PHIVOLCS cron job** — runs every 5 minutes automatically:
```js
cron.schedule('*/5 * * * *', async () => {
  // Fetches latest data and saves new entries to DB
});
```
This means even without anyone clicking the button, the DB stays updated every 5 minutes while the server is running.

---

### Step 8 — Build the Frontend Dashboard

**File:** `src/frontend/src/pages/EarthquakeDashboard.js`

This is the full React page. Key parts:

#### `THREAT_CONFIG` — Lines 4–10
Object that maps each threat level (Critical, High, Moderate, Low, Minor) to its Tailwind CSS classes, icon emoji, and whether it should pulse.

#### `getMagnitudeBar(magnitude)` — Lines 12–19
Calculates the width percentage and color of the magnitude progress bar shown on each card. Based on a 0–9 scale.

#### `EarthquakeCard` component — Lines 21–88
Renders one earthquake card. Shows:
- Tsunami warning banner (if `metadata.tsunami` is true)
- Threat level badge (pulses for Critical/High)
- Magnitude number (large, top right)
- Magnitude progress bar
- Location, depth with shallow warning flag, coordinates
- PHIVOLCS source badge and timestamp

#### `StatCard` component — Lines 90–97
Small reusable card for the stats row at the top of the dashboard.

#### `EarthquakeDashboard` main component — Lines 99 onward

- `loadData()` — fetches from `/api/earthquakes` and `/api/earthquakes/stats` in parallel
- `triggerUpdate()` — calls `POST /api/earthquakes/update` then reloads data
- `useEffect` on mount — calls `triggerUpdate()` immediately on page load, then sets a 5-minute interval
- Filter logic — `filtered` array derived from `earthquakes` state based on selected severity tab
- `highestThreat` — finds first Critical/High earthquake to show the alert banner
- `tsunamiActive` — checks if any earthquake has `metadata.tsunami === true`

---

### Step 9 — Wire into App Router and Navbar

**File:** `src/frontend/src/App.js`
```js
import EarthquakeDashboard from './pages/EarthquakeDashboard';
<Route path="/earthquakes" element={<EarthquakeDashboard />} />
```

**File:** `src/frontend/src/components/Navbar.js`
```jsx
<Link to="/earthquakes">🌍 Earthquakes</Link>
```

---

## How Data Flows End-to-End

```
User opens /earthquakes
        ↓
EarthquakeDashboard mounts (useEffect)
        ↓
POST /api/earthquakes/update
        ↓
earthquakeController.updateEarthquakeData()
        ↓
phivolcsService.fetchEarthquakeData()
        ↓
  [Try] scrapePhivolcs()
    → axios.get(https://earthquake.phivolcs.dost.gov.ph/)
    → cheerio parses HTML table
    → extracts 50 rows (date, lat, lon, depth, mag, location)
    → calculateThreatLevel() assigns severity
    → returns array of 50 earthquake objects
  [Fail] fetchFromUSGS()
    → axios.get(USGS API with PH bounding box)
    → returns same format
        ↓
Alert.deleteMany({ type: 'Earthquake' })   ← wipes old 50
Alert.insertMany(earthquakeData)           ← saves new 50
        ↓
GET /api/earthquakes  +  GET /api/earthquakes/stats
        ↓
React state updated → Dashboard renders cards
```

---

## Data Source Attribution

> **Primary:** PHIVOLCS — Philippine Institute of Volcanology and Seismology (DOST)
> `https://earthquake.phivolcs.dost.gov.ph/`
>
> **Fallback:** USGS Earthquake Hazards Program
> `https://earthquake.usgs.gov/fdsnws/event/1/`
