'use client'

import { FileUpload } from "@/components/file-upload"
import { VoiceCloning } from "@/components/voice-cloning"
import { PricingModal } from "@/components/pricing-modal"
import { MyAudios } from "@/components/my-audios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/use-subscription"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useState, useEffect } from "react"
import { VoiceOption } from "@/components/voice-selection"
import { getVoices } from "@/lib/getVoices"


export default function Home() {
  const { currentPlan, getRemainingDocuments, } = useSubscription()
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showMyAudios, setShowMyAudios] = useState(false)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const { user } = useUser()

  useEffect(() => {
    async function loadVoices() {
      const fetchedVoices = await getVoices(user?.id)
      setVoices(fetchedVoices)
    }
    loadVoices()
  }, [user])

  const remainingDocs = getRemainingDocuments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center">
          <img src="/placeholder-logo.svg" alt="Logo" className="h-8 w-auto" />
        </div>

        <div className="flex items-center gap-4">
          <div className='flex items-center gap-4'>
            <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className="text-sm px-4 py-1 rounded-full">
              {currentPlan.name} Plan
            </Badge>
            {currentPlan.id === "free" && remainingDocs !== null && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {remainingDocs} documents left today
              </p>
            )}
            {currentPlan.id === "free" && (
              <Button onClick={() => setShowPricingModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-4 py-2">
                Upgrade
              </Button>
            )}
          </div>

          <div className='flex items-center gap-4'>
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-4 py-2">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button variant="outline" onClick={() => setShowMyAudios(true)}>
                My Audios
              </Button>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              Convert PDF, DOCX & TXT to Lifelike Speech Instantly
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Simply upload your documents and transform them into high-quality audio with a variety of natural-sounding voices.
            </p>
          </div>

          <Tabs defaultValue="convert" className="space-y-6">
            <TabsList className="grid  w-full grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <TabsTrigger value="convert">Convert Documents</TabsTrigger>
              <TabsTrigger value="clone" disabled={!currentPlan.limits.voiceCloning}>
                Clone Your Voice
                {!currentPlan.limits.voiceCloning && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Premium
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="convert">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Your Document
                  </CardTitle>
                  <CardDescription>
                    Supported formats: PDF, Word (.docx), and Text (.txt) files
                    {currentPlan.id === "free" && (
                      <span className="text-orange-600 ml-2">• Max {currentPlan.limits.maxFileSize}MB per file</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload voices={voices} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clone">
              {currentPlan.limits.voiceCloning ? (
                <VoiceCloning
                  onVoiceCloned={(voiceId, voiceName) => {
                    console.log("Voice cloned:", voiceId, voiceName)
                  }}
                  hasExistingVoice={false}
                />
              ) : (
                <Card className="shadow-lg border-2 border-blue-500">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 text-blue-500 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unlock Voice Cloning</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Upgrade to Premium for $14.99/month and enjoy exclusive voices, voice cloning, and the ultimate audio conversion experience!
                      </p>
                      <Button onClick={() => setShowPricingModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-full px-8 py-3">
                        Upgrade to Premium
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
      <MyAudios isOpen={showMyAudios} onClose={() => setShowMyAudios(false)} />
    </div>
  )
}
