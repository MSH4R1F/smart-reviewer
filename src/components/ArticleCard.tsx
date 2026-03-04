'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { GNewsArticle, StoredArticle } from '@/types/index';

interface ArticleCardProps {
  article: GNewsArticle;
  onAnalyze: (article: GNewsArticle) => Promise<void>;
  isAnalyzing: boolean;
  analyzedArticle?: StoredArticle | null;
}

export function ArticleCard({ article, onAnalyze, isAnalyzing, analyzedArticle }: ArticleCardProps) {
  const isAlreadyAnalyzed = !!analyzedArticle;

  const handleClick = () => {
    if (isAnalyzing || isAlreadyAnalyzed) return;
    onAnalyze(article);
  };

  return (
    <Card
      onClick={handleClick}
      className={`transition-all duration-200 ${
        isAlreadyAnalyzed
          ? 'opacity-75 cursor-default'
          : isAnalyzing
          ? 'opacity-60 cursor-wait'
          : 'cursor-pointer hover:shadow-md hover:border-primary/50'
      }`}
    >
      {article.image && (
        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2">{article.title}</h3>
          {isAlreadyAnalyzed && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              ✓ Analyzed
            </Badge>
          )}
          {isAnalyzing && (
            <Badge variant="outline" className="shrink-0 text-xs animate-pulse">
              Analyzing…
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-xs line-clamp-3 mb-3">{article.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{article.source.name}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
