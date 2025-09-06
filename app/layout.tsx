import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Analytics } from "@vercel/analytics/next"
import './globals.css'
import { Footer } from '@/components/footer'
import GlobalContextProvider from '@/lib/globalContext'

export const metadata: Metadata = {
  title: 'Invocly - Free Text To Speech Online App',
  description: 'Invocly is a text-to-speech web app converting PDF, DOCX & TXT into clear audio for dyslexic learners, visually impaired users, and busy multitasking students.',
  icons: [{
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    url: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    url: '/favicon-16x16.png',
  },
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    url: '/apple-touch-icon.png',
  },
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
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
    </ClerkProvider>
  )
}