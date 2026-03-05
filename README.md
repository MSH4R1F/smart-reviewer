# Smart Reviewer — AI-Powered News Analysis

A single-page web app that fetches real-time news articles, uses AI to generate summaries and sentiment analysis, and stores results in MongoDB. Built as an Aries take-home case study.

## Live Demo

[Live Demo](https://smart-reviewer-lemon.vercel.app) *(deploy URL to be added after Vercel setup)*

---

## Features

- **News Search** — Search for articles via GNews.io (up to 10 results per query)
- **One-Click AI Analysis** — Click any article card to instantly trigger AI analysis (no separate button)
- **Summary + Sentiment** — GPT-4o-mini generates a 2–3 sentence summary, sentiment label (positive/negative/neutral/mixed), confidence score, reasoning, and key topics — all in a single API call
- **Persistent History** — All analyzed articles are stored in MongoDB Atlas and displayed in a history table
- **Loading Skeletons** — Skeleton placeholders during search and table fetch
- **Error Toasts** — User-friendly toast notifications on all failure paths
- **Responsive UI** — Works on mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (New York style) |
| AI | OpenAI gpt-4o-mini via `openai` SDK v6 |
| News | GNews.io REST API (free tier) |
| Database | MongoDB Atlas M0 + Mongoose |
| Deployment | Vercel |

---

## Architecture

```
User
 │
 ├─ Types search query
 │       │
 │       ▼
 │   GET /api/news?q=... ──► GNews.io API
 │       │
 │       ▼
 │   Article Cards rendered
 │       │
 │       ▼ (user clicks a card)
 │
 ├─ POST /api/analyze ──► OpenAI gpt-4o-mini
 │       │                (summary + sentiment in one call)
 │       ▼
 │   POST /api/articles ──► MongoDB Atlas
 │       │                  (store article + analysis)
 │       ▼
 │   Analysis Result displayed
 │
 └─ GET /api/articles ──► MongoDB Atlas
         │                (fetch history on load + after each analysis)
         ▼
     History Table updated
```

All external API calls happen server-side through Next.js API routes — API keys are never exposed to the browser.

---

## Prerequisites

- **Node.js 18+**
- **MongoDB Atlas** account — [Create free M0 cluster](https://cloud.mongodb.com) (no credit card required)
- **OpenAI API key** — [Get at platform.openai.com](https://platform.openai.com/api-keys)
- **GNews API key** — [Register at gnews.io](https://gnews.io/register) (free tier: 100 req/day)

---

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd smart-reviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your keys in `.env.local` (see table below).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `GNEWS_API_KEY` | GNews.io API key for news search | [gnews.io/register](https://gnews.io/register) — free tier, 100 req/day |
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `MONGODB_URI` | MongoDB Atlas connection string | [cloud.mongodb.com](https://cloud.mongodb.com) — free M0 cluster |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/news?q=query` | Proxy to GNews.io — returns up to 10 articles |
| `POST` | `/api/analyze` | Calls OpenAI gpt-4o-mini for summary + sentiment |
| `GET` | `/api/articles` | Fetch all analyzed articles from MongoDB (newest first) |
| `POST` | `/api/articles` | Store a new analyzed article in MongoDB |

---

## Design Decisions

- **Single OpenAI call** — Summary and sentiment are combined into one structured output call using `zodResponseFormat`, minimizing API usage and latency.
- **Server-side API proxy** — All calls to GNews, OpenAI, and MongoDB happen in Next.js API routes. API keys are never sent to the browser.
- **Mongoose singleton with `var`** — The global Mongoose connection uses a `var` declaration (not `let`/`const`) to survive Next.js serverless hot-reload without creating duplicate connections.
- **`zodResponseFormat` for structured output** — Guarantees type-safe, schema-validated JSON from OpenAI. No manual JSON parsing or schema drift.
- **GNews 403 → 429 mapping** — GNews returns HTTP 403 on rate limit (not the standard 429). The proxy maps this correctly so clients receive accurate rate-limit signals.
- **Click-to-analyze UX** — Clicking the entire article card immediately triggers analysis. No separate "Analyze" button reduces friction and makes the flow feel instant.

---

## Running Tests

```bash
npm test
```

Light unit tests cover all 3 API routes (9 tests total): happy path + error cases for `/api/news`, `/api/analyze`, and `/api/articles`.

---

## What I'd Add With More Time

- **User authentication** — NextAuth.js with Google OAuth so each user has their own analysis history
- **Server-side caching** — Redis (Upstash) or Next.js ISR to cache GNews results and avoid hitting the 100 req/day limit during demos
- **Playwright E2E tests** — Full browser automation covering the search → analyze → history flow
- **Sentiment trend visualization** — A recharts line chart showing sentiment distribution over time
- **Article bookmarking** — Let users save/favorite articles for later reference
- **Rate limiting on API routes** — Upstash `@upstash/ratelimit` to protect the analyze endpoint from abuse
- **Pagination** — For the history table once the article count grows beyond a demo dataset
