'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { StoredArticle } from '@/types/index';

interface HistoryTableProps {
  refreshKey: number;
}

const sentimentConfig = {
  positive: { label: 'Positive', className: 'bg-green-100 text-green-800' },
  negative: { label: 'Negative', className: 'bg-red-100 text-red-800' },
  neutral: { label: 'Neutral', className: 'bg-yellow-100 text-yellow-800' },
  mixed: { label: 'Mixed', className: 'bg-blue-100 text-blue-800' },
} as const;

export function HistoryTable({ refreshKey }: HistoryTableProps) {
  const [articles, setArticles] = useState<StoredArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch {
        // Silently fail — table just stays empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No articles analyzed yet. Search for articles above to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Title</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Sentiment</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => {
            const sentiment = sentimentConfig[article.sentiment] ?? sentimentConfig.neutral;
            return (
              <TableRow key={article._id}>
                <TableCell className="font-medium">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline line-clamp-2 text-sm"
                  >
                    {article.title}
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {article.sourceName}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sentiment.className}`}
                  >
                    {sentiment.label}
                  </span>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {(article.sentimentScore * 100).toFixed(0)}%
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(article.analyzedAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
