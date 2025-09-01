import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get project with term counts and stats
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        glossary_terms(
          id,
          term,
          slug,
          definition,
          tags,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      console.error('Project fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      )
    }

    // Calculate stats
    const terms = project.glossary_terms || []
    const stats = {
      totalTerms: terms.length,
      publishedTerms: terms.filter(t => t.status === 'published').length,
      draftTerms: terms.filter(t => t.status === 'draft').length
    }

    return NextResponse.json({
      project: {
        ...project,
        stats
      }
    })

  } catch (error) {
    console.error('Project API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}