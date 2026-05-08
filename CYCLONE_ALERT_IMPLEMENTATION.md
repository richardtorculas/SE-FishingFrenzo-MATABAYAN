# Cyclone Alert System - Updated Implementation Summary

## Overview
The cyclone alert system has been simplified to send alerts to all users with notifications enabled, without distance-based filtering or email fallback.

---

## What Was Changed

### 1. Alert Trigger Conditions (Simplified)
**Removed**: Intensity change trigger (wind speed > 10 km/h)

**Kept**:
- ✅ Cyclone enters PAR (new cyclone)
- ✅ Status changes (e.g., Tropical Storm → Typhoon)
- ✅ Cyclone approaching within 24 hours

### 2. Alert Radius (Removed)
**Removed**: Variable alert radius based on wind speed
- No more distance-based filtering
- Alerts sent to ALL users with notifications enabled
- Removed: 200–400 km radius calculations

### 3. Notification Channels (Simplified)
**Removed**: Email fallback

**Kept**:
- ✅ SMS (primary notification)
- ✅ In-app (always created)

### 4. User Filtering (Simplified)
**Old**: Filter by province + distance radius
**New**: Filter by notification preferences only
- `preferences.alertTypes.typhoon: true` (cyclone alerts enabled)
- `notificationPreferences.smsEnabled: true` (SMS enabled)
- Must have valid phone number

---

## Updated Files

| File | Changes |
|------|---------|
| `cycloneAlertTrigger.js` | Removed intensity change trigger, removed distance filtering |
| `CycloneAlert.js` | Removed distance field |
| `cycloneNotificationService.js` | Removed email fallback, SMS + in-app only |
| `distanceCalculator.js` | Removed cyclone alert radius functions |

---

## Alert Trigger Flow (Updated)

```
1. Cron Job (Every 30 minutes)
   ↓
2. Fetch cyclone data from PAGASA/JTWC
   ↓
3. Save to database (with duplicate detection)
   ↓
4. Check trigger conditions:
   - Is this a new cyclone? (PAR entry)
   - Did the category change? (status change)
   - Is it approaching? (approaching 24h)
   ↓
5. Get all users with:
   - preferences.alertTypes.typhoon = true
   - notificationPreferences.smsEnabled = true
   - Valid phone number
   ↓
6. Create CycloneAlert records for each user
   ↓
7. Send notifications:
   - SMS (primary)
   - In-app (always)
```

---

## Alert Trigger Conditions (Updated)

```javascript
// Cyclone enters PAR (new cyclone)
if (!previousCyclone) → Alert

// Status changes (e.g., Tropical Storm → Typhoon)
if (previousCyclone.category !== cyclone.category) → Alert

// Cyclone is approaching (moving toward PAR)
if (cyclone.movementSpeedKph > 0) → Alert
```

---

## User Filtering (Updated)

```javascript
// Get users to alert
const users = await User.find({
  'preferences.alertTypes.typhoon': true,      // Cyclone alerts enabled
  'notificationPreferences.smsEnabled': true   // SMS enabled
});

// For each user:
// - Must have valid phone number
// - Create alert
// - Send SMS
// - Create in-app notification
```

---

## SMS Message Format

```
🌀 MATABAYAN ALERT: Typhoon PAOLO (Typhoon) has status changed. 
Wind: 130 km/h. Stay safe!
```

---

## CycloneAlert Model (Updated)

```javascript
{
  _id: ObjectId,
  cycloneId: String,              // Reference to cyclone
  userId: ObjectId,               // User receiving alert
  cycloneName: String,            // e.g., "PAOLO"
  category: String,               // e.g., "Typhoon"
  severity: String,               // "critical", "high", "medium", "low"
  windKph: Number,                // e.g., 130
  location: String,               // e.g., "Central Luzon"
  cycloneTimestamp: Date,         // When cyclone data was recorded
  userProvince: String,           // User's province (optional)
  triggerReason: String,          // "par_entry", "status_change", "approaching_24h"
  notificationSent: Boolean,      // In-app notification sent
  smsSent: Boolean,               // SMS sent
  smsDeliveryStatus: String,      // "pending", "sent", "failed"
  read: Boolean,                  // User read the alert
  readAt: Date,                   // When user read it
  dismissed: Boolean,             // User dismissed the alert
  dismissedAt: Date,              // When user dismissed it
  notificationSentAt: Date,       // When notification was sent
  createdAt: Date,                // When alert was created
  expiresAt: Date,                // Auto-delete after 30 days
  updatedAt: Date
}
```

