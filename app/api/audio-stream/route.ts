import { type NextRequest, NextResponse } from "next/server"
import { getVoiceId } from "@/models/getVoiceId";
import { buildSpeechifySsml, isListeningStyle } from "@/lib/speech-direction";


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};


// Fix #7: limite de caracteres consistente com extract-text — evita abuso direto do endpoint
const MAX_CHAR_LIMIT = 20_000;

export async function POST(request: NextRequest) {
  try {
    const { text, selectedVoice, listeningStyle = "natural" } = await request.json()

    if (!text || !selectedVoice) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Fix #7: validar tamanho do texto antes de chamar a API do Speechify
    if (typeof text !== "string" || !text.trim() || text.length > MAX_CHAR_LIMIT) {
      return NextResponse.json(
        { error: `Text exceeds the maximum allowed length of ${MAX_CHAR_LIMIT} characters.` },
        { status: 400 }
      )
    }

    if (!isListeningStyle(listeningStyle)) {
      return NextResponse.json({ error: "Invalid listening style" }, { status: 400 })
    }

    const voiceId = await getVoiceId(selectedVoice)

    if (!voiceId) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 })
    }

    const input = buildSpeechifySsml(text, listeningStyle)

    // Speechify's 20,000-character stream limit includes SSML markup.
    if (input.length > MAX_CHAR_LIMIT) {
      return NextResponse.json(
        { error: "This document is too long after speech formatting. Try a shorter document." },
        { status: 400 },
      )
    }

    const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY!
    const speechifyResponse = await fetch("https://api.sws.speechify.com/v1/audio/stream", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
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

