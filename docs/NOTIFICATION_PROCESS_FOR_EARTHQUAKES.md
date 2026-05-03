# Notification Process for Earthquakes

## Overview
This document describes the complete flow of how earthquake data is fetched, processed, and notifications are sent to users in the MataBayan system.

---

## 1. Data Fetching Phase

### 1.1 Earthquake Data Sources
The system fetches earthquake data from two sources in priority order:

**Primary Source: PHIVOLCS**
- URL: `https://earthquake.phivolcs.dost.gov.ph/`
- Method: Web scraping using Cheerio
- Frequency: Every 5 minutes (cron job)
- Data extracted: Magnitude, depth, latitude, longitude, location, timestamp

**Fallback Source: USGS API**
- URL: `https://earthquake.usgs.gov/fdsnws/event/1/query`
- Method: REST API call
- Bounding box: Philippine region (4.0°N - 21.5°N, 116.0°E - 127.0°E)
- Used when: PHIVOLCS is unavailable or returns 0 records

### 1.2 Data Fetching Flow
```
┌─────────────────────────────────────────┐
│  Cron Job (Every 5 minutes)             │
│  POST /api/earthquakes/update           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  fetchEarthquakeData()                  │
│  (phivolcsService.js)                   │
└────────────┬────────────────────────────┘
             │
             ├─► Try PHIVOLCS scraping
             │   ├─ Success? → Return data
             │   └─ Fail? → Continue
             │
             └─► Try USGS API
                 └─ Return data (or empty)
```

### 1.3 Data Processing
Each earthquake record is enriched with:
- **Threat Level**: Calculated based on magnitude and depth
  - Critical: M ≥ 7.0
  - High: M 6.0–6.9
  - Moderate: M 5.0–5.9
  - Low: M 4.0–4.9
  - Minor: M < 4.0

- **Province Extraction**: Parsed from location string
  - Example: "45 km NE of Batangas City (Batangas)" → "Batangas"

- **Metadata**: Magnitude, depth, coordinates, tsunami flag, threat severity

---

## 2. Database Storage Phase

### 2.1 Earthquake Model
```javascript
{
  severity: String,           // "High", "Moderate", etc.
  location: String,           // Full location description
  province: String,           // Extracted province name
  description: String,        // Human-readable description
  source: String,             // "PHIVOLCS" or "USGS"
  timestamp: Date,            // When earthquake occurred
  metadata: {
    magnitude: Number,
    depth: Number,
    latitude: Number,
    longitude: Number,
    threatLevel: String,
    threatSeverity: Number,
    tsunami: Boolean,
    felt: Number,
    phivolcsId: String,
    usgsId: String,
    usgsUrl: String
  }
}
```

### 2.2 Storage Process
1. Clear old earthquake records from database
2. Insert new earthquake records (up to 50 latest)
3. Each saved earthquake gets a MongoDB `_id`
4. Proceed to alert triggering with saved earthquake objects

---

## 3. Alert Triggering Phase

### 3.1 Significance Check
Before creating alerts, earthquake is checked against minimum thresholds:
- **Magnitude threshold**: M ≥ 3.0 (configurable)
- If below threshold → Skip alert creation

### 3.2 User Filtering
For each significant earthquake:

1. **Fetch all users** with earthquake alerts enabled
2. **Get user location**: Province/city from user preferences
3. **Calculate distance**: Haversine formula from earthquake epicenter to user's province center
4. **Apply alert rules** based on magnitude and distance:
   - **Critical (M ≥ 6.0)**: Alert all users within 300 km
   - **High (M 5.0–5.9)**: Alert users within 300 km
   - **Moderate (M 4.0–4.9)**: Alert users within 200 km
   - **Low (M 3.0–3.9)**: Alert users within 100 km

### 3.3 Alert Creation
For each user to alert, create an Alert record:
```javascript
{
  userId: ObjectId,
  earthquakeId: ObjectId,      // Reference to saved earthquake
  magnitude: Number,
  depth: Number,
  location: String,
  epicenterLat: Number,
  epicenterLon: Number,
  distance: Number,            // Distance from user to epicenter (km)
  channelsSent: {
    sms: Boolean,
    email: Boolean,
    inApp: Boolean
  },
  status: "sent",
  sentAt: Date
}
```

---

## 4. Notification Sending Phase

### 4.1 Notification Channels (Priority Order)

**Channel 1: SMS (Primary)**
- Provider: SMS API PH
- Condition: Sent if user has SMS enabled AND phone number exists
- Success: Alert marked as sent via SMS
- Failure: Proceed to fallback

**Channel 2: Email (Fallback)**
- Provider: Nodemailer (Gmail SMTP)
- Condition: Sent only if SMS fails
- Format: HTML email with earthquake details and safety recommendations
- Failure: Continue to in-app notification

