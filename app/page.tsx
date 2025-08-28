'use client'
import Image from 'next/image'
import { FileUpload } from "@/components/file-upload"
import { VoiceCloning } from "@/components/voice-cloning"
import { PricingModal } from "@/components/pricing-modal"
import { MyAudios } from "@/components/my-audios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { useSubscription } from "@/hooks/use-subscription"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useState, useEffect, useContext } from "react"
import { VoiceOption } from "@/components/voice-selection"
import { getVoices } from "@/lib/getVoices"
import { AlertCircleIcon } from 'lucide-react'
import { GlobalContext } from '@/lib/globalContext'


export default function Home() {
  const { currentPlan, } = useSubscription()
  const { remainingDocs } = useContext(GlobalContext)
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

  useEffect(() => console.log(remainingDocs),[remainingDocs])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {currentPlan.id === "free" && (<Alert className='flex justify-center items-center gap-1 rounded-t-none py-2'>
        <div>
          <AlertCircleIcon size={17} color='#4a5565' />
        </div>
        {currentPlan.id === "free" && remainingDocs !== null && (
          <AlertTitle className="text-sm text-gray-600 dark:text-gray-400">
            {remainingDocs === 0 ? 'To add more - upgrade to premium.' : `${remainingDocs} documents left today.`}
          </AlertTitle>
        )}
        {currentPlan.id === "free" && (
          <Button onClick={() => setShowPricingModal(true)} size='sm' className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full ml-1">
            Upgrade
          </Button>
        )}
      </Alert>)}

      <header className="flex justify-between items-center p-4  dark:bg-gray-800 ">
        <div className="flex items-center">
          <Image src='/placeholder-logo.png' alt='Logo' width={40} height={20} className="h-10 w-auto" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {user && (<div className='flex items-center gap-2 sm:gap-4'>
            <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className="text-sm py-1 rounded-full">
              {currentPlan.name} Plan
            </Badge>
          </div>)}

          <div className='flex items-center gap-2 sm:gap-4'>
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <Button size='sm' className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size='sm' className="text-sm rounded-full min:px-2 max:px-4 py-2" variant="outline" onClick={() => setShowMyAudios(true)}>
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
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
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
                  ' - Premium'
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
