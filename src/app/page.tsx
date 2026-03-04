// src/app/page.tsx
import { Separator } from '@/components/ui/separator';

export default function Home() {
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

      {/* Search Section — will be replaced by NewsSearch component in T8 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Search Articles</h2>
        <div className="text-muted-foreground text-sm">Search component placeholder</div>
      </section>

      <Separator className="mb-8" />

      {/* Analysis Result Section — will be replaced by AnalysisResult component in T9 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Analysis Result</h2>
        <div className="text-muted-foreground text-sm">Analysis result placeholder</div>
      </section>

      <Separator className="mb-8" />

      {/* History Section — will be replaced by HistoryTable component in T9 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Analysis History</h2>
        <div className="text-muted-foreground text-sm">History table placeholder</div>
      </section>
    </main>
  );
}
