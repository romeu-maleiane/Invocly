import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would check the user's account for cloned voices
    // For now, we'll simulate checking local storage or database

    const hasClonedVoice = await checkUserClonedVoice()

    return NextResponse.json({
      hasClonedVoice,
      voiceName: hasClonedVoice ? "Your Voice" : null,
    })
  } catch (error) {
    console.error("Error checking cloned voice:", error)
    return NextResponse.json({ hasClonedVoice: false }, { status: 500 })
  }
}

async function checkUserClonedVoice(): Promise<boolean> {
  // Simulate checking for existing cloned voice
  // In production, this would query your database or ElevenLabs API

  // For demo purposes, randomly return true/false
  // In real implementation, you'd check user's account
  return Math.random() > 0.7 // 30% chance of having a cloned voice
}
