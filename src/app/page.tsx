'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { NewsSearch } from '@/components/NewsSearch';
import { AnalysisResult } from '@/components/AnalysisResult';
import { HistoryTable } from '@/components/HistoryTable';
import type { StoredArticle } from '@/types/index';

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<StoredArticle | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [analyzedArticles, setAnalyzedArticles] = useState<StoredArticle[]>([]);

  const onArticleAnalyzed = (article: StoredArticle) => {
    setAnalyzedArticles((prev) => [...prev, article]);
    setCurrentAnalysis(article);
    setHistoryRefreshKey((prev) => prev + 1);
  };

  const analyzedUrls = new Set(analyzedArticles.map((a) => a.url));

  const getAnalyzedArticle = (url: string) => {
    return analyzedArticles.find((a) => a.url === url);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Smart Reviewer</h1>
        <p className="text-muted-foreground mt-2">
          AI-powered news article analysis — search, analyze, and review
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Search Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search Articles</h2>
        <NewsSearch
          onArticleAnalyzed={onArticleAnalyzed}
          analyzedUrls={analyzedUrls}
          getAnalyzedArticle={getAnalyzedArticle}
        />
      </section>

      {currentAnalysis !== null && (
        <>
          <Separator className="mb-8" />
          {/* Analysis Result Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
            <AnalysisResult analysis={currentAnalysis} />
          </section>
        </>
      )}

      <Separator className="mb-8" />

      {/* History Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
        <HistoryTable refreshKey={historyRefreshKey} />
      </section>
    </main>
  );
}
