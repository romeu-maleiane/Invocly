export interface ExtractionResult {
  text: string
  wordCount: number
  estimatedReadingTime: number
  language?: string
}

export function processExtractedText(rawText: string): ExtractionResult {
  // Clean up the text
  const cleanText = rawText
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n\n") // Clean up multiple line breaks
    .trim()

  // Calculate word count
  const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length

  // Estimate reading time (average 200 words per minute for TTS)
  const estimatedReadingTime = Math.ceil(wordCount / 200)

  // Basic language detection (simplified)
  const language = detectLanguage(cleanText)

  return {
    text: cleanText,
    wordCount,
    estimatedReadingTime,
    language,
  }
}

function detectLanguage(text: string): string {
  // Simple language detection based on common words
  const sample = text.toLowerCase().substring(0, 1000)

  const englishWords = ["the", "and", "is", "in", "to", "of", "a", "that", "it", "with"]
  const portugueseWords = ["o", "a", "e", "de", "do", "da", "em", "um", "uma", "para", "com", "não"]
  const spanishWords = ["el", "la", "de", "que", "y", "en", "un", "es", "se", "no", "te", "lo"]

  let englishScore = 0
  let portugueseScore = 0
  let spanishScore = 0

  englishWords.forEach((word) => {
    if (sample.includes(` ${word} `)) englishScore++
  })

  portugueseWords.forEach((word) => {
    if (sample.includes(` ${word} `)) portugueseScore++
  })

  spanishWords.forEach((word) => {
    if (sample.includes(` ${word} `)) spanishScore++
  })

  if (portugueseScore > englishScore && portugueseScore > spanishScore) {
    return "pt"
  } else if (spanishScore > englishScore && spanishScore > portugueseScore) {
    return "es"
  } else {
    return "en"
  }
}

export function validateTextForTTS(text: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = []

  if (text.length === 0) {
    issues.push("No text content found")
  }

  if (text.length > 500000) {
    // 500KB limit for TTS
    issues.push("Text is too long for TTS processing (max 500KB)")
  }

  if (text.length < 10) {
    issues.push("Text is too short for meaningful TTS conversion")
  }

  // Check for excessive special characters that might cause TTS issues
  const specialCharRatio = (text.match(/[^a-zA-Z0-9\s.,!?;:]/g) || []).length / text.length
  if (specialCharRatio > 0.3) {
    issues.push("Text contains too many special characters that may affect TTS quality")
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
