'use client'

import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface EnhancedPromptProps {
  prompt: string
  onCopy: () => void
}

export default function EnhancedPrompt({ prompt, onCopy }: EnhancedPromptProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Enhanced Prompt</h3>
        <button
          onClick={handleCopy}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-gray-600">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
          {prompt}
        </pre>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{prompt.length} characters</span>
        <span className="flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          Ready to use
        </span>
      </div>
    </div>
  )
}
