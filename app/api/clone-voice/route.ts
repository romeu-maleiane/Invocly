import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";
import { SpeechifyClient } from "@speechify/api";
import { storeClonedVoiceId } from "@/models/storeClonedVoiceId";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob;
    const voiceName = formData.get("voiceName") as string;
    const voiceDescription = formData.get("voiceDescription") as string;

    if (!audioFile || !voiceName) {
      return NextResponse.json({ error: "Missing audio file or voice name" }, { status: 400 });
    }

    // Validate audio file
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Invalid audio file format" }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 5MB)" }, { status: 400 });
    }

    const supabase = await createClient();

    const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY;
    if (!SPEECHIFY_API_KEY) {
      console.error("Speechify API key not found");
      return NextResponse.json({ error: "Speechify API key not found" }, { status: 500 });
    }

    const { userId } = await auth();
    const { data, error } = await supabase
      .from("users")
      .select("user_name,email")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user on clone voice api:", error);
      throw new Error("Failed to fetch user data");
    }

    const consentData = {
      fullName: data?.user_name || "",
      email: data?.email || "",
    };

    let voiceId: string;
    try {
      const speechifyForm = new FormData();
      speechifyForm.append("sample", audioFile, "voice.wav");
      speechifyForm.append("name", voiceName);
      speechifyForm.append("gender", "notSpecified");
      speechifyForm.append("consent", JSON.stringify(consentData));

      const response = await fetch("https://api.sws.speechify.com/v1/voices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
        },
        body: speechifyForm,
      });


      if (!response.ok) {
        throw new Error("Speechify voice cloning failed");
      }
      const data = await response.json()
      voiceId = data.id;

      await storeClonedVoiceId(voiceId, voiceName, voiceDescription);

    } catch (error) {
      console.error("Speechify voice cloning error:", error);
      return NextResponse.json({ error: "Voice cloning failed" }, { status: 500 });
    }

    if (!voiceId) {
      throw new Error("Voice cloning failed");
    }

    return NextResponse.json({
      voiceId,
      voiceName,
      message: "Voice cloned successfully",
    });
  } catch (error) {
    console.error("Voice cloning error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Voice cloning failed" },
      { status: 500 },
    );
  }
}
