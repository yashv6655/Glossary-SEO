'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Github, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportFormProps {
  onSubmit?: (data: { repo: string; name: string }) => void
  isLoading?: boolean
}

export function ImportForm({ onSubmit, isLoading }: ImportFormProps) {
  const [repo, setRepo] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'input' | 'preview' | 'processing' | 'complete'>('input')
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<any>(null)
  
  const mockFiles = [
    'README.md',
    'docs/getting-started.md',
    'docs/api-reference.md',
    'CONTRIBUTING.md'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repo.trim()) return
    
    const projectName = name.trim() || repo.split('/').pop() || 'Untitled Project'
    
    try {
      setStep('processing')
      setError('')

      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          repo: repo.trim(), 
          name: projectName 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import repository')
      }

      // Success - show completion state with real data
      setStep('complete')
      setSuccessData(data)
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
          <h3 className="text-lg font-semibold mb-2">Processing Repository</h3>
          <p className="text-sm text-gray-600 text-center">
            Analyzing documentation and extracting terms...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (step === 'complete') {
    const termsCount = successData?.import_result?.terms_created?.length || 0
    const filesCount = successData?.import_result?.files_found?.length || 0
    
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            Successfully extracted <strong>{termsCount} terms</strong> from {filesCount} documentation files.
          </p>
          <div className="text-xs text-gray-500 mb-4 text-center">
            Project: <strong>{successData?.project?.name}</strong>
          </div>
          <Button asChild>
            <a href="/dashboard">View Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'preview') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span>Found Documentation</span>
          </CardTitle>
          <CardDescription>
            We found these documentation files in <strong>{repo}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            {mockFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{file}</span>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setStep('input')}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={() => setStep('processing')}
              className="flex-1"
            >
              Import Terms
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Github className="h-5 w-5" />
          <span>Import from GitHub</span>
        </CardTitle>
        <CardDescription>
          Enter a GitHub repository URL to extract terms from its documentation
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="repo" className="text-sm font-medium text-gray-700">
              Repository URL or owner/repo
            </label>
            <Input
              id="repo"
              type="text"
              placeholder="e.g., facebook/react or https://github.com/facebook/react"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Project Name (optional)
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Auto-detected from repository"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!repo.trim() || step === 'processing'}
          >
            {step === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Repository...
              </>
            ) : (
              'Analyze Repository'
            )}
          </Button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Supported Files</h4>
          <div className="flex flex-wrap gap-1">
            {['README.md', 'docs/', 'CONTRIBUTING.md', '.md files'].map((type) => (
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