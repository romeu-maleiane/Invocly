"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { convertWebMToWav } from "@/lib/convertWebMToWav"
import { getVoices } from "@/lib/getVoices"
import { useUser } from "@clerk/nextjs"

interface VoiceCloningProps {
  onVoiceCloned: (value: any) => void
  hasExistingVoice?: boolean
  existingVoiceName?: string
}

const getCloningErrorMessage = (error: any): string => {
  const defaultMessage = "An unexpected error occurred. Please try again later."
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes("failed to access microphone")) {
      return "Could not access the microphone. Please check your browser permissions and try again."
    }
    if (message.includes("audio file too large")) {
      return "The audio file is too large. Please ensure your recording is under 60 seconds."
    }
    if (message.includes("invalid audio file format")) {
      return "An invalid audio format was detected. Please try recording again."
    }
    if (message.includes("failed to clone voice")) {
      return "We couldn't clone your voice at this time. Please ensure your recording is clear and without background noise."
    }
  }
  return defaultMessage
}

export function VoiceCloning({ onVoiceCloned, }: VoiceCloningProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [voiceName, setVoiceName] = useState("")
  const [voiceDescription, setVoiceDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { user } = useUser()

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      setError(null)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1
          // Auto-stop at 60 seconds
          if (newDuration >= 60) {
            stopRecording()
          }
          return newDuration
        })
      }, 1000)
    } catch (error) {
      const friendlyErrorMessage = getCloningErrorMessage(error)
      setError(friendlyErrorMessage)
      console.error("Recording error:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setRecordingDuration(0)
    setError(null)
  }

  const processVoiceCloning = async () => {
    if (!audioBlob || !voiceName.trim()) {
      setError("Please provide a voice name and recording.")
      return
    }

    if (recordingDuration < 30) {
      setError("Recording must be at least 30 seconds long.")
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    setError(null)

    try {
      const wavBlob = await convertWebMToWav(audioBlob);
      const formData = new FormData()
      formData.append("audio", wavBlob, "voice.wav")
      formData.append("voiceName", voiceName.trim())
      formData.append("voiceDescription", voiceDescription.trim())

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => Math.min(prev + 10, 90))
      }, 500)

      const response = await fetch("/api/clone-voice", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to clone voice")
      }

      const result = await response.json()
      setProcessingProgress(100)

      
      // Show success message
      setSuccessMessage("Voice cloned successfully!")
      setTimeout(() => setSuccessMessage(null), 5000)
      
      // Reset form
      resetRecording()
      setVoiceName("")
      
      //update voice list
      const newVoiceList = await getVoices(user?.id)
      onVoiceCloned(newVoiceList)
    } catch (error) {
      const friendlyErrorMessage = getCloningErrorMessage(error)
      setError(friendlyErrorMessage)
      console.error("Voice cloning error:", error)
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          Voice Cloning
        </CardTitle>
        <CardDescription>Create a personalized voice by recording 30-60 seconds of your speech</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Name Input */}
        <div className="space-y-2">
          <Label htmlFor="voiceName">Voice Name</Label>
          <Input
            id="voiceName"
            placeholder="Enter a name for your voice (e.g., My Voice)"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Voice Description Input */}
        <div className="space-y-2">
          <Label htmlFor="voiceDescription">Voice Description (Optional)</Label>
          <Input
            id="voiceDescription"
            placeholder="e.g., My podcast voice"
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            disabled={isProcessing}
          />
        </div>

        {/* Recording Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Voice Recording</Label>
            {recordingDuration > 0 && (
              <Badge variant={recordingDuration >= 30 ? "default" : "secondary"}>
                {formatTime(recordingDuration)} / 1:00
              </Badge>
            )}
          </div>

          {!audioBlob ? (
            <div className="text-center space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                <div className="flex flex-col items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      isRecording ? "bg-red-100 dark:bg-red-900" : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <svg
                      className={`w-8 h-8 ${isRecording ? "text-red-600" : "text-gray-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">{isRecording ? "Recording in progress..." : "Ready to record"}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Speak clearly for 30-60 seconds. Read a paragraph or speak naturally.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button onClick={startRecording} className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop Recording
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Recording Complete</span>
                  <Badge variant="default">{formatTime(recordingDuration)}</Badge>
                </div>
                <audio controls className="w-full">
                  <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                  Your browser does not support audio playback.
                </audio>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={resetRecording}>
                  Record Again
                </Button>
                <Button
                  onClick={processVoiceCloning}
                  disabled={isProcessing || !voiceName.trim() || recordingDuration < 30}
                  className="flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                      Clone Voice
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing voice clone...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Recording Tips:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Speak in a quiet environment without background noise</li>
            <li>• Use your natural speaking voice and pace</li>
            <li>• Record at least 30 seconds for best quality</li>
            <li>• Read a paragraph or speak about a topic you know well</li>
            <li>• Ensure consistent volume throughout the recording</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
