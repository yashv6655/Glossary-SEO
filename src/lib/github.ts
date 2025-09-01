import { z } from 'zod'

const GitHubFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'dir']),
  content: z.string().optional(),
  download_url: z.string().nullable().optional()
})

export type GitHubFile = z.infer<typeof GitHubFileSchema>

export class GitHubClient {
  private baseUrl = 'https://api.github.com'
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  private async fetch(url: string) {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DevGlossary/1.0'
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getRepoFiles(owner: string, repo: string, path: string = ''): Promise<GitHubFile[]> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`
    const data = await this.fetch(url)
    return Array.isArray(data) ? data.map(file => GitHubFileSchema.parse(file)) : [GitHubFileSchema.parse(data)]
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`
    const data = await this.fetch(url)
    
    if (data.type !== 'file' || !data.content) {
      throw new Error(`File not found or is not a regular file: ${path}`)
    }

    // GitHub returns base64 encoded content
    return Buffer.from(data.content, 'base64').toString('utf-8')
  }

  async findDocumentationFiles(owner: string, repo: string): Promise<{ path: string; content: string }[]> {
    const documentationFiles: { path: string; content: string }[] = []
    
    // Common documentation file patterns
    const docPatterns = [
      /^README\.md$/i,
      /^CONTRIBUTING\.md$/i,
      /^docs\/.*\.md$/i,
      /^documentation\/.*\.md$/i,
      /.*\.md$/i // Fallback to any markdown file
    ]

    try {
      // Get root files
      const rootFiles = await this.getRepoFiles(owner, repo)
      
      // Check root level files
      for (const file of rootFiles) {
        if (file.type === 'file' && docPatterns.some(pattern => pattern.test(file.path))) {
          try {
            const content = await this.getFileContent(owner, repo, file.path)
            documentationFiles.push({ path: file.path, content })
          } catch (error) {
            console.warn(`[GITHUB] Failed to fetch content for ${file.path}:`, error)
          }
        }
        
        // Check docs directory
        if (file.type === 'dir' && (file.name === 'docs' || file.name === 'documentation')) {
          try {
            const docDirFiles = await this.getRepoFiles(owner, repo, file.path)
            for (const docFile of docDirFiles) {
              if (docFile.type === 'file' && docFile.path.endsWith('.md')) {
                try {
                  const content = await this.getFileContent(owner, repo, docFile.path)
                  documentationFiles.push({ path: docFile.path, content })
                } catch (error) {
                  console.warn(`[GITHUB] Failed to fetch content for ${docFile.path}:`, error)
                }
              }
            }
          } catch (error) {
            console.warn(`[GITHUB] Failed to fetch docs directory ${file.path}:`, error)
          }
        }
      }

      return documentationFiles.slice(0, 10) // Limit to first 10 files to avoid rate limits
    } catch (error) {
      console.error('[GITHUB] Repository fetch error:', error)
      if (error instanceof Error) {
        // More user-friendly error messages
        if (error.message.includes('404')) {
          throw new Error(`Repository "${owner}/${repo}" not found or is private`)
        }
        if (error.message.includes('403')) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.')
        }
        if (error.message.includes('Invalid input')) {
          throw new Error('Unable to access some files in the repository. This may be due to large files or GitHub API limitations.')
        }
      }
      throw new Error(`Failed to access repository "${owner}/${repo}". Please check the repository name and try again.`)
    }
  }

  parseRepoUrl(input: string): { owner: string; repo: string } | null {
    // Handle different GitHub URL formats
    const patterns = [
      // https://github.com/owner/repo
      /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/,
      // github.com/owner/repo
      /^github\.com\/([^\/]+)\/([^\/]+)(?:\/.*)?$/,
      // owner/repo
      /^([^\/\s]+)\/([^\/\s]+)$/
    ]

    for (const pattern of patterns) {
      const match = input.trim().match(pattern)
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, '') // Remove .git suffix if present
        }
      }
    }

    return null
  }
}