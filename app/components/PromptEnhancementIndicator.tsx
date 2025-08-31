'use client'

import { SparklesIcon, CpuChipIcon } from '@heroicons/react/24/outline'

interface PromptEnhancementIndicatorProps {
  isEnhancing: boolean
  isGenerating: boolean
}

export default function PromptEnhancementIndicator({ isEnhancing, isGenerating }: PromptEnhancementIndicatorProps) {
  if (isEnhancing) {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 rounded-2xl px-4 py-3 flex items-center space-x-2">
          <div className="animate-spin">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm text-blue-700">Enhancing your prompt...</span>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="flex justify-start">
        <div className="flex max-w-3xl">
          <div className="flex-shrink-0 mr-3">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <CpuChipIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-600">AI is thinking...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
