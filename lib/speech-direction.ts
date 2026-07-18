/**
 * The application owns this small, provider-specific SSML renderer. Never
 * accept user-supplied SSML: extracted documents are always treated as text.
 */
export const LISTENING_STYLES = ["natural", "focused", "relaxed", "engaging"] as const

export type ListeningStyle = (typeof LISTENING_STYLES)[number]

type SpeechifyDirection = {
  emotion: "calm" | "direct" | "relaxed" | "warm"
  rate: "+1%" | "-2%" | "-5%" | "-7%"
}

const directions: Record<ListeningStyle, SpeechifyDirection> = {
  natural: { emotion: "calm", rate: "-2%" },
  focused: { emotion: "direct", rate: "-5%" },
  relaxed: { emotion: "relaxed", rate: "-7%" },
  engaging: { emotion: "warm", rate: "+1%" },
}

const UNSAFE_XML_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g
const GENERATED_SSML = /^<speak><speechify:style emotion="(?:calm|direct|relaxed|warm)"><prosody rate="(?:\+1%|-2%|-5%|-7%)">(?:[^<]|<break time="650ms"\/>)+<\/prosody><\/speechify:style><\/speak>$/u

export function isListeningStyle(value: unknown): value is ListeningStyle {
  return typeof value === "string" && LISTENING_STYLES.includes(value as ListeningStyle)
}

function escapeXmlText(text: string) {
  return text
    .replace(UNSAFE_XML_CHARACTERS, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Creates SSML from plain document text only. The final allowlist assertion is
 * defence in depth: only our fixed tags, fixed attributes and escaped text may
 * be sent to Speechify.
 */
export function buildSpeechifySsml(text: string, style: ListeningStyle): string {
  const direction = directions[style]
  const paragraphs = text
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => escapeXmlText(paragraph.replace(/\s*\r?\n\s*/g, " ").trim()))
    .filter(Boolean)

  if (paragraphs.length === 0) {
    throw new Error("Text must contain readable characters")
  }

  const content = paragraphs.join('<break time="650ms"/>')
  const ssml = `<speak><speechify:style emotion="${direction.emotion}"><prosody rate="${direction.rate}">${content}</prosody></speechify:style></speak>`

  if (!GENERATED_SSML.test(ssml)) {
    throw new Error("Generated SSML failed safety validation")
  }

  return ssml
}
