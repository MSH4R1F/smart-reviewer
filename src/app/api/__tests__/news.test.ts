import { NextRequest } from 'next/server';
import { GET } from '../news/route';

beforeEach(() => {
  process.env.GNEWS_API_KEY = 'test-key';
  global.fetch = jest.fn() as typeof fetch;
});

afterEach(() => {
  delete process.env.GNEWS_API_KEY;
  jest.restoreAllMocks();
});

describe('GET /api/news', () => {
  it('returns 400 when query param q is missing', async () => {
    const req = new NextRequest('http://localhost/api/news');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBe('Search query is required');
  });

  it('returns 200 with articles on successful GNews response', async () => {
    const mockArticles = [
      {
        title: 'Test Article',
        description: 'A description',
        content: 'Some content',
        url: 'https://example.com/article',
        image: null,
        publishedAt: '2024-01-01T00:00:00Z',
        source: { name: 'Test Source', url: 'https://example.com' },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ articles: mockArticles, totalArticles: 1 }),
    } as unknown as Response);

    const req = new NextRequest('http://localhost/api/news?q=technology');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json() as { articles: unknown[]; totalArticles: number };
    expect(data.articles).toHaveLength(1);
    expect(data.totalArticles).toBe(1);
  });

  it('returns 429 when GNews API returns 403', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 403,
      ok: false,
    } as unknown as Response);

    const req = new NextRequest('http://localhost/api/news?q=technology');
    const res = await GET(req);

    expect(res.status).toBe(429);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('rate limit');
  });
});
