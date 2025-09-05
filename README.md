# DevGlossary - Technical Content SEO Platform

**Auto-generate SEO-optimized glossaries that capture developer search traffic.**

Transform your GitHub repos into hundreds of search-ranking definition pages. When developers Google "what is webpack hot module replacement" or "Next.js middleware explained", they find YOUR glossary pages instead of Stack Overflow.

## The SEO Value

- **Long-tail Search Capture**: Rank for thousands of "what is [technical term]" searches  
- **Content at Scale**: Generate 50+ SEO pages from one repository automatically
- **Developer Traffic Funnel**: Convert definition searches into product awareness
- **Technical Authority**: Own the definition space in your domain

Perfect for developer tool companies who want to capture technical search traffic without hiring content teams.

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

## How This Helps Sita's ICP

`dev-glossary` is more than just an SEO tool; it's a project designed to improve the developer experience.

### For Developer Tool Companies

- **Solve the "Developer Marketing" Problem:** Attract high-intent developer traffic through content-driven SEO without the high cost of a dedicated content team.
- **Streamline Onboarding:** Use the generated glossary as a "map" to your codebase, helping new hires become productive faster.

### For Individual Developers

- **Learn New Codebases Faster:** The generated glossaries provide a clear, searchable reference for any new project, making it easier to understand the key concepts and components.
- **Demystify "Tribal Knowledge":** By analyzing the code itself, `dev-glossary` surfaces internal components and terminology that are often undocumented.

This project directly supports Sita's core mission of making it easier for developers to learn new codebases. By providing a tool that creates high-quality, comprehensive glossaries, we are helping to build a more accessible and understandable open-source ecosystem.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API for term extraction
- **Integration**: GitHub API for repository access
