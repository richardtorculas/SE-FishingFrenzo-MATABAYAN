# Mock Active Cyclone Testing Guide

## Overview

This guide explains how to test the cyclone alert system using a mock cyclone named TOTO. It demonstrates the **PAR Entry** alert condition with TOTO just entering the Philippine Area of Responsibility from the Pacific Ocean.

---

## Quick Start (3 Steps)

### Step 1: Start Backend & Frontend
```bash
# Terminal 1: Backend
cd src/backend
npm run dev

# Terminal 2: Frontend
cd src/frontend
npm start
```

### Step 2: Run Seed Script
```bash
cd src/backend
node src/seeds/seedMockActiveCyclone.js
```

### Step 3: View Results
- Dashboard: http://localhost:3000/typhoon-dashboard
- Alerts: http://localhost:3000/alert-history
- SMS Logs: https://textbee.dev

---

## Testing Flow

```
1. RUN SEED SCRIPT
   └─ node src/seeds/seedMockActiveCyclone.js
        ↓
2. CREATE MOCK CYCLONE
   └─ TOTO (Typhoon, 130 km/h, Pacific Ocean East of Philippines)
        ↓
3. TRIGGER ALERT
   ├─ Check: Is TOTO new? YES
   ├─ Trigger Reason: "par_entry" (just entered PAR)
   └─ Create CycloneAlert record
        ↓
4. GENERATE SMS MESSAGE
   ├─ Format: "🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!"
   └─ Send via TextBee API
        ↓
5. VERIFY DASHBOARD
   ├─ Overview: See TOTO cyclone
   ├─ Charts: See wind speed
   ├─ Map: See cyclone location (outside PAR)
   └─ Stats: See accurate data
        ↓
6. VERIFY ALERT
   ├─ Check database record
   ├─ Verify trigger reason: "par_entry"
   └─ Check SMS delivery status
        ↓
7. VERIFY SMS
   ├─ Check TextBee dashboard
   ├─ Verify exact message with correct location
   └─ Confirm content alignment
```

---

## Alert Trigger Condition: PAR Entry

### What is PAR Entry?
- **Condition:** Cyclone is new (no previous record exists)
- **Trigger Reason:** "par_entry"
- **Meaning:** Cyclone has just entered the Philippine Area of Responsibility

### For TOTO
- ✅ TOTO is new → PAR Entry condition triggered
- ✅ SMS sent with "entered PAR" message
- ✅ Location: Pacific Ocean, East of Philippines (just entered, not yet at Central Luzon)
- ❌ NOT moving (movementSpeedKph = 0) → Approaching condition NOT triggered

---

## Mock Cyclone Data: TOTO

### Cyclone Details
```javascript
{
  name: 'TOTO',
  category: 'Typhoon',
  severity: 'High',
  signal: 3,
  location: 'Pacific Ocean, East of Philippines',
  latitude: 18.5,
  longitude: 135.0,
  windKph: 130,
  movementDirection: 'UNKNOWN',
  movementSpeedKph: 0,  // STATIONARY - no approaching alert
  trajectory: [5 points],
  affectedArea: 'Central Luzon, CALABARZON, Mimaropa'  // Expected to affect
}
```

### Key Points
- **Current Location:** Pacific Ocean, East of Philippines (18.5°N, 135.0°E)
- **Just Entered PAR:** This is the entry point
- **Expected to Move Toward:** Central Luzon in coming days
- **movementSpeedKph: 0** means currently stationary

---

## Exact SMS Message

### Message Format
```
🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!
```

### Message Breakdown
| Part | Value |
|------|-------|
| Emoji | 🌀 |
| Alert Type | MATABAYAN ALERT |
| Category | Typhoon |
| Name | TOTO |
| Trigger Reason | entered PAR |
| Current Location | Pacific Ocean, East of Philippines |
| Wind Speed | 130 km/h |
| Closing | Stay safe! |

### What User Sees
When a user receives the SMS on their phone:
```
🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!
```

---

## Expected Output

When you run the seed script:

```
✓ Connected to MongoDB
✓ Cleared 0 existing active cyclone(s)
✓ Cleared existing cyclone alerts

============================================================
📊 SEEDING MOCK ACTIVE CYCLONE FOR TESTING
============================================================

✅ Created cyclone: TOTO
   Category: Typhoon
   Wind Speed: 130 km/h
   Current Location: Pacific Ocean, East of Philippines
   Coordinates: 18.5°N, 135.0°E
   Signal: 3
   Trajectory Points: 5
   Expected Affected Area: Central Luzon, CALABARZON, Mimaropa
   Movement Speed: 0 km/h (STATIONARY)
   Alerts Created: 1
   Alerts Skipped: 0

============================================================
📱 PROCESSING NOTIFICATIONS (SMS)
============================================================

✅ Notifications Processed: 1
   Successful: 1
   Failed: 0

============================================================
✅ MOCK CYCLONE SEEDING COMPLETE
============================================================

Summary:
  • Cyclones Created: 1
  • Alerts Triggered: 1
  • SMS Notifications Sent: 1

Alert Trigger Condition:
  ✅ PAR Entry - TOTO just entered PAR
  Current Location: Pacific Ocean, East of Philippines
  SMS Message: "🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!"
```

