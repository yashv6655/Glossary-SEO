'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportFormProps {
  onSubmit?: (data: { repo: string; name: string }) => void
}

export function ImportForm({ onSubmit }: ImportFormProps) {
  const [repo, setRepo] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'input' | 'processing' | 'complete'>('input')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repo.trim()) return

    const projectName = name.trim() || repo.split('/').pop() || 'Untitled Project'

    try {
      setStep('processing')
      setError('')

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: repo.trim(),
          name: projectName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import repository')
      }

      setStep('complete')
      onSubmit?.(data)
    } catch (err) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during import')
      setStep('input')
    }
  }

  if (step === 'processing') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Processing Repository...</h3>
          <p className="text-sm text-gray-600">This may take a few minutes.</p>
        </CardContent>
      </Card>
    )
  }

  if (step === 'complete') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
          <Button asChild>
            <a href="/dashboard">View Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Import from GitHub</CardTitle>
        <CardDescription>Enter a GitHub repository URL to create a glossary from its entire codebase.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="repo"
            type="text"
            placeholder="e.g., facebook/react"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <Input
            id="name"
            type="text"
            placeholder="Project Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={!repo.trim() || step === 'processing'}>
            {step === 'processing' ? 'Analyzing...' : 'Import Repository'}
          </Button>
        </form>
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Analyzed Files</h4>
          <div className="flex flex-wrap gap-1">
            {['.js', '.ts', '.tsx', '.md', 'and more...'].map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
