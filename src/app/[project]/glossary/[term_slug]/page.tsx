import { notFound } from 'next/navigation'
import { getTermBySlug } from '@/lib/supabase/terms'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface TermPageProps {
  params: {
    project: string
    term_slug: string
  }
}

// This function generates the metadata for the page (title, description, etc.)
export async function generateMetadata({ params }: TermPageProps) {
  const termData = await getTermBySlug(params.project, params.term_slug)

  if (!termData) {
    return { title: 'Term not found' }
  }

  return {
    title: `What is ${termData.term}? | ${termData.project.name} Glossary`,
    description: termData.definition,
  }
}

export default async function TermPage({ params }: TermPageProps) {
  const termData = await getTermBySlug(params.project, params.term_slug)

  if (!termData) {
    notFound()
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/${params.project}/glossary`} className="hover:text-gray-700">
            {termData.project.name} Glossary
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-gray-700">{termData.term}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{termData.term}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              {termData.definition}
            </p>
            
            {termData.tags && termData.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Related Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {termData.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href={`/${params.project}/glossary`} className="text-primary-600 hover:text-primary-500">
            &larr; Back to full glossary
          </Link>
        </div>
      </div>
    </div>
  )
}