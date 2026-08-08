import { type NextRequest, NextResponse } from "next/server"
import { audioGuardrailConfig } from "@/lib/audio/config"
import { getAudioPlan, getFreeAudioUsage } from "@/lib/audio/guardrails"
import { audioErrorResponse } from "@/lib/audio/http"
import { attachGuestCookie, resolveAudioRequestIdentity, type AudioRequestIdentity } from "@/lib/audio/request-identity"

export async function GET(request: NextRequest) {
  let identity: AudioRequestIdentity | undefined

  try {
    identity = await resolveAudioRequestIdentity(request)
    const plan = await getAudioPlan(identity.userId)
    const usage = plan === "free" ? await getFreeAudioUsage(identity.identityHash) : 0
    const response = NextResponse.json({
      plan,
      usage,
      limit: plan === "free" ? audioGuardrailConfig.freeGenerationLimit : null,
      remaining: plan === "free" ? Math.max(0, audioGuardrailConfig.freeGenerationLimit - usage) : null,
    })

    return attachGuestCookie(response, identity)
  } catch (error) {
    return audioErrorResponse(error, identity)
  }
}
