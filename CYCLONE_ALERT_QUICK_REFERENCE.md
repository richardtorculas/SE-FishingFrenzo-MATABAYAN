# Cyclone Alert System - Updated Quick Reference

## Changes Made

### ❌ Removed
- Intensity change trigger (wind speed > 10 km/h)
- Distance-based filtering (200–400 km radius)
- Email fallback notifications
- Distance field in CycloneAlert model

### ✅ Kept
- PAR entry trigger
- Status change trigger
- Approaching 24h trigger
- SMS notifications
- In-app notifications
- Duplicate prevention

---

## Alert Trigger Conditions (Simplified)

```javascript
// 1. Cyclone enters PAR (new cyclone)
if (!previousCyclone) → Alert all SMS-enabled users

// 2. Status changes (e.g., Tropical Storm → Typhoon)
if (previousCyclone.category !== cyclone.category) → Alert all SMS-enabled users

// 3. Cyclone approaching (moving toward PAR)
if (cyclone.movementSpeedKph > 0) → Alert all SMS-enabled users
```

---

## User Filtering (Simplified)

```javascript
// Get users to alert
const users = await User.find({
  'preferences.alertTypes.typhoon': true,      // Cyclone alerts enabled
  'notificationPreferences.smsEnabled': true   // SMS enabled
});

// Requirements:
// - Must have valid phone number
// - No distance filtering
// - All SMS-enabled users get alerts
```

---

## Notification Flow (Simplified)

```
Cyclone Data Updated
    ↓
Check Trigger Conditions
    ↓
Get All SMS-Enabled Users
    ↓
Create CycloneAlert Records
    ↓
Send Notifications:
    ├─ SMS (primary)
    └─ In-app (always)
```

---

## API Endpoints

### Cyclone Data
```
GET    /api/typhoons                    # List active cyclones
GET    /api/typhoons/stats              # Get statistics
POST   /api/typhoons/update             # Fetch & process latest data
POST   /api/typhoons/historical         # Seed historical data
DELETE /api/typhoons/clear              # Clear all cyclones
```

### Cyclone Alerts (Requires Auth)
```
GET    /api/cyclone-alerts              # Get user's alerts (paginated)
GET    /api/cyclone-alerts/active       # Get active alerts (24h)
PATCH  /api/cyclone-alerts/:id/read     # Mark as read
PATCH  /api/cyclone-alerts/:id/dismiss  # Dismiss alert
DELETE /api/cyclone-alerts/:id          # Delete alert
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
}
```

**Removed**: `distance` field

---

## Cron Jobs

```javascript
// Earthquake data - Every 5 minutes
cron.schedule('*/5 * * * *', fetchEarthquakeData)

// Cyclone data - Every 30 minutes
cron.schedule('*/30 * * * *', fetchTyphoonData)
```

---

## Key Functions

### cycloneAlertTrigger.js
```javascript
triggerCycloneAlerts(cyclone)           // Main function
determineTriggerReason(cyclone, prev)   // Check conditions (3 only)
isApproaching24h(cyclone)               // Check if approaching
getSeverity(windKph)                    // Get severity level
```

### cycloneNotificationService.js
```javascript
processAlertNotifications()              // Send all pending
sendNotificationWithFallback(alert, user) // SMS + in-app
formatCycloneAlertMessage(alert)        // Format SMS message
```

---

## Testing Commands

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

## User Preferences (Reused)

```javascript
user.preferences.alertTypes.typhoon     // Enable/disable cyclone alerts
user.notificationPreferences.smsEnabled // Enable/disable SMS
user.phoneNumber                        // For SMS delivery
user.province                           // Optional (not used for filtering)
```

---

## Error Handling

| Error | Handling |
|-------|----------|
| PAGASA unavailable | Use JTWC |
| SMS fails | Still create in-app alert |
| No users to alert | Log and continue |
| Duplicate alert | Skip and continue |
| No phone number | Skip user |

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

## Console Logs

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

## Comparison: Original vs Updated

| Feature | Original | Updated |
|---------|----------|---------|
| **Intensity Trigger** | Yes | ❌ Removed |
| **Distance Filtering** | Yes (200–400 km) | ❌ Removed |
| **Email Fallback** | Yes | ❌ Removed |
| **User Filtering** | Province + distance | SMS enabled only |
| **Alerts Sent** | Selective | All SMS-enabled users |
| **Distance Field** | Tracked | ❌ Removed |
| **Complexity** | High | Low |
| **Coverage** | Limited | Broad |

---

## Benefits of Simplified System

✅ **Simpler Logic**: No complex distance calculations
✅ **Broader Coverage**: All SMS-enabled users get alerts
✅ **Faster Processing**: No distance filtering overhead
✅ **Cleaner Code**: Fewer edge cases to handle
✅ **Better UX**: Users don't miss alerts due to distance
✅ **Easier Maintenance**: Fewer moving parts

---

## Files Modified

| File | Changes |
|------|---------|
| `cycloneAlertTrigger.js` | Removed intensity trigger, distance filtering |
| `CycloneAlert.js` | Removed distance field |
| `cycloneNotificationService.js` | Removed email fallback |
| `distanceCalculator.js` | Removed cyclone functions |

---

## Deployment Checklist

- [ ] All files updated
- [ ] No new dependencies needed
- [ ] Environment variables set (SMS_API_KEY, etc.)
- [ ] Database indexes created
- [ ] Cron jobs configured
- [ ] Routes registered in server.js
- [ ] SMS API credentials verified
- [ ] Test cyclone alert creation
- [ ] Test SMS delivery
- [ ] Test in-app alerts
- [ ] Monitor logs for errors

---

## Quick Start

1. **Fetch cyclone data**:
   ```bash
   POST /api/typhoons/update
   ```

2. **Check alerts created**:
   ```bash
   GET /api/cyclone-alerts
   ```

3. **Verify SMS sent**:
   - Check console logs
   - Check SMS API dashboard

4. **Test alert management**:
   ```bash
   PATCH /api/cyclone-alerts/:id/read
   PATCH /api/cyclone-alerts/:id/dismiss
   ```

---

## Summary

The cyclone alert system is now **simplified and streamlined**:

- ✅ 3 trigger conditions (PAR entry, status change, approaching)
- ✅ All SMS-enabled users get alerts
- ✅ SMS + in-app notifications only
- ✅ No distance calculations
- ✅ Faster processing
- ✅ Broader coverage
- ✅ Easier maintenance
