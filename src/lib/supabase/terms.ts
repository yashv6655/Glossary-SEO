import { createClient } from '@/lib/supabase/server'

export async function getTermBySlug(projectSlug: string, termSlug: string) {
  const supabase = await createClient()

  const { data: term, error } = await supabase
    .from('glossary_terms')
    .select(`
      *,
      project:projects!inner(*)
    `)
    .eq('project.slug', projectSlug)
    .eq('slug', termSlug)
    .single()

  if (error) {
    console.error('Error fetching term:', error)
    return null
  }

  return term
}
