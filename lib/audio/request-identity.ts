import "server-only"

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto"
import { auth } from "@clerk/nextjs/server"
import { type NextRequest, type NextResponse } from "next/server"

const GUEST_COOKIE_NAME = "invocly_guest"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type AudioRequestIdentity = {
  userId: string | null
  identityHash: string
  ipHash: string
  guestCookie?: string
}

function identitySecret() {
  const secret = process.env.REQUEST_IDENTITY_SECRET || process.env.CLERK_SECRET_KEY
  if (!secret) throw new Error("REQUEST_IDENTITY_SECRET is not configured")
  return secret
}

function digest(purpose: string, value: string) {
  return createHmac("sha256", identitySecret())
    .update(`invocly:${purpose}:v1\0${value}`)
    .digest("hex")
}

function signGuestId(guestId: string) {
  return `${guestId}.${digest("guest-cookie", guestId)}`
}

function readGuestId(cookieValue: string | undefined) {
  if (!cookieValue) return null
  const separator = cookieValue.indexOf(".")
  if (separator < 0) return null

  const guestId = cookieValue.slice(0, separator)
  const signature = cookieValue.slice(separator + 1)
  if (!UUID_PATTERN.test(guestId) || !/^[0-9a-f]{64}$/i.test(signature)) return null

  const expected = Buffer.from(digest("guest-cookie", guestId), "hex")
  const received = Buffer.from(signature, "hex")
  return expected.length === received.length && timingSafeEqual(expected, received) ? guestId : null
}

function requestIp(request: NextRequest) {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown"

  return forwarded.split(",", 1)[0]?.trim().slice(0, 128) || "unknown"
}

export async function resolveAudioRequestIdentity(request: NextRequest): Promise<AudioRequestIdentity> {
  const { userId } = await auth()
  let guestId = readGuestId(request.cookies.get(GUEST_COOKIE_NAME)?.value)
  let guestCookie: string | undefined

  if (!userId && !guestId) {
    guestId = randomUUID()
    guestCookie = signGuestId(guestId)
  }

  const identity = userId ? `user:${userId}` : `guest:${guestId}`

  return {
    userId,
    identityHash: digest("identity", identity),
    ipHash: digest("ip", requestIp(request)),
    guestCookie,
  }
}

export function attachGuestCookie(response: NextResponse, identity: AudioRequestIdentity) {
  if (!identity.guestCookie) return response

  response.cookies.set({
    name: GUEST_COOKIE_NAME,
    value: identity.guestCookie,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })

  return response
}
