# Historical Typhoon Data Feature

## Overview
Since there are no active tropical cyclones in the Philippine Area of Responsibility (PAR) currently, the typhoon dashboard now supports loading historical typhoon data from PAGASA's preliminary reports (2026 only). This allows the dashboard to display charts, statistics, and overview cards even when no active cyclones exist.

## What Changed

### Backend Changes

#### 1. **pagasaService.js** - New Function
Added `fetchHistoricalTyphoons()` function that:
- Scrapes PAGASA preliminary reports page: `https://www.pagasa.dost.gov.ph/tropical-cyclone/publications/preliminary-report`
- Filters for 2026 reports only
- Parses typhoon data using existing `parseBulletinText()` function
- Marks data with `isHistorical: true` flag
- Sets source as `PAGASA-Historical`

#### 2. **Typhoon.js** - New Field
Added `isHistorical` boolean field to distinguish between:
- Active cyclones (`isHistorical: false`)
- Historical/past cyclones (`isHistorical: true`)

#### 3. **typhoonController.js** - New Endpoint
Added `seedHistoricalTyphoons()` controller function that:
- Calls `fetchHistoricalTyphoons()` from the service
- Saves historical data to MongoDB
- Prevents duplicates using `stormKey`
- Returns counts of new/skipped records

#### 4. **typhoonRoutes.js** - New Route
Added `POST /api/typhoons/historical` endpoint to trigger historical data seeding

### Frontend Changes

#### **TyphoonDashboard.js** - Enhanced Features
1. **New Function**: `seedHistoricalData()` - Calls the historical endpoint and reloads data
2. **Updated EmptyState**: Now shows "Load 2026 Historical Data" button when no cyclones exist
3. **Historical Badge**: TyphoonCard displays "Historical (2026)" badge for past typhoons
4. **Updated Stats**: Now shows total count including historical data
5. **Updated Links**: Footer links now point to PAGASA preliminary reports page

## How to Use

### Option 1: Via Dashboard Button
1. Open the Typhoon Dashboard at `http://localhost:3000/typhoons`
2. If no active cyclones exist, click "Load 2026 Historical Data" button
3. Historical typhoons will populate the dashboard

### Option 2: Via Seed Script
```bash
node scripts/seedHistoricalTyphoons.js
```

### Option 3: Via API
```bash
curl -X POST http://localhost:5000/api/typhoons/historical
```

## Data Flow

```
User clicks "Load 2026 Historical Data"
        ↓
POST /api/typhoons/historical
        ↓
seedHistoricalTyphoons() controller
        ↓
fetchHistoricalTyphoons() service
        ↓
axios.get(PAGASA preliminary reports page)
        ↓
cheerio parses HTML for 2026 reports
        ↓
parseBulletinText() extracts typhoon data
        ↓
Mark with isHistorical: true
        ↓
Save to MongoDB (skip duplicates)
        ↓
GET /api/typhoons returns all data
        ↓
Dashboard renders with historical typhoons
```

## Dashboard Behavior

### When No Active Cyclones Exist
- Shows empty state with "Load 2026 Historical Data" button
- Charts tab shows empty state
- Map tab shows default Philippines view

### When Historical Data is Loaded
- Overview tab shows all historical typhoons as cards
- Charts tab displays:
  - Wind speed comparison across all storms
  - Category distribution (pie/radial chart)
  - Trajectory charts for storms with path data
- Map tab shows Windy map centered on first storm with coordinates
- Stats show total count, highest winds, strongest storm, category

### When Active Cyclones Appear
- Active cyclones display normally (isHistorical: false)
- Historical data remains in database but can be filtered if needed
- Alert banner shows for Critical/High severity active cyclones only

## Data Filtering

To show only active cyclones (exclude historical):
```javascript
const activeTyphoons = typhoons.filter(t => !t.isHistorical);
```

To show only historical:
```javascript
const historicalTyphoons = typhoons.filter(t => t.isHistorical);
```

## Notes

- Historical data is marked with `isHistorical: true` and source `PAGASA-Historical`
- The scraper filters for 2026 reports only to avoid cluttering with old data
- Duplicate detection uses `stormKey` (name + position + hour) to prevent duplicates
- Historical data persists in MongoDB until manually cleared via `DELETE /api/typhoons/clear`
- The dashboard auto-refreshes active data every 30 minutes but doesn't re-fetch historical data

## Future Enhancements

- Add date range filter to show historical data from specific periods
- Add comparison view between historical and active cyclones
- Archive historical data by year
- Add export functionality for historical reports
