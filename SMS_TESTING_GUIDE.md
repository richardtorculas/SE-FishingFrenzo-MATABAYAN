# SMS Testing Guide - Earthquakes & Typhoons

## Overview
This guide explains how to test SMS notifications for both earthquake and typhoon alerts using the provided test scripts.

---

## Test Scripts

### 1. Earthquake SMS Test
**File**: `test-sms.js`
- Tests earthquake alert SMS messages
- Verifies SMS API connectivity
- Validates message delivery

### 2. Typhoon SMS Test
**File**: `test-typhoon-sms.js`
- Tests typhoon/cyclone alert SMS messages
- Tests 3 different trigger scenarios
- Verifies SMS API connectivity

---

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file has:
```
SMS_API_KEY=sk-xxxxxxxxxxxxx
TEXTBEE_DEVICE_ID=your-device-id
```

### 2. Dependencies
```bash
npm install axios dotenv
```

### 3. TextBee Account
- Create account at https://textbee.dev
- Get your Device ID from dashboard
- Get your API Key from dashboard

---

## Running Tests

### Test Earthquake SMS
```bash
node test-sms.js
```

**Expected Output**:
```
=== TextBee SMS API Test ===

✓ SMS_API_KEY found
✓ TEXTBEE_DEVICE_ID found
API URL: https://api.textbee.dev/api/v1/gateway/devices/your-device-id/send-sms

Testing SMS to: +639928112266
Message: 🚨 MataBayan ALERT: Magnitude 6.5 detected 45km away in Albay. Depth: 15km. Stay safe!

Sending SMS via TextBee...
✓ SMS sent successfully!

Response: {
  "id": "msg_123456",
  "status": "sent",
  ...
}

Status: 200
Message ID: msg_123456
Delivery Status: sent
```

### Test Typhoon SMS
```bash
node test-typhoon-sms.js
```

**Expected Output**:
```
=== TextBee SMS API Test - Typhoon Alerts ===

✓ SMS_API_KEY found
✓ TEXTBEE_DEVICE_ID found
API URL: https://api.textbee.dev/api/v1/gateway/devices/your-device-id/send-sms

Found 3 test cases

--- Test Case 1: PAR Entry Alert ---
Phone: +639928112266
Message: 🌀 MATABAYAN ALERT: Typhoon PAOLO (Typhoon) has entered PAR. Wind: 130 km/h. Stay safe!

Sending SMS via TextBee...
✓ SMS sent successfully!
Status: 200
Message ID: msg_123456
Delivery Status: sent

Waiting 2 seconds before next test...

--- Test Case 2: Status Change Alert ---
...

--- Test Case 3: Approaching Alert ---
...

=== Test Summary ===
✓ All test cases completed
Check the messages above for any failures
```

---

## Test Cases - Typhoon SMS

### 1. PAR Entry Alert
**Trigger**: New cyclone enters Philippine Area of Responsibility
```
🌀 MATABAYAN ALERT: Typhoon PAOLO (Typhoon) has entered PAR. Wind: 130 km/h. Stay safe!
```

### 2. Status Change Alert
**Trigger**: Cyclone category changes (e.g., Tropical Storm → Typhoon)
```
🌀 MATABAYAN ALERT: Typhoon PAOLO (Typhoon) has status changed. Wind: 130 km/h. Stay safe!
```

### 3. Approaching Alert
**Trigger**: Cyclone is moving toward PAR
```
🌀 MATABAYAN ALERT: Typhoon PAOLO (Typhoon) has approaching. Wind: 130 km/h. Stay safe!
```

---

## Troubleshooting

### Error: SMS_API_KEY not configured
**Solution**:
1. Check `.env` file exists in `src/backend/` directory
2. Verify `SMS_API_KEY` is set
3. Verify it's not set to `'your-api-key'`

### Error: TEXTBEE_DEVICE_ID not configured
**Solution**:
1. Log in to TextBee dashboard
2. Find your Device ID
3. Add to `.env`: `TEXTBEE_DEVICE_ID=your-device-id`

### Error: Invalid API Key
**Solution**:
1. Verify API key is correct in TextBee dashboard
2. Check for extra spaces or quotes
3. Regenerate API key if needed

### Error: Device not found
**Solution**:
1. Verify Device ID is correct
2. Check device is active in TextBee dashboard
3. Verify device has SMS capability

### Error: Invalid phone number
**Solution**:
1. Use Philippine format: `+639XXXXXXXXX`
2. Verify phone number is valid
3. Check phone number is not blocked

### Error: Rate limiting
**Solution**:
1. Wait between requests (script does this automatically)
2. Check TextBee rate limits
3. Reduce number of test cases

---

## Integration Testing

### Test with Real Cyclone Data

#### 1. Fetch Cyclone Data
```bash
curl -X POST http://localhost:5000/api/typhoons/update
```

#### 2. Check Alerts Created
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/cyclone-alerts
```

#### 3. Verify SMS Sent
- Check TextBee dashboard for message logs
- Check user's phone for received SMS
- Check console logs for delivery status

---

## Performance Testing

### Test SMS Delivery Speed
```bash
# Time the SMS sending
time node test-typhoon-sms.js
```

**Expected**: < 5 seconds for 3 messages

### Test Bulk SMS
Create a modified test script:
```javascript
// Send 100 SMS messages
for (let i = 0; i < 100; i++) {
  await sendSMS(phoneNumber, message);
}
```

**Expected**: < 30 seconds for 100 messages

---

## Monitoring SMS Delivery

### TextBee Dashboard
1. Log in to https://textbee.dev
2. Go to Message Logs
3. Filter by date/time
4. Check delivery status

### Console Logs
```bash
# Watch backend logs
npm run dev
```

Look for:
```
✓ SMS sent to +639928112266
✓ In-app alert created
```

### Database Logs
```javascript
// Check SMS delivery status in database
db.cyclonealerts.find({ smsSent: true })
```

---

## Message Format Validation

### Earthquake Alert
```
🚨 MATABAYAN ALERT: Magnitude X.X detected XXkm away in [Location]. Depth: XXkm. Stay safe!
```

### Typhoon Alert
```
🌀 MATABAYAN ALERT: Typhoon [NAME] ([CATEGORY]) has [REASON]. Wind: XXX km/h. Stay safe!
```

### Validation Checklist
- [ ] Emoji present
- [ ] "MATABAYAN ALERT" text
- [ ] Relevant details included
- [ ] "Stay safe!" closing
- [ ] Message length < 160 characters (SMS standard)

---

## Automated Testing

### Create Test Suite
```bash
# Create test directory
mkdir tests/sms

# Create test files
touch tests/sms/earthquake.test.js
touch tests/sms/typhoon.test.js
```

### Run Tests
```bash
npm test -- tests/sms/
```

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: SMS Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node test-sms.js
      - run: node test-typhoon-sms.js
```

---

## Best Practices

### 1. Test Regularly
- Run tests after code changes
- Run tests before deployment
- Run tests weekly in production

### 2. Monitor Delivery
- Check SMS delivery rate
- Monitor failed messages
- Track delivery times

### 3. Test Different Scenarios
- Test with valid phone numbers
- Test with invalid phone numbers
- Test with international numbers
- Test with blocked numbers

### 4. Performance Testing
- Test with single message
- Test with bulk messages
- Test during peak hours
- Test with API rate limits

### 5. Error Handling
- Test with API down
- Test with invalid credentials
- Test with network timeout
- Test with database errors

---

## Debugging Tips

### Enable Verbose Logging
```javascript
// Add to test script
console.log('Request:', JSON.stringify(requestData, null, 2));
console.log('Response:', JSON.stringify(response.data, null, 2));
```

### Check Network
```bash
# Test API connectivity
curl -X POST https://api.textbee.dev/api/v1/gateway/devices/test/send-sms \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"recipients": ["+639928112266"], "message": "Test"}'
```

### Check Environment
```bash
# Verify environment variables
echo $SMS_API_KEY
echo $TEXTBEE_DEVICE_ID
```

---

## Success Criteria

✅ **SMS Test Passes If**:
- API returns status 200
- Message ID is returned
- Delivery status is "sent"
- No errors in console
- SMS received on phone

✅ **Typhoon SMS Test Passes If**:
- All 3 test cases succeed
- Each message is delivered
- No rate limiting errors
- Correct message format
- SMS received on phone

---

## Support

**For Issues**:
1. Check error message
2. Review troubleshooting section
3. Check TextBee dashboard
4. Verify environment variables
5. Contact support

**For Questions**:
1. Review this guide
2. Check test script comments
3. Review SMS service code
4. Contact development team

---

## Next Steps

1. **Run Earthquake Test**
   ```bash
   node test-sms.js
   ```

2. **Run Typhoon Test**
   ```bash
   node test-typhoon-sms.js
   ```

3. **Verify SMS Received**
   - Check phone for messages
   - Check TextBee dashboard

4. **Monitor Production**
   - Watch console logs
   - Check SMS delivery rate
   - Monitor for errors

---

## Document Version

- **Version**: 1.0
- **Date**: 2026-05-15
- **Status**: Ready for Testing
- **Last Updated**: [Current Date]

---

**Ready to test SMS notifications! ✅**
