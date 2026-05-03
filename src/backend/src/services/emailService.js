/**
 * ============================================
 * EMAIL SERVICE
 * ============================================
 * Purpose: Send email notifications for earthquake alerts
 * ============================================
 */

const nodemailer = require('nodemailer');

/**
 * Email transporter configuration
 * Using environment variables for credentials
 */
const createTransporter = () => {
  // Using Gmail or your email service
  // For production, use environment variables
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

/**
 * Format earthquake alert email
 * @param {object} alertData - Alert data with earthquake details
 * @returns {string} HTML email content
 */
const formatEarthquakeEmail = (alertData) => {
  const {
    magnitude,
    depth,
    location,
    distance,
    epicenterLat,
    epicenterLon,
    userProvince
  } = alertData;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; border: 1px solid #ddd; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-row:last-child { border-bottom: none; }
          .label { font-weight: bold; color: #667eea; }
          .value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
          .critical { color: #dc3545; font-weight: bold; }
          .high { color: #fd7e14; font-weight: bold; }
          .medium { color: #ffc107; font-weight: bold; }
          .low { color: #17a2b8; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌍 Earthquake Alert</h1>
            <p>Real-time Disaster Alert from MataBayan</p>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <strong>⚠️ An earthquake has been detected near your location!</strong>
            </div>

            <h2>Earthquake Details</h2>
            <div class="details">
              <div class="detail-row">
                <span class="label">Magnitude:</span>
                <span class="value critical">${magnitude}</span>
              </div>
              <div class="detail-row">
                <span class="label">Depth:</span>
                <span class="value">${depth} km</span>
              </div>
              <div class="detail-row">
                <span class="label">Location:</span>
                <span class="value">${location}</span>
              </div>
              <div class="detail-row">
                <span class="label">Distance from you:</span>
                <span class="value">${distance} km</span>
              </div>
              <div class="detail-row">
                <span class="label">Your Area:</span>
                <span class="value">${userProvince}</span>
              </div>
              <div class="detail-row">
                <span class="label">Coordinates:</span>
                <span class="value">${epicenterLat.toFixed(4)}, ${epicenterLon.toFixed(4)}</span>
              </div>
            </div>

            <h2>Safety Recommendations</h2>
            <ul>
              <li><strong>If indoors:</strong> Take cover under a sturdy desk or table. Stay away from windows.</li>
              <li><strong>If outdoors:</strong> Move away from buildings, trees, and power lines.</li>
              <li><strong>If driving:</strong> Pull over safely and stay in your vehicle.</li>
              <li><strong>After shaking stops:</strong> Check for injuries and damage. Be prepared for aftershocks.</li>
            </ul>

            <p style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
              <strong>📱 For more information:</strong> Visit the <a href="https://www.phivolcs.dost.gov.ph/" target="_blank">PHIVOLCS website</a> or check the MataBayan app for real-time updates.
            </p>
          </div>

          <div class="footer">
            <p>MataBayan - Real-Time Disaster Alert and Preparedness System</p>
            <p>This is an automated alert. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Send earthquake alert email
 * @param {string} email - Recipient email address
 * @param {object} alertData - Alert data with earthquake details
 * @returns {Promise<object>} Email send result
 */
const sendEarthquakeAlertEmail = async (email, alertData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@matabayan.com',
      to: email,
      subject: `🌍 Earthquake Alert - Magnitude ${alertData.magnitude} near ${alertData.userProvince}`,
      html: formatEarthquakeEmail(alertData)
    };

    const result = await transporter.sendMail(mailOptions);

    console.log(`Email sent to ${email}:`, result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      email
    };

  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    return {
      success: false,
      email,
      error: error.message
    };
  }
};

/**
 * Send test email
 * @param {string} email - Test email address
 * @returns {Promise<object>} Test result
 */
const sendTestEmail = async (email) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@matabayan.com',
      to: email,
      subject: 'MataBayan - Test Email',
      html: '<h1>Test Email</h1><p>This is a test email from MataBayan.</p>'
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('Failed to send test email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendEarthquakeAlertEmail,
  sendTestEmail
};
