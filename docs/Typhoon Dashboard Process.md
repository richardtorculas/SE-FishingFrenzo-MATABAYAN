# Typhoon Dashboard Process

## Overview

This document explains step-by-step how the **PAGASA Typhoon Dashboard** was built for MataBayan, including every file involved, what specific code does what, and the tools used.

---

## The Problem

**PAGASA** has no public API. Their tropical cyclone data only exists as bulletin pages on their website at `https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin`. So instead of calling an API, we scrape the page directly and parse the bulletin text to extract real cyclone data.

---

## Tools & Technologies Used

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | v16 | Backend runtime |
| **Express.js** | ^4.18.2 | API server and routing |
| **Cheerio** | ^1.2.0 | HTML parser used to scrape PAGASA bulletin page |
| **Axios** | ^1.6.0 | HTTP client for fetching the PAGASA page and JTWC text file |
| **MongoDB + Mongoose** | ^7.6.3 | Storing typhoon records with trajectory history |
| **node-cron** | ^3.0.2 | Auto-refresh every 30 minutes in the background |
| **React 18** | ^18 | Frontend dashboard UI |
| **Tailwind CSS** | — | Styling and layout |
| **Lucide React** | — | Icons (Wind, AlertTriangle, MapPin, Navigation, Compass, etc.) |
| **Recharts** | ^2.12.7 | Bar chart, RadialBarChart for wind speed and category distribution |
| **Windy Embed API** | — | Live wind map iframe centered on active storm |
| **JTWC** | — | Fallback data source (Joint Typhoon Warning Center) when PAGASA is unreachable |

---

## Step-by-Step Process

---

### Step 1 — Inspect the PAGASA Website

Before writing any code, we fetched the raw HTML of `https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin` and inspected its structure.

**What we found:** PAGASA does not use a structured HTML table like PHIVOLCS. Instead, cyclone data is embedded inside bulletin text blocks. The page uses these selectors when a cyclone is active:

| Selector | Content |
|----------|---------|
| `div.weather-bulletin-item` | Full bulletin block per cyclone |
| `article.bulletin` | Alternative bulletin wrapper |
| `div.cyclone-item`, `.typhoon-item`, `.storm-item` | Other possible wrappers |

When no structured blocks are found, the full `body` text is parsed as a fallback.

**Bulletin text format example:**
```
TYPHOON "CARINA" (INTERNATIONAL NAME: GAEMI)
Center: 18.5°N 124.2°E
Maximum winds of 150 km/h moving NORTHWEST at 20 km/h
Affecting: Northern Luzon
```

---

### Step 2 — Install Dependencies

All required packages were already present from the earthquake feature. No new installs needed.

**File:** `src/backend/package.json`
```json
"cheerio": "^1.2.0",
"axios": "^1.6.0",
"node-cron": "^3.0.2"
```

---

### Step 3 — Create the PAGASA Service

**File:** `src/backend/src/services/pagasaService.js`

This is the core file. It contains 7 functions:

#### `classifyCategory(windKph)` — Lines 20–29
Assigns a storm category and PAGASA signal number based on maximum sustained wind speed.

```
windKph >= 185  →  Super Typhoon    (Critical, Signal 5)
windKph >= 150  →  Typhoon          (Critical, Signal 4)
windKph >= 118  →  Typhoon          (High,     Signal 3)
windKph >= 89   →  Severe Tropical Storm (High, Signal 2)
windKph >= 62   →  Tropical Storm   (Moderate, Signal 1)
windKph >= 45   →  Tropical Depression (Low,   Signal 1)
below 45        →  Low Pressure Area   (Low,   Signal 0)
```

#### `validateCyclone(data)` — Lines 32–50
Validates a parsed cyclone object before saving. Checks:
- `name` is a non-empty string
- `category` is one of the 6 valid PAGASA categories
- `severity` is one of Critical / High / Moderate / Low
- `windKph` is a non-negative number
- `latitude` is between -90 and 90 (if provided)
- `longitude` is between -180 and 180 (if provided)

Returns an array of error strings. Empty array = valid.

#### `cleanCycloneData(raw)` — Lines 53–61
Normalizes raw parsed data before saving:
- Trims and uppercases `name`, strips non-alpha characters
- Collapses whitespace in `location`
- Rounds `windKph` to nearest integer
- Rounds `latitude` and `longitude` to 2 decimal places

#### `buildStormKey(name, lat, lon, timestamp)` — Lines 64–70
Builds a deduplication key so the same storm at the same position within the same hour is never saved twice.
Format: `STORMNAME-lat(1dp)-lon(1dp)-hourTimestamp`
Example: `CARINA-18.5-124.2-1720000000000`

#### `parseBulletinText(text)` — Lines 73–120
The core text parser. Uses regex to extract fields from raw bulletin text:
- Storm name — matches `TYPHOON "NAME"`, `TROPICAL STORM "NAME"`, etc.
- Coordinates — matches `18.5°N, 124.2°E` pattern
- Wind speed — matches `150 km/h` or `150 kph`
- Movement — matches `moving NORTHWEST at 20 km/h`
- Affected area — matches `affecting Northern Luzon`

