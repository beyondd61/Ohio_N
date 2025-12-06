const axios = require('axios');
require('dotenv').config();

/**
 * Formats deals using AI (OpenAI, Claude, or Gemini)
 */
class AIFormatter {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
  }

  /**
   * Format deals into a beautiful newsletter using AI
   */
  async formatNewsletter(deals) {
    const prompt = this.createPrompt(deals);
    
    switch (this.provider) {
      case 'openai':
        return await this.formatWithOpenAI(prompt);
      case 'claude':
        return await this.formatWithClaude(prompt);
      case 'gemini':
        return await this.formatWithGemini(prompt);
      default:
        return await this.formatWithOpenAI(prompt);
    }
  }

  /**
   * Create prompt for AI
   */
  createPrompt(deals) {
    const dealsText = deals.map((deal, index) => {
      return `
Deal ${index + 1}:
- Business: ${deal.businessName}
- Title: ${deal.title}
- Description: ${deal.description}
- Discount: ${deal.discount}
- Valid Until: ${deal.validUntil}
- Location: ${deal.location || 'Ohio'}
- Category: ${deal.category || 'General'}
      `.trim();
    }).join('\n\n');

    return `You are creating a daily email newsletter for Ohio local business deals and discounts. 

Format the following deals into a beautiful, engaging HTML email newsletter. The email should:
1. Have a professional, modern design with a clean layout
2. Include a welcoming header with "Ohio Local Business Deals"
3. Group deals by category if applicable
4. Make each deal visually appealing with clear call-to-action
5. Include expiration dates prominently
6. Use HTML/CSS for styling (inline styles for email compatibility)
7. Be mobile-responsive
8. Include a footer with unsubscribe information

Here are the deals to format:

${dealsText}

Create a complete HTML email template that can be sent directly. Use inline CSS for email compatibility.`;
  }

  /**
   * Format using OpenAI
   */
  async formatWithOpenAI(prompt) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not set in environment variables');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert email newsletter designer. Create beautiful, professional HTML email templates.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Format using Claude (Anthropic)
   */
  async formatWithClaude(prompt) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not set in environment variables');
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Format using Google Gemini
   */
  async formatWithGemini(prompt) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not set in environment variables');
    }

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Extract HTML from AI response (handles markdown code blocks)
   */
  extractHTML(aiResponse) {
    // Remove markdown code blocks if present
    let html = aiResponse.trim();
    
    // Remove ```html or ``` at start/end
    html = html.replace(/^```(?:html)?\s*/i, '');
    html = html.replace(/\s*```$/i, '');
    
    return html.trim();
  }
}

module.exports = AIFormatter;

