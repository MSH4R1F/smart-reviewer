import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { extract } from '@extractus/article-extractor';
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

  const { title, description, content, url } = parsed.data;

  // Try to extract full article content from URL
  let fullContent = content;
  let extractionSource = 'gnews-truncated';
  if (url) {
    console.log(`[analyze] Attempting extraction from URL: ${url}`);
    try {
      const extracted = await extract(url);
      if (extracted?.content) {
        // Strip HTML tags from extracted content
        fullContent = extracted.content.replace(/<[^>]*>/g, '').trim();
        extractionSource = 'full-article';
        console.log(`[analyze] Extraction SUCCESS — ${fullContent.length} chars extracted`);
      } else {
        console.log('[analyze] Extraction returned no content — using GNews truncated');
      }
    } catch (extractErr) {
      console.log(`[analyze] Extraction FAILED — ${extractErr instanceof Error ? extractErr.message : 'unknown error'}`);
    }
  } else {
    console.log('[analyze] No URL provided — using GNews truncated content');
  }

  console.log(`[analyze] Content source: ${extractionSource} | Length: ${fullContent.length} chars`);
  const userMessage = `Title: ${title}\nDescription: ${description}\nContent: ${fullContent}`;
  console.log(`[analyze] Sending to OpenAI — prompt length: ${userMessage.length} chars`);

  try {
    const completion = await openai.chat.completions.parse({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content:
            'You are a news article analyst. For the summary field, write TWO full paragraphs (each 3-5 sentences) covering the key facts, broader context, and implications. Also provide sentiment analysis and key topics. If content is limited or truncated, provide the best analysis possible with available information. Do not fabricate details.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: zodResponseFormat(articleAnalysisSchema, 'article_analysis'),
    });

    console.log(`[analyze] OpenAI response received`);

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

    return NextResponse.json({ ...message.parsed, fullContent }, { status: 200 });
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
