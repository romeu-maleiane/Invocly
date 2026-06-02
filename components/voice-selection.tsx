"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useSubscription } from "@/hooks/use-subscription"
import { LockIcon } from "lucide-react"
import { estimateDuration } from "@/lib/utils"

export interface VoiceOption {
  voice_id: string
  voice_name: string
  description: string
  type: "standard" | "cloned" | 'premium'
  gender?: "female" | "male" | "neutral"
  available: boolean
  preview?: string
  premium?: boolean
}

interface VoiceSelectionProps {
  text: string
  onGenerate: (selectedVoice: string) => void
  isGenerating?: boolean
  voices: VoiceOption[]
}

export function VoiceSelection({
  text,
  onGenerate,
  isGenerating = false,
  voices = [],
}: VoiceSelectionProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("erin")
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null)
  const { currentPlan } = useSubscription()

  const availableVoices: VoiceOption[] = voices

  const handleGenerate = () => {
    onGenerate(selectedVoice)
  }

  const playPreview = async (voiceId: string) => {
    setIsPlayingPreview(voiceId)

    try {
      const previewText = "Hello! This is how I sound. I can read your documents with this voice."

      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: previewText,
          voiceId,
        }),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")

        if (contentType?.includes("audio/")) {
          const audioBlob = await response.blob()

          if (audioBlob.size === 0) {
            throw new Error("Empty audio response")
          }

          if (!audioBlob.type.startsWith("audio/")) {
            throw new Error("Invalid audio format")
          }

          const audioUrl = URL.createObjectURL(audioBlob)

          const audio = new Audio(audioUrl)

          audio.onended = () => {
            setIsPlayingPreview(null)
            URL.revokeObjectURL(audioUrl)
          }

          audio.onerror = (error) => {
            setIsPlayingPreview(null)
            URL.revokeObjectURL(audioUrl)
            throw new Error('Something went wrong playing the audio')
          }

          try {
            await audio.play()
          } catch (playError) {
            console.error("Audio play() failed:", playError)
            throw new Error('Something went wrong playing the audio')
          }
        } 
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Preview failed:", error)
      setIsPlayingPreview(null)
      throw new Error('Preview failed')
    }
  }

  const selectedVoiceData = availableVoices.find((v) => v.voice_id === selectedVoice)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          Voices 
        </CardTitle>
        <CardDescription>Choose from premium voices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="type-small-body font-medium mb-3 block">Select Voice</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableVoices.map((voice) => {
              const isPremium = voice.premium
              const isPremiumUser = currentPlan.name === "Premium"
              const isDisabled = isPremium && !isPremiumUser

              return (
                <div
                  key={voice.voice_id}
                  className={`
                    border rounded-lg p-4 transition-all hover:shadow-md
                    ${selectedVoice === voice.voice_id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 dark:border-gray-700"
                    }
                    ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                  `}
                  onClick={() => !isDisabled && setSelectedVoice(voice.voice_id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isDisabled && <LockIcon className="w-4 h-4 text-amber-600" />}
                      <div>
                        <h4 className="type-heading font-medium">{voice.voice_name}</h4>
                        <p className="type-caption text-gray-600 dark:text-gray-400">{voice.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {voice.type === "standard" && (
                        <Badge variant="default" className="type-caption">
                          Standard
                        </Badge>
                      )}
                      {voice.type === "cloned" && (
                        <Badge variant="secondary" className="type-caption">
                          Cloned
                        </Badge>
                      )}
                      {voice.premium && (
                        <Badge variant="outline" className="type-caption text-amber-600 border-amber-600">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      playPreview(voice.voice_id)
                    }}
                    disabled={isPlayingPreview === voice.voice_id}
                  >
                    {isPlayingPreview === voice.voice_id ? (
                      <>
                        <svg className="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Playing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Preview
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

          <Label className="type-small-body font-medium">Audio Generation</Label>

        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="flex justify-between items-center type-small-body text-gray-600 dark:text-gray-400">
            <span>Text to convert:</span>
            <span className="font-medium">{text.split(" ").length} words</span>
          </div>
          <div className="flex justify-between items-center type-small-body text-gray-600 dark:text-gray-400 mt-1">
            <span>Estimated duration:</span>
            <span className="font-medium">{estimateDuration(text, 200, 0.85)}</span>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedVoiceData?.available}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Generating Audio...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              Generate Audio
            </>
          )}
        </Button>

        {currentPlan.name !== "Premium" && (
          <Alert>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <AlertDescription>
              Upgrade to Premium ($14.99/month) to access premium voices, clone your voice, and use it in all your audio conversions.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
