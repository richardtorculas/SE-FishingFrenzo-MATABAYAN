# Notification Process for Cyclones

## Overview
This document describes the complete flow of how cyclone data is fetched, processed, and notifications are sent to users in the MataBayan system.

---

## 1. Data Fetching Phase

### 1.1 Cyclone Data Sources
The system fetches cyclone data from two sources in priority order:

**Primary Source: PAGASA**
- URL: `https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin`
- Method: Web scraping using Cheerio
- Frequency: Every 30 minutes (cron job)
- Data extracted: Name, category, wind speed, latitude, longitude, location, movement direction, timestamp

**Fallback Source: JTWC**
- URL: `https://www.metoc.navy.mil/jtwc/products/abpwweb.txt`
- Method: Text parsing
- Used when: PAGASA is unavailable or returns 0 records

### 1.2 Data Fetching Flow
```
┌─────────────────────────────────────────┐
│  Cron Job (Every 30 minutes)            │
│  POST /api/typhoons/update              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  fetchTyphoonData()                     │
│  (pagasaService.js)                     │
└────────────┬────────────────────────────┘
             │
             ├─► Try PAGASA scraping
             │   ├─ Success? → Return data
             │   └─ Fail? → Continue
             │
             └─► Try JTWC parsing
                 └─ Return data (or empty)
```

### 1.3 Data Processing
Each cyclone record is enriched with:
- **Category**: Classified based on wind speed
  - Super Typhoon: ≥ 185 km/h
  - Typhoon: 150–184 km/h
  - Severe Tropical Storm: 118–149 km/h
  - Tropical Storm: 89–117 km/h
  - Tropical Depression: 62–88 km/h
  - Low Pressure Area: < 62 km/h

- **Severity**: Mapped from category
  - Critical: Super Typhoon, Typhoon (≥ 150 km/h)
  - High: Severe Tropical Storm (118–149 km/h)
  - Moderate: Tropical Storm (89–117 km/h)
  - Low: Tropical Depression, Low Pressure Area (< 89 km/h)

- **Trajectory**: Historical path of the cyclone
- **Metadata**: Wind speed, movement direction, affected areas

---

## 2. Database Storage Phase

### 2.1 Typhoon Model
```javascript
{
  name: String,                    // Cyclone name (e.g., "PAOLO")
  category: String,                // Category classification
  severity: String,                // "Critical", "High", "Moderate", "Low"
  signal: Number,                  // PAGASA Signal No. (0-5)
  location: String,                // Current location description
  province: String,                // "Philippines"
  latitude: Number,                // Current position
  longitude: Number,               // Current position
  windKph: Number,                 // Maximum sustained wind speed
  movementDirection: String,       // Direction of movement
  movementSpeedKph: Number,        // Speed of movement
  trajectory: Array,               // Historical positions
  description: String,             // Human-readable description
  source: String,                  // "PAGASA" or "JTWC"
  affectedArea: String,            // Affected regions
  isHistorical: Boolean,           // Historical vs. active
  parEntryDate: String,            // When entered PAR
  parExitDate: String,             // When exited PAR
  stormKey: String,                // Unique identifier (name + position + hour)
  timestamp: Date                  // When data was recorded
}
```

### 2.2 Storage Process
1. Check for duplicate by stormKey (same storm, same position, same hour)
2. If duplicate exists → Skip
3. If same storm name with different position → Update trajectory and current position
4. If new storm → Insert new record
5. Proceed to alert triggering with saved cyclone object

---

## 3. Alert Triggering Phase

### 3.1 Trigger Conditions
Alerts are created when ANY of these conditions are met:

1. **PAR Entry**: Cyclone enters Philippine Area of Responsibility (new cyclone)
2. **Status Change**: Cyclone category changes (e.g., Tropical Storm → Typhoon)
3. **Intensity Change**: Wind speed increases by > 10 km/h
4. **Approaching 24h**: Cyclone is moving toward PAR (movementSpeedKph > 0)

### 3.2 User Filtering
For each significant cyclone:

1. **Fetch all users** with cyclone alerts enabled (`preferences.alertTypes.typhoon: true`)
2. **Get user location**: Province from user preferences
3. **Calculate distance**: Haversine formula from cyclone center to user's province center
4. **Apply alert rules** based on wind speed and distance:
   - **Critical (≥ 150 km/h)**: Alert users within 400 km
   - **High (118–149 km/h)**: Alert users within 350 km
   - **Moderate (89–117 km/h)**: Alert users within 300 km
   - **Low (62–88 km/h)**: Alert users within 250 km
   - **Very Low (< 62 km/h)**: Alert users within 200 km

