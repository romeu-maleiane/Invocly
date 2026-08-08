export function parseRetryAfter(value: string | null, now = Date.now()) {
  if (!value) return null

  const seconds = Number(value)
  if (Number.isFinite(seconds)) return seconds >= 0 ? Math.ceil(seconds) : null

  const date = Date.parse(value)
  if (Number.isNaN(date)) return null
  return Math.max(0, Math.ceil((date - now) / 1_000))
}
