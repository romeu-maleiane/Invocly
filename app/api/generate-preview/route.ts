import { getVoiceId } from "@/models/getVoiceId"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId,} = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY

    if (SPEECHIFY_API_KEY) {
      try {
        const previewAudio = await generateSpeechifyPreview(text, voiceId,)

        if (previewAudio && previewAudio.byteLength > 0) {
          return new NextResponse(previewAudio, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
            },
          })
        }
      } catch (error) {
        console.error("Speechify preview error:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)

        // Check for specific Speechify API errors
        if (
          errorMessage.includes("quota_exceeded") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("rate_limit") ||
          errorMessage.includes("unusual_activity")
        ) {
          console.log("Speechify API unavailable, using browser fallback:", errorMessage)
        }
        // Fall back to voice config response for browser TTS
      }
    }


    return NextResponse.json(
      {
        success: true,
        fallback: true,
        message: SPEECHIFY_API_KEY ? "Using browser TTS (Speechify unavailable)" : "Using browser TTS",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Preview generation failed:", error)
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 })
  }
}

async function generateSpeechifyPreview(
  text: string,
  voiceId: string,
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
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Speechify API error response:", error)
      throw new Error(`Speechify API error: ${error}`)
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Caso JSON com Base64
      const data = await response.json();
      if (!data.audio_data) {
        console.error("JSON recived but without audio");
        return null;
      }
      const buffer = Buffer.from(data.audio_data, "base64");
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    } else {
      // case direct binary (mp3)
      return await response.arrayBuffer();
    }

  } catch (fetchError) {
    console.error("Speechify API fetch failed:", fetchError)
    throw fetchError
  }
}

