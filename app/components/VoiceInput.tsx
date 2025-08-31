'use client'

import { useState, useEffect, useRef } from 'react'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
}

export default function VoiceInput({ onTranscript, isDisabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart
          } else {
            interimTranscript += transcriptPart
          }
        }

        setTranscript(prev => prev + finalTranscript)
        setInterimTranscript(interimTranscript)

        if (finalTranscript) {
          onTranscript(transcript + finalTranscript)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimTranscript('')
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [transcript, onTranscript])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setInterimTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    onTranscript('')
  }

  if (!isSupported) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <SpeakerWaveIcon className="h-4 w-4 mr-2" />
        Voice input not supported in this browser
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Voice Control Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isDisabled}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isListening ? (
            <>
              <StopIcon className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <MicrophoneIcon className="h-4 w-4 mr-2" />
              Start Voice Input
            </>
          )}
        </button>

        {transcript && (
          <button
            onClick={clearTranscript}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Live Transcript */}
      {(isListening || transcript || interimTranscript) && (
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
          <div className="flex items-center mb-2">
            <SpeakerWaveIcon className="h-4 w-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {isListening ? 'Listening...' : 'Voice Input Complete'}
            </span>
          </div>
          
          <div className="text-sm text-gray-800">
            <span className="font-mono">
              {transcript}
              <span className="text-gray-500 italic">{interimTranscript}</span>
            </span>
            {isListening && (
              <span className="inline-block w-2 h-4 bg-primary-600 ml-1 animate-pulse"></span>
            )}
          </div>
        </div>
      )}

      {/* Voice Tips */}
      {isListening && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-800">
            💡 <strong>Voice Tips:</strong> Speak clearly and pause between sentences. 
            Say "period" for punctuation, "new line" for breaks.
          </div>
        </div>
      )}
    </div>
  )
}
