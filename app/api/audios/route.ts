import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { audioGuardrailConfig } from "@/lib/audio/config"
import { createAdminClient } from "@/lib/supabase/admin"

const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("audios")
      .select("id,audio_name,audio_url,storage_path,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Unable to load audio library:", error.code)
      return NextResponse.json({ error: "Unable to load your audio library" }, { status: 500 })
    }

    const audios = await Promise.all(
      (data ?? []).map(async (audio) => {
        if (!audio.storage_path) {
          return {
            id: audio.id,
            audio_name: audio.audio_name,
            created_at: audio.created_at,
            playback_url: audio.audio_url,
            download_url: audio.audio_url,
          }
        }

        const [playback, download] = await Promise.all([
          supabase.storage
            .from(audioGuardrailConfig.privateAudioBucket)
            .createSignedUrl(audio.storage_path, SIGNED_URL_TTL_SECONDS),
          supabase.storage
            .from(audioGuardrailConfig.privateAudioBucket)
            .createSignedUrl(audio.storage_path, SIGNED_URL_TTL_SECONDS, {
              download: `${audio.audio_name || "audio"}.mp3`,
            }),
        ])

        if (playback.error || download.error) {
          console.error("Unable to sign stored audio:", playback.error?.message || download.error?.message)
        }

        return {
          id: audio.id,
          audio_name: audio.audio_name,
          created_at: audio.created_at,
          playback_url: playback.data?.signedUrl ?? null,
          download_url: download.data?.signedUrl ?? null,
        }
      }),
    )

    return NextResponse.json({ audios }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    console.error("Load audio library failed:", error)
    return NextResponse.json({ error: "Unable to load your audio library" }, { status: 500 })
  }
}
