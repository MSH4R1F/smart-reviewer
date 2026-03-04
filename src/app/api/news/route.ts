import { NextRequest, NextResponse } from 'next/server';
import { newsQuerySchema } from '@/lib/schemas';
import type { GNewsArticle, NewsSearchResponse } from '@/types/index';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  // Validate query parameter
  const parsed = newsQuerySchema.safeParse({ q });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'News service unavailable' },
      { status: 500 }
    );
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(parsed.data.q)}&lang=en&max=10&apikey=${apiKey}`;
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (response.status === 403) {
      return NextResponse.json(
        { error: 'News API rate limit reached. Try again later.' },
        { status: 429 }
      );
    }

    if (response.status === 401) {
      return NextResponse.json(
        { error: 'News service unavailable' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch news articles' },
        { status: 500 }
      );
    }

    const data = await response.json() as { articles: GNewsArticle[]; totalArticles: number };

    const result: NewsSearchResponse = {
      articles: data.articles ?? [],
      totalArticles: data.totalArticles ?? 0,
    };

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}
