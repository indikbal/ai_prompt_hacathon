import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { UserProfileManager } from '../../lib/userProfile'
import { ContextInjector } from '../../lib/contextInjection'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userInput, userId = 'default' } = await request.json()

    if (!userInput || userInput.trim().length === 0) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    // Get user profile and context
    const profileManager = UserProfileManager.getInstance()
    const contextInjector = ContextInjector.getInstance()
    
    const userProfile = profileManager.getProfile(userId)
    const contexts = await contextInjector.gatherContext(userInput, userId)
    const personalizedHints = profileManager.getPersonalizedEnhancementHints(userId, userInput)

    // Create context-enhanced input
    const contextEnhancedInput = contextInjector.injectContextIntoPrompt(userInput, contexts)

    // Generate 3 different enhancement styles
    const enhancementPromises = [
      generateProfessionalEnhancement(contextEnhancedInput, userProfile, personalizedHints),
      generateCreativeEnhancement(contextEnhancedInput, userProfile, personalizedHints),
      generateTechnicalEnhancement(contextEnhancedInput, userProfile, personalizedHints)
    ]

    const [professional, creative, technical] = await Promise.all(enhancementPromises)

    // Analyze each enhancement
    const analysisPromises = [
      analyzeEnhancement(userInput, professional),
      analyzeEnhancement(userInput, creative),
      analyzeEnhancement(userInput, technical)
    ]

    const [profAnalysis, creativeAnalysis, techAnalysis] = await Promise.all(analysisPromises)

    const enhancements = [
      {
        id: 'professional',
        title: 'Professional & Structured',
        description: 'Formal tone, clear objectives, business-ready format',
        prompt: professional,
        score: profAnalysis.score,
        style: 'professional' as const
      },
      {
        id: 'creative',
        title: 'Creative & Engaging',
        description: 'Innovative approach, engaging language, out-of-the-box thinking',
        prompt: creative,
        score: creativeAnalysis.score,
        style: 'creative' as const
      },
      {
        id: 'technical',
        title: 'Technical & Precise',
        description: 'Detailed specifications, technical accuracy, implementation-focused',
        prompt: technical,
        score: techAnalysis.score,
        style: 'technical' as const
      }
    ]

    // Update user profile with this interaction
    const avgScore = (profAnalysis.score + creativeAnalysis.score + techAnalysis.score) / 3
    profileManager.analyzePrompt(userId, userInput, professional, avgScore)

    return NextResponse.json({
      enhancements,
      contexts: contexts.map(c => ({ type: c.type, content: c.content.substring(0, 100) + '...' })),
      personalizedHints,
      userProfile: {
        totalPrompts: userProfile.stats.totalPrompts,
        averageScore: userProfile.stats.averageScore,
        commonTopics: userProfile.patterns.commonTopics.slice(0, 3)
      }
    })

  } catch (error) {
    console.error('Error in multi-enhancement API:', error)
    return NextResponse.json(
      { error: 'Failed to generate enhancements' },
      { status: 500 }
    )
  }
}

async function generateProfessionalEnhancement(input: string, profile: any, hints: string[]): Promise<string> {
  const prompt = `
Transform this input into a professional, structured prompt suitable for business or formal contexts.

Guidelines:
- Use formal, professional language
- Include clear objectives and expected outcomes
- Add proper context and constraints
- Structure with clear sections
- Make it actionable and specific
${hints.length > 0 ? `- User preferences: ${hints.join(', ')}` : ''}

Input: "${input}"

Return ONLY the enhanced prompt:
`

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  })

  return response.choices[0].message.content || input
}

async function generateCreativeEnhancement(input: string, profile: any, hints: string[]): Promise<string> {
  const prompt = `
Transform this input into a creative, engaging prompt that encourages innovative thinking.

Guidelines:
- Use engaging, inspiring language
- Encourage creative and innovative approaches
- Include examples or analogies
- Make it thought-provoking
- Add elements that spark imagination
${hints.length > 0 ? `- User preferences: ${hints.join(', ')}` : ''}

Input: "${input}"

Return ONLY the enhanced prompt:
`

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
  })

  return response.choices[0].message.content || input
}

async function generateTechnicalEnhancement(input: string, profile: any, hints: string[]): Promise<string> {
  const prompt = `
Transform this input into a technical, precise prompt with detailed specifications.

Guidelines:
- Use technical terminology and precision
- Include specific requirements and constraints
- Add implementation details where relevant
- Focus on accuracy and completeness
- Include error handling and edge cases
${hints.length > 0 ? `- User preferences: ${hints.join(', ')}` : ''}

Input: "${input}"

Return ONLY the enhanced prompt:
`

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  })

  return response.choices[0].message.content || input
}

async function analyzeEnhancement(original: string, enhanced: string): Promise<{ score: number }> {
  const analysisPrompt = `
Compare the original and enhanced prompts and provide a score (0-100) based on:
- Clarity improvement
- Specificity added
- Context provided
- Actionability
- Professional quality

Original: "${original}"
Enhanced: "${enhanced}"

Return only a JSON object: {"score": number}
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.2,
    })

    const result = JSON.parse(response.choices[0].message.content || '{"score": 75}')
    return { score: Math.min(100, Math.max(0, result.score)) }
  } catch {
    return { score: 75 }
  }
}
