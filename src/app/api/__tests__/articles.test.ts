// eslint-disable-next-line no-var
var mockFind: jest.Mock;
// eslint-disable-next-line no-var
var mockCreate: jest.Mock;

jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/models/Article', () => ({
  __esModule: true,
  default: {
    find: (...args: unknown[]) => mockFind(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '../articles/route';

beforeEach(() => {
  mockFind = jest.fn();
  mockCreate = jest.fn();
});

describe('GET /api/articles', () => {
  it('returns 200 with articles array', async () => {
    const stored = [{ _id: 'abc', title: 'Stored Article', sentiment: 'neutral' }];
    mockFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(stored),
      }),
    });

    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(stored);
  });

  it('returns 500 when database call throws', async () => {
    mockFind.mockImplementation(() => {
      throw new Error('DB connection failed');
    });

    const res = await GET();

    expect(res.status).toBe(500);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Failed to fetch articles');
  });
});

describe('POST /api/articles', () => {
  it('returns 201 when article is created successfully', async () => {
    const newArticle = {
      _id: 'new123',
      title: 'New Article',
      url: 'https://example.com',
      summary: 'A summary.',
      sentiment: 'positive',
      sentimentScore: 0.9,
      sentimentReasoning: 'Very positive.',
      keyTopics: ['tech'],
    };

    mockCreate.mockResolvedValueOnce({
      toObject: () => newArticle,
    });

    const req = new NextRequest('http://localhost/api/articles', {
      method: 'POST',
      body: JSON.stringify(newArticle),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data).toEqual(newArticle);
  });
});
