'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, ExternalLink } from 'lucide-react'

interface TermCardProps {
  term: {
    id: string
    term: string
    definition: string
    status: 'published' | 'draft'
    tags?: string[]
  }
  onEdit?: (term: any) => void
  showActions?: boolean
}

export function TermCard({ term, onEdit, showActions = false }: TermCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const truncatedDefinition = term.definition.length > 150 
    ? `${term.definition.slice(0, 150)}...` 
    : term.definition

  return (
    <Card 
      className="group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-card-hover"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary-600 transition-colors">
              {term.term}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={term.status === 'published' ? 'success' : 'secondary'}
                className="text-xs"
              >
                {term.status}
              </Badge>
              {term.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="text-sm text-gray-700 leading-relaxed">
          {isExpanded ? term.definition : truncatedDefinition}
          {term.definition.length > 150 && (
            <button
              className="ml-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </CardDescription>
      </CardContent>
    </Card>
  )
}