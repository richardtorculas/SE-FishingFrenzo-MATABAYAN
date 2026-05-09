/**
 * SMS Testing Script - Typhoon/Cyclone Alerts
 * Tests SMS API connectivity and cyclone alert message delivery
 */

require('dotenv').config({ path: './src/backend/.env' });
const axios = require('axios');

const SMS_API_BASE = 'https://api.textbee.dev/api/v1/gateway/devices';
const SMS_API_KEY = process.env.SMS_API_KEY;
const DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

async function testCycloneSMS() {
  console.log('=== TextBee SMS API Test - Typhoon Alerts ===\n');

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

  // Test cyclone alert scenarios - Reordered with 30-second delays
  const testCases = [
    {
      name: 'Approaching Alert - Imminent',
      phone: '+639928112266',
      message: '🔴 MATABAYAN ALERT: Typhoon PAOLO is IMMINENT! Expected landfall in 6-12 hours. Category: Typhoon | Wind Speed: 140 km/h | Location: 50km East of Camarines Sur. EVACUATE NOW if in danger zones!'
    },
    {
      name: 'PAR Entry Alert',
      phone: '+639928112266',
      message: '🌀 MATABAYAN ALERT: Typhoon PAOLO has entered the Philippine Area of Responsibility (PAR). Category: Typhoon | Wind Speed: 130 km/h | Location: Eastern Visayas. Prepare now!'
    },
    {
      name: 'Status Change Alert - Intensification',
      phone: '+639928112266',
      message: '⚠️ MATABAYAN ALERT: Typhoon PAOLO has intensified! Status changed from Severe Tropical Storm to Typhoon. Wind Speed: 130 km/h (↑ from 95 km/h) | Location: Central Luzon. Take precautions!'
    }
  ];

  console.log(`Found ${testCases.length} test cases\n`);
  console.log('Note: 30-second delay between each message\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n--- Test Case ${i + 1}: ${testCase.name} ---`);
    console.log(`Phone: ${testCase.phone}`);
    console.log(`Message: ${testCase.message}\n`);

    try {
      console.log('Sending SMS via TextBee...');
      const response = await axios.post(
        SMS_API_URL,
        {
          recipients: [testCase.phone],
          message: testCase.message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': SMS_API_KEY,
          },
          timeout: 10000,
        }
      );

      console.log('✓ SMS sent successfully!');
      console.log(`Status: ${response.status}`);
      console.log(`Message ID: ${response.data?.id || response.data?.messageId || 'N/A'}`);
      console.log(`Delivery Status: ${response.data?.status || 'N/A'}`);

      // Wait 30 seconds between requests
      if (i < testCases.length - 1) {
        console.log('\n⏳ Waiting 30 seconds before next test...');
        for (let sec = 30; sec > 0; sec--) {
          process.stdout.write(`\r⏳ Waiting ${sec} seconds...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('\r✓ Ready for next test!                    ');
      }

    } catch (error) {
      console.error('❌ SMS send failed!');
      console.error('Error:', error.message);
      
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  console.log('\n\n=== Test Summary ===');
  console.log('✓ All test cases completed');
  console.log('Check the messages above for any failures');
  console.log('\nMessage Order & Features Tested:');
  console.log('1️⃣  Approaching Alert - Imminent threat (6-12 hours)');
  console.log('2️⃣  PAR Entry - New cyclone detection');
  console.log('3️⃣  Status Change - Intensification (Tropical Storm → Typhoon)');
  console.log('\nDelay: 30 seconds between each message');
  process.exit(0);
}

testCycloneSMS();
