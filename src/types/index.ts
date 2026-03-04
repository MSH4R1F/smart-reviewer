// src/types/index.ts

export interface GNewsSource {
  name: string;
  url: string;
}

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: GNewsSource;
}

export interface ArticleAnalysis {
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  sentimentReasoning: string;
  keyTopics: string[];
}

export interface StoredArticle {
  _id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  sentimentReasoning: string;
  keyTopics: string[];
  analyzedAt: string;
}

export interface NewsSearchResponse {
  articles: GNewsArticle[];
  totalArticles: number;
}

export interface AnalyzeRequest {
  title: string;
  description: string;
  content: string;
}

export interface AnalyzeResponse {
  analysis: ArticleAnalysis;
}

export interface ApiError {
  error: string;
  status?: number;
}
