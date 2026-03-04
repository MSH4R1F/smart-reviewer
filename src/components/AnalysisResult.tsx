'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { GNewsArticle, StoredArticle } from '@/types/index';

interface AnalysisResultProps {
  article: GNewsArticle;
  analysis: StoredArticle | null;
  isLoading: boolean;
}

const sentimentConfig = {
  positive: { label: 'Positive', className: 'bg-green-100 text-green-800 border-green-200' },
  negative: { label: 'Negative', className: 'bg-red-100 text-red-800 border-red-200' },
  neutral: { label: 'Neutral', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  mixed: { label: 'Mixed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
} as const;

export function AnalysisResult({ article, analysis, isLoading }: AnalysisResultProps) {
  const sentiment = analysis ? (sentimentConfig[analysis.sentiment] ?? sentimentConfig.neutral) : null;
  const scorePercent = analysis ? `${(analysis.sentimentScore * 100).toFixed(0)}%` : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="md:col-span-2 space-y-6">
        <Card className="overflow-hidden">
          {article.image && (
            <div className="relative w-full h-48 sm:h-64">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-primary"
              >
                {article.title}
              </a>
            </CardTitle>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-medium">{article.source.name}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Summary */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Summary
              </h3>
              {analysis ? (
                <p className="text-base leading-relaxed">
                  {analysis.summary}
                </p>
              ) : isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : null}
            </div>

            {/* Article Content */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Article Excerpt
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {article.content}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
              >
                Read full article →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="md:col-span-1 space-y-6">
        <Card className="border-primary/20 bg-primary/5 h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Analysis
            </CardTitle>
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              {analysis && sentiment ? (
                <>
                  <span
                    className={`inline-flex items-center justify-center rounded-full border px-6 py-2 text-lg font-bold ${sentiment.className}`}
                  >
                    {sentiment.label}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    Confidence: {scorePercent}
                  </span>
                </>
              ) : isLoading ? (
                <>
                  <Skeleton className="h-10 w-32 rounded-full" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis ? (
              <>
                {analysis.sentimentReasoning && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Reasoning
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.sentimentReasoning}
                    </p>
                  </div>
                )}
                
                {analysis.keyTopics.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Key Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keyTopics.map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs px-2 py-1">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : isLoading ? (
              <>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Reasoning
                  </h4>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Key Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