**Removed Fields**:
- `distance` - No longer needed (no distance-based filtering)

---

## Notification Flow (Updated)

```
Cyclone Data Updated
    ↓
Check Trigger Conditions
    ↓
Get Users with SMS enabled
    ↓
Create CycloneAlert Records
    ↓
Send Notifications:
    ├─ SMS (primary)
    └─ In-app (always)
```

---

## Error Handling (Updated)

| Error | Handling |
|-------|----------|
| PAGASA unavailable | Use JTWC |
| SMS fails | Still create in-app alert |
| No users to alert | Log and continue |
| Duplicate alert | Skip and continue |
| No phone number | Skip user |

---

## API Endpoints (Unchanged)

```
GET    /api/cyclone-alerts              # Get user's alerts (paginated)
GET    /api/cyclone-alerts/active       # Get active alerts (24h)
PATCH  /api/cyclone-alerts/:id/read     # Mark as read
PATCH  /api/cyclone-alerts/:id/dismiss  # Dismiss alert
DELETE /api/cyclone-alerts/:id          # Delete alert
```

---

## Response Example

### POST /api/typhoons/update
```json
{
  "status": "success",
  "message": "PAGASA data updated — 1 new, 2 updated, 0 duplicate(s) skipped",
  "newCount": 1,
  "updatedCount": 2,
  "skippedCount": 0,
  "alerts": {
    "created": 150,
    "skipped": 0
  },
  "notifications": {
    "processed": 150,
    "successful": 148,
    "failed": 2
  }
}
```

---

## Key Differences from Original

| Aspect | Original | Updated |
|--------|----------|---------|
| **Intensity Trigger** | Yes (> 10 km/h) | ❌ Removed |
| **Distance Filtering** | Yes (200–400 km) | ❌ Removed |
| **Alert Radius** | Variable | ❌ Removed |
| **Email Fallback** | Yes | ❌ Removed |
| **User Filtering** | Province + distance | SMS enabled only |
| **Alerts Sent** | Selective | All SMS-enabled users |
| **Distance Field** | Tracked | ❌ Removed |

---

## Simplified Trigger Conditions

### 1. PAR Entry
- New cyclone detected
- No previous record exists
- Alert all SMS-enabled users

### 2. Status Change
- Cyclone category changed
- Example: Tropical Storm → Typhoon
- Alert all SMS-enabled users

### 3. Approaching 24h
- Cyclone moving toward PAR
- Movement speed > 0 km/h
- Alert all SMS-enabled users

---

## Testing

### Fetch Latest Cyclone Data
```bash
curl -X POST http://localhost:5000/api/typhoons/update
```

### Get User's Cyclone Alerts
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/cyclone-alerts
```

### Mark Alert as Read
```bash
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/cyclone-alerts/<alertId>/read
```

---

## Console Logs (Updated)

```
🌀 Processing cyclone PAOLO: Central Luzon
Trigger reason: status_change
Found 150 users with cyclone alerts enabled
✓ Alert created for user123
✓ Alert created for user456
Result: 150 created, 0 skipped

✓ SMS sent to +639123456789
✓ In-app alert created
```

---

## Summary of Changes

✅ **Removed**:
- Intensity change trigger
- Distance-based filtering
- Variable alert radius (200–400 km)
- Email fallback
- Distance field in CycloneAlert model

✅ **Kept**:
- PAR entry trigger
- Status change trigger
- Approaching 24h trigger
- SMS notifications
- In-app notifications
- Duplicate prevention
- Graceful error handling

✅ **Result**:
- Simpler implementation
- All SMS-enabled users get alerts
- Faster alert processing
- No distance calculations needed
- Cleaner notification flow

---

## Benefits

1. **Simpler Logic**: No complex distance calculations
2. **Broader Coverage**: All SMS-enabled users get alerts
3. **Faster Processing**: No distance filtering overhead
4. **Cleaner Code**: Fewer edge cases to handle
5. **Better UX**: Users don't miss alerts due to distance
6. **Easier Maintenance**: Fewer moving parts

---

## Next Steps

1. Test the updated system
2. Verify alerts are sent to all SMS-enabled users
3. Monitor SMS delivery status
4. Check console logs for any errors
5. Verify in-app alerts are created
6. Test alert read/dismiss functionality
