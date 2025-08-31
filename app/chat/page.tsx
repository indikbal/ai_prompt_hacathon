'use client'

import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, SparklesIcon, UserIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import ChatMessage from '../components/ChatMessage'
import PromptEnhancementIndicator from '../components/PromptEnhancementIndicator'
import VoiceInput from '../components/VoiceInput'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  originalPrompt?: string
  enhancedPrompt?: string
  isEnhanced?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsEnhancing(true)

    try {
      // Step 1: Enhance the prompt
      const enhanceResponse = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input }),
      })

      const enhanceData = await enhanceResponse.json()
      const enhancedPrompt = enhanceData.enhancedPrompt

      setIsEnhancing(false)
      setIsLoading(true)

      // Update user message with enhancement info
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, enhancedPrompt, originalPrompt: input, isEnhanced: true }
          : msg
      ))

      // Step 2: Send enhanced prompt to chat API
      const chatHistory = [...messages].map(msg => ({
        role: msg.role,
        content: msg.role === 'user' && msg.enhancedPrompt ? msg.enhancedPrompt : msg.content
      }))
      
      // Add the current enhanced prompt to history
      chatHistory.push({
        role: 'user',
        content: enhancedPrompt
      })

      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: chatHistory,
          enhancedPrompt
        }),
      })

      if (!chatResponse.ok) {
        throw new Error('Failed to get AI response')
      }

      const reader = chatResponse.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '',
        role: 'assistant',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Stream the response
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices[0]?.delta?.content || ''
              
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: msg.content + content }
                  : msg
              ))
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      setIsEnhancing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleVoiceTranscript = (voiceText: string) => {
    setInput(voiceText)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">AI Chat with Smart Prompts</h1>
          </div>
          <div className="text-sm text-gray-500">
            Auto-enhanced prompts for better AI responses
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Start a Conversation</h3>
              <p className="text-gray-500">Your messages will be automatically enhanced for better AI responses</p>
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {(isEnhancing || isLoading) && (
            <PromptEnhancementIndicator 
              isEnhancing={isEnhancing} 
              isGenerating={isLoading} 
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Voice Input */}
          <div className="mb-4">
            <VoiceInput 
              onTranscript={handleVoiceTranscript}
              isDisabled={isLoading || isEnhancing}
            />
          </div>
          
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or speak your message... (it will be automatically enhanced)"
                className="textarea-field resize-none"
                rows={3}
                disabled={isLoading || isEnhancing}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading || isEnhancing}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center px-6 py-3"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <SparklesIcon className="h-3 w-3 mr-1" />
            Messages are automatically enhanced for better AI communication
          </div>
        </div>
      </div>
    </div>
  )
}
