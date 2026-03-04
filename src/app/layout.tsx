import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Reviewer — AI-Powered News Analysis',
  description: 'Search news articles and get AI-powered summaries and sentiment analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
