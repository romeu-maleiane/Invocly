import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { audioGuardrailConfig } from "@/lib/audio/config"
import { isOwnedAudioPath, sanitizeAudioName, validateStoredAudioSize } from "@/lib/audio/storage"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const { path, fileName } = (await request.json()) as { path?: unknown; fileName?: unknown }
    if (typeof path !== "string" || typeof fileName !== "string" || !isOwnedAudioPath(path, userId)) {
      return NextResponse.json({ error: "Invalid audio path" }, { status: 400 })
    }

    const objectName = path.slice(userId.length + 1)
    const supabase = createAdminClient()
    const { data: objects, error: listError } = await supabase.storage
      .from(audioGuardrailConfig.privateAudioBucket)
      .list(userId, { limit: 5, search: objectName })
    const object = objects?.find((item) => item.name === objectName)
    const size = Number(object?.metadata?.size ?? 0)

    if (listError || !object || !validateStoredAudioSize(size)) {
      console.error("Uploaded audio could not be verified:", listError?.message)
      return NextResponse.json({ error: "Uploaded audio could not be verified" }, { status: 422 })
    }

    const displayName = sanitizeAudioName(fileName).replace(/\.mp3$/i, "")
    const { data: audio, error: insertError } = await supabase
      .from("audios")
      .insert({
        audio_name: displayName,
        audio_url: null,
        storage_path: path,
        file_size: size,
        user_id: userId,
      })
      .select("id")
      .single()

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existing } = await supabase
          .from("audios")
          .select("id")
          .eq("storage_path", path)
          .eq("user_id", userId)
          .maybeSingle()
        return NextResponse.json({ saved: true, id: existing?.id ?? null })
      }
      console.error("Unable to record uploaded audio:", insertError.code)
      await supabase.storage.from(audioGuardrailConfig.privateAudioBucket).remove([path])
      return NextResponse.json({ error: "Unable to save audio to your library" }, { status: 500 })
    }

    return NextResponse.json({ saved: true, id: audio.id })
  } catch (error) {
    console.error("Complete audio upload failed:", error)
    return NextResponse.json({ error: "Unable to save audio to your library" }, { status: 500 })
  }
}
