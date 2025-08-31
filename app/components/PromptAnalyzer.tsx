'use client'

import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface AnalysisProps {
  analysis: {
    issues: string[]
    strengths: string[]
    suggestions: string[]
    score: number
  }
}

export default function PromptAnalyzer({ analysis }: AnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Prompt Analysis</h3>
        <div className={`px-3 py-1 rounded-full ${getScoreBg(analysis.score)}`}>
          <span className={`font-semibold ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Issues */}
        {analysis.issues.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <h4 className="font-medium text-red-700">Issues Found</h4>
            </div>
            <ul className="space-y-1">
              {analysis.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-600 pl-7">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <h4 className="font-medium text-green-700">Strengths</h4>
            </div>
            <ul className="space-y-1">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-green-600 pl-7">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h4 className="font-medium text-blue-700">Suggestions</h4>
            </div>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-600 pl-7">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
