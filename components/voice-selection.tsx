"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useSubscription } from "@/hooks/use-subscription"
import { LockIcon } from "lucide-react"

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

export interface VoiceSettings {
  selectedVoice: string
  speed: number
  pitch: number
  volume: number
}

interface VoiceSelectionProps {
  text: string
  onGenerate: (settings: VoiceSettings) => void
  isGenerating?: boolean
  voices: VoiceOption[]
}

export function VoiceSelection({
  text,
  onGenerate,
  isGenerating = false,
  voices = [],
}: VoiceSelectionProps) {
  const [selectedVoice, setSelectedVoice] = useState<string>("speechify-sarah")
  const [speed, setSpeed] = useState<number[]>([1.0])
  const [pitch, setPitch] = useState<number[]>([1.0])
  const [volume, setVolume] = useState<number[]>([1.0])
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null)
  const { currentPlan } = useSubscription()

  const availableVoices: VoiceOption[] = voices
  
  const handleGenerate = () => {
    const settings: VoiceSettings = {
      selectedVoice,
      speed: speed[0],
      pitch: pitch[0],
      volume: volume[0],
    }
    onGenerate(settings)
  }

  const playPreview = async (voiceId: string) => {
    setIsPlayingPreview(voiceId)

    try {
      console.log("[v0] Starting preview for voice:", voiceId)
      const previewText = "Hello! This is how I sound. I can read your documents with this voice."

      const response = await fetch("/api/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: previewText,
          voiceId,
          speed: speed[0],
          pitch: pitch[0],
        }),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")
        console.log("[v0] Preview response content-type:", contentType)

        if (contentType?.includes("audio/")) {
          console.log("[v0] Processing audio response")
          const audioBlob = await response.blob()

          if (audioBlob.size === 0) {
            console.log("[v0] Empty audio blob received, falling back to browser TTS")
            throw new Error("Empty audio response")
          }

          if (!audioBlob.type.startsWith("audio/")) {
            console.log("[v0] Invalid audio blob type:", audioBlob.type, "falling back to browser TTS")
            throw new Error("Invalid audio format")
          }

          const audioUrl = URL.createObjectURL(audioBlob)

          const audio = new Audio(audioUrl)
          audio.volume = volume[0]
          audio.playbackRate = speed[0]

          audio.onended = () => {
            console.log("[v0] Audio preview ended successfully")
            setIsPlayingPreview(null)
            URL.revokeObjectURL(audioUrl)
          }

          audio.onerror = (error) => {
            console.error("[v0] Audio playback error:", error)
            console.log("[v0] Audio element error - likely invalid audio data")
            setIsPlayingPreview(null)
            URL.revokeObjectURL(audioUrl)
            // Fallback to browser TTS
            playWebSpeechPreview(previewText, voiceId)
          }

          audio.onloadstart = () => {
            console.log("[v0] Audio loading started")
          }

          audio.oncanplay = () => {
            console.log("[v0] Audio can play - valid audio detected")
          }

          try {
            await audio.play()
          } catch (playError) {
            console.error("[v0] Audio play() failed:", playError)
            setIsPlayingPreview(null)
            URL.revokeObjectURL(audioUrl)
            playWebSpeechPreview(previewText, voiceId)
          }
        } else if (contentType?.includes("application/json")) {
          console.log("[v0] Processing JSON fallback response")
          const { voiceConfig, settings } = await response.json()
          playWebSpeechPreview(previewText, voiceId, voiceConfig, settings)
        } else {
          throw new Error(`Unexpected content type: ${contentType}`)
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("[v0] Preview failed:", error)
      setIsPlayingPreview(null)

      // Always fallback to browser TTS
      const previewText = "Hello! This is how I sound. I can read your documents with this voice."
      playWebSpeechPreview(previewText, voiceId)
    }
  }

  const playWebSpeechPreview = (text: string, voiceId: string, voiceConfig?: any, settings?: any) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)

      const voices = speechSynthesis.getVoices()
      let selectedVoice = voices.find(
        (voice) => voiceConfig?.voiceName && voice.name.includes(voiceConfig.voiceName.split(" - ")[0]),
      )

      if (!selectedVoice) {
        const voiceGender = voiceConfig?.gender || getVoiceGender(voiceId)
        selectedVoice =
          voices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              (voiceGender === "female"
                ? voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("woman")
                : voiceGender === "male"
                  ? voice.name.toLowerCase().includes("male") || voice.name.toLowerCase().includes("man")
                  : true),
          ) || voices[0]
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      utterance.rate = settings?.speed || speed[0]
      utterance.pitch = settings?.pitch || pitch[0]
      utterance.volume = volume[0]

      utterance.onend = () => {
        setIsPlayingPreview(null)
      }

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error)
        setIsPlayingPreview(null)
      }

      speechSynthesis.speak(utterance)
    } else {
      setIsPlayingPreview(null)
      alert("Preview not available. Your browser may not support speech synthesis.")
    }
  }

  const getVoiceGender = (voiceId: string) => {
    const genderMap = {
      "erin": "female",
      "oliver": "male",
      "james": "neutral",
      "kim": "female",
      "ken": "male",
      "carol": "female",
      "freddie": "male",
      "beverly": "female",
    }
    return genderMap[voiceId as keyof typeof genderMap] || "neutral"
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
          Voice & Audio Settings
        </CardTitle>
        <CardDescription>Choose from premium voices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-3 block">Select Voice</Label>
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
                    ${
                      selectedVoice === voice.voice_id
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
                        <h4 className="font-medium text-sm">{voice.voice_name}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{voice.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {voice.type === "standard" && (
                        <Badge variant="default" className="text-xs">
                          Standard
                        </Badge>
                      )}
                      {voice.type === "cloned" && (
                        <Badge variant="secondary" className="text-xs">
                          Cloned
                        </Badge>
                      )}
                      {voice.premium && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
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

        <div className="space-y-4">
          <Label className="text-base font-medium">Audio Controls</Label>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Reading Speed</Label>
              <Badge variant="outline">{speed[0]}x</Badge>
            </div>
            <Slider value={speed} onValueChange={setSpeed} min={0.5} max={4.0} step={0.1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5x (Slow)</span>
              <span>4.0x (Fast)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Pitch</Label>
              <Badge variant="outline">{pitch[0]}x</Badge>
            </div>
            <Slider value={pitch} onValueChange={setPitch} min={0.5} max={2.0} step={0.1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0.5x (Lower)</span>
              <span>2.0x (Higher)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Volume</Label>
              <Badge variant="outline">{Math.round(volume[0] * 100)}%</Badge>
            </div>
            <Slider value={volume} onValueChange={setVolume} min={0.1} max={1.0} step={0.1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Text to convert:</span>
            <span className="font-medium">{text.split(" ").length} words</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-400">Estimated duration:</span>
            <span className="font-medium">{Math.ceil(text.split(" ").length / 200 / speed[0])} min</span>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedVoiceData?.available}
          className="w-full"
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


// Helper function to get gender from voice ID
function getVoiceGender(voiceId: string) {
  const genderMap = {
    "speechify-sarah": "female",
    "speechify-mark": "male",
    "speechify-james": "male",
    "speechify-kim": "female",
    "speechify-ken": "male",
    "speechify-carol": "female",
    "speechify-freddie": "male",
    "speechify-beverly": "female",
    "cloned-voice": "neutral",
  }
  return genderMap[voiceId as keyof typeof genderMap] || "neutral"
}