import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireApiAuth } from '@/lib/auth/api-auth'
import { slugify } from '@/lib/utils'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const UpdateTermSchema = z.object({
  term: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['published', 'draft']).optional()
})

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const authResult = await requireApiAuth()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const updates = UpdateTermSchema.parse(body)
    
    const supabase = await createClient()

    // Prepare update object
    const updateData: any = {}
    if (updates.term !== undefined) {
      updateData.term = updates.term
      updateData.slug = slugify(updates.term)
    }
    if (updates.definition !== undefined) updateData.definition = updates.definition
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.status !== undefined) updateData.status = updates.status

    // Update term
    const { data: updatedTerm, error } = await supabase
      .from('glossary_terms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Term not found' },
          { status: 404 }
        )
      }
      console.error('Term update error:', error)
      return NextResponse.json(
        { error: 'Failed to update term' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      term: updatedTerm
    })

  } catch (error) {
    console.error('Update term error:', error)
    
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const authResult = await requireApiAuth()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('glossary_terms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Term deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete term' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Delete term error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}