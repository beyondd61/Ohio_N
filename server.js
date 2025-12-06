const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { initDatabase, addSubscriber, unsubscribe } = require('./database');
const EmailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize database
initDatabase().catch(err => {
  console.error('Database initialization error:', err);
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const result = await addSubscriber(email, name);
    const emailService = new EmailService();

    // Send confirmation email
    try {
      await emailService.sendConfirmationEmail(result.email, result.unsubscribeToken);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.json({ 
      success: true, 
      message: 'Successfully subscribed! Check your email for confirmation.',
      id: result.id 
    });
  } catch (error) {
    if (error.message === 'Email already subscribed') {
      return res.status(400).json({ error: 'This email is already subscribed' });
    }
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Unsubscribe endpoint
app.get('/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>Invalid unsubscribe link</h1>
            <p>The unsubscribe link is invalid or missing.</p>
          </body>
        </html>
      `);
    }

    const success = await unsubscribe(token);

    if (success) {
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>Successfully Unsubscribed</h1>
            <p>You have been unsubscribed from the Ohio Deals Newsletter.</p>
            <p>We're sorry to see you go! You can resubscribe anytime.</p>
          </body>
        </html>
      `);
    } else {
      res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>Unsubscribe Failed</h1>
            <p>The unsubscribe link is invalid or has already been used.</p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1>Error</h1>
          <p>An error occurred while processing your unsubscribe request.</p>
        </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Start scheduler for daily newsletters (uncomment to enable)
// const startScheduler = require('./scheduler');
// startScheduler();

