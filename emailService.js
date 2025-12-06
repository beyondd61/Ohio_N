const axios = require('axios');
require('dotenv').config();

/**
 * Email service using Email IT API
 */
class EmailService {
  constructor() {
    this.apiKey = process.env.EMAILIT_API_KEY;
    this.apiUrl = process.env.EMAILIT_API_URL || 'https://api.emailit.com/v1';
    this.senderEmail = process.env.SENDER_EMAIL;
    this.senderName = process.env.SENDER_NAME || 'Ohio Deals Newsletter';
  }

  /**
   * Send newsletter email to a subscriber
   */
  async sendNewsletter(toEmail, htmlContent, subject = null) {
    if (!this.apiKey) {
      throw new Error('EMAILIT_API_KEY not set in environment variables');
    }

    if (!this.senderEmail) {
      throw new Error('SENDER_EMAIL not set in environment variables');
    }

    const emailSubject = subject || process.env.NEWSLETTER_NAME || 'Ohio Local Business Deals';

    try {
      // Email IT API endpoint for sending emails
      // Note: Adjust the endpoint based on Email IT API documentation
      const response = await axios.post(
        `${this.apiUrl}/send`,
        {
          to: toEmail,
          from: this.senderEmail,
          from_name: this.senderName,
          subject: emailSubject,
          html: htmlContent,
          text: this.htmlToText(htmlContent) // Plain text fallback
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Email IT API Error:', error.response?.data || error.message);
      
      // If Email IT API structure is different, you may need to adjust
      // Common alternatives:
      // - POST to /emails/send
      // - Different auth method
      // - Different payload structure
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send confirmation email after subscription
   */
  async sendConfirmationEmail(toEmail, unsubscribeToken) {
    const unsubscribeUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/unsubscribe?token=${unsubscribeToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Ohio Deals Newsletter</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Welcome to Ohio Deals Newsletter!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Thank you for subscribing to our daily newsletter featuring the best deals and discounts from Ohio local businesses!</p>
          <p>You'll receive daily emails with:</p>
          <ul>
            <li>Exclusive discounts and offers</li>
            <li>Local business promotions</li>
            <li>Limited-time deals</li>
            <li>Special events and sales</li>
          </ul>
          <p>We're excited to help you save money while supporting local Ohio businesses!</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            If you no longer wish to receive these emails, you can 
            <a href="${unsubscribeUrl}" style="color: #667eea;">unsubscribe here</a>.
          </p>
        </div>
      </body>
      </html>
    `;

    return await this.sendNewsletter(
      toEmail,
      htmlContent,
      'Welcome to Ohio Deals Newsletter!'
    );
  }

  /**
   * Convert HTML to plain text (simple version)
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

module.exports = EmailService;

