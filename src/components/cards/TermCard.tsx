'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

interface TermCardProps {
  term: {
    id: string
    term: string
    slug: string
    definition: string
    status: 'published' | 'draft'
    tags?: string[]
  }
  projectSlug: string
  onEdit?: (term: any) => void
  showActions?: boolean
}

export function TermCard({ term, projectSlug, onEdit, showActions = false }: TermCardProps) {
  const truncatedDefinition = term.definition.length > 120 
    ? `${term.definition.slice(0, 120)}...` 
    : term.definition

  const cardContent = (
    <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-card-hover group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold group-hover:text-primary-600 transition-colors">
            {term.term}
          </CardTitle>
          {showActions && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(term)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-gray-700 leading-relaxed">
          {truncatedDefinition}
        </CardDescription>
        {term.tags && term.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {term.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (showActions) {
    return cardContent
  }

  return (
    <Link href={`/${projectSlug}/glossary/${term.slug}`} className="block h-full">
      {cardContent}
    </Link>
  )
}
