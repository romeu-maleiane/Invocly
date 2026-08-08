import "server-only"

function positiveInteger(name: string, fallback: number) {
  const parsed = Number.parseInt(process.env[name] ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const audioGuardrailConfig = {
  totalConcurrency: positiveInteger("AUDIO_TOTAL_CONCURRENCY", 14),
  documentConcurrency: positiveInteger("AUDIO_DOCUMENT_CONCURRENCY", 12),
  previewConcurrency: positiveInteger("AUDIO_PREVIEW_CONCURRENCY", 2),
  perIdentityConcurrency: positiveInteger("AUDIO_PER_IDENTITY_CONCURRENCY", 1),
  leaseTtlSeconds: positiveInteger("AUDIO_LEASE_TTL_SECONDS", 360),
  documentRatePerIdentity: positiveInteger("AUDIO_DOCUMENT_RATE_PER_IDENTITY", 5),
  documentRatePerIp: positiveInteger("AUDIO_DOCUMENT_RATE_PER_IP", 30),
  previewRatePerIdentity: positiveInteger("AUDIO_PREVIEW_RATE_PER_IDENTITY", 20),
  previewRatePerIp: positiveInteger("AUDIO_PREVIEW_RATE_PER_IP", 60),
  rateWindowSeconds: positiveInteger("AUDIO_RATE_WINDOW_SECONDS", 60),
  freeGenerationLimit: positiveInteger("AUDIO_FREE_GENERATION_LIMIT", 3),
  speechifyMaxRetries: positiveInteger("SPEECHIFY_MAX_RETRIES", 2),
  speechifyMaxRetryDelaySeconds: positiveInteger("SPEECHIFY_MAX_RETRY_DELAY_SECONDS", 10),
  privateAudioBucket: process.env.SUPABASE_PRIVATE_AUDIO_BUCKET || "user-audio",
  maxStoredAudioBytes: positiveInteger("AUDIO_MAX_STORED_BYTES", 100 * 1024 * 1024),
} as const

export type AudioRequestKind = "document" | "preview"
