'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface ProjectCardProps {
  project: {
    id: string
    name: string
    slug: string
    repo: string
    termCount: number
    isPublic: boolean
    updatedAt: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/${project.slug}/glossary`}>
      <Card className="group cursor-pointer transition-all hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold group-hover:text-primary-600 transition-colors">
              {project.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <CardDescription className="text-gray-500">{project.repo}</CardDescription>
              {project.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>
              <strong className="text-gray-900">{project.termCount}</strong> terms
            </span>
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
      </Card>
    </Link>
  )
}