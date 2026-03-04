'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { NewsSearch } from '@/components/NewsSearch';
import { AnalysisResult } from '@/components/AnalysisResult';
import { HistoryTable } from '@/components/HistoryTable';
import type { GNewsArticle, StoredArticle } from '@/types/index';

export default function Home() {
  const [view, setView] = useState<'search' | 'detail'>('search');
  const [selectedArticle, setSelectedArticle] = useState<GNewsArticle | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<StoredArticle | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [analyzedArticles, setAnalyzedArticles] = useState<StoredArticle[]>([]);

  const handleArticleSelected = (article: GNewsArticle) => {
    setSelectedArticle(article);
    setPendingAnalysis(null);
    setIsAnalyzing(true);
    setView('detail');
  };

  const handleAnalysisComplete = (stored: StoredArticle) => {
    setPendingAnalysis(stored);
    setIsAnalyzing(false);
    setAnalyzedArticles((prev) => [...prev, stored]);
    setHistoryRefreshKey((prev) => prev + 1);
  };

  const handleBack = () => {
    setView('search');
    setSelectedArticle(null);
    setPendingAnalysis(null);
    setIsAnalyzing(false);
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

      {/* Search + History (hidden when viewing detail, but stays mounted to preserve state) */}
      <div className={view === 'detail' ? 'hidden' : ''}>
        {/* Search Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Articles</h2>
          <NewsSearch
            onArticleSelected={handleArticleSelected}
            onArticleAnalyzed={handleAnalysisComplete}
            analyzedUrls={analyzedUrls}
            getAnalyzedArticle={getAnalyzedArticle}
          />
        </section>

        <Separator className="mb-8" />

        {/* History Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
          <HistoryTable refreshKey={historyRefreshKey} />
        </section>
      </div>

      {/* Detail View */}
      {view === 'detail' && selectedArticle && (
        <>
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            ← Back to search
          </button>
          <AnalysisResult
            article={selectedArticle}
            analysis={pendingAnalysis}
            isLoading={isAnalyzing}
          />
        </>
      )}
    </main>
  );
}