Calls `classifyCategory()`, `cleanCycloneData()`, and `validateCyclone()` before returning. Returns `null` if validation fails.

#### `scrapePagasa()` — Lines 123–148 (PRIMARY)
The main scraper. Steps inside this function:
1. Makes an HTTP GET request to `https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin` using Axios
2. Uses `httpsAgent: new https.Agent({ rejectUnauthorized: false })` to bypass PAGASA's SSL certificate issue
3. Loads the HTML into Cheerio with `cheerio.load(response.data)`
4. Tries to find structured bulletin blocks (`div.weather-bulletin-item`, `article.bulletin`, etc.)
5. If blocks are found, parses each one with `parseBulletinText()`
6. If no blocks are found, falls back to parsing the full `body` text
7. Returns an array of validated cyclone objects

#### `fetchFromJTWC()` — Lines 151–200 (FALLBACK)
Fallback function. Fetches the JTWC Western Pacific active storms text file from:
```
https://www.metoc.navy.mil/jtwc/products/abpwweb.txt
```
Parses each storm line using regex for storm ID, name, coordinates (in tenths of degrees), and wind speed (in knots, converted to km/h via × 1.852).

Filters to only include storms within the Philippine Area of Responsibility:
```
lat: 4°N – 21°N
lon: 115°E – 135°E
```

Returns data in the same format as `scrapePagasa()`.

#### `fetchTyphoonData()` — Lines 203–218 (exported)
The main exported function. Tries `scrapePagasa()` first. If it fails or returns 0 records, automatically calls `fetchFromJTWC()` as fallback. If both fail, returns an empty array (no active cyclones). Logs which source was used to the console.

---

### Step 4 — Create the Typhoon Model

**File:** `src/backend/src/models/Typhoon.js`

A dedicated Mongoose model (not reusing the Alert model) because typhoons have significantly more fields than earthquakes, including trajectory history.

Key schema fields:

| Field | Type | Purpose |
|-------|------|---------|
| `name` | String (uppercase) | Storm name e.g. `CARINA` |
| `category` | String (enum) | One of 6 PAGASA categories |
| `severity` | String (enum) | Critical / High / Moderate / Low |
| `signal` | Number (0–5) | PAGASA public storm warning signal |
| `latitude` / `longitude` | Number | Current storm center position |
| `windKph` | Number | Maximum sustained wind speed |
| `movementDirection` | String | e.g. `NORTHWEST` |
| `movementSpeedKph` | Number | Speed of storm movement |
| `trajectory` | Array of points | Past positions with timestamp and wind |
| `stormKey` | String (unique) | Deduplication key |
| `source` | String (enum) | `PAGASA` or `JTWC` |
| `affectedArea` | String | Affected provinces/regions |

The `trajectory` sub-schema (`trajectoryPointSchema`) stores each position update:
```js
{ latitude, longitude, timestamp, windKph }
```

Three indexes are defined:
```js
typhoonSchema.index({ severity: 1, timestamp: -1 });
typhoonSchema.index({ name: 1, timestamp: -1 });
stormKey: { unique: true, index: true }  // on field definition
```

---

### Step 5 — Create the Typhoon Controller

**File:** `src/backend/src/controllers/typhoonController.js`

Contains 4 controller functions:

#### `getTyphoons`
Queries MongoDB for all typhoon documents, sorted by `timestamp` descending, limited to 20. Returns them as JSON.

#### `updateTyphoonData`
The function triggered by the **Fetch Latest** button on the frontend:
1. Calls `fetchTyphoonData()` from the service
2. If 0 cyclones returned, responds immediately with "No active tropical cyclones"
3. For each cyclone, checks `stormKey` for exact duplicates — skips if found
4. If same storm name exists with a different position (storm moved), appends the new position to `trajectory` and updates current fields via `findByIdAndUpdate`
5. If brand new storm, creates a new document
6. Responds with counts: `newCount`, `updatedCount`, `skippedCount`

This upsert strategy preserves full trajectory history across updates.

#### `getTyphoonStats`
Runs 3 parallel MongoDB queries using `Promise.all`:
- Total typhoon count
- Count grouped by severity level
- The single typhoon with the highest `windKph`

#### `clearTyphoons`
Utility function — deletes all typhoon records. Used for resetting the DB.

---

### Step 6 — Create the Typhoon Routes

**File:** `src/backend/src/routes/typhoonRoutes.js`

Registers 4 API endpoints:

```
GET    /api/typhoons         →  getTyphoons
GET    /api/typhoons/stats   →  getTyphoonStats
POST   /api/typhoons/update  →  updateTyphoonData
DELETE /api/typhoons/clear   →  clearTyphoons
```

---

### Step 7 — Register Routes and Cron Job in Server

**File:** `src/backend/server.js`

Two additions were made:

**1. Import and register the typhoon route** (around line 32–33):
```js
const typhoonRoutes = require('./src/routes/typhoonRoutes');
app.use('/api/typhoons', typhoonRoutes);
```

**2. PAGASA cron job** — runs every 30 minutes automatically (bulletins update less frequently than earthquake data):
```js
cron.schedule('*/30 * * * *', async () => {
  // Fetches latest data, upserts storms, appends trajectory
});
```
The cron uses the same upsert logic as the controller — it appends trajectory points for existing storms rather than replacing records.

---

### Step 8 — Build the Frontend Dashboard

**File:** `src/frontend/src/pages/TyphoonDashboard.js`

This is the full React page. It has 3 tabs: **Overview**, **Charts**, and **Map**. Key parts:

#### `SEVERITY_CONFIG` — Lines 9–14
Object that maps each severity level (Critical, High, Moderate, Low) to its Tailwind CSS classes, icon emoji, and whether it should pulse.

#### `CATEGORY_COLORS` — Lines 16–23
Maps each PAGASA storm category to a hex color used in the Recharts visualizations.

#### `getWindBar(windKph)` — Lines 25–32
Calculates the width percentage and color of the wind speed progress bar. Based on a 0–250 km/h scale.

#### `TyphoonCard` component — Lines 35–100
Renders one typhoon card. Shows:
- Storm name (large, uppercase) and category badge (pulses for Critical/High)
- Wind speed number (top right) with progress bar
- PAGASA signal number badge (color-coded: red for Signal 3+, yellow for lower)
- Trajectory point count
- Affected area, coordinates, movement direction and speed
- Description text
- Source badge (PAGASA or JTWC) and timestamp

#### `StatCard` component — Lines 102–109
Small reusable card for the stats row at the top of the dashboard.

#### `CycloneMap` component — Lines 112–155
Embeds a live Windy wind map via iframe. Automatically centers on the first active storm's coordinates. If no storm has coordinates, defaults to center Philippines (12°N, 122°E). Shows an info bar above the map listing all active storms with their wind speeds.

#### `WindSpeedChart` component — Lines 158–178
Recharts `BarChart` comparing wind speeds across all active cyclones. Y-axis fixed at 0–250 km/h.

#### `CategoryChart` component — Lines 181–205
Recharts `RadialBarChart` showing the distribution of storm categories. Each bar is colored using `CATEGORY_COLORS`.

#### `TrajectoryChart` component — Lines 208–230
Recharts `BarChart` showing wind speed at each recorded trajectory point for a single storm. Only renders if the storm has trajectory data.

#### `TyphoonDashboard` main component — Lines 233 onward

- `loadData()` — fetches from `/api/typhoons` and `/api/typhoons/stats` in parallel
- `triggerUpdate()` — calls `POST /api/typhoons/update` then reloads data
- `useEffect` on mount — calls `triggerUpdate()` immediately on page load, then sets a 30-minute interval
- `activeTab` state — controls which of the 3 tabs is shown (`overview`, `charts`, `map`)
- `activeCritical` — finds first Critical/High cyclone to show the alert banner
- `strongestStorm` — the cyclone with the highest `windKph`, used as the focus of the trajectory chart

---

### Step 9 — Wire into App Router and Navbar

**File:** `src/frontend/src/App.js`
```js
import TyphoonDashboard from './pages/TyphoonDashboard';
<Route path="/typhoons" element={<TyphoonDashboard />} />
```

**File:** `src/frontend/src/components/Navbar.js`
```jsx
<Link to="/typhoons">🌀 Typhoons</Link>
```

---

## How Data Flows End-to-End

```
User opens /typhoons
        ↓
TyphoonDashboard mounts (useEffect)
        ↓
POST /api/typhoons/update
        ↓
typhoonController.updateTyphoonData()
        ↓
pagasaService.fetchTyphoonData()
        ↓
  [Try] scrapePagasa()
    → axios.get(https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin)
    → cheerio loads HTML
    → finds bulletin blocks (div.weather-bulletin-item, etc.)
    → parseBulletinText() extracts name, coords, wind, movement
    → classifyCategory() assigns category + signal + severity
    → validateCyclone() checks all fields
    → cleanCycloneData() normalizes values
    → returns array of cyclone objects
  [Fail] fetchFromJTWC()
    → axios.get(JTWC abpwweb.txt)
    → regex parses each storm line
    → filters to Philippine Area of Responsibility
    → returns same format
        ↓
For each cyclone:
  → findOne({ stormKey }) — skip if exact duplicate
  → findOne({ name })     — update trajectory if storm moved
  → Typhoon.create()      — insert if brand new storm
        ↓
GET /api/typhoons  +  GET /api/typhoons/stats
        ↓
React state updated → Dashboard renders cards + charts + map
```

---

## Data Source Attribution

> **Primary:** PAGASA — Philippine Atmospheric, Geophysical and Astronomical Services Administration (DOST)
> `https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin`
>
> **Fallback:** JTWC — Joint Typhoon Warning Center (U.S. Navy)
> `https://www.metoc.navy.mil/jtwc/products/abpwweb.txt`
>
> **Live Map:** Windy.com Embed API
> `https://embed.windy.com/embed2.html`
