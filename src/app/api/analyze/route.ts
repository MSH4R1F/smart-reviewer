import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { analyzeRequestSchema, articleAnalysisSchema } from '@/lib/schemas';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, description, content } = parsed.data;

  try {
    const completion = await openai.chat.completions.parse({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You are a news article analyst. Analyze the given article and provide a summary, sentiment analysis, and key topics. If content is limited or truncated, provide the best analysis possible with available information. Do not fabricate details.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}\nContent: ${content}`,
        },
      ],
      response_format: zodResponseFormat(articleAnalysisSchema, 'article_analysis'),
    });

    const message = completion.choices[0].message;

    if (message.refusal) {
      return NextResponse.json(
        { error: 'Content could not be analyzed', details: message.refusal },
        { status: 422 }
      );
    }

    if (!message.parsed) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(message.parsed, { status: 200 });
  } catch (err) {
    const error = err as { status?: number; message?: string };

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'AI service rate limit reached. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
