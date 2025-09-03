'use client'

import { useState, useEffect } from 'react'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { EmptyState } from '@/components/misc/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/providers/auth-provider'
import { Plus, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted && user) {
      fetchUserProjects()
    }
  }, [isMounted, user])

  const fetchUserProjects = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('[DASHBOARD] Fetching user projects...')
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[DASHBOARD] Projects fetch failed:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch projects`)
      }

      const data = await response.json()
      console.log('[DASHBOARD] Projects fetched:', data)
      setProjects(data.projects || [])
    } catch (err) {
      console.error('[DASHBOARD] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sign in to access your dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create and manage your developer glossaries with authentication.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const hasProjects = projects.length > 0

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user.email?.split('@')[0]}! Manage your glossaries and track project documentation.
            </p>
          </div>
          <Button asChild>
            <Link href="/import">
              <Plus className="h-4 w-4 mr-2" />
              New Glossary
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-gray-600">Loading your projects...</span>
          </div>
        )}

        {!loading && hasProjects && (
          <>
            {/* Search and Filters */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, p) => acc + (p.termCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Terms</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.is_public).length}
                </div>
                <div className="text-sm text-gray-600">Public Glossaries</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
                <div className="text-2xl font-bold text-primary-600">
                  {projects.length > 0 
                    ? Math.round(projects.reduce((acc, p) => acc + (p.termCount || 0), 0) / projects.length)
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-600">Avg Terms/Project</div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={{
                    id: project.id,
                    name: project.name,
                    slug: project.slug,
                    repo: project.repo,
                    termCount: project.termCount || 0,
                    isPublic: project.is_public,
                    updatedAt: project.updated_at
                  }} 
                />
              ))}
            </div>
          </>
        )}

        {!loading && !hasProjects && (
          <div className="py-12">
            <EmptyState
              title="No glossaries yet"
              description="Get started by importing a GitHub repository to create your first developer glossary."
              actionLabel="Import Repository"
              actionHref="/import"
            />
          </div>
        )}
      </div>
    </div>
  )
}
