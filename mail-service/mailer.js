import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly BEFORE anything else
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

// Log loaded credentials (for debugging)
console.log('📧 Loading email configuration from:', envPath);
console.log('  EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Missing');
console.log('  EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Loaded' : '❌ Missing');
console.log('  MAIL_HOST:', process.env.MAIL_HOST || 'smtp.gmail.com');
console.log('  MAIL_PORT:', process.env.MAIL_PORT || 587);

/**
 * Create and configure Nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // Use TLS (false for port 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body (plain text)
 * @param {string} html - Email body (HTML format, optional)
 * @returns {Promise<Object>} - Response from Nodemailer
 */
export async function sendEmail(to, subject, text, html = null) {
  try {
    // Validate inputs
    if (!to || !subject || !text) {
      throw new Error('Missing required parameters: to, subject, text');
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      ...(html && { html }), // Add HTML if provided
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email',
    };
  }
}

/**
 * Send HTML email with templates
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlTemplate - HTML email template
 * @returns {Promise<Object>} - Response from Nodemailer
 */
export async function sendHtmlEmail(to, subject, htmlTemplate) {
  try {
    if (!to || !subject || !htmlTemplate) {
      throw new Error('Missing required parameters: to, subject, htmlTemplate');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ HTML email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: 'HTML email sent successfully',
    };
  } catch (error) {
    console.error(`❌ Error sending HTML email to ${to}:`, error.message);

    return {
      success: false,
      error: error.message,
      message: 'Failed to send HTML email',
    };
  }
}

/**
 * Verify transporter connection
 * @returns {Promise<Boolean>}
 */
export async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ Nodemailer transporter is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Error verifying Nodemailer transporter:', error.message);
    return false;
  }
}

export default {
  sendEmail,
  sendHtmlEmail,
  verifyConnection,
};
