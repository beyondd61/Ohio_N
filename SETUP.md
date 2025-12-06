# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

### Required:
- `EMAILIT_API_KEY` - Your Email IT API key
- `SENDER_EMAIL` - Your verified sender email address

### Choose One AI Provider:
- `OPENAI_API_KEY` + `AI_PROVIDER=openai`
- OR `ANTHROPIC_API_KEY` + `AI_PROVIDER=claude`
- OR `GEMINI_API_KEY` + `AI_PROVIDER=gemini`

## Step 3: Start the Server

```bash
npm start
```

Visit `http://localhost:3000` to see the subscription page.

## Step 4: Test Newsletter Sending

Manually trigger a newsletter:

```bash
npm run send-newsletter
```

## Step 5: Enable Daily Scheduler (Optional)

Edit `server.js` and uncomment these lines at the bottom:

```javascript
const startScheduler = require('./scheduler');
startScheduler();
```

## Email IT API Configuration

**Important:** The Email IT API integration uses a generic structure. You may need to adjust `emailService.js` based on Email IT's actual API:

1. Check Email IT's API documentation for:
   - Exact endpoint URL
   - Request payload format
   - Authentication method (Bearer token, API key in header, etc.)
   - Response structure

2. Common variations:
   - Endpoint might be `/emails/send` instead of `/send`
   - Might require different headers
   - Payload structure might differ

3. Test the email sending with a single subscriber first before enabling the scheduler.

## Testing

1. **Subscribe**: Visit `http://localhost:3000` and subscribe with your email
2. **Check Database**: The `newsletter.db` file will be created automatically
3. **Send Test Newsletter**: Run `npm run send-newsletter`
4. **Check Email**: Verify you received the formatted newsletter

## Troubleshooting

- **"API key not set"**: Make sure `.env` file exists and has all required keys
- **Email sending fails**: Check Email IT API credentials and endpoint URL
- **AI formatting fails**: Verify your chosen AI provider API key is valid
- **Database errors**: Ensure the directory has write permissions

