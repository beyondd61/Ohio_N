const cron = require('node-cron');
const sendNewsletter = require('./scripts/sendNewsletter');

/**
 * Schedule daily newsletter sending
 * Runs every day at 8:00 AM
 */
function startScheduler() {
  console.log('Starting newsletter scheduler...');
  console.log('Newsletter will be sent daily at 8:00 AM');

  // Schedule daily at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('\n=== Scheduled Newsletter Run ===');
    console.log(`Time: ${new Date().toISOString()}`);
    try {
      await sendNewsletter();
    } catch (error) {
      console.error('Scheduled newsletter failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York" // Ohio timezone
  });

  // Optional: Also run on server start for testing (comment out in production)
  // Uncomment the line below to send immediately on server start
  // sendNewsletter().catch(console.error);
}

module.exports = startScheduler;

