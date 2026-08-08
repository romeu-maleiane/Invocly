import "server-only"

import { audioGuardrailConfig } from "@/lib/audio/config"

const STORAGE_PATH_PATTERN = /^([^/]+)\/([0-9a-f-]{36})\.mp3$/i

export function sanitizeAudioName(value: string) {
  const name = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[\\/]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180)

  return name || "Generated audio.mp3"
}

export function isOwnedAudioPath(path: string, userId: string) {
  const match = STORAGE_PATH_PATTERN.exec(path)
  return Boolean(match && match[1] === userId)
}

export function validateStoredAudioSize(size: number) {
  return Number.isSafeInteger(size) && size > 0 && size <= audioGuardrailConfig.maxStoredAudioBytes
}
