import type { Metadata } from 'next'
import { Header } from '@/components/header'

export const metadata: Metadata = {
  title: 'Invocly Blog - Text to Speech & Auditory Learning',
  description: 'Guides, tips, and insights on converting PDFs, DOCX, and TXT to natural-sounding audio for dyslexia, studying, and productivity.',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <Header />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  )
}
