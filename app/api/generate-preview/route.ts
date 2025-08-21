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

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Caso JSON com Base64
      const data = await response.json();
      if (!data.audio_data) {
        console.log("[v0] JSON recived but without audio");
        return null;
      }
      const buffer = Buffer.from(data.audio_data, "base64");
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    } else {
      // case direct binary (mp3)
      return await response.arrayBuffer();
    }

  } catch (fetchError) {
    console.error("[v0] Speechify API fetch failed:", fetchError)
    throw fetchError
  }
}

function getSpeechifyVoiceId(voiceId: string): string {
  const voiceMapping = {
    "erin": "erin",
    "oliver": "oliver",
    "james": "james",
    "kim": "kim",
    "ken": "ken",
    "carol": "carol",
    "freddie": "freddie",
    "beverly": "beverly",
    "cloned-voice": "cloned-voice", // Will be handled separately
  }

  return voiceMapping[voiceId as keyof typeof voiceMapping] || voiceMapping["erin"]
}

function getVoiceConfiguration(voiceId: string) {
  const voiceConfigs = {
    "erin": {
      gender: "female",
      language: "en-US",
      name: "Erin",
      pitch: 1.0,
      rate: 1.0,
      voiceName: "Microsoft Erin - English (United States)",
    },
    "oliver": {
      gender: "male",
      language: "en-US",
      name: "Oliver",
      pitch: 0.8,
      rate: 1.0,
      voiceName: "Microsoft Oliver - English (United States)",
    },
    "james": {
      gender: "neutral",
      language: "en-US",
      name: "James",
      pitch: 0.9,
      rate: 1.0,
      voiceName: "Microsoft James - English (United States)",
    },
    "kim": {
      gender: "female",
      language: "en-US",
      name: "Kim",
      pitch: 1.2,
      rate: 1.1,
      voiceName: "Microsoft kim - English (United States)",
    },
    "ken": {
      gender: "male",
      language: "en-US",
      name: "Ken",
      pitch: 0.7,
      rate: 0.9,
      voiceName: "Microsoft Mark - English (United States)",
    },
    "carol": {
      gender: "female",
      language: "en-US",
      name: "Carol",
      pitch: 1.1,
      rate: 0.95,
      voiceName: "Microsoft Zira - English (United States)",
    },
    "freddie": {
      gender: "male",
      language: "en-US",
      name: "Freddie",
      pitch: 0.75,
      rate: 0.9,
      voiceName: "Microsoft David - English (United States)",
    },
    "beverly": {
      gender: "female",
      language: "en-US",
      name: "Beverly",
      pitch: 1.05,
      rate: 1.0,
      voiceName: "Microsoft Aria - English (United States)",
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

  return voiceConfigs[voiceId as keyof typeof voiceConfigs] || voiceConfigs["erin"]
}
