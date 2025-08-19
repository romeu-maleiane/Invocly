import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, speed, pitch } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY

    if (SPEECHIFY_API_KEY) {
      try {
        console.log("[v0] Attempting Speechify API preview for voice:", voiceId)
        const previewAudio = await generateSpeechifyPreview(text, voiceId, speed, pitch)

        if (previewAudio && previewAudio.byteLength > 0) {
          console.log("[v0] Speechify preview generated successfully")
          return new NextResponse(previewAudio, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
            },
          })
        } else {
          console.log("[v0] Speechify returned empty audio, falling back to browser TTS")
        }
      } catch (error) {
        console.error("[v0] Speechify preview error:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Check for specific Speechify API errors
        if (
          errorMessage.includes("quota_exceeded") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("rate_limit") ||
          errorMessage.includes("unusual_activity")
        ) {
          console.log("[v0] Speechify API unavailable, using browser fallback:", errorMessage)
        }
        // Fall back to voice config response for browser TTS
      }
    } else {
      console.log("[v0] No Speechify API key found, using browser TTS fallback")
    }

    const voiceConfig = getVoiceConfiguration(voiceId)

    return NextResponse.json(
      {
        success: true,
        fallback: true,
        message: SPEECHIFY_API_KEY ? "Using browser TTS (Speechify unavailable)" : "Using browser TTS",
        voiceConfig,
        settings: {
          text,
          speed: speed || 1.0,
          pitch: pitch || 1.0,
          volume: 1.0,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Preview generation failed:", error)
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 })
  }
}

async function generateSpeechifyPreview(
  text: string,
  voiceId: string,
  speed: number,
  pitch: number,
): Promise<ArrayBuffer | null> {
  const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY!

  const speechifyVoiceId = getSpeechifyVoiceId(voiceId)

  // Limit preview text length
  const previewText = text.length > 100 ? text.substring(0, 100) + "..." : text

  try {
    const response = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: previewText,
        voice_id: speechifyVoiceId,
        audio_format: "mp3",
        speed: speed,
        // Speechify doesn't have direct pitch control, so we'll use voice variations
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.log("[v0] Speechify API error response:", error)
      throw new Error(`Speechify API error: ${error}`)
    }

    const audioBuffer = await response.arrayBuffer()

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      console.log("[v0] Speechify returned empty audio buffer")
      return null
    }

    console.log("[v0] Speechify audio buffer size:", audioBuffer.byteLength)
    return audioBuffer
  } catch (fetchError) {
    console.error("[v0] Speechify API fetch failed:", fetchError)
    throw fetchError
  }
}

function getSpeechifyVoiceId(voiceId: string): string {
  const voiceMapping = {
    "speechify-sarah": "sarah",
    "speechify-david": "david",
    "speechify-alex": "alex",
    "speechify-emma": "emma",
    "speechify-james": "james",
    "speechify-lily": "lily",
    "speechify-marcus": "marcus",
    "speechify-sophia": "sophia",
    "celebrity-snoop": "snoop_dogg",
    "celebrity-gwyneth": "gwyneth_paltrow",
    "celebrity-morgan": "morgan_freeman",
    "celebrity-scarlett": "scarlett_johansson",
    "celebrity-samuel": "samuel_jackson",
    "cloned-voice": "cloned-voice", // Will be handled separately
  }

  return voiceMapping[voiceId as keyof typeof voiceMapping] || voiceMapping["speechify-sarah"]
}

function getVoiceConfiguration(voiceId: string) {
  const voiceConfigs = {
    "speechify-sarah": {
      gender: "female",
      language: "en-US",
      name: "Sarah",
      pitch: 1.0,
      rate: 1.0,
      voiceName: "Microsoft Zira - English (United States)",
    },
    "speechify-david": {
      gender: "male",
      language: "en-US",
      name: "David",
      pitch: 0.8,
      rate: 1.0,
      voiceName: "Microsoft David - English (United States)",
    },
    "speechify-alex": {
      gender: "neutral",
      language: "en-US",
      name: "Alex",
      pitch: 0.9,
      rate: 1.0,
      voiceName: "Microsoft Mark - English (United States)",
    },
    "speechify-emma": {
      gender: "female",
      language: "en-US",
      name: "Emma",
      pitch: 1.2,
      rate: 1.1,
      voiceName: "Microsoft Aria - English (United States)",
    },
    "speechify-james": {
      gender: "male",
      language: "en-US",
      name: "James",
      pitch: 0.7,
      rate: 0.9,
      voiceName: "Microsoft Mark - English (United States)",
    },
    "speechify-lily": {
      gender: "female",
      language: "en-US",
      name: "Lily",
      pitch: 1.1,
      rate: 0.95,
      voiceName: "Microsoft Zira - English (United States)",
    },
    "speechify-marcus": {
      gender: "male",
      language: "en-US",
      name: "Marcus",
      pitch: 0.75,
      rate: 0.9,
      voiceName: "Microsoft David - English (United States)",
    },
    "speechify-sophia": {
      gender: "female",
      language: "en-US",
      name: "Sophia",
      pitch: 1.05,
      rate: 1.0,
      voiceName: "Microsoft Aria - English (United States)",
    },
    "celebrity-snoop": {
      gender: "male",
      language: "en-US",
      name: "Snoop Dogg",
      pitch: 0.8,
      rate: 0.9,
      voiceName: "Microsoft David - English (United States)",
    },
    "celebrity-gwyneth": {
      gender: "female",
      language: "en-US",
      name: "Gwyneth Paltrow",
      pitch: 1.0,
      rate: 1.0,
      voiceName: "Microsoft Zira - English (United States)",
    },
    "celebrity-morgan": {
      gender: "male",
      language: "en-US",
      name: "Morgan Freeman",
      pitch: 0.6,
      rate: 0.8,
      voiceName: "Microsoft David - English (United States)",
    },
    "celebrity-scarlett": {
      gender: "female",
      language: "en-US",
      name: "Scarlett Johansson",
      pitch: 0.95,
      rate: 1.0,
      voiceName: "Microsoft Zira - English (United States)",
    },
    "celebrity-samuel": {
      gender: "male",
      language: "en-US",
      name: "Samuel L. Jackson",
      pitch: 0.85,
      rate: 1.1,
      voiceName: "Microsoft Mark - English (United States)",
    },
    "cloned-voice": {
      gender: "custom",
      language: "en-US",
      name: "Your Voice",
      pitch: 1.0,
      rate: 1.0,
      voiceName: "Microsoft Zira - English (United States)",
    },
  }

  return voiceConfigs[voiceId as keyof typeof voiceConfigs] || voiceConfigs["speechify-sarah"]
}
