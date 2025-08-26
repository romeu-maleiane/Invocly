'use server'
import { createClient } from "@/lib/supabase/server"

export async function getVoiceId(voice: string) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('voices')
            .select('voice_id')
            .or(`voice_id.eq.${voice},voice_name.eq.${voice}`)
            .single()

        if (error) {
            throw error
        }

        if (!data) {
            throw new Error("Voice not found")
        }

        return data.voice_id as string
    } catch (error) {
        console.error('Get Voice Error: ', error)
        return null
    }
}

