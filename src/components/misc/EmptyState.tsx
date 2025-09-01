import { Button } from '@/components/ui/button'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  actionHref, 
  icon 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
        {icon || <BookOpen className="h-8 w-8 text-gray-400" />}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 max-w-sm mb-6">
        {description}
      </p>
      
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  )
}