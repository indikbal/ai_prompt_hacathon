// Context Injection System
export interface ContextData {
  type: 'web' | 'file' | 'project' | 'user_history'
  source: string
  content: string
  relevance: number
  timestamp: Date
}

export class ContextInjector {
  private static instance: ContextInjector
  
  static getInstance(): ContextInjector {
    if (!ContextInjector.instance) {
      ContextInjector.instance = new ContextInjector()
    }
    return ContextInjector.instance
  }

  async gatherContext(prompt: string, userId: string): Promise<ContextData[]> {
    const contexts: ContextData[] = []
    
    // Gather different types of context in parallel
    const [
      projectContext,
      userHistoryContext,
      domainContext
    ] = await Promise.all([
      this.getProjectContext(prompt),
      this.getUserHistoryContext(userId, prompt),
      this.getDomainContext(prompt)
    ])

    contexts.push(...projectContext)
    contexts.push(...userHistoryContext)
    contexts.push(...domainContext)

    // Sort by relevance and return top 5
    return contexts
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
  }

  injectContextIntoPrompt(originalPrompt: string, contexts: ContextData[]): string {
    if (contexts.length === 0) return originalPrompt

    let contextSection = "\n\n**Relevant Context:**\n"
    
    contexts.forEach((context, index) => {
      contextSection += `${index + 1}. [${context.type.toUpperCase()}] ${context.content}\n`
    })

    contextSection += "\n**Please consider this context when responding.**\n"
    
    return originalPrompt + contextSection
  }

  private async getProjectContext(prompt: string): Promise<ContextData[]> {
    const contexts: ContextData[] = []
    
    // Detect if prompt mentions code/development
    if (this.isCodeRelated(prompt)) {
      // Simulate project context (in real app, would scan actual files)
      const projectInfo = this.getSimulatedProjectInfo(prompt)
      if (projectInfo) {
        contexts.push({
          type: 'project',
          source: 'current_project',
          content: projectInfo,
          relevance: 0.9,
          timestamp: new Date()
        })
      }
    }

    return contexts
  }

  private async getUserHistoryContext(userId: string, prompt: string): Promise<ContextData[]> {
    const contexts: ContextData[] = []
    
    // Get user's conversation history from localStorage
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem(`chatHistory_${userId}`)
      if (history) {
        const messages = JSON.parse(history)
        const relevantMessages = this.findRelevantHistory(messages, prompt)
        
        relevantMessages.forEach(msg => {
          contexts.push({
            type: 'user_history',
            source: 'previous_conversation',
            content: `Previous discussion: "${msg.content.substring(0, 100)}..."`,
            relevance: 0.7,
            timestamp: new Date(msg.timestamp)
          })
        })
      }
    }

    return contexts
  }

  private async getDomainContext(prompt: string): Promise<ContextData[]> {
    const contexts: ContextData[] = []
    
    // Detect domain and add relevant context
    const domain = this.detectDomain(prompt)
    const domainContext = this.getDomainSpecificContext(domain, prompt)
    
    if (domainContext) {
      contexts.push({
        type: 'web',
        source: 'domain_knowledge',
        content: domainContext,
        relevance: 0.8,
        timestamp: new Date()
      })
    }

    return contexts
  }

  private isCodeRelated(prompt: string): boolean {
    const codeKeywords = ['code', 'function', 'variable', 'debug', 'api', 'programming', 'algorithm', 'database']
    return codeKeywords.some(keyword => prompt.toLowerCase().includes(keyword))
  }

  private getSimulatedProjectInfo(prompt: string): string | null {
    // Simulate project context based on prompt
    if (prompt.toLowerCase().includes('react') || prompt.toLowerCase().includes('next')) {
      return "Current project: Next.js 14 app with TypeScript, using Tailwind CSS and OpenAI API integration"
    }
    if (prompt.toLowerCase().includes('api')) {
      return "Current project: REST API with authentication endpoints and database integration"
    }
    if (prompt.toLowerCase().includes('database')) {
      return "Current project: Database schema includes users, messages, and enhancement_logs tables"
    }
    return null
  }

  private findRelevantHistory(messages: any[], prompt: string): any[] {
    const promptWords = prompt.toLowerCase().split(' ')
    return messages
      .filter(msg => {
        const msgWords = msg.content.toLowerCase().split(' ')
        const commonWords = promptWords.filter(word => msgWords.includes(word))
        return commonWords.length > 2
      })
      .slice(-3) // Last 3 relevant messages
  }

  private detectDomain(prompt: string): string {
    const domains = {
      coding: ['code', 'programming', 'function', 'debug', 'api'],
      writing: ['write', 'essay', 'article', 'content', 'blog'],
      business: ['business', 'strategy', 'marketing', 'sales'],
      design: ['design', 'ui', 'ux', 'interface', 'layout'],
      data: ['data', 'analysis', 'statistics', 'chart']
    }
    
    const lowerPrompt = prompt.toLowerCase()
    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return domain
      }
    }
    return 'general'
  }

  private getDomainSpecificContext(domain: string, prompt: string): string | null {
    const contextMap: Record<string, string> = {
      coding: "Best practices: Use clean code principles, proper error handling, and comprehensive documentation. Consider performance, security, and maintainability.",
      writing: "Writing guidelines: Use clear structure, engaging tone, proper grammar, and audience-appropriate language. Include compelling headlines and strong conclusions.",
      business: "Business context: Focus on ROI, market analysis, competitive advantage, and stakeholder value. Consider scalability and risk management.",
      design: "Design principles: Follow user-centered design, accessibility standards, visual hierarchy, and consistent branding. Prioritize usability and aesthetics.",
      data: "Data analysis: Ensure data quality, use appropriate statistical methods, create clear visualizations, and provide actionable insights."
    }
    
    return contextMap[domain] || null
  }
}
