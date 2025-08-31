'use client'

import { UserIcon, CpuChipIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  originalPrompt?: string
  enhancedPrompt?: string
  isEnhanced?: boolean
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [showEnhancement, setShowEnhancement] = useState(false)

  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-primary-600' : 'bg-gray-600'
          }`}>
            {isUser ? (
              <UserIcon className="h-5 w-5 text-white" />
            ) : (
              <CpuChipIcon className="h-5 w-5 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-4 py-3 max-w-full ${
            isUser 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-gray-800 shadow-sm border'
          }`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Enhancement Indicator */}
          {message.isEnhanced && (
            <div className="mt-2 flex items-center space-x-2">
              <button
                onClick={() => setShowEnhancement(!showEnhancement)}
                className="flex items-center text-xs text-gray-500 hover:text-primary-600 transition-colors"
              >
                <SparklesIcon className="h-3 w-3 mr-1" />
                Enhanced
                <EyeIcon className="h-3 w-3 ml-1" />
              </button>
            </div>
          )}

          {/* Enhancement Details */}
          {showEnhancement && message.originalPrompt && message.enhancedPrompt && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-xs max-w-md">
              <div className="mb-2">
                <span className="font-medium text-gray-700">Original:</span>
                <div className="text-gray-600 mt-1">{message.originalPrompt}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Enhanced:</span>
                <div className="text-gray-600 mt-1">{message.enhancedPrompt}</div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="mt-1 text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
