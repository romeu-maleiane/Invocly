'use server'
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function storeClonedVoiceId(voiceId: string, voiceName: string, voiceDescription: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { userId } = await auth()

    if (!userId) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase.from("voices").insert({
      voice_id: voiceId,
      voice_name: voiceName,
      description: voiceDescription || 'Your cloned voice',
      user_id: userId,
      gender: 'neutral',
      type: "cloned",
      available: true,
      premium: true,
    })

    if (error) {
      console.error("Error storing cloned voice:", error)
      throw new Error("Failed to store cloned voice")
    }

  } catch (err) {
    console.error("StoreClonedVoiceId error:", err)
    throw err
  }
}
