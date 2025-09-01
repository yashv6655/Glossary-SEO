import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Eye, Settings, Share2 } from 'lucide-react'

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
      
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${project.slug}/glossary`}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${project.slug}/manage`}>
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Link>
          </Button>
        </div>
        
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}