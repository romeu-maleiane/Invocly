import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import './globals.css'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Invocly - Invoke you reading voice',
  description: 'Convert PDF, DOCX, and TXT files into lifelike speech with Invocly. Choose from multiple natural voices and listen to your documents anytime, anywhere.',
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
        <body className="flex flex-col h-full">
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}