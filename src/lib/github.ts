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

  

  async findDocumentationFiles(owner: string, repo: string, analysisPath?: string): Promise<{ path: string; content: string }[]> {
    const documentationFiles: { path: string; content: string }[] = []

    // Get the default branch
    const repoData = await this.fetch(`${this.baseUrl}/repos/${owner}/${repo}`)
    const defaultBranch = repoData.default_branch

    // Get the recursive tree
    const treeData = await this.fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`)
    const allFiles = treeData.tree

    const includedExtensions = [
      '.js', '.ts', '.tsx', '.py', '.go', '.java', '.rb', '.php', '.c', '.cpp', '.h', '.cs', 
      '.html', '.css', '.scss', '.less', '.sh', '.md', '.txt'
    ]

    const excludedDirectories = [
      'node_modules', '.git', 'dist', 'build', 'coverage', 'test', 'tests', '__tests__', 'vendor', 'public'
    ]

    const filesToAnalyze = allFiles.filter((file: any) => {
      if (file.type !== 'blob') return false

      const hasIncludedExtension = includedExtensions.some(ext => file.path.endsWith(ext))
      if (!hasIncludedExtension) return false

      const isInExcludedDirectory = excludedDirectories.some(dir => file.path.startsWith(`${dir}/`) || file.path.includes(`/${dir}/`))
      if (isInExcludedDirectory) return false

      return true
    })

    for (const file of filesToAnalyze) {
      try {
        const content = await this.getFileContent(owner, repo, file.path)
        documentationFiles.push({ path: file.path, content })
      } catch (error) {
        console.warn(`[GITHUB] Failed to fetch content for ${file.path}:`, error)
      }
    }

    return documentationFiles
  }

  parseRepoUrl(input: string): { owner: string; repo: string } | null {
    // Handle different GitHub URL formats
    const patterns = [
      // https://github.com/owner/repo
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/.*)?$/,
      // github.com/owner/repo
      /^github\.com\/([^/]+)\/([^/]+)(?:\/.*)?$/,
      // owner/repo
      /^([^/\s]+)\/([^/\s]+)$/
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
