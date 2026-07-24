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
  const [streamError, setStreamError] = useState<string | null>(null)

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
    let completedAudioUrl: string | undefined
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    let sourceBuffer: SourceBuffer | undefined
    let cancelled = false
    let streamEnded = false
    let finalised = false
    let usingCompletedAudio = false
    const pendingChunks: Uint8Array[] = []
    const allChunks: Uint8Array[] = []

    // Keep a short playable window in MediaSource. The complete MP3 is kept
    // separately so pausing never fills the browser's SourceBuffer.
    const INITIAL_BUFFER_SECONDS = 10
    const MAX_BUFFERED_AHEAD_SECONDS = 45
    const RETAINED_BEHIND_SECONDS = 20

    audio.src = objectUrl
    audio.load()
    setIsStreamComplete(false)
    setStreamError(null)

    const getBufferedAhead = () => {
      if (!sourceBuffer) return 0

      const ranges = sourceBuffer.buffered
      for (let index = 0; index < ranges.length; index += 1) {
        const start = ranges.start(index)
        const end = ranges.end(index)
        if (audio.currentTime >= start && audio.currentTime <= end) {
          return end - audio.currentTime
        }
      }

      return 0
    }

    const reportStreamError = (error: unknown) => {
      console.error("Audio streaming error:", error)
      setStreamError("Audio streaming was interrupted. Please generate it again.")
      setIsPlaying(false)
    }

    const finaliseAudio = () => {
      if (finalised || cancelled || !streamEnded) return
      finalised = true
      usingCompletedAudio = true

      const blob = new Blob(allChunks, { type: "audio/mpeg" })
      completedAudioUrl = URL.createObjectURL(blob)
      const resumeAt = audio.currentTime
      const shouldResume = !audio.paused

      const useCompletedAudio = () => {
        if (cancelled) return

        const duration = Number.isFinite(audio.duration) ? audio.duration : 0
        audio.currentTime = Math.min(resumeAt, duration || resumeAt)
        setCurrentTime(audio.currentTime)
        setTotalDuration(duration)
        setIsStreamComplete(true)
        onStreamEnd(blob)

        if (shouldResume) {
          audio.play().catch((error) => console.log("Autoplay failed", error))
        }
      }

      audio.addEventListener("loadedmetadata", useCompletedAudio, { once: true })
      audio.src = completedAudioUrl
      audio.load()

      if (mediaSource.readyState === "open" && sourceBuffer && !sourceBuffer.updating) {
        mediaSource.endOfStream()
      }
    }

    const pumpSourceBuffer = () => {
      if (cancelled || usingCompletedAudio || !sourceBuffer || sourceBuffer.updating || mediaSource.readyState !== "open") {
        return
      }

      const removalEnd = audio.currentTime - RETAINED_BEHIND_SECONDS
      if (removalEnd > 0 && sourceBuffer.buffered.length > 0 && sourceBuffer.buffered.start(0) < removalEnd) {
        sourceBuffer.remove(0, removalEnd)
        return
      }

      if (pendingChunks.length === 0) return

      const bufferLimit = audio.paused ? INITIAL_BUFFER_SECONDS : MAX_BUFFERED_AHEAD_SECONDS
      if (getBufferedAhead() >= bufferLimit) return

      const nextChunk = pendingChunks.shift()
      if (!nextChunk) return

      try {
        sourceBuffer.appendBuffer(nextChunk)
      } catch (error) {
        // QuotaExceededError means the browser needs consumed data removed
        // before accepting another segment. Keep the segment queued and retry
        // after the remove operation finishes.
        if (error instanceof DOMException && error.name === "QuotaExceededError" && sourceBuffer.buffered.length > 0) {
          pendingChunks.unshift(nextChunk)
          const start = sourceBuffer.buffered.start(0)
          const end = Math.max(start, audio.currentTime - 1)
          if (end > start) {
            sourceBuffer.remove(start, end)
            return
          }
        }

        reportStreamError(error)
      }
    }

    const onSourceOpen = () => {
      try {
        sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg")
        reader = audioStream.getReader()
        sourceBuffer.addEventListener("updateend", pumpSourceBuffer)

        const readStream = async () => {
          try {
            while (!cancelled) {
              const { done, value } = await reader!.read()
              if (done) break
              if (!value) continue

              const chunk = new Uint8Array(value)
              allChunks.push(chunk)
              pendingChunks.push(chunk)
              pumpSourceBuffer()
            }

            streamEnded = true
            finaliseAudio()
          } catch (error) {
            if (!cancelled) reportStreamError(error)
          }
        }

        void readStream()
      } catch (error) {
        reportStreamError(error)
      }
    }

    mediaSource.addEventListener("sourceopen", onSourceOpen)
    audio.addEventListener("play", pumpSourceBuffer)
    audio.addEventListener("timeupdate", pumpSourceBuffer)

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.log("Autoplay failed", error)
        setIsPlaying(false)
      })

    return () => {
      cancelled = true
      void reader?.cancel()
      mediaSource.removeEventListener("sourceopen", onSourceOpen)
      audio.removeEventListener("play", pumpSourceBuffer)
      audio.removeEventListener("timeupdate", pumpSourceBuffer)
      sourceBuffer?.removeEventListener("updateend", pumpSourceBuffer)
      URL.revokeObjectURL(objectUrl)
      if (completedAudioUrl) URL.revokeObjectURL(completedAudioUrl)
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
                {streamError ?? (!isStreamComplete ? "Streaming Audio..." : "Generated Audio")}
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
