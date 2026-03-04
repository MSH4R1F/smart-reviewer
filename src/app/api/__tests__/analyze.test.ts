// eslint-disable-next-line no-var
var mockParse: jest.Mock;

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        parse: (...args: unknown[]) => mockParse(...args),
      },
    },
  })),
}));

jest.mock('openai/helpers/zod', () => ({
  zodResponseFormat: jest.fn(() => ({})),
}));

import { NextRequest } from 'next/server';
import { POST } from '../analyze/route';

beforeEach(() => {
  mockParse = jest.fn();
  process.env.OPENAI_API_KEY = 'test-key';
});

const validBody = {
  title: 'Test Article Title',
  description: 'A brief description',
  content: 'Full article content here',
};

const mockAnalysis = {
  summary: 'A two sentence summary of the article.',
  sentiment: 'positive' as const,
  sentimentScore: 0.85,
  sentimentReasoning: 'The article has a positive tone.',
  keyTopics: ['technology', 'innovation'],
};

describe('POST /api/analyze', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ description: 'no title here' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Validation failed');
  });

  it('returns 200 with analysis on successful OpenAI call', async () => {
    mockParse.mockResolvedValueOnce({
      choices: [
        {
          message: {
            refusal: null,
            parsed: mockAnalysis,
          },
        },
      ],
    });

    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockAnalysis);
  });

  it('returns 422 when OpenAI refuses to analyze content', async () => {
    mockParse.mockResolvedValueOnce({
      choices: [
        {
          message: {
            refusal: 'I cannot analyze this content.',
            parsed: null,
          },
        },
      ],
    });

    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(422);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Content could not be analyzed');
  });
});
