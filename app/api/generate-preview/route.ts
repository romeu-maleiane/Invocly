import { getVoiceId } from "@/models/getVoiceId"
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


    return NextResponse.json(
      {
        success: true,
        fallback: true,
        message: SPEECHIFY_API_KEY ? "Using browser TTS (Speechify unavailable)" : "Using browser TTS",
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

  const speechifyVoiceId = await getVoiceId(voiceId)

  if (!speechifyVoiceId) {
    throw new Error("Voice not found")
  }
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
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    } else {
      // case direct binary (mp3)
      return await response.arrayBuffer();
    }

  } catch (fetchError) {
    console.error("[v0] Speechify API fetch failed:", fetchError)
    throw fetchError
  }
}

