import { type NextRequest, NextResponse } from "next/server"
import {
  acquireAudioLease,
  AudioAccessError,
  authorizeAudioVoice,
  enforceAudioRateLimit,
  getAudioPlan,
  releaseAudioLease,
} from "@/lib/audio/guardrails"
import { audioErrorResponse } from "@/lib/audio/http"
import { attachGuestCookie, resolveAudioRequestIdentity, type AudioRequestIdentity } from "@/lib/audio/request-identity"
import { fetchSpeechifyWithRetry, parseRetryAfter } from "@/lib/audio/speechify"

const MAX_PREVIEW_INPUT = 2_000

export async function POST(request: NextRequest) {
  let identity: AudioRequestIdentity | undefined
  let leaseId: string | undefined

  try {
    const { text, voiceId } = (await request.json()) as { text?: unknown; voiceId?: unknown }
    if (typeof text !== "string" || !text.trim() || typeof voiceId !== "string" || !voiceId.trim()) {
      return NextResponse.json({ error: "Missing required parameters", code: "invalid_request" }, { status: 400 })
    }
    if (text.length > MAX_PREVIEW_INPUT) {
      return NextResponse.json({ error: "Preview text is too long", code: "preview_too_long" }, { status: 400 })
    }

    identity = await resolveAudioRequestIdentity(request)
    const plan = await getAudioPlan(identity.userId)
    const voice = await authorizeAudioVoice(voiceId, identity.userId, plan)

    await enforceAudioRateLimit(identity.identityHash, identity.ipHash, "preview")
    const lease = await acquireAudioLease(identity.identityHash, "preview")
    leaseId = lease.id

    const lastSpace = text.lastIndexOf(" ", 100)
    const previewText = text.length > 100
      ? `${text.substring(0, lastSpace > 0 ? lastSpace : 100).trim()}...`
      : text

    const speechifyResponse = await fetchSpeechifyWithRetry(
      "/v1/audio/speech",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: previewText, voice_id: voice.voiceId, audio_format: "mp3" }),
      },
      { signal: request.signal },
    )

    if (!speechifyResponse.ok) {
      const providerMessage = (await speechifyResponse.text()).slice(0, 1_000)
      console.error("Speechify preview failed:", {
        status: speechifyResponse.status,
        requestId:
          speechifyResponse.headers.get("speechify-request-id") || speechifyResponse.headers.get("x-request-id"),
        providerMessage,
      })

      if (speechifyResponse.status === 429) {
        throw new AudioAccessError(
          "Voice previews are busy. Please try again shortly.",
          429,
          "speechify_rate_limited",
          parseRetryAfter(speechifyResponse.headers.get("retry-after")) ?? 2,
        )
      }
      throw new AudioAccessError("Unable to generate this voice preview.", 502, "speechify_failed")
    }

    const contentType = speechifyResponse.headers.get("content-type") || ""
    let previewAudio: ArrayBuffer
    if (contentType.includes("application/json")) {
      const data = (await speechifyResponse.json()) as { audio_data?: string }
      if (!data.audio_data) throw new AudioAccessError("The voice preview was empty.", 502, "empty_preview")
      const buffer = Buffer.from(data.audio_data, "base64")
      previewAudio = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
    } else {
      previewAudio = await speechifyResponse.arrayBuffer()
    }

    if (previewAudio.byteLength === 0) {
      throw new AudioAccessError("The voice preview was empty.", 502, "empty_preview")
    }

    const response = new NextResponse(previewAudio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    })
    return attachGuestCookie(response, identity)
  } catch (error) {
    if (!(error instanceof AudioAccessError)) console.error("Preview generation failed:", error)
    return audioErrorResponse(error, identity)
  } finally {
    if (leaseId) await releaseAudioLease(leaseId)
  }
}
