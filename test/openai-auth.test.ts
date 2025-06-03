import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

describe('OpenAI Authentication', () => {
  it('should authenticate and receive a reply from OpenAI', async () => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello.' }
      ],
      max_tokens: 10,
    });
    expect(completion.choices[0]?.message.content).toMatch(/hello/i);
  });
});
