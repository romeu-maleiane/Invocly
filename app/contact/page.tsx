import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CreditCard, Lightbulb, Mail, MessageSquareText } from "lucide-react"
import { Header } from "@/components/header"
import { navbarPrimaryButtonClass } from "@/components/marketing-styles"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const contactEmail = "hello@invocly.com"

export const metadata: Metadata = {
  title: "Contact | Invocly",
  description: "Contact the Invocly team for product questions, account support, billing help, or feedback.",
}

const contactTopics = [
  {
    icon: MessageSquareText,
    title: "Product support",
    description: "Tell us what you were trying to do and what happened so we can understand the issue quickly.",
  },
  {
    icon: CreditCard,
    title: "Billing questions",
    description: "Write from the email connected to your Invocly account and include the relevant subscription details.",
  },
  {
    icon: Lightbulb,
    title: "Ideas and feedback",
    description: "Share the features or improvements that would make Invocly more useful for you.",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main id="page-content" className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-8 size-[30rem] -translate-x-1/2 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-64 size-80 rounded-full bg-indigo-300/20 blur-3xl" />

        <section className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/80 px-4 py-1.5 text-sm font-medium text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
              <Mail className="size-4" aria-hidden="true" />
              Contact Invocly
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
              How can we <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">help?</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
              Questions about Invocly, your account, or a subscription? Send us an email and give us the details we need to help.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_30px_100px_-45px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:mt-16 dark:border-white/10 dark:bg-slate-900/80">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Mail className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Email us</p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="mt-2 inline-block break-all text-xl font-semibold tracking-tight text-slate-950 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-700 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 sm:text-2xl dark:text-white dark:hover:text-blue-300"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              <Button asChild className={cn(navbarPrimaryButtonClass, "h-12 w-full px-6 font-semibold lg:w-auto")}>
                <a href={`mailto:${contactEmail}`}>
                  Write an email
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
            </div>

            <div className="border-t border-slate-200/80 px-6 py-5 text-sm leading-6 text-slate-500 sm:px-10 dark:border-white/10 dark:text-slate-400">
              Please do not include passwords, full payment-card details, or other sensitive information in your message.
            </div>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {contactTopics.map((topic) => (
              <article key={topic.title} className="rounded-2xl border border-white/80 bg-white/65 p-6 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.3)] backdrop-blur-lg dark:border-white/10 dark:bg-white/5">
                <topic.icon className="size-5 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{topic.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{topic.description}</p>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
            Looking for plan details first? Visit our <Link href="/pricing" className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-800 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-blue-300 dark:hover:text-blue-200">Pricing page</Link>.
          </p>
        </section>
      </main>
    </div>
  )
}
