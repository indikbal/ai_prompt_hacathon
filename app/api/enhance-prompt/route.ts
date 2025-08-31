import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userInput } = await request.json()

    if (!userInput || userInput.trim().length === 0) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    // Analyze the prompt first
    const analysisPrompt = `
Analyze this user prompt and provide a JSON response with the following structure:
{
  "issues": ["list of specific problems with the prompt"],
  "strengths": ["list of good aspects of the prompt"],
  "suggestions": ["list of specific improvement suggestions"],
  "score": number between 0-100
}

User prompt to analyze: "${userInput}"

Focus on:
- Clarity and specificity
- Missing context or constraints
- Vague language
- Lack of examples or format specifications
- Missing role or expertise level
- Unclear desired output
`

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
    })

    let analysis
    try {
      analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}')
    } catch {
      analysis = {
        issues: ['Unable to analyze prompt'],
        strengths: [],
        suggestions: ['Try being more specific'],
        score: 50
      }
    }

    // Enhance the prompt
    const enhancementPrompt = `
You are an expert prompt engineer. Transform this vague or basic user input into a powerful, specific, and effective AI prompt.

Original input: "${userInput}"

Guidelines for enhancement:
1. Add specific role/persona if missing (e.g., "Act as a...")
2. Include clear context and constraints
3. Specify desired output format
4. Add relevant examples if helpful
5. Include expertise level considerations
6. Make instructions clear and actionable
7. Add any missing technical specifications

Return ONLY the enhanced prompt, nothing else. Make it professional and effective.
`

    const enhancementResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: enhancementPrompt }],
      temperature: 0.7,
    })

    const enhancedPrompt = enhancementResponse.choices[0].message.content || userInput

    return NextResponse.json({
      enhancedPrompt,
      analysis,
      originalInput: userInput
    })

  } catch (error) {
    console.error('Error enhancing prompt:', error)
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    )
  }
}
