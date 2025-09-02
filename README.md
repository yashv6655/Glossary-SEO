# DevGlossary - Technical Content SEO Platform

**Auto-generate SEO-optimized glossaries that capture developer search traffic.**

Transform your GitHub repos into hundreds of search-ranking definition pages. When developers Google "what is webpack hot module replacement" or "Next.js middleware explained", they find YOUR glossary pages instead of Stack Overflow.

## The SEO Value

- **Long-tail Search Capture**: Rank for thousands of "what is [technical term]" searches  
- **Content at Scale**: Generate 50+ SEO pages from one repository automatically
- **Developer Traffic Funnel**: Convert definition searches into product awareness
- **Technical Authority**: Own the definition space in your domain

Perfect for developer tool companies who want to capture technical search traffic without hiring content teams.

## Features

- 🤖 **AI-Powered**: Claude extracts and defines technical terms with SEO optimization
- 📚 **GitHub Integration**: Import from any repository (React, Vue, your product docs)
- 🔍 **Search Optimized**: Each term becomes a rankable landing page
- 🎯 **Developer Focused**: Captures technical searches competitors miss
- 📱 **Production Ready**: Clean UI, fast search, mobile-responsive

## Quick Start

1. **Clone and setup**:
   ```bash
   cd dev-glossary
   npm install
   ```

2. **Environment setup**:
   Copy `.env.example` to `.env.local` and add your keys:
   ```bash
   # Required
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   CLAUDE_KEY=your_claude_api_key
   
   # Optional (for higher rate limits)
   GITHUB_TOKEN=your_github_token
   ```

3. **Database setup**:
   - Create a new Supabase project
   - Run the SQL from `src/lib/database/schema.sql` in your Supabase SQL editor

4. **Start development**:
   ```bash
   npm run dev
   ```
   
   Visit [http://localhost:3000](http://localhost:3000)

## ROI for Developer Tool Companies

**Instead of $50k/month for content writers, generate technical SEO content automatically.**

Examples:
- **Vercel** could capture "Edge function deployment" searches
- **Linear** could own "Git workflow automation" definitions  
- **PostHog** could rank for "Event tracking analytics" queries

Each imported repository becomes dozens of search-optimized landing pages that build domain authority and capture qualified developer traffic.

## How It Works

1. **Import**: Enter any GitHub repository URL (`facebook/react`, `your-company/docs`)
2. **AI Extract**: Claude scans documentation for technical terms and concepts
3. **SEO Optimize**: Each term becomes a search-friendly definition page
4. **Rank & Convert**: Capture developer searches and funnel to your product

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API for term extraction
- **Integration**: GitHub API for repository access

## API Endpoints

- `POST /api/import` - Import repository and extract terms
- `GET /api/projects` - List all projects
- `GET /api/projects/[slug]` - Get project details
- `GET /api/terms` - List terms (with filtering)
- `POST /api/terms` - Create new term
- `PATCH /api/terms/[id]` - Update term
- `DELETE /api/terms/[id]` - Delete term

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── api/                # API routes
│   ├── dashboard/          # Project management
│   ├── import/             # Repository import flow
│   └── [project]/glossary/ # Public glossary pages
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   ├── cards/             # Project/Term cards
│   ├── forms/             # Import forms
│   └── layout/            # Header/Footer
├── lib/                   # Utilities and integrations
│   ├── supabase/          # Database client
│   ├── github.ts          # GitHub API client
│   ├── claude.ts          # Claude AI integration
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript definitions
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT License - see LICENSE file for details.