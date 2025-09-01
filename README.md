# DevGlossary

A beautiful, AI-powered tool for generating developer glossaries from GitHub repositories. Extract technical terms from your documentation and create searchable, SEO-friendly glossaries.

## Features

- 🤖 **AI-Powered**: Uses Claude AI to intelligently extract and define technical terms
- 📚 **GitHub Integration**: Import documentation from any public repository
- 🎨 **Beautiful UI**: Clean, Airbnb-inspired design with responsive layouts
- 🔍 **Searchable**: Fast, instant search through terms and definitions
- 🌐 **SEO-Friendly**: Public glossary pages optimized for search engines
- 📱 **Mobile-First**: Responsive design that works on all devices

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

## How It Works

1. **Import**: Enter a GitHub repository URL (e.g., `facebook/react`)
2. **Extract**: AI scans README, docs, and markdown files for technical terms
3. **Glossary**: Get a beautiful, searchable glossary with definitions
4. **Share**: Public SEO-friendly pages for each project glossary

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