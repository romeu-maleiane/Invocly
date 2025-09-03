'use server'
import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

export async function storeClonedVoiceId(voiceId: string, voiceName: string, voiceDescription: string): Promise<void> {
  const supabase = await createClient()
  const { userId } = await auth()

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("voices").insert([
    {
      id: voiceId,
      name: voiceName,
      description: voiceDescription || 'Your cloned voice',
      user_id: userId,
      type: "cloned",
      available: true,
      premium: true,
    },
  ])

  if (error) {
    console.error("Error storing cloned voice:", error)
    throw new Error("Failed to store cloned voice")
  }

  console.log(`Stored cloned voice: ${voiceName} with ID: ${voiceId}`)
}
