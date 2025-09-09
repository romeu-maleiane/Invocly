"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AudioPlayerProps {
  audioStream: ReadableStream<Uint8Array>
  fileName: string
  onStreamEnd: (blob: Blob) => void
  onDownload: () => void
}

export function AudioPlayer({
  audioStream,
  fileName,
  onStreamEnd,
  onDownload,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [volume, setVolume] = useState([1.0])
  const [playbackRate, setPlaybackRate] = useState([1.0])
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isStreamComplete, setIsStreamComplete] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    const mediaSource = new MediaSource()
    const audio = audioRef.current
    if (!audio) return

    const objectUrl = URL.createObjectURL(mediaSource)
    audio.src = objectUrl
    audio.load()

    const onSourceOpen = () => {
      try {
        const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg")
        const reader = audioStream.getReader()
        const chunks: BlobPart[] = []

        const processStream = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                if (!sourceBuffer.updating && mediaSource.readyState === "open") {
                  mediaSource.endOfStream()
                  const blob = new Blob(chunks, { type: "audio/mpeg" })
                  onStreamEnd(blob)
                  setIsStreamComplete(true)
                  setTotalDuration(mediaSource.duration)
                }
                return
              }

              chunks.push(new Uint8Array(value))
              if (!sourceBuffer.updating) {
                sourceBuffer.appendBuffer(new Uint8Array(value))
              } else {
                sourceBuffer.addEventListener("updateend", () => processStream(), { once: true })
              }
            })
            .catch((err) => {
              console.error("Stream reading error:", err)
            })
        }

        sourceBuffer.addEventListener("updateend", processStream)
        processStream()
      } catch (error) {
        console.error("MediaSource or SourceBuffer error:", error)
      }
    }

    mediaSource.addEventListener("sourceopen", onSourceOpen)

    audio.play().catch((e) => console.log("Autoplay failed", e))
    setIsPlaying(true)

    return () => {
      mediaSource.removeEventListener("sourceopen", onSourceOpen)
      URL.revokeObjectURL(objectUrl)
    }
  }, [audioStream])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0]
      audioRef.current.playbackRate = playbackRate[0]
    }
  }, [volume, playbackRate])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio || !isStreamComplete) return

    audio.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <audio ref={audioRef} preload="metadata" />

        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{fileName}</h4>
              <p className="text-xs text-gray-500">
                {!isStreamComplete ? "Streaming Audio..." : "Generated Audio"}
              </p>
            </div>
            <Badge variant="secondary">MP3</Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={totalDuration}
              step={1}
              className="w-full"
              disabled={!isStreamComplete}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{!isStreamComplete ? "Loading duration..." : formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              className="flex items-center justify-center sm:w-fit w-full gap-2 bg-transparent"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <div className="flex items-center sm:w-fit w-full gap-2">
              <span className="text-xs text-gray-500">Speed:</span>
              <Slider
                value={playbackRate}
                onValueChange={setPlaybackRate}
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={!isStreamComplete}
                className="sm:w-20 w-full"
              />
              <Badge variant="outline" className="text-xs">
                {playbackRate[0]}x
              </Badge>
            </div>

            <div className="flex items-center sm:w-fit w-full gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728"
                />
              </svg>
              <Slider value={volume} onValueChange={setVolume} min={0} max={1} step={0.1} className="sm:w-16 w-full" />
            </div>

            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-center sm:w-fit w-full"
              onClick={onDownload}
              disabled={!isStreamComplete}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {!isStreamComplete ? 'Loading download...' : 'Download'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
