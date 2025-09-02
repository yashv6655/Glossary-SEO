import { z } from 'zod'

const ExtractedTermSchema = z.object({
  term: z.string(),
  definition: z.string(),
  tags: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.5)
})

export type ExtractedTerm = z.infer<typeof ExtractedTermSchema>

export class ClaudeClient {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'claude-3-5-sonnet-latest') {
    this.apiKey = apiKey
    this.model = model
  }

  async extractTerms(documentationFiles: { path: string; content: string }[]): Promise<ExtractedTerm[]> {
    const systemPrompt = `You are an API that converts repository documentation into a developer glossary for onboarding.
Return ONLY valid JSON matching this schema:
[
  {
    "term": "string",
    "definition": "plain-English, 2-4 sentences, no markdown",
    "tags": ["string"],
    "confidence": 0-1
  }
]

Rules:
- Focus on domain concepts, internal acronyms, module/service names, and technical terminology
- Avoid trivial programming terms like "function" or "variable"
- Definitions must be independent and self-contained (no "as above")
- Keep each definition <= 80 words, clear and concise
- Include relevant tags for categorization
- Set confidence based on how clearly the term is defined in the documentation
- Extract 10-30 terms maximum, prioritizing the most important ones`

    const batchSize = 20;
    const allTerms: ExtractedTerm[] = [];

    for (let i = 0; i < documentationFiles.length; i += batchSize) {
      const batch = documentationFiles.slice(i, i + batchSize);
      const userPrompt = this.buildUserPrompt(batch);

      try {
        console.log(`[CLAUDE] Processing batch ${i / batchSize + 1} of ${Math.ceil(documentationFiles.length / batchSize)}`);
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 4000,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userPrompt
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;

        if (content) {
          try {
            const rawTerms = JSON.parse(content);
            const terms = z.array(ExtractedTermSchema).parse(rawTerms);
            allTerms.push(...terms);
          } catch (parseError) {
            console.error('Failed to parse Claude response for batch:', content);
          }
        }

        // Add a delay between requests to avoid rate limiting
        if (i + batchSize < documentationFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }

      } catch (error) {
        console.error(`Claude API request failed for batch ${i / batchSize + 1}:`, error);
        // Continue to next batch even if one fails
      }
    }

    // Filter out low confidence terms and duplicates from all batches
    const filteredTerms = allTerms
      .filter(term => term.confidence >= 0.3)
      .filter((term, index, arr) => 
        arr.findIndex(t => t.term.toLowerCase() === term.term.toLowerCase()) === index
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 100); // Increase the limit for the final result

    return filteredTerms;
  }

  private buildUserPrompt(files: { path: string; content: string }[]): string {
    let prompt = `Repository documentation to analyze for technical terms:\n\n`

    for (const file of files) {
      // Truncate very long files to avoid token limits
      const truncatedContent = file.content.length > 3000 
        ? file.content.slice(0, 3000) + '...[truncated]'
        : file.content

      prompt += `## ${file.path}\n\n${truncatedContent}\n\n---\n\n`
    }

    // Add some heuristic candidates based on common patterns
    const allContent = files.map(f => f.content).join('\n')
    const candidates = this.extractCandidateTerms(allContent)
    
    if (candidates.length > 0) {
      prompt += `\nPotential terms found (use as hints): ${candidates.slice(0, 20).join(', ')}\n\n`
    }

    prompt += `Extract the most important technical terms from this documentation.`
    
    return prompt
  }

  private extractCandidateTerms(content: string): string[] {
    const candidates = new Set<string>()
    
    // Extract terms from common markdown patterns
    const patterns = [
      // Headers (# Term, ## Term)
      /^#{1,3}\s+([^#\n]+)/gm,
      // Bold terms (**term** or __term__)
      /\*\*([^*]+)\*\*/g,
      /__([^_]+)__/g,
      // Code blocks (`term`)
      /`([^`]+)`/g,
      // Capital words that look like acronyms or proper nouns
      /\b([A-Z][A-Z0-9]{2,}|[A-Z][a-z]*[A-Z][A-Za-z]*)\b/g
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const term = match[1].trim()
        if (term.length >= 3 && term.length <= 50 && !term.includes(' ')) {
          candidates.add(term)
        }
      }
    }

    return Array.from(candidates).slice(0, 50)
  }
}