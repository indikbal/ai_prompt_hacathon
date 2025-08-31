// User Profiling System
export interface UserProfile {
  id: string
  preferences: {
    domains: string[] // coding, writing, business, etc.
    complexity: 'beginner' | 'intermediate' | 'expert'
    tone: 'formal' | 'casual' | 'technical'
    responseLength: 'short' | 'medium' | 'detailed'
  }
  patterns: {
    commonTopics: string[]
    frequentKeywords: string[]
    successfulEnhancements: string[]
    preferredStructures: string[]
  }
  stats: {
    totalPrompts: number
    averageScore: number
    lastActive: Date
    createdAt: Date
  }
}

export class UserProfileManager {
  private static instance: UserProfileManager
  private profiles: Map<string, UserProfile> = new Map()

  static getInstance(): UserProfileManager {
    if (!UserProfileManager.instance) {
      UserProfileManager.instance = new UserProfileManager()
    }
    return UserProfileManager.instance
  }

  getProfile(userId: string): UserProfile {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, this.createDefaultProfile(userId))
    }
    return this.profiles.get(userId)!
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): void {
    const profile = this.getProfile(userId)
    this.profiles.set(userId, { ...profile, ...updates })
    this.saveToStorage(userId, this.profiles.get(userId)!)
  }

  analyzePrompt(userId: string, prompt: string, enhancedPrompt: string, score: number): void {
    const profile = this.getProfile(userId)
    
    // Extract keywords and topics
    const keywords = this.extractKeywords(prompt)
    const domain = this.detectDomain(prompt)
    
    // Update patterns
    profile.patterns.commonTopics = this.updateTopics(profile.patterns.commonTopics, domain)
    profile.patterns.frequentKeywords = this.updateKeywords(profile.patterns.frequentKeywords, keywords)
    
    if (score > 80) {
      profile.patterns.successfulEnhancements.push(enhancedPrompt)
    }
    
    // Update stats
    profile.stats.totalPrompts++
    profile.stats.averageScore = (profile.stats.averageScore * (profile.stats.totalPrompts - 1) + score) / profile.stats.totalPrompts
    profile.stats.lastActive = new Date()
    
    this.updateProfile(userId, profile)
  }

  getPersonalizedEnhancementHints(userId: string, prompt: string): string[] {
    const profile = this.getProfile(userId)
    const hints: string[] = []
    
    // Based on user's complexity preference
    if (profile.preferences.complexity === 'beginner') {
      hints.push('Add explanations for technical terms')
      hints.push('Include step-by-step instructions')
    } else if (profile.preferences.complexity === 'expert') {
      hints.push('Use advanced terminology')
      hints.push('Focus on implementation details')
    }
    
    // Based on common topics
    const domain = this.detectDomain(prompt)
    if (profile.patterns.commonTopics.includes(domain)) {
      hints.push(`Apply ${domain}-specific best practices`)
    }
    
    // Based on tone preference
    if (profile.preferences.tone === 'formal') {
      hints.push('Use professional language')
    } else if (profile.preferences.tone === 'casual') {
      hints.push('Keep tone conversational')
    }
    
    return hints
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      preferences: {
        domains: [],
        complexity: 'intermediate',
        tone: 'casual',
        responseLength: 'medium'
      },
      patterns: {
        commonTopics: [],
        frequentKeywords: [],
        successfulEnhancements: [],
        preferredStructures: []
      },
      stats: {
        totalPrompts: 0,
        averageScore: 0,
        lastActive: new Date(),
        createdAt: new Date()
      }
    }
  }

  private extractKeywords(prompt: string): string[] {
    const words = prompt.toLowerCase().split(/\s+/)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'help', 'me', 'please']
    return words.filter(word => word.length > 3 && !stopWords.includes(word))
  }

  private detectDomain(prompt: string): string {
    const domains = {
      coding: ['code', 'programming', 'function', 'variable', 'debug', 'api', 'database', 'algorithm'],
      writing: ['write', 'essay', 'article', 'content', 'blog', 'story', 'grammar'],
      business: ['business', 'strategy', 'marketing', 'sales', 'revenue', 'customer', 'market'],
      design: ['design', 'ui', 'ux', 'interface', 'layout', 'color', 'typography'],
      data: ['data', 'analysis', 'statistics', 'chart', 'visualization', 'dataset']
    }
    
    const lowerPrompt = prompt.toLowerCase()
    for (const [domain, keywords] of Object.entries(domains)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return domain
      }
    }
    return 'general'
  }

  private updateTopics(current: string[], newTopic: string): string[] {
    const updated = [...current]
    const index = updated.indexOf(newTopic)
    if (index > -1) {
      updated.splice(index, 1)
    }
    updated.unshift(newTopic)
    return updated.slice(0, 10) // Keep top 10
  }

  private updateKeywords(current: string[], newKeywords: string[]): string[] {
    const updated = [...current]
    newKeywords.forEach(keyword => {
      const index = updated.indexOf(keyword)
      if (index > -1) {
        updated.splice(index, 1)
      }
      updated.unshift(keyword)
    })
    return updated.slice(0, 20) // Keep top 20
  }

  private saveToStorage(userId: string, profile: UserProfile): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`userProfile_${userId}`, JSON.stringify(profile))
    }
  }

  private loadFromStorage(userId: string): UserProfile | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`userProfile_${userId}`)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }
}
