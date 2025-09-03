'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
}

export function TermCard({ term, projectSlug }: TermCardProps) {
  const truncatedDefinition = term.definition.length > 120 
    ? `${term.definition.slice(0, 120)}...` 
    : term.definition

  return (
    <Link href={`/${projectSlug}/glossary/${term.slug}`} className="block group">
      <Card className="h-full transition-all hover:scale-[1.02] hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="text-lg font-semibold group-hover:text-primary-600 transition-colors">
            {term.term}
          </CardTitle>
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
    </Link>
  )
}
