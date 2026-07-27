import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, CalendarDays, FileText } from "lucide-react"
import { Header } from "@/components/header"

export interface LegalSection {
  id: string
  title: string
  content: ReactNode
}

interface LegalPageProps {
  eyebrow: string
  title: string
  description: string
  updatedAt: string
  sections: LegalSection[]
}

export function LegalPage({ eyebrow, title, description, updatedAt, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div id="page-content" className="relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-18">
          <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-slate-300 dark:hover:text-blue-300">
            <ArrowLeft className="size-4" />
            Back to Invocly
          </Link>

          <div className="mb-10 max-w-3xl sm:mb-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/80 px-4 py-1.5 text-sm font-medium text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
              <FileText className="size-4" />
              {eyebrow}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl dark:text-white">{title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
            <p className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <CalendarDays className="size-4" />
              Last updated {updatedAt}
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/5" aria-label="On this page">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">On this page</p>
              <nav className="space-y-1">
                {sections.map((section, index) => (
                  <a key={section.id} href={`#${section.id}`} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-blue-300">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">{index + 1}</span>
                    {section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <article className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-slate-200/80 px-6 py-8 last:border-b-0 sm:px-10 sm:py-10 dark:border-white/10">
                  <div className="mb-4 flex items-start gap-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{index + 1}</span>
                    <h2 className="pt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-white">{section.title}</h2>
                  </div>
                  <div className="space-y-4 pl-0 text-base leading-7 text-slate-600 sm:pl-13 dark:text-slate-300 [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline [&_a]:decoration-blue-300 [&_a]:underline-offset-4 [&_a]:hover:text-blue-800 dark:[&_a]:text-blue-300 dark:[&_a]:hover:text-blue-200 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                    {section.content}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
