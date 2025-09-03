'use client'

import { useState, useEffect, use } from 'react'
import { TermCard } from '@/components/cards/TermCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus, Filter, MoreHorizontal, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ManagePageProps {
  params: Promise<{
    project: string
  }>
}

export default function ManagePage({ params }: ManagePageProps) {
  const { project: projectSlug } = use(params)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [projectData, setProjectData] = useState<any>(null)
  const [terms, setTerms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (projectSlug) {
      fetchProjectData()
    }
  }, [projectSlug])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      console.log(`[MANAGE] Fetching data for project: ${projectSlug}`)
      
      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${projectSlug}`)
      if (!projectResponse.ok) {
        throw new Error('Project not found')
      }
      const projectResult = await projectResponse.json()
      
      // Fetch all terms for management (including drafts)
      const termsResponse = await fetch(`/api/terms?project=${projectSlug}`)
      if (!termsResponse.ok) {
        throw new Error('Failed to fetch terms')
      }
      const termsResult = await termsResponse.json()
      
      console.log('[MANAGE] Data loaded:', { project: projectResult.project, termsCount: termsResult.terms?.length })
      
      setProjectData(projectResult.project)
      setTerms(termsResult.terms || [])
    } catch (err) {
      console.error('[MANAGE] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const filteredTerms = terms.filter(term => {
    if (filter === 'all') return true
    return term.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Project</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={fetchProjectData}
            className="text-primary-600 hover:text-primary-500"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
        </div>
      </div>
    )
  }

  const handleEditTerm = (term: any) => {
    // In real app, this would open an edit modal or navigate to edit page
    console.log('Edit term:', term)
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage {projectData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Review and organize terms extracted from {projectData.repo}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${encodeURIComponent(projectSlug)}/glossary`}>
                  View Public Glossary
                </Link>
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Term
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{terms.length}</div>
            <div className="text-sm text-gray-600">Total Terms</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {terms.filter(t => t.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {terms.filter(t => t.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
            <div className="text-2xl font-bold text-primary-600">
              {terms.length > 0 
                ? Math.round((terms.filter(t => t.status === 'published').length / terms.length) * 100)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search terms..."
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({terms.length})
              </Button>
              <Button
                variant={filter === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('published')}
              >
                Published ({terms.filter(t => t.status === 'published').length})
              </Button>
              <Button
                variant={filter === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('draft')}
              >
                Drafts ({terms.filter(t => t.status === 'draft').length})
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((term) => (
            <TermCard 
              key={term.id} 
              term={term} 
              projectSlug={projectSlug}
              onEdit={handleEditTerm}
              showActions={true}
            />
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No terms found for the current filter</div>
            <Button variant="outline" onClick={() => setFilter('all')}>
              Show All Terms
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
