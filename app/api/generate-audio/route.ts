import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, settings, fileName } = await request.json()

    if (!text || !settings) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const audioBuffer = await generateSpeechifyAudio(text, settings)

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${fileName.replace(/\.[^/.]+$/, "")}_audio.mp3"`,
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Audio generation failed:", error)
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
  }
}

async function generateSpeechifyAudio(text: string, settings: any): Promise<ArrayBuffer> {
  const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY

  if (!SPEECHIFY_API_KEY) {
    console.warn("Speechify API key not found, using fallback TTS")
    return generateFallbackAudio(text, settings)
  }

  try {
    const voiceId = getSpeechifyVoiceId(settings.selectedVoice)

    const chunks = splitTextIntoChunks(text, 5000) // Speechify has higher limits
    const audioChunks: ArrayBuffer[] = []

    for (const chunk of chunks) {
      const chunkAudio = await generateSpeechifyChunk(chunk, voiceId, settings)
      audioChunks.push(chunkAudio)
    }

    return combineAudioBuffers(audioChunks)
  } catch (error) {
    console.error("Speechify API error:", error)
    return generateFallbackAudio(text, settings)
  }
}

function getSpeechifyVoiceId(voiceId: string): string {
  const voiceMapping = {
    "speechify-sarah": "sarah",
    "speechify-david": "david",
    "speechify-alex": "alex",
    "speechify-emma": "emma",
    "speechify-james": "james",
    "speechify-lily": "lily",
    "speechify-marcus": "marcus",
    "speechify-sophia": "sophia",
    "celebrity-snoop": "snoop_dogg",
    "celebrity-gwyneth": "gwyneth_paltrow",
    "celebrity-morgan": "morgan_freeman",
    "celebrity-scarlett": "scarlett_johansson",
    "celebrity-samuel": "samuel_jackson",
    "cloned-voice": "cloned-voice", // Will be handled separately
  }

  return voiceMapping[voiceId as keyof typeof voiceMapping] || voiceMapping["speechify-sarah"]
}

async function generateSpeechifyChunk(text: string, voiceId: string, settings: any): Promise<ArrayBuffer> {
  const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY!

  if (voiceId === "cloned-voice") {
    const clonedVoiceId = await getClonedVoiceId()
    if (clonedVoiceId) {
      voiceId = clonedVoiceId
    } else {
      throw new Error("Cloned voice not available")
    }
  }

  const response = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      voice_id: voiceId,
      audio_format: "mp3",
      speed: settings.speed || 1.0,
      model: "simba-multilingual",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Speechify API error: ${error}`)
  }

  return response.arrayBuffer()
}

function getElevenLabsVoiceId(voiceId: string): string {
  const voiceMapping = {
    "female-standard": "21m00Tcm4TlvDq8ikWAM", // Rachel
    "male-standard": "29vD33N1CtxCmqQRPOHJ", // Drew
    "neutral-standard": "pNInz6obpgDQGcFmaJgB", // Adam
    "cheerful-standard": "EXAVITQu4vr4xnSDxMaL", // Bella
    "cloned-voice": "cloned-voice", // Will be handled separately
  }

  return voiceMapping[voiceId as keyof typeof voiceMapping] || voiceMapping["female-standard"]
}

async function generateElevenLabsChunk(text: string, voiceId: string, settings: any): Promise<ArrayBuffer> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!

  if (voiceId === "cloned-voice") {
    const clonedVoiceId = await getClonedVoiceId()
    if (clonedVoiceId) {
      voiceId = clonedVoiceId
    } else {
      throw new Error("Cloned voice not available")
    }
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${error}`)
  }

  return response.arrayBuffer()
}

async function getClonedVoiceId(): Promise<string | null> {
  return "user_cloned_voice_id"
}

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  let currentChunk = ""

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += (currentChunk ? ". " : "") + sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

function combineAudioBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
  if (buffers.length === 0) return new ArrayBuffer(0)
  if (buffers.length === 1) return buffers[0]

  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0)
  const combined = new ArrayBuffer(totalLength)
  const combinedView = new Uint8Array(combined)

  let offset = 0
  for (const buffer of buffers) {
    const bufferView = new Uint8Array(buffer)
    combinedView.set(bufferView, offset)
    offset += buffer.byteLength
  }

  return combined
}

async function generateFallbackAudio(text: string, settings: any): Promise<ArrayBuffer> {
  const wordsPerMinute = 200 * settings.speed
  const wordCount = text.split(" ").length
  const durationSeconds = (wordCount / wordsPerMinute) * 60

  const sampleRate = 44100
  const samples = Math.floor(sampleRate * durationSeconds)

  const wavHeader = createWAVHeader(samples * 2, sampleRate)
  const audioData = new ArrayBuffer(samples * 2)
  const view = new Int16Array(audioData)

  for (let i = 0; i < samples; i++) {
    const frequency = 200 + Math.sin(i / 1000) * 100
    const amplitude = 0.3 * settings.volume * Math.sin(i / 5000)
    const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * amplitude * 32767
    view[i] = Math.floor(sample)
  }

  const combined = new ArrayBuffer(wavHeader.byteLength + audioData.byteLength)
  const combinedView = new Uint8Array(combined)
  combinedView.set(new Uint8Array(wavHeader), 0)
  combinedView.set(new Uint8Array(audioData), wavHeader.byteLength)

  return combined
}

function createWAVHeader(dataSize: number, sampleRate: number): ArrayBuffer {
  const header = new ArrayBuffer(44)
  const view = new DataView(header)

  view.setUint32(0, 0x52494646, false) // "RIFF"
  view.setUint32(4, 36 + dataSize, true) // File size
  view.setUint32(8, 0x57415645, false) // "WAVE"
  view.setUint32(12, 0x666d7420, false) // "fmt "
  view.setUint32(16, 16, true) // Subchunk1Size
  view.setUint16(20, 1, true) // AudioFormat (PCM)
  view.setUint16(22, 1, true) // NumChannels (mono)
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate * 2, true) // ByteRate
  view.setUint16(32, 2, true) // BlockAlign
  view.setUint16(34, 16, true) // BitsPerSample
  view.setUint32(36, 0x64617461, false) // "data"
  view.setUint32(40, dataSize, true) // Subchunk2Size

  return header
}
