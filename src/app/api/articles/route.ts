import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Article, { IArticle } from '@/lib/models/Article';

export async function GET() {
  try {
    await dbConnect();
    const articles = await Article.find().sort({ analyzedAt: -1 }).lean();
    return NextResponse.json(articles, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    await dbConnect();
    const article = await Article.create(body as Partial<IArticle>);
    return NextResponse.json(article.toObject(), { status: 201 });
  } catch (err) {
    const error = err as { name?: string; message?: string };

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save article' },
      { status: 500 }
    );
  }
}
