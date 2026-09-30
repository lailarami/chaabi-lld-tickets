import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEmail, sendHtmlEmail, verifyConnection } from './mailer.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.MAIL_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mail service is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /send-email
 * Send a plain text email
 * 
 * Expected JSON body:
 * {
 *   "to": "recipient@example.com",
 *   "subject": "Email Subject",
 *   "text": "Email body text"
 * }
 */
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    // Validate required fields
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, text',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format',
      });
    }

    const result = await sendEmail(to, subject, text);

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error in /send-email route:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /send-html-email
 * Send an HTML formatted email
 * 
 * Expected JSON body:
 * {
 *   "to": "recipient@example.com",
 *   "subject": "Email Subject",
 *   "html": "<h1>HTML content</h1>"
 * }
 */
app.post('/send-html-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, html',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format',
      });
    }

    const result = await sendHtmlEmail(to, subject, html);

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error in /send-html-email route:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /send-ticket-email
 * Send a formatted ticket email
 */
app.post('/send-ticket-email', async (req, res) => {
  try {
    const { to, ticketId, status, subject } = req.body;

    if (!to || !ticketId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, ticketId, status',
      });
    }

    // Create HTML template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; }
          .header { background: #F58220; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { padding: 20px; }
          .info { background: #f9f9f9; padding: 15px; border-left: 4px solid #F58220; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Chaabi LLD - Support IT</h1>
          </div>
          <div class="content">
            <h2>Mise à jour de votre ticket</h2>
            <div class="info">
              <p><strong>Ticket ID:</strong> #${ticketId}</p>
              <p><strong>Statut:</strong> ${status}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <p>Merci de votre confiance. Nous vous tiendrons informé des avancées.</p>
          </div>
          <div class="footer">
            <p>© 2026 Chaabi LLD - Support IT</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendHtmlEmail(to, subject || `Ticket #${ticketId} - ${status}`, htmlTemplate);

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error in /send-ticket-email route:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error',
    });
  }
});

/**
 * GET /verify
 * Verify email service connection
 */
app.get('/verify', async (req, res) => {
  try {
    const isConnected = await verifyConnection();
    return res.json({
      success: isConnected,
      message: isConnected ? 'Email service is connected' : 'Email service is not connected',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to verify email service',
    });
  }
});

/**
 * 404 Error handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    message: 'Internal server error',
  });
});

// Start server
async function startServer() {
  console.log('🚀 Starting Chaabi LLD Mail Service...');

  // Verify connection before starting
  const isConnected = await verifyConnection();
  if (!isConnected) {
    console.warn('⚠️  Warning: Email service may not be properly configured');
  }

  app.listen(PORT, () => {
    console.log(`✅ Mail service running on http://localhost:${PORT}`);
    console.log(`📝 Available endpoints:`);
    console.log(`   GET  /health                    - Health check`);
    console.log(`   GET  /verify                    - Verify email connection`);
    console.log(`   POST /send-email                - Send plain text email`);
    console.log(`   POST /send-html-email           - Send HTML formatted email`);
    console.log(`   POST /send-ticket-email         - Send formatted ticket email`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
