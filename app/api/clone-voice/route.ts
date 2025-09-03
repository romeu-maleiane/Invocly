import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server"
import { SpeechifyClient } from "@speechify/api";
import { storeClonedVoiceId } from "@/models/storeClonedVoiceId";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const voiceName = formData.get("voiceName") as string
    const voiceDescription = formData.get("voiceDescription") as string

    if (!audioFile || !voiceName) {
      return NextResponse.json({ error: "Missing audio file or voice name" }, { status: 400 })
    }

    // Validate audio file
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Invalid audio file format" }, { status: 400 })
    }

    // Check file size (max 5MB)
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 5MB)" }, { status: 400 })
    }

    const voiceId = await processSpeechifyVoiceCloning(audioFile, voiceName, voiceDescription)

    if (!voiceId) {
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

async function processSpeechifyVoiceCloning(audioFile: File, voiceName: string, voiceDescription: string): Promise<string | null> {
  const supabase = await createClient()

  const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY
  if (!SPEECHIFY_API_KEY) {
    console.error("Speechify API key not found")
    return null
  }
  
  const { userId } = await auth()
  const { data, error } = await supabase
  .from("users")
  .select('user_name,email')
  .eq('id', userId)
  .single()

  if (error) {
    console.error("Error fetching user on clone voice api:", error)
    throw new Error("Failed to store cloned voice")
  }

  const consentData = {
    fullName: data?.user_name || '',
    email: data?.email || ''
  }

  const client = new SpeechifyClient({ token: SPEECHIFY_API_KEY });
  try {
    // First, create a voice clone with Speechify  
    const clonedVoice = await client.tts.voices.create({
      sample: audioFile,
      name: voiceName,
      gender: "notSpecified",
      consent: JSON.stringify(consentData)
    });

    if (!clonedVoice) {
      throw new Error("Speechify voice cloning failed")
    }

    await storeClonedVoiceId(clonedVoice.id, voiceName, voiceDescription)

    return clonedVoice.id
  } catch (error) {
    console.error("Speechify voice cloning error:", error)
    return null
  }
}