### 3.3 Alert Creation
For each user to alert, create a CycloneAlert record:
```javascript
{
  cycloneId: String,               // Reference to saved cyclone
  userId: ObjectId,                // User receiving alert
  cycloneName: String,             // Cyclone name
  category: String,                // Category
  severity: String,                // Severity level
  windKph: Number,                 // Wind speed
  location: String,                // Cyclone location
  distance: Number,                // Distance from user to cyclone (km)
  userProvince: String,            // User's province
  triggerReason: String,           // "par_entry", "status_change", "intensity_change", "approaching_24h"
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
- Provider: SMS API PH (TextBee)
- Condition: Sent if user has SMS enabled AND phone number exists
- Success: Alert marked as sent via SMS
- Failure: Proceed to fallback

**Channel 2: Email (Fallback)**
- Provider: Nodemailer (Gmail SMTP)
- Condition: Sent only if SMS fails
- Format: HTML email with cyclone details and safety recommendations
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
🌀 MATABAYAN ALERT: Typhoon PAOLO (Typhoon) has intensified. 
Wind: 130 km/h. Distance: 45km. Stay safe!
```

### 4.4 Email Format
- Subject: "🌀 Cyclone Alert - [Cyclone Name] [Category] in [Location]"
- Content: HTML email with:
  - Cyclone severity badge
  - Name, category, wind speed, location, distance
  - User's province
  - Cyclone coordinates
  - Trigger reason (entered PAR, status changed, intensified, approaching)
  - Safety recommendations
  - Link to PAGASA website
  - MataBayan app information

---

## 5. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    CYCLONE NOTIFICATION SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

STEP 1: DATA FETCHING
┌──────────────────┐
│ PAGASA/JTWC      │
│ Cyclone Data     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Enrich with category & severity      │
│ (pagasaService.js)                   │
└────────┬─────────────────────────────┘

STEP 2: DATABASE STORAGE
         │
         ▼
┌──────────────────────────────────────┐
│ Save to Typhoon collection           │
│ (Get MongoDB _id)                    │
└────────┬─────────────────────────────┘

STEP 3: ALERT TRIGGERING
         │
         ▼
┌──────────────────────────────────────┐
│ Check trigger conditions             │
│ (cycloneAlertTrigger.js)             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Fetch users with alerts enabled      │
│ (cycloneAlertTrigger.js)             │
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
│ (CycloneAlert model)                 │
└────────┬─────────────────────────────┘

STEP 4: NOTIFICATION SENDING
         │
         ▼
┌──────────────────────────────────────┐
│ Send bulk notifications              │
│ (cycloneNotificationService.js)      │
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

### 6.1 pagasaService.js
- **Purpose**: Fetch and parse cyclone data
- **Functions**:
  - `fetchTyphoonData()` - Main export, tries PAGASA then JTWC
  - `scrapePagasa()` - Web scraping
  - `fetchFromJTWC()` - Text parsing fallback
  - `classifyCategory(windKph)` - Category classification

### 6.2 cycloneAlertTrigger.js
- **Purpose**: Filter users and determine who should be alerted
- **Functions**:
  - `triggerCycloneAlerts(cyclone)` - Main filtering logic
  - `determineTriggerReason(cyclone, previousCyclone)` - Check alert conditions
  - `isApproaching24h(cyclone)` - Check if approaching PAR

### 6.3 distanceCalculator.js
- **Purpose**: Calculate distances and alert radii
- **Functions**:
  - `calculateHaversineDistance(lat1, lon1, lat2, lon2)` - Distance calculation
  - `getCycloneAlertRadius(windKph)` - Variable radius based on intensity
  - `isUserWithinCycloneAlertRadius(province, lat, lng, windKph)` - Proximity check

### 6.4 cycloneNotificationService.js
- **Purpose**: Send notifications via SMS, email, and in-app
- **Functions**:
  - `processAlertNotifications()` - Main orchestrator
  - `sendSMS(phoneNumber, message)` - SMS sending
  - `sendInAppNotification(alertId)` - In-app alert creation
  - `formatCycloneAlertMessage(alert)` - Message formatting

---

## 7. Configuration & Thresholds

### 7.1 Alert Distance Thresholds
```javascript
const CYCLONE_ALERT_RULES = {
  CRITICAL:  { windKph: 150, distance: 400 },  // ≥ 150 km/h, within 400km
  HIGH:      { windKph: 118, distance: 350 },  // 118–149 km/h, within 350km
  MODERATE:  { windKph: 89,  distance: 300 },  // 89–117 km/h, within 300km
  LOW:       { windKph: 62,  distance: 250 },  // 62–88 km/h, within 250km
  VERY_LOW:  { windKph: 0,   distance: 200 }   // < 62 km/h, within 200km
};
```

### 7.2 Cron Schedule
- **Cyclone data**: Every 30 minutes (`*/30 * * * *`)
- **Earthquake data**: Every 5 minutes (`*/5 * * * *`)