---

## Verification Steps

### 1. Dashboard Overview Tab
Navigate to: http://localhost:3000/typhoon-dashboard

**Verify:**
- ✅ 1 cyclone card visible
- ✅ TOTO: Typhoon badge
- ✅ Wind Speed: 130 km/h
- ✅ Location: Pacific Ocean, East of Philippines
- ✅ Signal: PAGASA Signal No. 3
- ✅ Stats: 1 cyclone, 130 km/h max wind

### 2. Dashboard Charts Tab
Click "Charts" tab

**Verify:**
- ✅ Wind Speed Comparison: 1 bar (130 km/h)
- ✅ Category Distribution: Typhoon (1)

### 3. Dashboard Map Tab
Click "Map" tab

**Verify:**
- ✅ Windy map loads
- ✅ Map centered on TOTO (18.5°N, 135.0°E)
- ✅ Cyclone location is outside PAR (Pacific Ocean)
- ✅ Cyclone info bar shows TOTO

### 4. Alert History
Navigate to: http://localhost:3000/alert-history

**Verify:**
- ✅ 1 alert created
- ✅ Trigger reason: "par_entry"
- ✅ SMS delivery status: "sent"

### 5. SMS Message
Go to: https://textbee.dev → Message Logs

**Verify SMS Message:**
```
🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!
```

**Check:**
- [ ] Emoji: 🌀 ✓
- [ ] Name: TOTO ✓
- [ ] Category: Typhoon ✓
- [ ] Trigger: entered PAR ✓
- [ ] Location: Pacific Ocean, East of Philippines ✓
- [ ] Wind: 130 km/h ✓
- [ ] Closing: Stay safe! ✓

---

## Why Only PAR Entry?

### TOTO Configuration
```javascript
movementSpeedKph: 0  // STATIONARY
```

### Alert Conditions Check
1. **PAR Entry** - Is TOTO new? → YES ✅ TRIGGERS
2. **Status Change** - Did category change? → NO ❌
3. **Approaching** - Is movementSpeedKph > 0? → NO ❌

**Result:** Only PAR Entry condition triggers → Only 1 SMS sent

---

## Troubleshooting

### Cyclone not appearing on dashboard
```bash
# Check backend is running
cd src/backend && npm run dev

# Refresh browser (F5)

# Check browser console for errors (F12)
```

### SMS not sent
```bash
# Check test user has phone number
mongosh
db.users.findOne({ email: "test@example.com" })

# Check user has SMS enabled
db.users.findOne({ "notificationPreferences.smsEnabled": true })
```

### Alert not created
```bash
# Check user has typhoon alerts enabled
mongosh
db.users.findOne({ "preferences.alertTypes.typhoon": true })

# Check alert in database
db.cyclonealerts.find()
```

---

## Clean Up

To remove mock cyclone data:

```bash
mongosh

# Delete mock cyclone
db.typhoons.deleteMany({ isHistorical: false })

# Delete related alert
db.cyclonealerts.deleteMany({})

exit
```

---

## Testing Checklist

### Pre-Test
- [ ] Backend running
- [ ] Frontend running
- [ ] Test user created with phone number
- [ ] Test user has typhoon alerts enabled
- [ ] Test user has SMS enabled

### During Test
- [ ] Seed script runs successfully
- [ ] 1 cyclone created (TOTO)
- [ ] Location: Pacific Ocean, East of Philippines
- [ ] 1 alert triggered (par_entry)
- [ ] 1 SMS sent
- [ ] Dashboard displays TOTO

### Post-Test
- [ ] SMS message includes correct location
- [ ] Location matches current position (not destination)
- [ ] Message content matches exactly
- [ ] Alert trigger reason is "par_entry"
- [ ] No console errors
- [ ] Clean up test data

---

## Success Criteria

✅ **Test Passes If:**
- TOTO cyclone appears on dashboard
- Location shows: Pacific Ocean, East of Philippines
- 1 alert created with trigger reason "par_entry"
- 1 SMS sent with exact message
- Message: "🌀 MATABAYAN ALERT: Typhoon TOTO (Typhoon) has entered PAR. Location: Pacific Ocean, East of Philippines. Wind: 130 km/h. Stay safe!"
- Location in message matches current position
- All stats are accurate
- No console errors

---

## Summary

This testing setup demonstrates:

1. ✅ How cyclone data is created
2. ✅ How PAR Entry alert condition works
3. ✅ How SMS messages are generated with current location
4. ✅ Exact message format users receive
5. ✅ Dashboard display of cyclone data
6. ✅ Alert trigger logic
7. ✅ Complete system integration

**Ready to test! 🚀**
