"use client"

import * as tus from "tus-js-client"
import { createClient } from "@/lib/supabase/client"

type PreparedUpload = {
  bucket: string
  path: string
  token: string
  displayName: string
  resumable: boolean
}

async function responseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(data.error || "Audio storage request failed")
  return data
}

function directStorageEndpoint() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!configuredUrl) throw new Error("Supabase URL is not configured")
  const url = new URL(configuredUrl)
  if (url.hostname.endsWith(".supabase.co")) {
    url.hostname = url.hostname.replace(/\.supabase\.co$/, ".storage.supabase.co")
  }
  url.pathname = "/storage/v1/upload/resumable"
  url.search = ""
  return url.toString()
}

function uploadResumable(blob: Blob, prepared: PreparedUpload) {
  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(blob, {
      endpoint: directStorageEndpoint(),
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      headers: { "x-signature": prepared.token },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: prepared.bucket,
        objectName: prepared.path,
        contentType: "audio/mpeg",
        cacheControl: "3600",
      },
      onError: reject,
      onSuccess: () => resolve(),
    })

    upload.start()
  })
}

export async function uploadGeneratedAudio(blob: Blob, fileName: string) {
  const prepared = await responseJson<PreparedUpload>(
    await fetch("/api/audio-upload/prepare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileSize: blob.size }),
    }),
  )

  if (prepared.resumable) {
    await uploadResumable(blob, prepared)
  } else {
    const { error } = await createClient().storage
      .from(prepared.bucket)
      .uploadToSignedUrl(prepared.path, prepared.token, blob, {
        contentType: "audio/mpeg",
        cacheControl: "3600",
      })
    if (error) throw error
  }

  return responseJson<{ saved: true; id: number }>(
    await fetch("/api/audio-upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: prepared.path, fileName: prepared.displayName }),
    }),
  )
}
