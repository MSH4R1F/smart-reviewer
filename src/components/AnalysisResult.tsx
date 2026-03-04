'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StoredArticle } from '@/types/index';

interface AnalysisResultProps {
  analysis: StoredArticle;
}

const sentimentConfig = {
  positive: { label: 'Positive', className: 'bg-green-100 text-green-800 border-green-200' },
  negative: { label: 'Negative', className: 'bg-red-100 text-red-800 border-red-200' },
  neutral: { label: 'Neutral', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  mixed: { label: 'Mixed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
} as const;

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const sentiment = sentimentConfig[analysis.sentiment] ?? sentimentConfig.neutral;
  const scorePercent = `${(analysis.sentimentScore * 100).toFixed(0)}%`;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold line-clamp-2">{analysis.title}</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sentiment.className}`}
          >
            {sentiment.label}
          </span>
          <span className="text-xs text-muted-foreground">Confidence: {scorePercent}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
          <p className="text-sm">{analysis.summary}</p>
        </div>
        {analysis.sentimentReasoning && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Reasoning</p>
            <p className="text-sm text-muted-foreground">{analysis.sentimentReasoning}</p>
          </div>
        )}
        {analysis.keyTopics.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Topics</p>
            <div className="flex flex-wrap gap-1">
              {analysis.keyTopics.map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
