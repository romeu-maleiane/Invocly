"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface AudioFile {
  id: number
  audio_name: string
  audio_url: string
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
  const supabase = createClient()

  const handleDownload = async (audioUrl: string, audioName: string) => {
    const response = await fetch(audioUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = audioName.replace(/\.[^/.]+$/, "") + "_audio.mp3"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    async function loadAudioFiles() {
      if (!user) return

      setIsLoading(true)
      const { data, error } = await supabase
        .from("audios")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching audio files:", error)
      } else {
        setAudioFiles(data as AudioFile[])
      }
      setIsLoading(false)
    }

    if (isOpen) {
      loadAudioFiles()
    }
  }, [isOpen, user])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Audios</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden overflow-y-scroll custom-scrollbar">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading audios...</p>
              </div>
            ) : audioFiles.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p>No audios generated yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {audioFiles.map((audio) => (
                  <div key={audio.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{audio.audio_name}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(audio.created_at), "PPP p")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <audio controls src={audio.audio_url} className="w-64 h-10"></audio>
                      <Button variant="outline" size="sm" onClick={async () => handleDownload(audio.audio_url, audio.audio_name)}>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Download
                      </Button>
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
