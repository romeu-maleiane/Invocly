import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import {
  ClerkProvider,
} from '@clerk/nextjs'

// Clerk's server entry is async at runtime, which Next.js supports, but this
// project's JSX checker still expects a synchronous component signature.
const RootClerkProvider = ClerkProvider as unknown as React.ComponentType<{ children: React.ReactNode }>
import { Analytics } from "@vercel/analytics/next"
import './globals.css'
import { Footer } from '@/components/footer'
import GlobalContextProvider from '@/lib/globalContext'

export const metadata: Metadata = {
  title: 'Invocly - Free Text To Speech Online App',
  description: 'Invocly is a text-to-speech web app converting PDF, DOCX & TXT into clear audio for dyslexic learners, visually impaired users, and busy multitasking students.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <RootClerkProvider>
      <html lang="en" className="h-full">
        <head>
          <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
          <link rel="icon" href="/favicon.ico" sizes='any' />
        </head>
        <body className="flex flex-col h-full custom-scrollbar">
          <main className="flex-grow">
            <GlobalContextProvider>
              {children}
              <Analytics />
            </GlobalContextProvider>
          </main>
          <Footer />
        </body>
      </html>
    </RootClerkProvider>
  )
}