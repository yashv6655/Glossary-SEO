'use client'

import { useState, useEffect, use } from 'react'
import { TermCard } from '@/components/cards/TermCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, ExternalLink, Share2, Loader2 } from 'lucide-react'

interface GlossaryPageProps {
  params: Promise<{
    project: string
  }>
}

export default function GlossaryPage({ params }: GlossaryPageProps) {
  const { project: projectSlug } = use(params)
  const [projectData, setProjectData] = useState<any>(null)
  const [terms, setTerms] = useState<any[]>([])
  const [filteredTerms, setFilteredTerms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalTerms, setTotalTerms] = useState(0)

  useEffect(() => {
    if (projectSlug) {
      fetchProjectData()
    }
  }, [projectSlug])

  const fetchProjectData = async (page = 1, resetData = true) => {
    try {
      if (resetData) {
        setLoading(true)
        setCurrentPage(1)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }
      
      console.log(`[GLOSSARY] Fetching data for project: ${projectSlug}, page: ${page}`)
      
      // Fetch project details only on initial load
      if (resetData) {
        const projectResponse = await fetch(`/api/projects/${projectSlug}`)
        if (!projectResponse.ok) {
          throw new Error('Project not found')
        }
        const projectResult = await projectResponse.json()
        setProjectData(projectResult.project)
      }
      
      // Fetch terms for this project with pagination
      const termsResponse = await fetch(`/api/terms?project=${projectSlug}&status=published&page=${page}`)
      if (!termsResponse.ok) {
        throw new Error('Failed to fetch terms')
      }
      const termsResult = await termsResponse.json()
      
      console.log('[GLOSSARY] Data loaded:', { 
        page, 
        termsCount: termsResult.terms?.length,
        pagination: termsResult.pagination
      })
      
      const newTerms = termsResult.terms || []
      const pagination = termsResult.pagination
      
      if (resetData) {
        setTerms(newTerms)
        setFilteredTerms(newTerms)
      } else {
        // Append new terms to existing ones, avoiding duplicates
        setTerms(prevTerms => {
          const existingIds = new Set(prevTerms.map(term => term.id))
          const uniqueNewTerms = newTerms.filter(term => !existingIds.has(term.id))
          return [...prevTerms, ...uniqueNewTerms]
        })
        setFilteredTerms(prevFiltered => {
          const existingIds = new Set(prevFiltered.map(term => term.id))
          const uniqueNewTerms = newTerms.filter(term => !existingIds.has(term.id))
          return [...prevFiltered, ...uniqueNewTerms]
        })
      }
      
      setTotalTerms(pagination?.total || 0)
      setHasMore(pagination?.page < pagination?.pages)
      setCurrentPage(pagination?.page || 1)
      
    } catch (err) {
      console.error('[GLOSSARY] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load glossary')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more terms
  const loadMoreTerms = async () => {
    if (!hasMore || loadingMore) return
    await fetchProjectData(currentPage + 1, false)
  }

  // Reset and refetch when search/filter changes
  useEffect(() => {
    if (searchQuery.trim() || selectedTag) {
      // For search/filter, we'll need to refetch from the beginning
      // For now, we'll filter client-side from loaded terms
      let filtered = terms

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        filtered = filtered.filter(term => 
          term.term.toLowerCase().includes(query) ||
          term.definition?.toLowerCase().includes(query) ||
          (term.tags && term.tags.some((tag: string) => tag.toLowerCase().includes(query)))
        )
      }

      // Apply tag filter
      if (selectedTag) {
        filtered = filtered.filter(term => 
          term.tags && term.tags.includes(selectedTag)
        )
      }

      setFilteredTerms(filtered)
    } else {
      // No filters, show all loaded terms
      setFilteredTerms(terms)
    }
  }, [terms, searchQuery, selectedTag])

  const handleTagFilter = (tag: string | null) => {
    setSelectedTag(selectedTag === tag ? null : tag)
  }

  const uniqueTags = Array.from(new Set(terms.flatMap(term => term.tags || [])))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading glossary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Glossary</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => fetchProjectData()}
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

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {projectData.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Developer glossary for {projectData.repo}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>
                  {totalTerms > 0 ? (
                    <>
                      {terms.length} of {totalTerms} terms loaded
                      {terms.length < totalTerms && <span className="text-primary-600 ml-1">(+ {totalTerms - terms.length} more)</span>}
                    </>
                  ) : (
                    `${terms.length} terms`
                  )}
                </span>
                <span>•</span>
                <span>Updated {new Date(projectData.updated_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <ExternalLink className="h-4 w-4" />
                  <span>{projectData.repo}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" asChild>
                <a href={`https://github.com/${projectData.repo}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Repository
                </a>
              </Button>
            </div>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedTag === null ? "default" : "outline"} 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleTagFilter(null)}
              >
                All
              </Badge>
              {uniqueTags.slice(0, 6).map((tag) => (
                <Badge 
                  key={tag} 
                  variant={selectedTag === tag ? "default" : "outline"} 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleTagFilter(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredTerms.length} of {totalTerms > 0 ? totalTerms : terms.length} terms
            {searchQuery && <span> for &quot;{searchQuery}&quot;</span>}
            {selectedTag && <span> tagged with &quot;{selectedTag}&quot;</span>}
            {(searchQuery || selectedTag) && terms.length < totalTerms && (
              <span className="text-amber-600 ml-2">(filtered from {terms.length} loaded terms - load more to see all results)</span>
            )}
          </p>
        </div>

        {/* Terms Grid */}
        {filteredTerms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTerms.map((term) => (
                <TermCard key={term.id} term={term} projectSlug={projectSlug} />
              ))}
            </div>
            
            {/* Load More Button */}
            {!searchQuery && !selectedTag && hasMore && (
              <div className="mt-12 text-center">
                <Button
                  onClick={loadMoreTerms}
                  disabled={loadingMore}
                  size="lg"
                  variant="outline"
                  className="min-w-32"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Terms
                      <span className="ml-2 text-sm text-gray-500">
                        ({totalTerms - terms.length} remaining)
                      </span>
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Loaded {terms.length} of {totalTerms} terms
                </p>
              </div>
            )}

            {/* All Loaded Message */}
            {!hasMore && terms.length > 20 && (
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500">
                  All {totalTerms} terms loaded
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No terms found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setSelectedTag(null)
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}