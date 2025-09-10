import { type NextRequest, NextResponse } from "next/server"
import { getVoiceId } from "@/models/getVoiceId";


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};


export async function POST(request: NextRequest) {
  try {
    const { text, selectedVoice, } = await request.json()

    if (!text || !selectedVoice) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const voiceId = await getVoiceId(selectedVoice)

    if (!voiceId) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 })
    }

    const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY!
    const speechifyResponse = await fetch("https://api.sws.speechify.com/v1/audio/stream", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        voice_id: voiceId,
        audio_format: "mp3",
        model: "simba-multilingual",
      }),
    });

    if (!speechifyResponse.ok || !speechifyResponse.body) {
      const error = await speechifyResponse.text()
      console.error("Speechify API error:", error)
      return NextResponse.json({ error: `Failed to generate audio: ${error}` }, { status: speechifyResponse.status })
    }

    const stream = speechifyResponse.body;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error) {
    console.error("Audio generation failed:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}