**Channel 3: In-App (Always)**
- Method: Alert record stored in database
- Condition: Always created regardless of SMS/Email status
- Display: Shown in Dashboard and Alert History

### 4.2 Notification Flow
```
┌──────────────────────────────────────┐
│  User to Alert                       │
│  (SMS enabled, has phone number)     │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Send SMS via SMS API PH             │
└────────────┬─────────────────────────┘
             │
        ┌────┴────┐
        │          │
    Success    Failure
        │          │
        │          ▼
        │    ┌──────────────────────────┐
        │    │  Send Email (Fallback)   │
        │    │  via Nodemailer          │
        │    └────────┬─────────────────┘
        │             │
        │        ┌────┴────┐
        │        │          │
        │    Success    Failure
        │        │          │
        └────┬───┴──────┬───┘
             │          │
             ▼          ▼
        ┌──────────────────────────────┐
        │  Create In-App Alert         │
        │  (Always created)            │
        └──────────────────────────────┘
```

### 4.3 SMS Message Format
```
🌍 EARTHQUAKE ALERT
Magnitude: 5.2 | Depth: 15km
Location: Batangas
Distance: 45km from you
Stay safe! Check MataBayan app for details.
```

### 4.4 Email Format
- Subject: "🌍 Earthquake Alert - Magnitude X.X near [Province]"
- Content: HTML email with:
  - Earthquake severity badge
  - Magnitude, depth, location, distance
  - User's province
  - Epicenter coordinates
  - Safety recommendations
  - Link to PHIVOLCS website
  - MataBayan app information

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EARTHQUAKE NOTIFICATION SYSTEM               │
└─────────────────────────────────────────────────────────────────┘

STEP 1: DATA FETCHING
┌──────────────────┐
│ PHIVOLCS/USGS    │
│ Earthquake Data  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Enrich with threat level & province  │
│ (phivolcsService.js)                 │
└────────┬─────────────────────────────┘

STEP 2: DATABASE STORAGE
         │
         ▼
┌──────────────────────────────────────┐
│ Save to Earthquake collection        │
│ (Get MongoDB _id)                    │
└────────┬─────────────────────────────┘

STEP 3: ALERT TRIGGERING
         │
         ▼
┌──────────────────────────────────────┐
│ Check significance (M ≥ 3.0)         │
│ (alertTriggerService.js)             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Fetch users with alerts enabled      │
│ (earthquakeAlertService.js)          │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Calculate distance & apply rules     │
│ (distanceCalculator.js)              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Create Alert records for each user   │
│ (Alert model)                        │
└────────┬─────────────────────────────┘

STEP 4: NOTIFICATION SENDING
         │
         ▼
┌──────────────────────────────────────┐
│ Send bulk notifications              │
│ (notificationService.js)             │
└────────┬─────────────────────────────┘
         │
    ┌────┴────┬────────┐
    │          │        │
    ▼          ▼        ▼
  SMS      EMAIL    IN-APP
  (Primary) (Fallback) (Always)
```

---

## 6. Key Services

### 6.1 phivolcsService.js
- **Purpose**: Fetch and parse earthquake data
- **Functions**:
  - `fetchEarthquakeData(limit)` - Main export, tries PHIVOLCS then USGS
  - `scrapePhivolcs(limit)` - Web scraping
  - `fetchFromUSGS(limit)` - API fallback
  - `calculateThreatLevel(magnitude, depth)` - Threat assessment

### 6.2 earthquakeAlertService.js
- **Purpose**: Filter users and determine who should be alerted
- **Functions**:
  - `processEarthquakeAlerts(earthquake)` - Main filtering logic
  - `isSignificantEarthquake(earthquake)` - Magnitude threshold check
  - Distance calculation and alert rule application

### 6.3 alertTriggerService.js
- **Purpose**: Create alert records and orchestrate notifications
- **Functions**:
  - `triggerEarthquakeAlerts(earthquake)` - Main trigger function
  - `manuallyTriggerAlerts(earthquakeId)` - For testing

### 6.4 notificationService.js
- **Purpose**: Send notifications via SMS, email, and in-app
- **Functions**:
  - `sendBulkNotifications(usersToAlert)` - Main orchestrator
  - SMS sending with fallback logic
  - Email sending
  - In-app alert creation

### 6.5 smsService.js
- **Purpose**: SMS API integration
- **Provider**: SMS API PH
- **Authentication**: API key from environment variable

### 6.6 emailService.js
- **Purpose**: Email notification sending
- **Provider**: Nodemailer (Gmail SMTP)
- **Functions**:
  - `sendEarthquakeAlertEmail(email, alertData)` - Send earthquake alert
  - `sendTestEmail(email)` - For testing

---

## 7. Configuration & Thresholds

### 7.1 Alert Magnitude Thresholds
```javascript
const ALERT_RULES = {
  CRITICAL: { magnitude: 6.0, distance: 300 },  // M ≥ 6.0, within 300km
  HIGH:     { magnitude: 5.0, distance: 300 },  // M 5.0–5.9, within 300km
  MODERATE: { magnitude: 4.0, distance: 200 },  // M 4.0–4.9, within 200km
  LOW:      { magnitude: 3.0, distance: 100 }   // M 3.0–3.9, within 100km
};
```

### 7.2 Cron Schedule
- **Earthquake data**: Every 5 minutes (`*/5 * * * *`)
- **Typhoon data**: Every 30 minutes (`*/30 * * * *`)

### 7.3 Environment Variables
```
PHIVOLCS_URL=https://earthquake.phivolcs.dost.gov.ph/
USGS_API=https://earthquake.usgs.gov/fdsnws/event/1/query
SMS_API_KEY=sk-xxxxxxxxxxxxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 8. Error Handling

