export interface Project {
  id: string
  name: string
  slug: string
  repo: string
  is_public: boolean
  owner_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface GlossaryTerm {
  id: string
  project_id: string
  term: string
  slug: string
  definition: string
  tags: string[]
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}

export interface ImportResult {
  repo: string
  files_found: string[]
  terms_extracted: number
  terms_created: GlossaryTerm[]
}