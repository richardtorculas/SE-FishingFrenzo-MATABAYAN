/**
 * SMS Testing Script - TextBee API
 * Tests SMS API connectivity and message delivery
 */

require('dotenv').config({ path: './src/backend/.env' });
const axios = require('axios');

const SMS_API_BASE = 'https://api.textbee.dev/api/v1/gateway/devices';
const SMS_API_KEY = process.env.SMS_API_KEY;
const DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

async function testSMS() {
  console.log('=== TextBee SMS API Test ===\n');

  if (!SMS_API_KEY || SMS_API_KEY === 'your-api-key') {
    console.error('❌ SMS_API_KEY not configured in .env');
    process.exit(1);
  }

  if (!DEVICE_ID || DEVICE_ID === 'your-device-id') {
    console.error('❌ TEXTBEE_DEVICE_ID not configured in .env');
    console.log('Please get your device ID from TextBee dashboard and set it in .env');
    process.exit(1);
  }

  console.log('✓ SMS_API_KEY found');
  console.log('✓ TEXTBEE_DEVICE_ID found');
  
  const SMS_API_URL = `${SMS_API_BASE}/${DEVICE_ID}/send-sms`;
  console.log(`API URL: ${SMS_API_URL}\n`);

  const testPhone = '+639763214551';
  const testMessage = '🚨 MataBayan ALERT: Magnitude 6.5 detected 45km away in Albay. Depth: 15km. Stay safe!';

  console.log(`Testing SMS to: ${testPhone}`);
  console.log(`Message: ${testMessage}\n`);

  try {
    console.log('Sending SMS via TextBee...');
    const response = await axios.post(
      SMS_API_URL,
      {
        recipients: [testPhone],
        message: testMessage,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': SMS_API_KEY,
        },
        timeout: 10000,
      }
    );

    console.log('✓ SMS sent successfully!\n');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log(`\nStatus: ${response.status}`);
    console.log(`Message ID: ${response.data?.id || response.data?.messageId || 'N/A'}`);
    console.log(`Delivery Status: ${response.data?.status || 'N/A'}`);
    process.exit(0);

  } catch (error) {
    console.error('❌ SMS send failed!\n');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
}

testSMS();