### 8.1 Graceful Degradation
- PHIVOLCS unavailable → Fall back to USGS
- SMS fails → Fall back to email
- Email fails → Still create in-app alert
- No users to alert → Log and continue

### 8.2 Logging
- All major steps logged to console
- Error messages include context (user ID, earthquake ID, etc.)
- Failed operations tracked but don't stop the process

---

## 9. Testing

### 9.1 Manual Earthquake Simulation
**Add mock earthquakes:**
```bash
POST /api/earthquakes/mock
```

**Fetch real data:**
```bash
POST /api/earthquakes/update
```

**Clear all earthquakes:**
```bash
DELETE /api/earthquakes/clear
```

### 9.2 Testing Checklist
- [ ] Earthquake data fetches from PHIVOLCS
- [ ] Fallback to USGS works when PHIVOLCS fails
- [ ] Alerts created for users within distance threshold
- [ ] SMS sent when enabled and phone exists
- [ ] Email sent as fallback if SMS fails
- [ ] In-app alerts always created
- [ ] Alert history displays in Dashboard
- [ ] Duplicate alerts prevented
- [ ] Cron job runs every 5 minutes

---

## 10. Future Improvements

- [ ] WebSocket real-time notifications
- [ ] Push notifications (mobile app)
- [ ] Telegram/WhatsApp integration
- [ ] Custom alert thresholds per user
- [ ] Alert history export (CSV/PDF)
- [ ] Earthquake prediction analytics
- [ ] Multi-language support
- [ ] Offline alert caching

---

## 11. API Endpoints

### Earthquake Endpoints
- `GET /api/earthquakes` - List earthquakes (paginated, filterable)
- `GET /api/earthquakes/:id` - Get earthquake details
- `GET /api/earthquakes/stats` - Get earthquake statistics
- `POST /api/earthquakes/update` - Fetch latest data
- `POST /api/earthquakes/mock` - Add mock data for testing
- `DELETE /api/earthquakes/clear` - Clear all earthquakes

### Alert Endpoints
- `GET /api/alerts` - Get user's alerts (paginated, filterable)
- `GET /api/alerts/logs` - Get alert logs with filtering
- `GET /api/alerts/active` - Get active alerts (last 24h)
- `POST /api/alerts` - Create alert (testing)
- `PATCH /api/alerts/:alertId/read` - Mark alert as read
- `DELETE /api/alerts/:alertId` - Delete alert

### User Preferences
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update preferences

---

## 12. Database Collections

### Earthquakes Collection
- Stores raw earthquake data from PHIVOLCS/USGS
- Indexed by: province, timestamp
- Retention: Latest 50 records (cleared on each update)

### Alerts Collection
- Stores alert records for each user
- Indexed by: userId, earthquakeId, sentAt
- Retention: Permanent (for history)

### Users Collection
- Stores user data including notification preferences
- Fields: phoneNumber, notificationPreferences (smsEnabled, inAppEnabled)

### UserPreferences Collection
- Stores detailed user preferences
- Fields: location (province, city), notificationChannels, language

---

## Summary

The earthquake notification system is a multi-stage pipeline that:
1. **Fetches** earthquake data from reliable sources
2. **Enriches** data with threat levels and location info
3. **Stores** earthquakes in database
4. **Filters** users based on location and preferences
5. **Creates** alert records for affected users
6. **Sends** notifications via SMS (primary) → Email (fallback) → In-app (always)
7. **Logs** all activities for monitoring and debugging

This ensures users receive timely, relevant earthquake alerts through their preferred channels while maintaining system reliability through graceful error handling and fallback mechanisms.
