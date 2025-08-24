'use server'
import { createClient } from "@/lib/supabase/server"

export async function insertAudio(audioName: string, publicUrl: string, userId: string) {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('audios')
            .upsert({'audio_name': audioName.replace(/\.(txt|docx|pdf)$/i, ''), 
                'audio_url': publicUrl, 
                'user_id': userId
            })
            .select()

        if (error) {
            console.error("Supabase insert audio error:", error)
            throw error
        }

    } catch (error) {
        console.error('Insert Audio Error: ', error)
        return
    }
}

