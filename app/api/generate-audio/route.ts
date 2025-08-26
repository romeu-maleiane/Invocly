import { type NextRequest, NextResponse } from "next/server"
import { auth } from '@clerk/nextjs/server'
import { uploadAudio } from "@/models/uploadAudio"
import { insertAudio } from "@/models/insertAudio";
import { getVoiceId } from "@/models/getVoiceId";

 
export async function POST(request: NextRequest) {
  try {
    const { text, settings, fileName } = await request.json()
    const { userId } = await auth()

    if (!text || !settings) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const voiceId = await getVoiceId(settings.selectedVoice)

    if (!voiceId) {
      return NextResponse.json({ error: "Voice not found" }, { status: 404 })
    }

    const audioBuffer = await generateSpeechifyAudio(text, voiceId, settings)

    // add to database if user is loged 
    if (userId) {
      const publicUrl = await uploadAudio(audioBuffer, fileName, userId);
      if(publicUrl)
        await insertAudio(fileName, publicUrl, userId);
    };

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${fileName.replace(/\.[^/.]+$/, "")}_audio.mp3"`,
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Audio generation failed:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}

async function generateSpeechifyAudio(text: string, voiceId: string, settings: any): Promise<ArrayBuffer> {
  const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY!

  if (voiceId === "cloned-voice") {
    const clonedVoiceId = await getClonedVoiceId()
    if (clonedVoiceId) {
      voiceId = clonedVoiceId
    } else {
      throw new Error("Cloned voice not available")
    }
  }

  const response = await fetch("https://api.sws.speechify.com/v1/audio/stream", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      voice_id: voiceId,
      audio_format: "mp3",
      speed: settings.speed || 1.0,
      model: "simba-multilingual",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Speechify API error: ${error}`)
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    // Caso JSON com Base64
    const data = await response.json();
    if (!data.audio_data) {
      console.log("[v0] JSON recived but without audio");
      return await response.arrayBuffer();
    }
      const buffer = Buffer.from(data.audio_data, "base64");
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  } else {
    // case direct binary (mp3)
    return await response.arrayBuffer();
  }
}


async function getClonedVoiceId(): Promise<string | null> {
  return "user_cloned_voice_id"
}


