'use client'

import { useState, useEffect, useRef } from 'react'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isDisabled?: boolean
}

export default function VoiceInput({ onTranscript, isDisabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    setIsSupported(true)
    setError('')
    
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError('')
      setPermissionDenied(false)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart + ' '
        } else {
          interimTranscript += transcriptPart
        }
      }

      // Only append new final transcript, don't replace existing
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
      setInterimTranscript(interimTranscript)

      // Always update the parent with the complete transcript
      const completeText = transcript + finalTranscript + interimTranscript
      onTranscript(completeText)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setPermissionDenied(true)
          setError('Microphone access denied. Please allow microphone permissions and refresh the page.')
          setIsListening(false)
          break
        case 'audio-capture':
          setError('No microphone found. Please check your microphone connection.')
          setIsListening(false)
          break
        case 'network':
          setError('Network error. Please check your internet connection.')
          // Try to restart after network error
          if (isListening) {
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.start()
                } catch (e) {
                  console.log('Recognition restart failed:', e)
                  setIsListening(false)
                }
              }
            }, 2000)
          }
          break
        case 'aborted':
          // This happens when recognition is manually stopped, ignore
          break
        case 'no-speech':
          // Continue listening, this is normal
          break
        default:
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
      }
    }

    recognition.onend = () => {
      // Auto-restart if user hasn't manually stopped and no permission issues
      if (isListening && !permissionDenied) {
        setTimeout(() => {
          if (recognitionRef.current && isListening && !permissionDenied) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Recognition restart failed:', e)
              setIsListening(false)
            }
          }
        }, 100)
      } else if (!isListening) {
        // When manually stopped, send final transcript to parent
        setInterimTranscript('')
        if (transcript) {
          onTranscript(transcript)
        }
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [transcript, onTranscript, isListening, permissionDenied])

  const startListening = async () => {
    if (!recognitionRef.current || isListening) return

    try {
      // First check if microphone devices exist
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      
      if (audioInputs.length === 0) {
        setError('No microphone devices found. Please connect a microphone and refresh the page.')
        return
      }

      // Request microphone permission with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      // Stop the stream immediately as we only needed it for permission
      stream.getTracks().forEach(track => track.stop())
      
      setTranscript('')
      setInterimTranscript('')
      setError('')
      setPermissionDenied(false)
      
      recognitionRef.current.start()
    } catch (err: any) {
      console.error('Microphone access error:', err)
      
      switch (err.name) {
        case 'NotAllowedError':
          setPermissionDenied(true)
          setError('Microphone access denied. Click the microphone icon in your browser address bar and allow access.')
          break
        case 'NotFoundError':
          setError('No microphone found. Please connect a microphone, refresh the page, and try again.')
          break
        case 'NotReadableError':
          setError('Microphone is being used by another application. Please close other apps using the microphone.')
          break
        case 'OverconstrainedError':
          setError('Microphone constraints not supported. Trying with basic settings...')
          // Retry with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            basicStream.getTracks().forEach(track => track.stop())
            setError('')
            recognitionRef.current.start()
          } catch (retryErr) {
            setError('Failed to access microphone with any settings.')
          }
          break
        default:
          setError(`Microphone error: ${err.message || err.name}. Please check your microphone settings.`)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false)
      recognitionRef.current.stop()
      
      // Send complete transcript when stopping
      const completeTranscript = transcript + interimTranscript
      if (completeTranscript.trim()) {
        onTranscript(completeTranscript.trim())
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    setError('')
    onTranscript('')
  }

  if (!isSupported) {
    return (
      <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
        Voice input not supported. Please use Chrome, Edge, or Safari.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Error Display */}
      {error && (
        <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <ExclamationTriangleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <div>
            {error}
            {permissionDenied && (
              <div className="mt-1 text-xs">
                <strong>Fix:</strong> Click the microphone icon in your browser's address bar and allow access.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Control Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isDisabled || permissionDenied}
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
      {isListening && !error && (
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
