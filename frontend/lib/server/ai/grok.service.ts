/**
 * @deprecated This service is deprecated. All Grok LLM interactions are now consolidated 
 * and managed by the FastAPI backend agent layer at `/api/insights` and `/api/chat`.
 */
import axios from 'axios';

export class GrokService {
  private get apiKey() {
    return process.env.GROK_API_KEY || '';
  }

  async generateStructuredInsight(prompt: string, systemPrompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('GROK_API_KEY is not configured');
    }

    try {
      const response = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000, // 25s timeout
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Grok API');
      }

      // Clean markdown code blocks if Grok wraps the JSON response in them
      let cleaned = content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
      }

      return JSON.parse(cleaned);
    } catch (err: any) {
      console.error('[GrokService] API invocation failed:', err.message);
      throw err;
    }
  }
}

export const grokService = new GrokService();
