import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireApiAuth } from '@/lib/auth/api-auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication - only return user's own projects
    const authResult = await requireApiAuth()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const offset = (page - 1) * limit

    // Get user's projects with term counts
    const { data: projects, error, count } = await supabase
      .from('projects')
      .select(`
        *,
        glossary_terms(count)
      `, { count: 'exact' })
      .eq('owner_id', authResult.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Projects fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    // Transform data to include term counts
    const transformedProjects = projects?.map(project => ({
      ...project,
      termCount: project.glossary_terms?.[0]?.count || 0
    })) || []

    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}