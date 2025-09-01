-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  repo TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Glossary terms table  
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  slug TEXT NOT NULL,
  definition TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_project_id ON glossary_terms(project_id);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_status ON glossary_terms(status);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_slug ON glossary_terms(slug);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_glossary_terms_updated_at 
    BEFORE UPDATE ON glossary_terms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Public projects are visible to everyone" ON projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own projects" ON projects 
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own projects" ON projects 
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" ON projects 
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" ON projects 
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for glossary_terms (inherit from projects)
CREATE POLICY "Terms from public projects are visible to everyone" ON glossary_terms
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE is_public = true
    )
  );

CREATE POLICY "Users can view terms from their own projects" ON glossary_terms
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create terms in their own projects" ON glossary_terms
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update terms in their own projects" ON glossary_terms
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete terms from their own projects" ON glossary_terms
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );