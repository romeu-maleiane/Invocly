"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AudioFile {
  id: number
  audio_name: string | null
  playback_url: string | null
  download_url: string | null
  created_at: string
}

interface MyAudiosProps {
  isOpen: boolean
  onClose: () => void
}

export function MyAudios({ isOpen, onClose }: MyAudiosProps) {
  const { user } = useUser()
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !user) return
    let cancelled = false

    async function loadAudioFiles() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const response = await fetch("/api/audios", { cache: "no-store" })
        const result = (await response.json()) as { audios?: AudioFile[]; error?: string }
        if (!response.ok) throw new Error(result.error || "Unable to load audios")
        if (!cancelled) setAudioFiles(result.audios ?? [])
      } catch (error) {
        console.error("Error fetching audio files:", error)
        if (!cancelled) setLoadError("Unable to load your audio library.")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadAudioFiles()
    return () => {
      cancelled = true
    }
  }, [isOpen, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Audios</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close audio library">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden overflow-y-scroll custom-scrollbar">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full"><p>Loading audios...</p></div>
            ) : loadError ? (
              <div className="flex items-center justify-center h-full"><p>{loadError}</p></div>
            ) : audioFiles.length === 0 ? (
              <div className="flex items-center justify-center h-full"><p>No audios generated yet.</p></div>
            ) : (
              <div className="space-y-4">
                {audioFiles.map((audio) => (
                  <div key={audio.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{audio.audio_name || "Generated audio"}</p>
                      <p className="type-caption text-gray-500">{format(new Date(audio.created_at), "PPP p")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {audio.playback_url && <audio controls src={audio.playback_url} className="w-64 h-10" />}
                      {audio.download_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={audio.download_url}>Download</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
