'use client'

import { useState } from 'react'
import { SparklesIcon, ArrowRightIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import PromptAnalyzer from './components/PromptAnalyzer'
import EnhancedPrompt from './components/EnhancedPrompt'
import MultiEnhancementPreview from './components/MultiEnhancementPreview'
import VoiceInput from './components/VoiceInput'

export default function Home() {
  const [userInput, setUserInput] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [enhancements, setEnhancements] = useState<any[]>([])
  const [showMultiPreview, setShowMultiPreview] = useState(false)
  const [contexts, setContexts] = useState<any[]>([])
  const [personalizedHints, setPersonalizedHints] = useState<string[]>([])

  const handleEnhancePrompt = async () => {
    if (!userInput.trim()) return

    setIsLoading(true)
    setShowMultiPreview(true)
    try {
      const response = await fetch('/api/enhance-prompt-multi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput, userId: 'demo_user' }),
      })

      const data = await response.json()
      setEnhancements(data.enhancements)
      setContexts(data.contexts || [])
      setPersonalizedHints(data.personalizedHints || [])
    } catch (error) {
      console.error('Error enhancing prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectEnhancement = (enhancement: any) => {
    setEnhancedPrompt(enhancement.prompt)
    setAnalysis({
      issues: [],
      strengths: [`Selected ${enhancement.title} style`, 'Optimized for specific use case'],
      suggestions: personalizedHints,
      score: enhancement.score
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleVoiceTranscript = (voiceText: string) => {
    setUserInput(voiceText)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <SparklesIcon className="h-8 w-8 text-primary-600 mr-2" />
          <h1 className="text-4xl font-bold text-gray-900">AI Prompt Generator</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your vague ideas into powerful, effective AI prompts that get better results
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Input</h2>
            
            {/* Voice Input Component */}
            <div className="mb-4">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                isDisabled={isLoading}
              />
            </div>
            
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your rough idea or use voice input above... 

Example: 'help me write code' or 'explain machine learning'"
              className="textarea-field h-40"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {userInput.length} characters
              </div>
              <button
                onClick={handleEnhancePrompt}
                disabled={!userInput.trim() || isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Enhance Prompt
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Section */}
          {analysis && (
            <PromptAnalyzer analysis={analysis} />
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {showMultiPreview && enhancements.length > 0 ? (
            <MultiEnhancementPreview
              originalPrompt={userInput}
              enhancements={enhancements}
              onSelect={handleSelectEnhancement}
              isLoading={isLoading}
            />
          ) : enhancedPrompt ? (
            <EnhancedPrompt 
              prompt={enhancedPrompt} 
              onCopy={() => copyToClipboard(enhancedPrompt)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your enhanced prompt will appear here</p>
              </div>
            </div>
          )}

          {/* Context & Personalization Info */}
          {(contexts.length > 0 || personalizedHints.length > 0) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
                Smart Enhancements Applied
              </h3>
              
              {contexts.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">🧠 Context Injected:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {contexts.map((ctx, i) => (
                      <li key={i}>• [{ctx.type.toUpperCase()}] {ctx.content}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {personalizedHints.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">🎯 Personalized for You:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {personalizedHints.map((hint, i) => (
                      <li key={i}>• {hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Quick Tips</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Be specific about your desired output format</li>
              <li>• Include context and constraints</li>
              <li>• Mention your expertise level</li>
              <li>• Add examples when helpful</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Examples Section */}
      <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Example Transformations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-l-4 border-red-400 pl-4">
            <h4 className="font-medium text-red-700 mb-2">❌ Vague Input</h4>
            <p className="text-gray-600 text-sm">"help me write code"</p>
          </div>
          <div className="border-l-4 border-green-400 pl-4">
            <h4 className="font-medium text-green-700 mb-2">✅ Enhanced Prompt</h4>
            <p className="text-gray-600 text-sm">"Act as a senior software engineer. Help me write clean, well-documented Python code for a REST API that handles user authentication. Include error handling, input validation, and follow PEP 8 standards. Provide code examples with explanations."</p>
          </div>
        </div>
      </div>
    </div>
  )
}
