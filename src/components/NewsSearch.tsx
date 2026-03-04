'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from '@/components/ArticleCard';
import type { GNewsArticle, StoredArticle } from '@/types/index';

interface NewsSearchProps {
  onArticleSelected: (article: GNewsArticle) => void;
  onArticleAnalyzed: (article: StoredArticle) => void;
  analyzedUrls: Set<string>;
  getAnalyzedArticle: (url: string) => StoredArticle | undefined;
}

export function NewsSearch({ onArticleSelected, onArticleAnalyzed, analyzedUrls, getAnalyzedArticle }: NewsSearchProps) {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<GNewsArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [analyzingUrl, setAnalyzingUrl] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setArticles([]);

    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to search articles. Please try again.');
        return;
      }

      if (!data.articles || data.articles.length === 0) {
        toast.info('No articles found for that query.');
        return;
      }

      setArticles(data.articles);
    } catch {
      toast.error('Failed to search articles. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async (article: GNewsArticle) => {
    onArticleSelected(article);

    setAnalyzingUrl(article.url);

    try {
      // Step 1: Get AI analysis
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.content,
        }),
      });

      const analysisData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        toast.error(analysisData.error ?? 'Analysis failed. Please try again.');
        return;
      }

      // Step 2: Store in MongoDB
      const storeRes = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image: article.image,
          publishedAt: article.publishedAt,
          sourceName: article.source.name,
          sourceUrl: article.source.url,
          ...analysisData,
        }),
      });

      const storedData = await storeRes.json();

      if (!storeRes.ok) {
        toast.error('Failed to save analysis.');
        return;
      }

      toast.success('Article analyzed successfully!');
      onArticleAnalyzed(storedData);
    } catch {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setAnalyzingUrl(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Search for news articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          disabled={isSearching}
        />
        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {isSearching && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isSearching && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {articles.map((article) => {
            const analyzed = getAnalyzedArticle(article.url);
            return (
              <div 
                key={article.url} 
                onClickCapture={() => {
                  if (analyzed) {
                    onArticleSelected(article);
                    onArticleAnalyzed(analyzed);
                  }
                }}
              >
                <ArticleCard
                  article={article}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={analyzingUrl === article.url}
                  analyzedArticle={analyzed}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
