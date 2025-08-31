'use client'

import { useEffect, useState } from 'react'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
}

export default function VoiceInput({ onTranscript, isDisabled = false }: VoiceInputProps) {
  const [isMounted, setIsMounted] = useState(false)
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Send transcript to parent whenever it changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript)
    }
  }, [transcript, onTranscript])

  const startListening = () => {
    resetTranscript()
    SpeechRecognition.startListening({
      continuous: false,
      language: 'en-US'
    })
  }

  const stopListening = () => {
    SpeechRecognition.stopListening()
  }

  const clearTranscript = () => {
    resetTranscript()
    onTranscript('')
  }

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <button
            disabled
            className="flex items-center px-4 py-2 rounded-lg font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            <MicrophoneIcon className="h-4 w-4 mr-2" />
            Loading Voice Input...
          </button>
        </div>
      </div>
    )
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
        Voice input not supported. Please use Chrome, Edge, or Safari.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Voice Control Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={listening ? stopListening : startListening}
          disabled={isDisabled}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            listening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {listening ? (
            <>
              <StopIcon className="h-4 w-4 mr-2" />
              Listening...
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
      {transcript && (
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
          <div className="flex items-center mb-2">
            <SpeakerWaveIcon className="h-4 w-4 text-primary-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {listening ? 'Listening...' : 'Voice Input Result'}
            </span>
          </div>
          
          <div className="text-sm text-gray-800">
            <span className="font-mono">{transcript}</span>
            {listening && (
              <span className="inline-block w-2 h-4 bg-primary-600 ml-1 animate-pulse"></span>
            )}
          </div>
        </div>
      )}

      {/* Voice Tips */}
      {listening && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-800">
            🎤 <strong>Listening:</strong> Speak clearly. Click "Stop" or pause to finish recording.
          </div>
        </div>
      )}
    </div>
  )
}
