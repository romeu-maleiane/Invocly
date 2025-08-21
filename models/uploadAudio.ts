'use server'
import { createClient } from "@/lib/supabase/server"

export async function uploadAudio(file: Buffer, fileName: string, userId: string) {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase.storage
            .from('audio')
            .upload(`${userId}/${fileName}`, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (error) {
            console.error("Supabase upload error:", error)
            throw error
        }

        // Gerar URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('audio')
            .getPublicUrl(`${userId}/${fileName}`)

        return publicUrl
    } catch (error) {
        console.error('Upload Audio Error: ', error)
        return null
    }
}
