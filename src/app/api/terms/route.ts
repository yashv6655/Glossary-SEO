import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireApiAuth } from '@/lib/auth/api-auth'
import { slugify } from '@/lib/utils'

const CreateTermSchema = z.object({
  project_id: z.string().uuid(),
  term: z.string().min(1),
  definition: z.string().min(1),
  tags: z.array(z.string()).default([]),
  status: z.enum(['published', 'draft']).default('published')
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const projectSlug = searchParams.get('project')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = (page - 1) * limit

    let query = supabase
      .from('glossary_terms')
      .select(`
        *,
        projects!inner(slug, name, is_public)
      `, { count: 'exact' })

    // Filter by project slug
    if (projectSlug) {
      query = query.eq('projects.slug', projectSlug)
    }

    // Filter by status
    if (status && ['published', 'draft'].includes(status)) {
      query = query.eq('status', status)
    }

    // Search in term name and definition
    if (search) {
      query = query.or(`term.ilike.%${search}%,definition.ilike.%${search}%`)
    }

    // Only show published terms for public projects (unless filtering by project)
    if (!projectSlug) {
      query = query.eq('status', 'published').eq('projects.is_public', true)
    }

    const { data: terms, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Terms fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch terms' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      terms: terms || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Terms API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication  
    const authResult = await requireApiAuth()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { project_id, term, definition, tags, status } = CreateTermSchema.parse(body)
    
    const supabase = await createClient()

    // Verify project exists and user owns it
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, owner_id')
      .eq('id', project_id)
      .eq('owner_id', authResult.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create term
    const { data: createdTerm, error: termError } = await supabase
      .from('glossary_terms')
      .insert({
        project_id,
        term,
        slug: slugify(term),
        definition,
        tags,
        status
      })
      .select()
      .single()

    if (termError) {
      console.error('Term creation error:', termError)
      return NextResponse.json(
        { error: 'Failed to create term' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      term: createdTerm
    })

  } catch (error) {
    console.error('Create term error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}