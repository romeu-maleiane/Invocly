'use server'
import { createClient } from "@/lib/supabase/server"

export async function uploadAudio(audioBlob: Blob, fileName: string, userId: string) {
    const supabase = await createClient()
    const file = new File([audioBlob], fileName, { type: 'audio/mpeg' })
    
    try {
        const { error } = await supabase.storage
            .from('audio')
            .upload(`${userId}/${fileName}`, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: 'audio/mpeg',
            })

        if (error) {
            console.error("Supabase upload error:", error)
            throw error
        }


        const { data: { publicUrl } } = supabase.storage
            .from('audio')
            .getPublicUrl(`${userId}/${fileName}`)

        return publicUrl
    } catch (error) {
        console.error('Upload Audio Error: ', error)
        return null
    }
}
