'use server'
import { createClient } from "@/lib/supabase/server"

export async function uploadAudio(file: Buffer, fileName: string, userId: string) {
    const supabase = await createClient()

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
    const { publicUrl, error: urlError } = supabase.storage
        .from('audio')
        .getPublicUrl(`${userId}/${fileName}`)

    if (urlError) {
        console.error("Supabase URL error:", urlError)
        throw urlError
    }

    return publicUrl
}
