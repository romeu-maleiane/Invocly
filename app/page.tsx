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
import { AlertCircleIcon, BriefcaseBusiness, CaseSensitive, GraduationCap, Zap } from 'lucide-react'
import { GlobalContext } from '@/lib/globalContext'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"



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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
            <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className={`text-sm py-1 ${currentPlan.id === "premium" ? 'bg-blue-600': ''} rounded-full`}>
              {currentPlan.name} Plan
            </Badge>
          </div>)}

          <div className='flex items-center gap-2 sm:gap-4'>
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <Button size='sm' className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full">
                  Try for free
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
      <div className="container mx-auto px-4 pt-8 mb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
              Convert PDF, DOCX & TXT to Lifelike Speech Instantly
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-4">
              Simply upload your documents and transform them into high-quality audio with a variety of natural-sounding voices.
            </p>
            {!user && (
              <>
                <div className="flex justify-center mb-2">
                  <SignUpButton>
                    <Button size='lg' className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl">
                      Try for free
                    </Button>
                  </SignUpButton>
                </div>
                <p className="text-sm text-center text-gray-500 px-6">
                  No credit card required.
                </p>
              </>
            )}
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
                  <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
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
                <VoiceCloning
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

      {/* Convert Documents in 3 Simple Steps */}
      <section className="max-w-4xl mx-auto mb-24">
        <h2 className="text-3xl px-4 font-bold mb-6 text-center text-gray-900">Convert Documents in 3 Simple Steps</h2>
        <div className="grid justify-items-center grid-rows-3 md:grid-rows-1 md:grid-cols-3 gap-6 lg:px-0 px-6">
          <Card className='flex flex-col justify-start items-center  px-6 gap-1 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <div className=''>
              <Image className='rounded-sm' width={350} height={350} alt='upload document step 1 image' src={'/upload_document_step_1.png'}>

              </Image>
            </div>
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Upload your Document</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Drag-and-drop or click to upload your PDF, DOCX or TXT file (up to 5 MB). Invocly’s uploader instantly reads your document.</p>
              </CardContent>
            </div>
          </Card>
          <Card className='flex flex-col justify-start items-center  px-6 gap-1 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <div className=''>
              <Image className='rounded-sm' width={350} height={350} alt='select voice step 2 image' src={'/select_voice_step_2.png'}>

              </Image>
            </div>
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Choose a Voice</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Choose your preferred natural-sounding voice. Adjust the speaking speed and style, or try different accents.</p>
              </CardContent>
            </div>
          </Card>
          <Card className='flex flex-col justify-start items-center px-6 gap-1 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <div className=''>
              <Image className='rounded-sm' width={350} height={350} alt='generate audio step 3 image' src={'/generate_audio_step_3.png'}>

              </Image>
            </div>
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Generate audio</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Click Generate and Invocly will generate the speech. Download the MP3 audio file and enjoy listening anywhere.</p>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Text To Speech Benefits */}
      <section className="container mx-auto px-4 mb-24">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 ">Text To Speech Benefits</h2>
        <div className="max-w-2xl mx-auto grid grid-rows-3 justify-items-center gap-6">
          <Card className='flex flex-col sm:flex-row xl:gap-4 justify-between items-center h-fit sm:w-full  px-6 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <div className=''>
              <Image className='rounded-sm' width={350} height={350} alt='boost productivity benefit image' src={'/boost_productivity_benefit.png'}>

              </Image>
            </div>
            <div className='sm:w-[60%]'>
              <CardTitle className='md:px-6 md:mb-3 mb-1 text-2xl'>Boost Productivity</CardTitle>
              <CardContent className='px-0 md:px-6 text-xl text-gray-600'>
                <p>
                  Save time by listening to reports, study notes, or articles while commuting, cooking, or multitasking.
                </p>
              </CardContent>
            </div>
          </Card>
          <Card className='flex flex-col-reverse sm:flex-row xl:gap-4 justify-between items-center h-fit sm:w-full px-6 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <div className='sm:w-[60%]'>
              <CardTitle className='md:px-6 md:mb-3 mb-1 text-2xl'>Reduce Eye Fatigue</CardTitle>
              <CardContent className='px-0 md:px-6 text-xl text-gray-600'>
                <p>
                  Long screen hours cause strain. Invocly’s lifelike audio lets you learn and focus without hurting your eyes.
                </p>
              </CardContent>
            </div>
            <div className=''>
              <Image className='rounded-sm' width={350} height={350} alt='reduce eye fiting benefit image' src={'/reduce_eye_fiting_benefit.png'}>

              </Image>
            </div>
          </Card>
          <Card className='flex flex-col sm:flex-row xl:gap-4 justify-between items-center h-fit sm:w-full px-6 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <div className=''>
              <Image className='rounded-sm' width={350} height={350} alt='improve rentention benefit image' src={'/improve_rentention_benefit.png'}>

              </Image>
            </div>
            <div className='sm:w-[60%]'>
              <CardTitle className='md:px-6 md:mb-3 mb-1 text-2xl'>Improve Retention</CardTitle>
              <CardContent className='px-0 md:px-6 text-xl text-gray-600'>
                <p className=''>
                  Combine reading with listening. Studies show this dual approach strengthens memory and improves comprehension.
                </p>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Multilingual Reader */}
      <section className="max-w-4xl mx-auto mb-24">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Multilingual Reader</h2>
        <p className="text-xl text-center text-gray-600 px-6 mb-4">
          Invocly supports 60+ languages and accents, letting you listen in English, Spanish, Chinese, Portuguese, and more. Perfect for students, language learners, and global teams who want accurate, native-like voices across documents.
        </p>
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-base px-4 py-2">60+ Languages Supported</Badge>
        </div>
      </section>

      {/* Text to Speech Use Cases */}
      <section className="max-w-4xl mx-auto mb-24">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Text to Speech Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-6 px-6">
          <Card className='px-6 gap-2 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <GraduationCap size={55} className='text-blue-600' />
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Students</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Convert lecture notes, research papers, or e-books into audio. Listen while commuting or working out. Audio study helps absorb complex material and makes review less tedious.</p>
              </CardContent>
            </div>
          </Card>
          <Card className='px-6 gap-2 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <BriefcaseBusiness size={55} className='text-blue-600' />
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Professionals</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Stay productive with text-to-speech for reports, presentations, or emails. Catch up on documents during travel or exercise, turning downtime into efficient work time.</p>
              </CardContent>
            </div>
          </Card>
          <Card className='px-6 gap-2 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <CaseSensitive size={55} className='text-blue-600' />
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Accessibility</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Text-to-speech enables people with dyslexia, visual impairments, or learning disabilities to consume content easily, meeting ADA/WCAG standards for classrooms or offices.</p>
              </CardContent>
            </div>
          </Card>
          <Card className='px-6 gap-2 shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <Zap size={55} className='text-blue-600 font-sm' />
            <div>
              <CardTitle className=' md:mb-3 mb-1 text-2xl'>Busy Individuals</CardTitle>
              <CardContent className='px-0 text-xl text-gray-600'>
                <p>Listen to long articles, manuals, or books while exercising, cooking, or doing chores. With Invocly, you learn hands-free and make everyday tasks more productive.</p>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-4xl mx-auto mb-24">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">What our users say</h2>
        <div className="grid md:grid-cols-3 gap-6 px-6">
          <Card className='shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <CardContent className="pt-6">
              <p className="italic mb-2">“Invocly saved me countless hours by converting my PDFs into audio. I can listen on the bus or at the gym, and the voices are so natural I never miss any details. Now studying doesn’t feel like a chore anymore.”</p>
              <div className="text-sm font-semibold text-gray-500 "> Mike T. — College Student</div>
            </CardContent>
          </Card>
          <Card className='shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <CardContent className="pt-6">
              <p className="italic mb-2">“As a busy project manager, I use Invocly every day. It converts reports and emails into audio that I can listen to while exercising or commuting. It’s like having a personal assistant read everything to me!”</p>
              <div className="text-sm font-semibold text-gray-500">Thomas C. — Project Manager</div>
            </CardContent>
          </Card>
          <Card className='shadow-md hover:shadow-lg hover:border-1 hover:border-blue-600'>
            <CardContent className="pt-6">
              <p className="italic mb-2">“Invocly’s speech tools help all my students learn. Even my dyslexic student can follow along by listening. It’s made my classroom more inclusive and interactive.”</p>
              <div className="text-sm font-semibold text-gray-500">Mary J. — Elementary School Teacher</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto pb-24">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">FAQ</h2>
        <div className='flex justify-center items-center lg:px-0 px-6'>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-medium">What file formats does Invocly support?</AccordionTrigger>
              <AccordionContent>
                Invocly works with PDF, Microsoft Word (.docx), and plain text (.txt) files (up to 5 MB per file). Just upload any of these formats and Invocly will read the text aloud.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-medium">How many languages and voices are available?</AccordionTrigger>
              <AccordionContent>
                It offers 60+ languages and accents with a variety of AI voice options. You can select different voices for different needs – for example, a male or female narrator, or different accents – to match your preference.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-medium">Is Invocly free?</AccordionTrigger>
              <AccordionContent>
                Yes – Invocly’s web app is free to use for standard conversions. You can access its text-to-speech features without an account. (Invocly may offer premium plans for advanced features like voice cloning or higher limits.)
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-medium">How do I get the audio after conversion?</AccordionTrigger>
              <AccordionContent>
                After uploading and converting, Invocly lets you download the MP3 file directly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-medium">Is my content private?</AccordionTrigger>
              <AccordionContent>
                Yes. Invocly processes your document on secure servers and does not share your files. Your uploaded documents are converted to speech and the result is returned to you, without storing your personal data long-term.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Start For Free */}
      {!user ?
        <>
          <section className="max-w-4xl mx-auto pb-24">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 px-6">Make Your Documents Speak Naturally — Instantly</h2>
            <p className="text-xl text-center text-gray-600 px-6 mb-4">
              Convert your documents PDF, DOCX & TXT into clear, lifelike speech. With Invocly, you can listen to your content anywhere. Whether it’s for learning, work, or accessibility and turn reading time into listening time in just one click.
            </p>
            <div className="flex justify-center mb-2">
              <SignUpButton>
                <Button size='lg' className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl">
                  Start for free
                </Button>
              </SignUpButton>
            </div>
            <p className="text-md text-center text-gray-600 px-6">
              3 documents conversions for free. No credit card required.
            </p>
          </section>
        </>
        : null
      }
    </div>
  )
}
