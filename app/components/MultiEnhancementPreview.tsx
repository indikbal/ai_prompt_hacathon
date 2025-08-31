'use client'

import { useState } from 'react'
import { SparklesIcon, CheckIcon, EyeIcon } from '@heroicons/react/24/outline'

interface Enhancement {
  id: string
  title: string
  description: string
  prompt: string
  score: number
  style: 'professional' | 'creative' | 'technical'
}

interface MultiEnhancementPreviewProps {
  originalPrompt: string
  enhancements: Enhancement[]
  onSelect: (enhancement: Enhancement) => void
  isLoading: boolean
}

export default function MultiEnhancementPreview({ 
  originalPrompt, 
  enhancements, 
  onSelect, 
  isLoading 
}: MultiEnhancementPreviewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'professional': return 'border-blue-200 bg-blue-50'
      case 'creative': return 'border-purple-200 bg-purple-50'
      case 'technical': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'professional': return '💼'
      case 'creative': return '🎨'
      case 'technical': return '⚡'
      default: return '✨'
    }
  }

  const handleSelect = (enhancement: Enhancement) => {
    setSelectedId(enhancement.id)
    onSelect(enhancement)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="animate-spin">
            <SparklesIcon className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 ml-2">
            Generating Enhancement Options...
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
        Choose Your Enhancement Style
      </h3>

      <div className="space-y-4">
        {enhancements.map((enhancement) => (
          <div
            key={enhancement.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedId === enhancement.id 
                ? 'border-primary-500 bg-primary-50' 
                : getStyleColor(enhancement.style)
            } hover:shadow-md`}
            onClick={() => handleSelect(enhancement)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{getStyleIcon(enhancement.style)}</span>
                  <h4 className="font-medium text-gray-800">{enhancement.title}</h4>
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">
                      {enhancement.score}/100
                    </span>
                    {selectedId === enhancement.id && (
                      <CheckIcon className="h-4 w-4 text-primary-600" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{enhancement.description}</p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedId(expandedId === enhancement.id ? null : enhancement.id)
                  }}
                  className="flex items-center text-xs text-gray-500 hover:text-primary-600"
                >
                  <EyeIcon className="h-3 w-3 mr-1" />
                  {expandedId === enhancement.id ? 'Hide' : 'Preview'} Enhanced Prompt
                </button>
              </div>
            </div>

            {expandedId === enhancement.id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="bg-white rounded-lg p-3 border">
                  <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                    {enhancement.prompt}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Each style optimizes for different use cases and audiences
      </div>
    </div>
  )
}
