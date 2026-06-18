'use client'
import Image from 'next/image'
import { FileUpload } from "@/components/file-upload"
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
import { AlertCircleIcon, BriefcaseBusiness, CaseSensitive, GraduationCap, Zap, Headphones, Eye, Star, Quote, ChevronRight, ArrowRight, Shield, Sparkles } from 'lucide-react'
import { GlobalContext } from '@/lib/globalContext'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import dynamic from 'next/dynamic'

const DynamicVoiceCloning = dynamic(() => import("@/components/voice-cloning").then(mod => mod.VoiceCloning), {
  ssr: false
})
const DynamicPricingModal = dynamic(() => import("@/components/pricing-modal").then(mod => mod.PricingModal), {
  ssr: false
})
const DynamicMyAudios = dynamic(() => import("@/components/my-audios").then(mod => mod.MyAudios), {
  ssr: false
})


export default function Home() {
  const { currentPlan, } = useSubscription()
  const { remainingDocs } = useContext(GlobalContext)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showMyAudios, setShowMyAudios] = useState(false)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const { user } = useUser()

  useEffect(() => {
    if (currentPlan.id === 'free' && user)
      setShowPricingModal(true)
  }, [user])

  useEffect(() => {
    async function loadVoices() {
      const fetchedVoices = await getVoices(user?.id)
      setVoices(fetchedVoices)
    }
    loadVoices()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentPlan.id === "free" && (<Alert className='flex justify-center items-center gap-1 rounded-t-none py-2'>
        <div>
          <AlertCircleIcon size={17} color='#4a5565' />
        </div>
        {currentPlan.id === "free" && remainingDocs !== null && (
          <AlertTitle className="text-sm text-gray-600 dark:text-gray-400">
            {remainingDocs === 0 ? 'To add more - upgrade to premium.' : `${remainingDocs} documents left.`}
          </AlertTitle>
        )}
        {currentPlan.id === "free" && (
          <Button onClick={() => setShowPricingModal(true)} size='sm' className=" ml-1 inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 text-base font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50">
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
            <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className={`text-sm py-1 ${currentPlan.id === "premium" ? 'bg-blue-600' : ''} rounded-full`}>
              {currentPlan.name} Plan
            </Badge>
          </div>)}

          <div className='flex items-center gap-2 sm:gap-4'>
            <SignedOut>
              <SignInButton>
                <Button
                  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/70 bg-white/50 px-5 text-base font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  <span className="text-nowrap">Sign In</span>
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 text-base font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  Try for free
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-2xl border border-white/70 bg-white/50 px-5 text-base font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" variant="outline" onClick={() => setShowMyAudios(true)}>
                My Audios
              </Button>
              <UserButton>
                {currentPlan.id === "premium" && (
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Manage Subscription"
                      labelIcon={<Zap className="w-4 h-4 text-blue-600" />}
                      onClick={() => window.location.href = '/api/billing/portal'}
                    />
                  </UserButton.MenuItems>
                )}
              </UserButton>
            </SignedIn>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 pt-16 sm:pt-18 mb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            {!user && (
              <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 text-sm font-normal text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                Join 10,000+ users transforming their reading
              </div>
            )}

            {!user ? (
              <h1 className="tracking-normal text-foreground font-semibold text-4xl md:text-6xl lg:text-7xl dark:text-white mb-6 leading-tight">
                Turn any document into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">lifelike speech</span> instantly.
              </h1>
            ) : (
              <h1 className="tracking-normal text-foreground font-semibold text-4xl md:text-6xl lg:text-7xl dark:text-white mb-6 leading-tight">
                Turn Any Document into Lifelike Speech
              </h1>
            )}

            {!user && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 font-normal leading-relaxed">
                Simply upload your PDF, DOCX, or TXT and transform them into high-quality audio with natural-sounding AI voices.
              </p>
            )}

            {!user && (
              <div className="flex flex-col items-center justify-center gap-3">
                <SignUpButton>
                  <Button size='lg' className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-500/20 bg-blue-500/10 py-5 px-6 text-lg font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50">
                    Start Listening for Free
                  </Button>
                </SignUpButton>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  No credit card required
                </div>
              </div>
            )}
          </div>

          <div className="relative mx-auto w-full rounded-2xl sm:rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl p-2 sm:p-4 md:p-6 mt-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-3xl pointer-events-none"></div>

            <Tabs defaultValue="convert" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
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
                    <CardTitle className="flex items-center gap-2 text-2xl font-semimedium">
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
                    <CardDescription className='text-md'>
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
                  <DynamicVoiceCloning
                    onVoiceCloned={setVoices}
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
                        <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">Unlock Voice Cloning</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Upgrade to Premium for $14.99/month and enjoy exclusive voices, voice cloning, and the ultimate audio conversion experience!
                        </p>
                        <Button onClick={() => setShowPricingModal(true)} className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 text-lg font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50">
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
      </div>

      {/* Trust Logos */}
      <section className="border-y border-gray-200 bg-blue-50  backdrop-blur-sm py-10 sm:py-16 mb-24 overflow-hidden">
        <div className="container mx-auto  relative">
          <p className="text-center text-sm font-semimedium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8">
            Trusted by 10.000+ users worldwide
          </p>

          <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-24 sm:w-40 z-10 pointer-events-none bg-gradient-to-r from-blue-50 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-40 z-10 pointer-events-none bg-gradient-to-l from-blue-50 to-transparent" />

            <div className="flex flex-col gap-8 py-6 opacity-90">
              <div className="flex items-center overflow-hidden">
                <div className="min-w-full flex gap-6 md:gap-16 items-center shrink-0 pr-6 md:pr-16 animate-scroll-left-fast">
                  {[
                    { src: "/trust_logos/logo-uc-berkeley.webp", alt: "UC Berkeley", width: 320, height: 100 },
                    { src: "/trust_logos/logo-stanford.webp", alt: "Stanford University", width: 260, height: 100 },
                    { src: "/trust_logos/logo-columbia.webp", alt: "Columbia University", width: 560, height: 100 },
                    { src: "/trust_logos/logo-princeton.webp", alt: "Princeton University", width: 340, height: 100 },
                    { src: "/trust_logos/logo-sheffield.webp", alt: "University of Sheffield", width: 302, height: 100 },
                    { src: "/trust_logos/logo-cecos.webp", alt: "CECOS College London", width: 200, height: 100 },
                    { src: "/trust_logos/logo-our-lady-of-fatima.webp", alt: "Our Lady of Fatima University", width: 452, height: 100 },
                    { src: "/trust_logos/logo-batangas-state.webp", alt: "Batangas State University", width: 90, height: 100 },
                    { src: "/trust_logos/logo-universiti-teknologi-mara.webp", alt: "Universiti Teknologi MARA", width: 200, height: 100 },
                  ].concat([
                    { src: "/trust_logos/logo-uc-berkeley.webp", alt: "UC Berkeley", width: 320, height: 100 },
                    { src: "/trust_logos/logo-stanford.webp", alt: "Stanford University", width: 260, height: 100 },
                    { src: "/trust_logos/logo-columbia.webp", alt: "Columbia University", width: 560, height: 100 },
                    { src: "/trust_logos/logo-princeton.webp", alt: "Princeton University", width: 340, height: 100 },
                    { src: "/trust_logos/logo-sheffield.webp", alt: "University of Sheffield", width: 302, height: 100 },
                    { src: "/trust_logos/logo-cecos.webp", alt: "CECOS College London", width: 200, height: 100 },
                    { src: "/trust_logos/logo-our-lady-of-fatima.webp", alt: "Our Lady of Fatima University", width: 452, height: 100 },
                    { src: "/trust_logos/logo-batangas-state.webp", alt: "Batangas State University", width: 90, height: 100 },
                    { src: "/trust_logos/logo-universiti-teknologi-mara.webp", alt: "Universiti Teknologi MARA", width: 200, height: 100 },
                  ]).map((logo, index) => (
                    <div key={`row1-${index}`} style={{ height: 50 }} className="shrink-0 flex items-center">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width}
                        height={logo.height}
                        className="h-full w-auto object-contain grayscale opacity-60 transition duration-300 hover:opacity-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center overflow-hidden">
                <div className="min-w-full flex gap-6 md:gap-16 items-center shrink-0 pr-6 md:pr-16 animate-scroll-right-fast">
                  {[
                    { src: "/trust_logos/logo-universiti-putra-malaysia.webp", alt: "Universiti Putra Malaysia", width: 180, height: 100 },
                    { src: "/trust_logos/logo-srm.webp", alt: "SRM Institute of Science and Technology", width: 240, height: 160 },
                    { src: "/trust_logos/logo-vit.webp", alt: "VIT University", width: 300, height: 100 },
                    { src: "/trust_logos/logo-thammasat.webp", alt: "Thammasat University", width: 360, height: 100 },
                    { src: "/trust_logos/logo-mae-fah-luang.webp", alt: "Mae Fah Luang University", width: 360, height: 100 },
                    { src: "/trust_logos/logo-fpt.webp", alt: "FPT University", width: 200, height: 100 },
                    { src: "/trust_logos/logo-duy-tan.webp", alt: "Duy Tan University", width: 260, height: 100 },
                    { src: "/trust_logos/logo-middle-east-technical.webp", alt: "Middle East Technical University", width: 580, height: 100 },
                    { src: "/trust_logos/logo-yeditepe.webp", alt: "Yeditepe University", width: 270, height: 100 },
                  ].concat([
                    { src: "/trust_logos/logo-universiti-putra-malaysia.webp", alt: "Universiti Putra Malaysia", width: 180, height: 100 },
                    { src: "/trust_logos/logo-srm.webp", alt: "SRM Institute of Science and Technology", width: 240, height: 160 },
                    { src: "/trust_logos/logo-vit.webp", alt: "VIT University", width: 300, height: 100 },
                    { src: "/trust_logos/logo-thammasat.webp", alt: "Thammasat University", width: 360, height: 100 },
                    { src: "/trust_logos/logo-mae-fah-luang.webp", alt: "Mae Fah Luang University", width: 360, height: 100 },
                    { src: "/trust_logos/logo-fpt.webp", alt: "FPT University", width: 200, height: 100 },
                    { src: "/trust_logos/logo-duy-tan.webp", alt: "Duy Tan University", width: 260, height: 100 },
                    { src: "/trust_logos/logo-middle-east-technical.webp", alt: "Middle East Technical University", width: 580, height: 100 },
                    { src: "/trust_logos/logo-yeditepe.webp", alt: "Yeditepe University", width: 270, height: 100 },
                  ]).map((logo, index) => (
                    <div key={`row2-${index}`} style={{ height: 50 }} className="shrink-0 flex items-center">
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width}
                        height={logo.height}
                        className="h-full w-auto object-contain grayscale opacity-60 transition duration-300 hover:opacity-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPricingModal && <DynamicPricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />}
      {showMyAudios && <DynamicMyAudios isOpen={showMyAudios} onClose={() => setShowMyAudios(false)} />}

      {/* Convert Documents in 3 Simple Steps */}
      <section className="max-w-6xl mx-auto mb-32 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-6xl font-medium mb-4 text-gray-900 dark:text-white tracking-tight">Convert Documents in 3 Simple Steps</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">From text to lifelike speech in seconds.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connector Line (visible on md+) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-200 to-blue-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 z-0"></div>

          <Card className="relative z-10 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group">
            <div className="absolute -top-7 sm:-top-5 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-xl shadow-lg ring-4 ring-white dark:ring-gray-950">1</div>
            <div className="w-full aspect-square relative mb-8 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-900/5 dark:ring-white/5">
              <Image className="object-cover group-hover:scale-105 transition-transform duration-700" fill alt="upload document step 1 image" src={'/upload_document_step_1.webp'} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <CardTitle className="text-2xl font-medium mb-3 text-center text-gray-900 dark:text-white">Upload your Document</CardTitle>
            <CardContent className="px-0 text-center text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              <p>Drag-and-drop or click to upload your PDF, DOCX or TXT file. Invocly’s engine instantly reads your document.</p>
            </CardContent>
          </Card>

          <Card className="relative z-10 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group mt-4 md:mt-0">
            <div className="absolute -top-7 sm:-top-5 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-xl shadow-lg ring-4 ring-white dark:ring-gray-950">2</div>
            <div className="w-full aspect-square relative mb-8 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-900/5 dark:ring-white/5">
              <Image className="object-cover group-hover:scale-105 transition-transform duration-700" fill alt="select voice step 2 image" src={'/select_voice_step_2.webp'} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <CardTitle className="text-2xl font-medium mb-3 text-center text-gray-900 dark:text-white">Choose a Voice</CardTitle>
            <CardContent className="px-0 text-center text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              <p>Select from 60+ languages and natural-sounding voices. Adjust speed and style to match your preference.</p>
            </CardContent>
          </Card>

          <Card className="relative z-10 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 group mt-4 md:mt-0">
            <div className="absolute -top-7 sm:-top-5 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-xl shadow-lg ring-4 ring-white dark:ring-gray-950">3</div>
            <div className="w-full aspect-square relative mb-8 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 ring-1 ring-gray-900/5 dark:ring-white/5">
              <Image className="object-cover group-hover:scale-105 transition-transform duration-700" fill alt="generate audio step 3 image" src={'/generate_audio_step_3.webp'} sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <CardTitle className="text-2xl font-medium mb-3 text-center text-gray-900 dark:text-white">Generate Audio</CardTitle>
            <CardContent className="px-0 text-center text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              <p>Click Generate and Invocly creates the speech. Download the MP3 and enjoy listening anywhere you go.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="about" className="max-w-6xl mx-auto mb-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="flex-1">
              <h2 className="tracking-normal text-foreground font-medium text-3xl md:text-6xl mb-8">
                Stop reading every{" "}
                <span className="inline-block rounded-md border-2 border-dotted border-blue-300 px-2 font-medium text-blue-500">
                  document manually
                </span>
                .
                <br />
                <br />
                Turn PDFs, DOCX & TXT into{" "}
                <span className="inline-block rounded-md border-2 border-dotted border-purple-300 px-2 font-medium text-purple-600">
                  lifelike audio
                </span>{" "}
                and listen anywhere.
              </h2>

              {!user ?
                (
                  <div className="mt-12 flex justify-end gap-4">
                    <SignInButton>
                      <Button className="inline-flex items-center cursor-pointer text-foreground justify-center gap-2 rounded-2xl border border-white/70 bg-white/50 px-6 py-5 text-base font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-white/70">
                        Start Converting Free
                      </Button>
                    </SignInButton>
                  </div>
                )
                : null}
            </div>
          </div>

        </div>
      </section>


      {/* Benefits Bento Grid */}
      <section className="container mx-auto px-4 mb-32 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-6xl font-medium mb-4 text-gray-900 dark:text-white tracking-tight">Why Choose Invocly?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">Experience the power of listening over reading.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large Card: Boost Productivity */}
          <Card className="md:col-span-2 group overflow-hidden relative flex flex-col md:flex-row items-center bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-gray-800 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="md:w-1/2 md:pr-12 z-10">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-3xl font-medium mb-4 text-gray-900 dark:text-white tracking-tight">Boost Your Productivity</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Save time by listening to reports, study notes, or articles while commuting, cooking, or multitasking. Turn idle time into learning time.
              </p>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 relative aspect-video md:aspect-auto md:h-full w-full min-h-[300px] rounded-2xl overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/5 shadow-inner">
              <Image className="object-cover group-hover:scale-105 transition-transform duration-700" fill alt="boost productivity benefit" src={'/boost_productivity_benefit.webp'} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </Card>

          {/* Small Card 1: Reduce Eye Fatigue */}
          <Card className="group overflow-hidden relative flex flex-col items-start bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-gray-800 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h3 className="text-2xl font-medium mb-3 text-gray-900 dark:text-white tracking-tight">Reduce Eye Fatigue</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed flex-grow">
              Long screen hours cause strain. Invocly’s lifelike audio lets you learn and focus without hurting your eyes.
            </p>
            <div className="w-full aspect-[4/3] relative rounded-2xl overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/5 mt-auto">
              <Image className="object-cover group-hover:scale-105 transition-transform duration-700" fill alt="reduce eye fatigue benefit" src={'/reduce_eye_fiting_benefit.webp'} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </Card>

          {/* Small Card 2: Improve Retention */}
          <Card className="group overflow-hidden relative flex flex-col items-start bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-gray-800 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h3 className="text-2xl font-medium mb-3 text-gray-900 dark:text-white tracking-tight">Improve Retention</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed flex-grow">
              Combine reading with listening. Studies show this dual approach strengthens memory and improves comprehension.
            </p>
            <div className="w-full aspect-[4/3] relative rounded-2xl overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/5 mt-auto">
              <Image className="object-cover group-hover:scale-105 transition-transform duration-700" fill alt="improve retention benefit" src={'/improve_rentention_benefit.webp'} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </Card>
        </div>
      </section>

      {/* Multilingual Reader */}
      <section className="max-w-6xl mx-auto mb-32 px-4">
        <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-950 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl border border-gray-800">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="text-blue-300 border-blue-500/30 bg-blue-900/30 mb-8 px-4 py-1.5 text-sm backdrop-blur-md">Global Reach</Badge>
            <h2 className="text-4xl md:text-6xl lg:text-6xl font-medium mb-6 text-white tracking-tight">Speak the World's Languages</h2>
            <p className="text-xl text-blue-100/70 mb-10 leading-relaxed font-medium">
              Invocly supports 60+ languages and accents. Perfect for students, language learners, and global teams who want accurate, native-like voices across documents.
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              {['🇺🇸 English (US)', '🇬🇧 English (UK)', '🇪🇸 Spanish', '🇫🇷 French', '🇩🇪 German', '🇮🇹 Italian', '🇨🇳 Chinese', '🇯🇵 Japanese', '🇵🇹 Portuguese', '...and 50+ more'].map((lang, i) => (
                <span key={i} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-200 text-sm font-medium backdrop-blur-sm transition-colors cursor-default shadow-sm hover:-translate-y-0.5 duration-300">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-6xl mx-auto mb-32 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-medium text-gray-900 dark:text-white tracking-tight mb-4">
            Who uses Invocly?
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            From students to professionals, Invocly fits seamlessly into any workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: GraduationCap,
              title: "Students",
              description: "Convert lecture notes, research papers, and e-books into audio. Listen while commuting or working out — absorb complex material effortlessly.",
              gradient: "from-blue-500 to-indigo-500",
              bgGlow: "bg-blue-500/5 dark:bg-blue-500/5",
            },
            {
              icon: BriefcaseBusiness,
              title: "Professionals",
              description: "Stay productive with text-to-speech for reports, presentations, and emails. Turn commute time and downtime into efficient work sessions.",
              gradient: "from-violet-500 to-purple-500",
              bgGlow: "bg-violet-500/5 dark:bg-violet-500/5",
            },
            {
              icon: Eye,
              title: "Accessibility",
              description: "Empower users with dyslexia, visual impairments, or learning disabilities to consume content with ease — meeting ADA & WCAG standards.",
              gradient: "from-emerald-500 to-teal-500",
              bgGlow: "bg-emerald-500/5 dark:bg-emerald-500/5",
            },
            {
              icon: Zap,
              title: "Busy Individuals",
              description: "Listen to articles, manuals, or books while cooking, exercising, or commuting. Go hands-free and make every moment count.",
              gradient: "from-amber-500 to-orange-500",
              bgGlow: "bg-amber-500/5 dark:bg-amber-500/5",
            },
          ].map((useCase, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl border border-gray-200 dark:border-white/10 ${useCase.bgGlow} p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden`}
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="flex items-start gap-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center shadow-lg`}>
                  <useCase.icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semimedium text-gray-900 dark:text-white mb-2">{useCase.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{useCase.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — Wall of Love */}
      <section className="max-w-6xl mx-auto mb-32 px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-medium text-gray-900 dark:text-white tracking-tight mb-4">
            Loved by thousands
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            See what our users have to say about their experience with Invocly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "Invocly saved me countless hours by converting my PDFs into audio. I can listen on the bus or at the gym, and the voices are so natural I never miss any details.",
              name: "Mike T.",
              role: "College Student",
              initials: "MT",
              color: "from-blue-500 to-indigo-500",
            },
            {
              quote: "As a busy project manager, I use Invocly every day. It converts reports and emails into audio I can listen to while exercising. It's like having a personal assistant!",
              name: "Thomas C.",
              role: "Project Manager",
              initials: "TC",
              color: "from-violet-500 to-purple-500",
            },
            {
              quote: "Invocly's speech tools help all my students learn. Even my dyslexic student can follow along by listening. It's made my classroom more inclusive and interactive.",
              name: "Mary J.",
              role: "Elementary Teacher",
              initials: "MJ",
              color: "from-emerald-500 to-teal-500",
            },
          ].map((testimonial, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
            >
              {/* Quote icon */}
              <Quote size={32} className="text-blue-100 dark:text-white/5 mb-4" />

              {/* Star rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-sm font-medium shadow-md`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semimedium text-gray-900 dark:text-white">{testimonial.name}</span>
                    <Shield size={14} className="text-blue-500" />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto pb-32 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-medium text-slate-900 dark:text-white tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about Invocly, from file support to privacy and downloads.
          </p>
        </div>

        <div className=" overflow-hidden">
          <div className="grid gap-4 p-3 sm:p-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-none rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.08)]">
                <AccordionTrigger className="text-lg font-semimedium text-slate-900 dark:text-white px-5 py-5">
                  What file formats does Invocly support?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-300 px-5 pb-6">
                  Invocly works with PDF, Microsoft Word (.docx), and plain text (.txt) files (up to 5 MB per file). Just upload any of these formats and Invocly will read the text aloud.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-none rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.08)]">
                <AccordionTrigger className="text-lg font-semimedium text-slate-900 dark:text-white px-5 py-5">
                  How many languages and voices are available?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-300 px-5 pb-6">
                  It offers 60+ languages and accents with a variety of AI voice options. You can select different voices for different needs – for example, a male or female narrator, or different accents – to match your preference.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-none rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.08)]">
                <AccordionTrigger className="text-lg font-semimedium text-slate-900 dark:text-white px-5 py-5">
                  What is the character limit per file?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-300 px-5 pb-6">
                  Each file works best if it&apos;s under 20,000 characters. For longer documents, split them into smaller parts to ensure smooth and accurate conversion.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-none rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.08)]">
                <AccordionTrigger className="text-lg font-semimedium text-slate-900 dark:text-white px-5 py-5">
                  Is Invocly free?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-300 px-5 pb-6">
                  Yes – Invocly&apos;s web app is free to use for standard conversions. You can access its text-to-speech features without an account. Premium plans are available for advanced features like voice cloning or higher limits.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border-none rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.08)]">
                <AccordionTrigger className="text-lg font-semimedium text-slate-900 dark:text-white px-5 py-5">
                  How do I get the audio after conversion?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-300 px-5 pb-6">
                  After uploading and converting, Invocly lets you download the MP3 file directly.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6" className="border-none rounded-[1.75rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.08)]">
                <AccordionTrigger className="text-lg font-semimedium text-slate-900 dark:text-white px-5 py-5">
                  Is my content private?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-300 px-5 pb-6">
                  Yes. Invocly processes your document on secure servers and does not share your files. Your uploaded documents are converted to speech and the result is returned to you, without storing your personal data long-term.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user ?
        <section className="max-w-6xl mx-auto pb-24 px-4">
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-indigo-950 to-blue-950 p-12 md:p-20 text-center overflow-hidden border border-white/10">
            {/* Background glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-indigo-500/15 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-blue-300 text-sm font-medium mb-8">
                <Sparkles size={14} />
                Get started today
              </div>

              <h2 className="text-4xl md:text-6xl font-medium text-white tracking-tight mb-6 max-w-3xl mx-auto">
                Make your documents speak naturally — instantly
              </h2>

              <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                Convert PDF, DOCX &amp; TXT into clear, lifelike speech. Listen anywhere — whether for learning, work, or accessibility.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <SignUpButton>
                  <Button className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-2xl border border-white/70 bg-white/50 px-6 py-5 text-base font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-white/70">
                    <ArrowRight size={18} className="mr-2" />
                    Start For Free
                  </Button>
                </SignUpButton>
              </div>

              <p className="text-sm text-gray-400">
                3 free document conversions. No credit card required.
              </p>
            </div>
          </div>
        </section>
        : null
      }
    </div>
  )
}
