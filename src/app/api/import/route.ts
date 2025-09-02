import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GitHubClient } from '@/lib/github'
import { ClaudeClient } from '@/lib/claude'
import { createClient } from '@/lib/supabase/server'
import { requireApiAuth } from '@/lib/auth/api-auth'
import { slugify } from '@/lib/utils'

const ImportRequestSchema = z.object({
  repo: z.string().min(1, 'Repository is required'),
  name: z.string().optional()
})

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
    const { repo, name, analysisPath } = ImportRequestSchema.parse(body)

    // Initialize clients
    const githubToken = process.env.GITHUB_TOKEN
    const claudeKey = process.env.CLAUDE_KEY
    
    if (!claudeKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    const github = new GitHubClient(githubToken)
    const claude = new ClaudeClient(claudeKey)
    const supabase = await createClient()

    // Parse repository URL/path
    const repoInfo = github.parseRepoUrl(repo)
    if (!repoInfo) {
      return NextResponse.json(
        { error: 'Invalid repository format. Use owner/repo or GitHub URL' },
        { status: 400 }
      )
    }

    // Fetch documentation files
    console.log(`[IMPORT] Fetching documentation for ${repoInfo.owner}/${repoInfo.repo}`)
    const docFiles = await github.findDocumentationFiles(repoInfo.owner, repoInfo.repo, analysisPath)
    console.log(`[IMPORT] Found ${docFiles.length} documentation files`)
    
    if (docFiles.length === 0) {
      return NextResponse.json(
        { error: 'No documentation files found in repository' },
        { status: 404 }
      )
    }

    // Extract terms using Claude
    console.log(`[IMPORT] Extracting terms from ${docFiles.length} documentation files`)
    const extractedTerms = await claude.extractTerms(docFiles)
    console.log(`[IMPORT] Extracted ${extractedTerms.length} terms`)

    if (extractedTerms.length === 0) {
      return NextResponse.json(
        { error: 'No terms could be extracted from the documentation' },
        { status: 404 }
      )
    }

    // Create or update project
    const projectName = name || repoInfo.repo
    let projectSlug = slugify(projectName)
    
    // Check if project already exists for this user
    console.log(`[IMPORT] Checking for existing project "${projectName}" for user ${authResult.user.id}`)
    const { data: existingProject } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', projectSlug)
      .eq('owner_id', authResult.user.id)
      .single()

    let project
    if (existingProject) {
      console.log(`[IMPORT] Updating existing project ${existingProject.id}`)
      
      // Delete existing terms first
      await supabase
        .from('glossary_terms')
        .delete()
        .eq('project_id', existingProject.id)
      
      // Update project with new repo info
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({
          repo: `${repoInfo.owner}/${repoInfo.repo}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProject.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Project update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update project' },
          { status: 500 }
        )
      }
      
      project = updatedProject
    } else {
      // Generate unique slug if needed
      let slugSuffix = 1
      let uniqueSlug = projectSlug
      
      while (true) {
        const { data: conflictCheck } = await supabase
          .from('projects')
          .select('id')
          .eq('slug', uniqueSlug)
          .single()
        
        if (!conflictCheck) {
          projectSlug = uniqueSlug
          break
        }
        
        uniqueSlug = `${projectSlug}-${slugSuffix}`
        slugSuffix++
      }
      
      console.log(`[IMPORT] Creating new project "${projectName}" with slug "${projectSlug}"`)
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          slug: projectSlug,
          repo: `${repoInfo.owner}/${repoInfo.repo}`,
          is_public: true,
          owner_id: authResult.user.id,
          created_by: authResult.user.id
        })
        .select()
        .single()

      if (projectError) {
        console.error('Project creation error:', projectError)
        return NextResponse.json(
          { error: 'Failed to create project' },
          { status: 500 }
        )
      }
      
      project = newProject
    }

    // Create glossary terms
    const termsToInsert = extractedTerms.map(term => ({
      project_id: project.id,
      term: term.term,
      slug: slugify(term.term),
      definition: term.definition,
      tags: term.tags,
      status: 'published' as const
    }))

    console.log(`[IMPORT] Creating ${termsToInsert.length} terms`)
    const { data: createdTerms, error: termsError } = await supabase
      .from('glossary_terms')
      .insert(termsToInsert)
      .select()

    console.log(`[IMPORT] Terms creation result:`, { count: createdTerms?.length, error: termsError })

    if (termsError) {
      console.error('Terms creation error:', termsError)
      // Clean up project if terms creation fails
      await supabase.from('projects').delete().eq('id', project.id)
      return NextResponse.json(
        { error: 'Failed to create glossary terms' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        repo: project.repo
      },
      import_result: {
        repo: `${repoInfo.owner}/${repoInfo.repo}`,
        files_found: docFiles.map(f => f.path),
        terms_extracted: extractedTerms.length,
        terms_created: createdTerms || []
      }
    })

  } catch (error) {
    console.error('Import error:', error)
    
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

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 5 // requests per window
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const client = requestCounts.get(clientId)

  if (!client || now > client.resetTime) {
    requestCounts.set(clientId, { count: 1, resetTime: now + WINDOW_MS })
    return true
  }

  if (client.count >= RATE_LIMIT) {
    return false
  }

  client.count++
  return true
}

export async function middleware(request: NextRequest) {
  // Simple rate limiting by IP
  const clientId = request.ip || 'anonymous'
  
  if (!checkRateLimit(clientId)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}