import { type NextRequest, NextResponse } from "next/server"
import {
  acquireAudioLease,
  AudioAccessError,
  authorizeAudioVoice,
  commitFreeAudioQuota,
  enforceAudioRateLimit,
  getAudioPlan,
  releaseAudioLease,
  releaseFreeAudioQuota,
  reserveFreeAudioQuota,
} from "@/lib/audio/guardrails"
import { audioErrorResponse } from "@/lib/audio/http"
import { attachGuestCookie, resolveAudioRequestIdentity, type AudioRequestIdentity } from "@/lib/audio/request-identity"
import { fetchSpeechifyWithRetry, parseRetryAfter, streamWithFinalizer } from "@/lib/audio/speechify"
import { buildSpeechifySsml, isListeningStyle } from "@/lib/speech-direction"

const MAX_CHAR_LIMIT = 20_000

export async function POST(request: NextRequest) {
  let identity: AudioRequestIdentity | undefined
  let leaseId: string | undefined
  let quotaReservationId: string | undefined

  try {
    const body = (await request.json()) as {
      text?: unknown
      selectedVoice?: unknown
      listeningStyle?: unknown
    }
    const { text, selectedVoice, listeningStyle = "natural" } = body

    if (typeof selectedVoice !== "string" || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Missing required parameters", code: "invalid_request" }, { status: 400 })
    }
    if (text.length > MAX_CHAR_LIMIT) {
      return NextResponse.json(
        { error: `Text exceeds the maximum allowed length of ${MAX_CHAR_LIMIT} characters.`, code: "text_too_long" },
        { status: 400 },
      )
    }
    if (!isListeningStyle(listeningStyle)) {
      return NextResponse.json({ error: "Invalid listening style", code: "invalid_listening_style" }, { status: 400 })
    }

    const input = buildSpeechifySsml(text, listeningStyle)
    if (input.length > MAX_CHAR_LIMIT) {
      return NextResponse.json(
        { error: "This document is too long after speech formatting. Try a shorter document.", code: "text_too_long" },
        { status: 400 },
      )
    }

    identity = await resolveAudioRequestIdentity(request)
    const plan = await getAudioPlan(identity.userId)
    const voice = await authorizeAudioVoice(selectedVoice, identity.userId, plan)

    await enforceAudioRateLimit(identity.identityHash, identity.ipHash, "document")
    const lease = await acquireAudioLease(identity.identityHash, "document")
    leaseId = lease.id

    let remainingDocuments: number | null = null
    if (plan === "free") {
      const quota = await reserveFreeAudioQuota(identity.identityHash)
      quotaReservationId = quota.id
      remainingDocuments = quota.remaining
    }

    const speechifyResponse = await fetchSpeechifyWithRetry(
      "/v1/audio/stream",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          input,
          voice_id: voice.voiceId,
          audio_format: "mp3",
          model: "simba-multilingual",
        }),
      },
      { signal: request.signal },
    )

    if (!speechifyResponse.ok || !speechifyResponse.body) {
      const providerMessage = (await speechifyResponse.text()).slice(0, 1_000)
      console.error("Speechify audio stream failed:", {
        status: speechifyResponse.status,
        requestId:
          speechifyResponse.headers.get("speechify-request-id") || speechifyResponse.headers.get("x-request-id"),
        providerMessage,
      })

      if (speechifyResponse.status === 429) {
        throw new AudioAccessError(
          "Audio generation is busy. Please try again shortly.",
          429,
          "speechify_rate_limited",
          parseRetryAfter(speechifyResponse.headers.get("retry-after")) ?? 2,
        )
      }
      if (speechifyResponse.status === 402) {
        throw new AudioAccessError("Audio generation is temporarily unavailable.", 503, "speechify_payment_required")
      }
      throw new AudioAccessError("The audio provider could not generate this document.", 502, "speechify_failed")
    }

    if (quotaReservationId) {
      await commitFreeAudioQuota(quotaReservationId)
      quotaReservationId = undefined
    }

    const activeLeaseId = leaseId
    leaseId = undefined
    const stream = streamWithFinalizer(
      speechifyResponse.body,
      () => releaseAudioLease(activeLeaseId),
      request.signal,
    )

    const response = new NextResponse(stream, {
      headers: {
        "Content-Type": speechifyResponse.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...(remainingDocuments === null
          ? {}
          : { "X-Invocly-Remaining-Documents": String(remainingDocuments) }),
      },
    })

    return attachGuestCookie(response, identity)
  } catch (error) {
    if (quotaReservationId) await releaseFreeAudioQuota(quotaReservationId)
    if (leaseId) await releaseAudioLease(leaseId)
    if (!(error instanceof AudioAccessError)) console.error("Audio generation failed:", error)
    return audioErrorResponse(error, identity)
  }
}
