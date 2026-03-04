// src/lib/schemas.ts
import { z } from 'zod';

export const newsQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});

export const analyzeRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  content: z.string(),
  url: z.string().url().optional(),
});

export const articleAnalysisSchema = z.object({
  summary: z.string().describe('2-3 sentence summary of the article'),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']).describe('Overall sentiment of the article'),
  sentimentScore: z.number().min(0).max(1).describe('Confidence score from 0.0 to 1.0'),
  sentimentReasoning: z.string().describe('One sentence explaining the sentiment classification'),
  keyTopics: z.array(z.string()).describe('Up to 3 main topics covered in the article'),
});

// Infer TypeScript types from schemas where applicable
export type NewsQuery = z.infer<typeof newsQuerySchema>;
export type AnalyzeRequestData = z.infer<typeof analyzeRequestSchema>;
export type ArticleAnalysisData = z.infer<typeof articleAnalysisSchema>;
