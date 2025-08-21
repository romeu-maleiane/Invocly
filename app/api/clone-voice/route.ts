import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const voiceName = formData.get("voiceName") as string

    if (!audioFile || !voiceName) {
      return NextResponse.json({ error: "Missing audio file or voice name" }, { status: 400 })
    }

    // Validate audio file
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Invalid audio file format" }, { status: 400 })
    }

    // Check file size (max 10MB)
    if (audioFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 10MB)" }, { status: 400 })
    }

    const voiceId = await processSpeechifyVoiceCloning(audioFile, voiceName)

    if(!voiceId) {
      throw new Error("Voice cloning failed");
    }

    return NextResponse.json({
      voiceId,
      voiceName,
      message: "Voice cloned successfully",
    })
  } catch (error) {
    console.error("Voice cloning error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voice cloning failed" },
      { status: 500 },
    )
  }
}

async function processSpeechifyVoiceCloning(audioFile: File, voiceName: string): Promise<string | null> {
  const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY

  if (!SPEECHIFY_API_KEY) {
    console.error("Speechify API key not found")
    return null
  }

  try {
    // First, create a voice clone with Speechify
    const formData = new FormData()
    formData.append("name", voiceName)
    formData.append("audio_file", audioFile)
    formData.append("description", `Cloned voice: ${voiceName}`)

    const response = await fetch("https://api.sws.speechify.com/v1/voices/clone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Speechify voice cloning failed")
    }

    const result = await response.json()

    await storeClonedVoiceId(result.voice_id, voiceName)

    return result.voice_id
  } catch (error) {
    console.error("Speechify voice cloning error:", error)
    return null
  }
}

async function storeClonedVoiceId(voiceId: string, voiceName: string): Promise<void> {
  // For now, we'll simulate storage
  console.log(`Stored cloned voice: ${voiceName} with ID: ${voiceId}`)

  // You could store this in a database, Redis, or other persistent storage
  // Example: await db.clonedVoices.create({ voiceId, voiceName, userId })
}
