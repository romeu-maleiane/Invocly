import { randomUUID } from "node:crypto"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { audioGuardrailConfig } from "@/lib/audio/config"
import { sanitizeAudioName, validateStoredAudioSize } from "@/lib/audio/storage"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const { fileName, fileSize } = (await request.json()) as { fileName?: unknown; fileSize?: unknown }
    if (typeof fileName !== "string" || typeof fileSize !== "number" || !validateStoredAudioSize(fileSize)) {
      return NextResponse.json({ error: "Invalid audio file" }, { status: 400 })
    }

    const displayName = sanitizeAudioName(fileName)
    const path = `${userId}/${randomUUID()}.mp3`
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage
      .from(audioGuardrailConfig.privateAudioBucket)
      .createSignedUploadUrl(path, { upsert: false })

    if (error || !data?.token) {
      console.error("Unable to create signed audio upload:", error?.message)
      return NextResponse.json({ error: "Unable to prepare audio storage" }, { status: 503 })
    }

    return NextResponse.json({
      bucket: audioGuardrailConfig.privateAudioBucket,
      path,
      token: data.token,
      displayName,
      resumable: fileSize > 6 * 1024 * 1024,
    })
  } catch (error) {
    console.error("Prepare audio upload failed:", error)
    return NextResponse.json({ error: "Unable to prepare audio storage" }, { status: 500 })
  }
}
