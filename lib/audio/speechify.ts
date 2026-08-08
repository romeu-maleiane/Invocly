import "server-only"

import * as Sentry from "@sentry/nextjs"
import { audioGuardrailConfig } from "@/lib/audio/config"
export { parseRetryAfter } from "@/lib/audio/retry-after"
import { parseRetryAfter } from "@/lib/audio/retry-after"

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"))
      return
    }

    const timeout = setTimeout(resolve, milliseconds)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout)
        reject(signal.reason ?? new DOMException("Aborted", "AbortError"))
      },
      { once: true },
    )
  })
}

export async function fetchSpeechifyWithRetry(
  path: string,
  init: RequestInit,
  options: { signal?: AbortSignal; fetcher?: typeof fetch } = {},
) {
  const apiKey = process.env.SPEECHIFY_API_KEY
  if (!apiKey) throw new Error("Speechify API key is not configured")

  const baseUrl = (process.env.SPEECHIFY_API_BASE_URL || "https://api.sws.speechify.com").replace(/\/$/, "")
  const fetcher = options.fetcher ?? fetch
  let response: Response | undefined

  for (let attempt = 0; attempt <= audioGuardrailConfig.speechifyMaxRetries; attempt += 1) {
    const headers = new Headers(init.headers)
    headers.set("Authorization", `Bearer ${apiKey}`)
    response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      signal: options.signal,
      headers,
      cache: "no-store",
    })

    const requestId = response.headers.get("speechify-request-id") || response.headers.get("x-request-id")
    if (requestId) Sentry.setTag("speechify.request_id", requestId)

    if (response.status !== 429 || attempt === audioGuardrailConfig.speechifyMaxRetries) return response

    // A 429 body is small and must be consumed before reusing the connection.
    await response.arrayBuffer()
    const retryAfter = parseRetryAfter(response.headers.get("retry-after")) ?? 2 ** attempt
    const boundedDelay = Math.min(retryAfter, audioGuardrailConfig.speechifyMaxRetryDelaySeconds)
    await wait(Math.max(1, boundedDelay) * 1_000, options.signal)
  }

  return response!
}

export function streamWithFinalizer(
  source: ReadableStream<Uint8Array>,
  finalizer: () => Promise<void>,
  signal?: AbortSignal,
) {
  const reader = source.getReader()
  let finalized = false
  let abortHandler: (() => void) | undefined

  const finalizeOnce = async () => {
    if (finalized) return
    finalized = true
    await finalizer()
  }

  const removeAbortHandler = () => {
    if (abortHandler) signal?.removeEventListener("abort", abortHandler)
    abortHandler = undefined
  }

  return new ReadableStream<Uint8Array>({
    start() {
      abortHandler = () => void reader.cancel(signal?.reason).finally(finalizeOnce)
      signal?.addEventListener("abort", abortHandler, { once: true })
    },
    async pull(controller) {
      try {
        const { done, value } = await reader.read()
        if (done) {
          removeAbortHandler()
          controller.close()
          await finalizeOnce()
          return
        }
        if (value) controller.enqueue(value)
      } catch (error) {
        removeAbortHandler()
        if (!signal?.aborted) controller.error(error)
        await finalizeOnce()
      }
    },
    async cancel(reason) {
      removeAbortHandler()
      try {
        await reader.cancel(reason)
      } finally {
        await finalizeOnce()
      }
    },
  })
}
