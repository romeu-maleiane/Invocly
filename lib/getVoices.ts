import { VoiceOption } from "@/components/voice-selection"
import { createClient } from "./supabase/client"


export async function getVoices(userId?: string) {
  const supabase = createClient()

  let voices: VoiceOption[] = []

  const { data: publicVoices, error: publicError } = await supabase
    .from("voices")
    .select("*")
    .eq("user_id", '')

  if (publicError) {
    console.error("Error fetching public voices:", publicError)
  } else if (publicVoices) {
    voices = voices.concat(publicVoices)
  }

  if (userId) {
    const { data: clonedVoices, error: clonedError } = await supabase
      .from("voices")
      .select("*")
      .eq("user_id", userId)

    if (clonedError) {
      console.error("Error fetching cloned voices:", clonedError)
    } else if (clonedVoices) {
      voices = voices.concat(clonedVoices)
    }
  }
  
  return voices
}