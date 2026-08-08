'use client'

import dynamic from "next/dynamic"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type VoiceOption } from "./voice-selection"
import { processExtractedText, validateTextForTTS, type ExtractionResult } from "@/lib/text-extraction"
import { useSubscription } from "@/hooks/use-subscription"
import { useUser } from "@clerk/nextjs"
import { type ListeningStyle } from "@/lib/speech-direction"
import { uploadGeneratedAudio } from "@/lib/audio/direct-upload"

const DynamicVoiceSelection = dynamic(() => import("./voice-selection").then((mod) => mod.VoiceSelection),{
  ssr: false
})
const DynamicAudioPlayer = dynamic(() => import('./audio-player').then(mod => mod.AudioPlayer),{
  ssr: false
})

interface UploadedFile {
  file: File
  id: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedText?: string
  extractionResult?: ExtractionResult
  error?: string
  showVoiceSelection?: boolean
  downloadableBlob?: Blob
  audioStream?: ReadableStream<Uint8Array>
  isSavingAudio?: boolean
  storageError?: string
}

interface FileUploadProps {
  voices: VoiceOption[]
}

export function FileUpload({ voices }: FileUploadProps) {
  const { currentPlan, canProcessDocument, incrementUsage } = useSubscription()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null)
  const { user } = useUser()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!canProcessDocument()) {
        alert("You've reached your document limit. Upgrade to Premium for unlimited documents!")
        return
      }

      const oversizedFiles = acceptedFiles.filter((file) => file.size > currentPlan.limits.maxFileSize * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        alert(
          `File size limit exceeded. ${currentPlan.name} plan allows up to ${currentPlan.limits.maxFileSize}MB per file.`,
        )
        return
      }

      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: "uploading",
        progress: 0,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      for (const fileData of newFiles) {
        try {
          await processFile(fileData)
        } catch (error) {
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileData.id ? { ...f, status: "error", error: "Failed to process file" } : f)),
          )
        }
      }

    },
    [canProcessDocument, currentPlan.limits.maxFileSize,],
  )

  const processFile = async (fileData: UploadedFile) => {
    const formData = new FormData()
    formData.append("file", fileData.file)

    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileData.id ? { ...f, status: "processing", progress: 30 } : f)),
    )

    try {
      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to extract text")
      }

      const result = await response.json()

      const extractionResult = processExtractedText(result.text)
      const validation = validateTextForTTS(result.text)

      if (!validation.isValid) {
        throw new Error(`Text validation failed: ${validation.issues.join(", ")}`)
      }

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                extractedText: result.text,
                extractionResult,
              }
            : f,
        ),
      )
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? { ...f, status: "error", error: error instanceof Error ? error.message : "Failed to extract text" }
            : f,
        ),
      )
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: currentPlan.limits.maxFileSize * 1024 * 1024,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const toggleVoiceSelection = (id: string) => {
    setUploadedFiles((prev) => prev.map((f) => (f.id === id ? { ...f, showVoiceSelection: !f.showVoiceSelection } : f)))
  }

  const handleGenerateAudio = async (fileId: string, selectedVoice: string, listeningStyle: ListeningStyle) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (!file?.extractedText) return

    setGeneratingAudio(fileId)

    try {
      let response: Response | undefined
      for (let attempt = 0; attempt < 3; attempt += 1) {
        response = await fetch("/api/audio-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: file.extractedText, selectedVoice, listeningStyle }),
        })

        if (response.ok) break
        const error = await response.clone().json().catch(() => ({})) as { error?: string; code?: string }
        const retryAfter = Number.parseInt(response.headers.get("retry-after") || "0", 10)
        const retryable = ["capacity_limited", "speechify_rate_limited"].includes(error.code || "")
        if (!retryable || attempt === 2 || retryAfter < 1 || retryAfter > 5) {
          throw new Error(error.error || "Failed to generate audio stream")
        }
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1_000))
      }

      if (!response?.ok || !response.body) {
        throw new Error("Failed to generate audio stream")
      }

      const remainingHeader = response.headers.get("x-invocly-remaining-documents")
      const audioStream = response.body
      const remaining = remainingHeader === null ? null : Number.parseInt(remainingHeader, 10)
      incrementUsage(remaining !== null && Number.isFinite(remaining) ? remaining : null)
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, audioStream, showVoiceSelection: false } : f)),
      )
      setGeneratingAudio(null)
    } catch (error) {
      console.error("Audio generation failed:", error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: "error", error: error instanceof Error ? error.message : "Failed to generate audio" }
            : f,
        ),
      )
      setGeneratingAudio(null)
    }
  }

  const handleStreamEnd = (fileId: string, blob: Blob, fileName: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? {
              ...f,
              downloadableBlob: blob,
            }
          : f,
      ),
    )
    if (user) {
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, isSavingAudio: true, storageError: undefined } : file)),
      )
      void uploadGeneratedAudio(blob, fileName)
        .then(() => {
          setUploadedFiles((prev) =>
            prev.map((file) => (file.id === fileId ? { ...file, isSavingAudio: false } : file)),
          )
        })
        .catch((error) => {
          console.error("Unable to save generated audio:", error)
          setUploadedFiles((prev) =>
            prev.map((file) =>
              file.id === fileId
                ? { ...file, isSavingAudio: false, storageError: "Audio generated, but it could not be saved to your library." }
                : file,
            ),
          )
        })
    }
  }

  const downloadAudio = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (!file?.downloadableBlob) return

    const a = document.createElement("a")
    a.href = URL.createObjectURL(file.downloadableBlob)
    a.download = `${file.file.name.replace(/\.[^/.]+$/, "")}_audio.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      {!canProcessDocument() && (
        <Alert variant="destructive">
          <AlertDescription>
            You've reached your limit of {currentPlan.limits.Documents} documents. Upgrade to Premium for
            unlimited document processing!
          </AlertDescription>
        </Alert>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${!canProcessDocument() ? "opacity-50 cursor-not-allowed" : ""}
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
        `}
      >
        <input {...getInputProps()} disabled={!canProcessDocument()} />
        <div className="flex flex-col items-center gap-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p className="type-heading font-medium text-gray-700 dark:text-gray-300">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="type-body-16 text-gray-500 dark:text-gray-400 mt-1">
              or click to browse (PDF, DOCX, TXT - max {currentPlan.limits.maxFileSize}MB)
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="type-heading font-semibold">Uploaded Files</h3>
          {uploadedFiles.map((fileData) => (
            <Card key={fileData.id} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="type-heading font-medium overflow-hidden whitespace-nowrap text-ellipsis sm:max-w-[200px] max-w-[100px]">{fileData.file.name}</p>
                      <p className="type-caption text-gray-500">{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2"> 
                    <Badge
                      variant={
                        fileData.status === "completed"
                          ? "default"
                          : fileData.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                      className={`${fileData.status === "completed" && "bg-blue-600"}`}
                    >
                      {fileData.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(fileData.id)}>
                      x
                    </Button>
                  </div>
                </div>

                {(fileData.status === "uploading" || fileData.status === "processing") && (
                  <Progress value={fileData.progress} className="mb-2" />
                )}

                {fileData.status === "error" && (
                  <Alert variant="destructive">
                    <AlertDescription>{fileData.error}</AlertDescription>
                  </Alert>
                )}

                {fileData.status === "completed" && fileData.extractedText && fileData.extractionResult && (
                  <div className="mt-3">
                    <div className="flex gap-4 mb-3 type-caption text-gray-600 dark:text-gray-400">
                      <span>Words: {fileData.extractionResult.wordCount.toLocaleString()}</span>
                      <span>Est. Reading Time: {fileData.extractionResult.estimatedReadingTime} min</span>
                      {fileData.extractionResult.language && (
                        <span>Language: {fileData.extractionResult.language.toUpperCase()}</span>
                      )}
                    </div>
                    <p className="type-caption font-medium mb-2">Extracted Text Preview:</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded type-caption max-h-32 overflow-y-auto">
                      {fileData.extractedText.substring(0, 200)}
                      {fileData.extractedText.length > 200 && "..."}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {!fileData.audioStream && (
                        <Button
                          size="sm"
                          onClick={() => toggleVoiceSelection(fileData.id)}
                          variant={fileData.showVoiceSelection ? "secondary" : "default"}
                        >
                          {fileData.showVoiceSelection ? "Hide Voice Options" : "Convert to Audio"}
                        </Button>
                      )}
                    </div>

                    {fileData.showVoiceSelection && !fileData.audioStream && (
                      <div className="mt-4">
                        <DynamicVoiceSelection
                          text={fileData.extractedText}
                          onGenerate={(selectedVoice, listeningStyle) => handleGenerateAudio(fileData.id, selectedVoice, listeningStyle)}
                          isGenerating={generatingAudio === fileData.id}
                          voices={voices}
                        />
                      </div>
                    )}

                    {fileData.audioStream && (
                      <div className="mt-4">
                        <DynamicAudioPlayer
                          audioStream={fileData.audioStream}
                          fileName={`${fileData.file.name.replace(/\.[^/.]+$/, "")}_audio.mp3`}
                          onStreamEnd={(blob) => handleStreamEnd(fileData.id, blob, `${fileData.file.name.replace(/\.[^/.]+$/, "")}_audio.mp3`)}
                          onDownload={() => downloadAudio(fileData.id)}
                        />
                        {fileData.isSavingAudio && (
                          <p className="mt-2 type-caption text-gray-500">Saving to your audio library...</p>
                        )}
                        {fileData.storageError && (
                          <Alert className="mt-2" variant="destructive">
                            <AlertDescription>{fileData.storageError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
