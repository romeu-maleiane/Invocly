"use client"

import { FileUpload } from "@/components/file-upload"
import { VoiceCloning } from "@/components/voice-cloning"
import { PricingModal } from "@/components/pricing-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/use-subscription"
import { useState } from "react"

export default function Home() {
  const { currentPlan, dailyUsage, canProcessDocument, getRemainingDocuments, upgradeToPremium } = useSubscription()
  const [showPricingModal, setShowPricingModal] = useState(false)

  const remainingDocs = getRemainingDocuments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Text to Speech Converter</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Upload your documents and convert them to audio with multiple voice options
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className="mb-2">
                  {currentPlan.name} Plan
                </Badge>
                {currentPlan.id === "free" && remainingDocs !== null && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{remainingDocs} documents left today</p>
                )}
              </div>
              {currentPlan.id === "free" && (
                <Button onClick={() => setShowPricingModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="convert" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
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
                  <CardTitle className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Document
                  </CardTitle>
                  <CardDescription>
                    Supported formats: PDF, Word (.docx), and Text (.txt) files
                    {currentPlan.id === "free" && (
                      <span className="text-orange-600 ml-2">• Max {currentPlan.limits.maxFileSize}MB per file</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload />
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
                <Card className="shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <svg
                        className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
                      <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Voice cloning is available with our Premium plan
                      </p>
                      <Button onClick={() => setShowPricingModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        Upgrade to Premium - $9.99/month
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} onUpgrade={upgradeToPremium} />
    </div>
  )
}