### 7.3 Environment Variables
```
PAGASA_URL=https://bagong.pagasa.dost.gov.ph/tropical-cyclone/weather-bulletin
JTWC_URL=https://www.metoc.navy.mil/jtwc/products/abpwweb.txt
SMS_API_KEY=sk-xxxxxxxxxxxxx
TEXTBEE_DEVICE_ID=device-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## 8. Error Handling

### 8.1 Graceful Degradation
- PAGASA unavailable → Fall back to JTWC
- SMS fails → Fall back to email
- Email fails → Still create in-app alert
- No users to alert → Log and continue
- Duplicate detection → Skip and continue

### 8.2 Logging
- All major steps logged to console
- Error messages include context (user ID, cyclone ID, etc.)
- Failed operations tracked but don't stop the process

---

## 9. Testing

### 9.1 Manual Cyclone Simulation
**Fetch real data:**
```bash
POST /api/typhoons/update
```

**Seed historical data:**
```bash
POST /api/typhoons/historical
```

**Clear all cyclones:**
```bash
DELETE /api/typhoons/clear
```

### 9.2 Testing Checklist
- [ ] Cyclone data fetches from PAGASA
- [ ] Fallback to JTWC works when PAGASA fails
- [ ] Alerts created for users within distance threshold
- [ ] SMS sent when enabled and phone exists
- [ ] Email sent as fallback if SMS fails
- [ ] In-app alerts always created
- [ ] Alert history displays in Dashboard
- [ ] Duplicate alerts prevented
- [ ] Cron job runs every 30 minutes
- [ ] Status changes trigger alerts
- [ ] Intensity changes trigger alerts
- [ ] PAR entry triggers alerts

---

## 10. API Endpoints

### Cyclone Endpoints
- `GET /api/typhoons` - List active cyclones
- `GET /api/typhoons/stats` - Get cyclone statistics
- `POST /api/typhoons/update` - Fetch latest data
- `POST /api/typhoons/historical` - Seed historical data
- `DELETE /api/typhoons/clear` - Clear all cyclones

### Cyclone Alert Endpoints
- `GET /api/cyclone-alerts` - Get user's cyclone alerts (paginated)
- `GET /api/cyclone-alerts/active` - Get active alerts (last 24h)
- `PATCH /api/cyclone-alerts/:alertId/read` - Mark alert as read
- `PATCH /api/cyclone-alerts/:alertId/dismiss` - Dismiss alert
- `DELETE /api/cyclone-alerts/:alertId` - Delete alert

---

## 11. Database Collections

### Typhoons Collection
- Stores cyclone data from PAGASA/JTWC
- Indexed by: name, timestamp, severity
- Retention: Latest 10 records (historical + active)

### CycloneAlerts Collection
- Stores alert records for each user
- Indexed by: userId, cycloneId, createdAt
- Retention: Permanent (for history)
- Auto-delete: After 30 days

### Users Collection
- Stores user data including notification preferences
- Fields: phoneNumber, notificationPreferences (smsEnabled, inAppEnabled)
- Fields: preferences.alertTypes.typhoon (enabled/disabled)

---

## 12. Summary

The cyclone notification system is a multi-stage pipeline that:
1. **Fetches** cyclone data from reliable sources (PAGASA/JTWC)
2. **Enriches** data with category, severity, and trajectory info
3. **Stores** cyclones in database with duplicate detection
4. **Detects** trigger conditions (PAR entry, status change, intensity change, approaching)
5. **Filters** users based on location and preferences
6. **Creates** alert records for affected users
7. **Sends** notifications via SMS (primary) → Email (fallback) → In-app (always)
8. **Logs** all activities for monitoring and debugging

This ensures users receive timely, relevant cyclone alerts through their preferred channels while maintaining system reliability through graceful error handling and fallback mechanisms.

---

## 13. Differences from Earthquake Alerts

| Aspect | Earthquake | Cyclone |
|--------|-----------|---------|
| **Trigger** | Magnitude threshold (≥ 3.0) | Multiple conditions (PAR entry, status change, intensity change, approaching) |
| **Distance Radius** | Fixed 100 km | Variable (200–400 km based on wind speed) |
| **Data Source** | PHIVOLCS/USGS | PAGASA/JTWC |
| **Update Frequency** | Every 5 minutes | Every 30 minutes |
| **Alert Reason** | Magnitude-based | Trigger reason-based |
| **Trajectory** | Not tracked | Tracked (historical path) |
| **Category** | Severity levels | Wind-based categories |

---

## 14. Future Improvements

- [ ] WebSocket real-time notifications
- [ ] Push notifications (mobile app)
- [ ] Telegram/WhatsApp integration
- [ ] Custom alert thresholds per user
- [ ] Alert history export (CSV/PDF)
- [ ] Cyclone prediction analytics
- [ ] Multi-language support
- [ ] Offline alert caching
- [ ] Cyclone impact assessment
- [ ] Evacuation route recommendations
