import { NextResponse } from "next/server"
import { AudioAccessError } from "@/lib/audio/guardrails"
import { attachGuestCookie, type AudioRequestIdentity } from "@/lib/audio/request-identity"

export function audioErrorResponse(error: unknown, identity?: AudioRequestIdentity) {
  const known = error instanceof AudioAccessError
  const status = known ? error.status : 500
  const response = NextResponse.json(
    {
      error: known ? error.message : "Audio generation failed.",
      code: known ? error.code : "audio_generation_failed",
    },
    { status },
  )

  if (known && error.retryAfter) response.headers.set("Retry-After", String(error.retryAfter))
  return identity ? attachGuestCookie(response, identity) : response
}
