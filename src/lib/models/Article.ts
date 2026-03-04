import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: Date | null;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  sentimentReasoning: string;
  keyTopics: string[];
  analyzedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    url: { type: String, required: true },
    image: { type: String, default: null },
    publishedAt: { type: Date, default: null },
    sourceName: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    summary: { type: String, required: true },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
      required: true,
    },
    sentimentScore: { type: Number, required: true },
    sentimentReasoning: { type: String, default: '' },
    keyTopics: { type: [String], default: [] },
    analyzedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false, // We manage analyzedAt ourselves
  }
);

// Index for sorting history table by newest first
articleSchema.index({ analyzedAt: -1 });

// ISR-safe export: prevent model recompilation in Next.js hot reload
const Article = (mongoose.models.Article as mongoose.Model<IArticle>) ||
  mongoose.model<IArticle>('Article', articleSchema);

export default Article;
