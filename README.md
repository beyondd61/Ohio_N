# Ohio Local Business Deals Newsletter

A simple email newsletter website that aggregates Ohio local business deals, discounts, offers, and coupons. The deals are formatted using AI (OpenAI, Claude, or Gemini) and sent daily to subscribed users via Email IT API.

## Features

- 📧 Daily email newsletter with curated Ohio business deals
- 🤖 AI-powered formatting using OpenAI, Claude, or Gemini
- 📝 User subscription management
- 🔄 Automated daily email sending via cron job
- 💾 SQLite database for subscribers and deals
- 🎨 Beautiful, responsive subscription page

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- API keys for:
  - Email IT API
  - One of: OpenAI, Anthropic (Claude), or Google Gemini

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Copy the example environment file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```env
# Email IT API
EMAILIT_API_KEY=your_emailit_api_key_here
EMAILIT_API_URL=https://api.emailit.com/v1

# Choose one AI provider
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here
# OR
GEMINI_API_KEY=your_gemini_api_key_here

# Set which AI provider to use
AI_PROVIDER=openai  # or 'claude' or 'gemini'

# Email configuration
SENDER_EMAIL=newsletter@yourdomain.com
SENDER_NAME=Ohio Deals Newsletter
BASE_URL=http://localhost:3000
```

## Configuration

### Email IT API Setup

1. Sign up for an account at [Email IT](https://www.emailit.com) (or your email service provider)
2. Get your API key from the dashboard
3. Update `EMAILIT_API_URL` if your provider uses a different endpoint
4. Note: You may need to adjust the API endpoint in `emailService.js` based on Email IT's actual API structure

### AI Provider Setup

Choose one of the following:

**OpenAI:**
- Get API key from https://platform.openai.com
- Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=your_key`

**Anthropic (Claude):**
- Get API key from https://console.anthropic.com
- Set `AI_PROVIDER=claude` and `ANTHROPIC_API_KEY=your_key`

**Google Gemini:**
- Get API key from https://makersuite.google.com/app/apikey
- Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=your_key`

## Usage

### Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Manual Newsletter Send

To manually trigger a newsletter send (for testing):

```bash
node scripts/sendNewsletter.js
```

Or use npm:
```bash
npm run send-newsletter
```

### Automated Daily Sending

The scheduler is set up to send newsletters daily at 8:00 AM (Eastern Time). To enable it, uncomment the scheduler import in `server.js`:

```javascript
// In server.js, add:
const startScheduler = require('./scheduler');
startScheduler();
```

## Project Structure

```
Ohio/
├── server.js              # Express server and routes
├── database.js            # SQLite database operations
├── dealAggregator.js      # Deal fetching and aggregation
├── aiFormatter.js         # AI-powered newsletter formatting
├── emailService.js        # Email IT API integration
├── scheduler.js           # Daily cron job scheduler
├── scripts/
│   └── sendNewsletter.js # Newsletter sending script
├── public/
│   └── index.html        # Subscription page
├── .env.example          # Environment variables template
└── package.json          # Dependencies
```

## Customizing Deal Sources

The `dealAggregator.js` file currently uses sample deals. To integrate real deal sources:

1. **Yelp API**: Get business promotions and deals
2. **Google Places API**: Find local businesses and their offers
3. **RSS Feeds**: Parse RSS feeds from local deal websites
4. **Web Scraping**: Scrape deal websites (ensure compliance with ToS)
5. **Direct Integrations**: Partner with local businesses for API access

Example integration in `dealAggregator.js`:

```javascript
async fetchDeals() {
  // Add your API calls here
  const yelpDeals = await this.fetchFromYelp();
  const googleDeals = await this.fetchFromGooglePlaces();
  // ... combine and return
}
```

## Database

The application uses SQLite for simplicity. The database file (`newsletter.db`) is created automatically on first run.

**Tables:**
- `subscribers`: Email addresses and subscription status
- `deals`: Historical deals that have been sent

## API Endpoints

- `GET /` - Subscription page
- `POST /api/subscribe` - Subscribe to newsletter
- `GET /unsubscribe?token=...` - Unsubscribe from newsletter
- `GET /api/health` - Health check endpoint

## Email IT API Notes

The Email IT API integration in `emailService.js` uses a generic structure. You may need to adjust:

- API endpoint URL
- Request payload structure
- Authentication method
- Response handling

Check Email IT's documentation for the exact API structure.

## Troubleshooting

**Newsletter not sending:**
- Check API keys are set correctly in `.env`
- Verify Email IT API credentials
- Check console logs for errors

**AI formatting fails:**
- Ensure your chosen AI provider API key is valid
- Check API rate limits
- Verify the `AI_PROVIDER` environment variable matches your key

**Database errors:**
- Ensure write permissions in the project directory
- Delete `newsletter.db` to reset (will lose all data)

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

