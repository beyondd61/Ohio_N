const DealAggregator = require('../dealAggregator');
const AIFormatter = require('../aiFormatter');
const EmailService = require('../emailService');
const { getActiveSubscribers, saveDeal, markDealAsSent } = require('../database');
require('dotenv').config();

/**
 * Main function to send daily newsletter
 */
async function sendDailyNewsletter() {
  console.log('Starting newsletter generation...');
  
  try {
    // Step 1: Fetch deals
    console.log('Fetching deals...');
    const aggregator = new DealAggregator();
    let deals = await aggregator.fetchDeals();
    deals = aggregator.filterOhioDeals(deals);
    deals = aggregator.removeDuplicates(deals);

    if (deals.length === 0) {
      console.log('No deals found. Skipping newsletter.');
      return;
    }

    console.log(`Found ${deals.length} deals`);

    // Step 2: Save deals to database
    console.log('Saving deals to database...');
    const dealIds = [];
    for (const deal of deals) {
      try {
        const dealId = await saveDeal(deal);
        dealIds.push(dealId);
      } catch (error) {
        console.error('Error saving deal:', error);
      }
    }

    // Step 3: Format newsletter using AI
    console.log('Formatting newsletter with AI...');
    const formatter = new AIFormatter();
    let htmlContent = await formatter.formatNewsletter(deals);
    htmlContent = formatter.extractHTML(htmlContent);

    // Add unsubscribe footer if not present
    if (!htmlContent.includes('unsubscribe')) {
      const unsubscribeFooter = `
        <div style="margin-top: 40px; padding: 20px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
          <p>You're receiving this because you subscribed to Ohio Deals Newsletter.</p>
          <p><a href="${process.env.BASE_URL || 'http://localhost:3000'}/unsubscribe?token={{UNSUBSCRIBE_TOKEN}}" style="color: #667eea;">Unsubscribe</a></p>
        </div>
      `;
      htmlContent = htmlContent.replace('</body>', unsubscribeFooter + '</body>');
    }

    // Step 4: Get all active subscribers
    console.log('Fetching subscribers...');
    const subscribers = await getActiveSubscribers();

    if (subscribers.length === 0) {
      console.log('No active subscribers. Skipping email send.');
      return;
    }

    console.log(`Sending to ${subscribers.length} subscribers...`);

    // Step 5: Send emails
    const emailService = new EmailService();
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Replace unsubscribe token in HTML
        const personalizedContent = htmlContent.replace(
          /{{UNSUBSCRIBE_TOKEN}}/g,
          subscriber.unsubscribe_token
        );

        await emailService.sendNewsletter(subscriber.email, personalizedContent);
        successCount++;
        console.log(`✓ Sent to ${subscriber.email}`);
      } catch (error) {
        failCount++;
        console.error(`✗ Failed to send to ${subscriber.email}:`, error.message);
      }
    }

    // Step 6: Mark deals as sent
    console.log('Marking deals as sent...');
    for (const dealId of dealIds) {
      await markDealAsSent(dealId);
    }

    console.log('\n=== Newsletter Summary ===');
    console.log(`Deals found: ${deals.length}`);
    console.log(`Subscribers: ${subscribers.length}`);
    console.log(`Emails sent successfully: ${successCount}`);
    console.log(`Emails failed: ${failCount}`);
    console.log('Newsletter sent successfully!');

  } catch (error) {
    console.error('Error sending newsletter:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  sendDailyNewsletter()
    .then(() => {
      console.log('Process completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = sendDailyNewsletter;

