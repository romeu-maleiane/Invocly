import "server-only"

import { randomUUID } from "node:crypto"
import { audioGuardrailConfig, type AudioRequestKind } from "@/lib/audio/config"
import { createAdminClient } from "@/lib/supabase/admin"

export type AudioPlan = "free" | "premium"

export class AudioAccessError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly retryAfter?: number,
  ) {
    super(message)
  }
}

type RpcBooleanResult = {
  acquired?: boolean
  allowed?: boolean
  reserved?: boolean
  retry_after_seconds?: number
  remaining?: number
}

function firstRpcRow(data: unknown): RpcBooleanResult {
  if (Array.isArray(data)) return (data[0] ?? {}) as RpcBooleanResult
  return (data ?? {}) as RpcBooleanResult
}

export async function getAudioPlan(userId: string | null): Promise<AudioPlan> {
  if (!userId) return "free"

  const supabase = createAdminClient()
  const { data, error } = await supabase.from("users").select("plan").eq("id", userId).maybeSingle()
  if (error) throw new AudioAccessError("Unable to verify your plan right now.", 503, "plan_lookup_failed")

  return data?.plan?.trim().toLowerCase() === "premium" ? "premium" : "free"
}

type AuthorizedVoice = {
  voiceId: string
  isPremium: boolean
  isCloned: boolean
}

export async function authorizeAudioVoice(
  requestedVoice: string,
  userId: string | null,
  plan: AudioPlan,
): Promise<AuthorizedVoice> {
  const voice = requestedVoice.trim().slice(0, 200)
  if (!voice) throw new AudioAccessError("Voice is required.", 400, "voice_required")

  const supabase = createAdminClient()
  const columns = "voice_id,voice_name,premium,type,user_id,available"
  let result = await supabase.from("voices").select(columns).eq("voice_id", voice).limit(1).maybeSingle()

  if (!result.data && !result.error) {
    result = await supabase.from("voices").select(columns).eq("voice_name", voice).limit(1).maybeSingle()
  }

  if (result.error || !result.data?.voice_id) {
    throw new AudioAccessError("Voice not found.", 404, "voice_not_found")
  }

  const row = result.data
  const ownerId = row.user_id?.trim() || null
  const isCloned = row.type === "cloned" || Boolean(ownerId)
  const isPremium = row.premium === true || row.type === "premium" || isCloned

  if (row.available !== true) {
    throw new AudioAccessError("This voice is currently unavailable.", 403, "voice_unavailable")
  }
  if (isCloned && (!userId || ownerId !== userId)) {
    throw new AudioAccessError("You do not have access to this voice.", 403, "voice_forbidden")
  }
  if (isPremium && plan !== "premium") {
    throw new AudioAccessError("This voice requires a Premium plan.", 403, "premium_voice_required")
  }

  return { voiceId: row.voice_id, isPremium, isCloned }
}

export async function enforceAudioRateLimit(
  identityHash: string,
  ipHash: string,
  kind: AudioRequestKind,
) {
  const isDocument = kind === "document"
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("check_audio_rate_limit", {
    p_identity_hash: identityHash,
    p_ip_hash: ipHash,
    p_scope: kind,
    p_identity_limit: isDocument
      ? audioGuardrailConfig.documentRatePerIdentity
      : audioGuardrailConfig.previewRatePerIdentity,
    p_ip_limit: isDocument ? audioGuardrailConfig.documentRatePerIp : audioGuardrailConfig.previewRatePerIp,
    p_window_seconds: audioGuardrailConfig.rateWindowSeconds,
  })

  if (error) {
    console.error("Audio rate-limit RPC failed:", error.code)
    throw new AudioAccessError("Audio generation is temporarily unavailable.", 503, "guardrail_unavailable")
  }

  const row = firstRpcRow(data)
  if (!row.allowed) {
    const retryAfter = Math.max(1, row.retry_after_seconds ?? audioGuardrailConfig.rateWindowSeconds)
    throw new AudioAccessError("Too many requests. Please try again shortly.", 429, "rate_limited", retryAfter)
  }
}

export type AudioLease = { id: string; retryAfter?: number }

export async function acquireAudioLease(identityHash: string, kind: AudioRequestKind): Promise<AudioLease> {
  const id = randomUUID()
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("acquire_audio_generation_lease", {
    p_lease_id: id,
    p_identity_hash: identityHash,
    p_kind: kind,
    p_total_limit: audioGuardrailConfig.totalConcurrency,
    p_kind_limit:
      kind === "document" ? audioGuardrailConfig.documentConcurrency : audioGuardrailConfig.previewConcurrency,
    p_per_identity_limit: audioGuardrailConfig.perIdentityConcurrency,
    p_ttl_seconds: audioGuardrailConfig.leaseTtlSeconds,
  })

  if (error) {
    console.error("Audio lease RPC failed:", error.code)
    throw new AudioAccessError("Audio generation is temporarily unavailable.", 503, "guardrail_unavailable")
  }

  const row = firstRpcRow(data)
  if (!row.acquired) {
    const retryAfter = Math.min(10, Math.max(1, row.retry_after_seconds ?? 2))
    throw new AudioAccessError(
      "Audio generation is busy. Please try again shortly.",
      429,
      "capacity_limited",
      retryAfter,
    )
  }

  return { id }
}

export async function releaseAudioLease(leaseId: string) {
  const { error } = await createAdminClient().rpc("release_audio_generation_lease", { p_lease_id: leaseId })
  if (error) console.error("Unable to release audio lease:", error.code)
}

export type FreeQuotaReservation = { id: string; remaining: number }

export async function reserveFreeAudioQuota(identityHash: string): Promise<FreeQuotaReservation> {
  const id = randomUUID()
  const { data, error } = await createAdminClient().rpc("reserve_audio_free_quota", {
    p_reservation_id: id,
    p_identity_hash: identityHash,
    p_limit: audioGuardrailConfig.freeGenerationLimit,
    p_ttl_seconds: audioGuardrailConfig.leaseTtlSeconds,
  })

  if (error) {
    console.error("Audio quota RPC failed:", error.code)
    throw new AudioAccessError("Unable to verify your free usage right now.", 503, "guardrail_unavailable")
  }

  const row = firstRpcRow(data)
  if (!row.reserved) {
    throw new AudioAccessError(
      "You have reached the free document limit. Upgrade to Premium to continue.",
      403,
      "free_limit_reached",
    )
  }

  return { id, remaining: Math.max(0, row.remaining ?? 0) }
}

export async function commitFreeAudioQuota(reservationId: string) {
  const { error } = await createAdminClient().rpc("commit_audio_free_quota", {
    p_reservation_id: reservationId,
  })
  if (error) {
    console.error("Unable to commit audio quota:", error.code)
    throw new AudioAccessError("Unable to record your audio usage.", 503, "guardrail_unavailable")
  }
}

export async function releaseFreeAudioQuota(reservationId: string) {
  const { error } = await createAdminClient().rpc("release_audio_free_quota", {
    p_reservation_id: reservationId,
  })
  if (error) console.error("Unable to release audio quota:", error.code)
}

export async function getFreeAudioUsage(identityHash: string) {
  const { data, error } = await createAdminClient().rpc("get_audio_free_usage", {
    p_identity_hash: identityHash,
  })
  if (error) throw new AudioAccessError("Unable to load your usage right now.", 503, "guardrail_unavailable")
  return typeof data === "number" ? data : Number(data ?? 0)
}
