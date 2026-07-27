import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CircleCheck,
  FileAudio,
  Headphones,
  LockKeyhole,
  Minus,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react"
import BuyButton from "@/components/buyButto"
import { Header } from "@/components/header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { navbarSecondaryButtonClass } from "@/components/marketing-styles"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Pricing | Invocly",
  description: "Compare Invocly Free and Premium plans. Get unlimited document conversions, premium voices, voice cloning, and larger file uploads for $14.99/month.",
}

const freeFeatures = [
  "3 document conversions",
  "2 standard voices",
  "PDF, DOCX, and TXT support",
  "Up to 5 MB per file",
]

const premiumFeatures = [
  "Unlimited document conversions",
  "Premium natural-sounding voices",
  "Voice cloning",
  "Up to 50 MB per file",
  "Priority support",
]

const comparisonRows = [
  { feature: "Document conversions", free: "3 total", premium: "Unlimited" },
  { feature: "Voice library", free: "2 standard", premium: "Premium voices" },
  { feature: "Voice cloning", free: false, premium: true },
  { feature: "Maximum file size", free: "5 MB", premium: "50 MB" },
  { feature: "Priority support", free: false, premium: true },
]

const faqs = [
  {
    question: "Can I try Invocly for free?",
    answer: "Yes. The Free plan includes three document conversions, two standard voices, and uploads up to 5 MB. No credit card is required to start.",
  },
  {
    question: "What does unlimited documents mean?",
    answer: "Premium removes the Free plan's three-document limit, so you can keep converting supported PDF, DOCX, and TXT files while your subscription is active. Fair-use and service safeguards still apply.",
  },
  {
    question: "Can I cancel at any time?",
    answer: "Yes. You can cancel through your subscription management page. Your Premium access remains active until the end of the current paid billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer: "New Premium customers are covered by a 14-day money-back guarantee on their first purchase. Recurring renewals and partial billing periods are not refundable after that window.",
  },
  {
    question: "Is payment secure?",
    answer: "Yes. Checkout and billing are handled by our payment provider, so Invocly does not directly store your complete payment-card credentials.",
  },
]

function FeatureItem({ children, inverted = false }: { children: ReactNode; inverted?: boolean }) {
  return (
    <li className={`flex items-start gap-3 text-sm leading-6 ${inverted ? "text-blue-50" : "text-slate-700 dark:text-slate-200"}`}>
      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${inverted ? "bg-blue-400/20 text-blue-200" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
      {children}
    </li>
  )
}

function ComparisonValue({ value, premium = false }: { value: string | boolean; premium?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
        <CircleCheck className="size-4" /> Included
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <Minus className="size-4" /> Not included
      </span>
    )
  }

  return <span className={premium ? "font-semibold text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-300"}>{value}</span>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="relative overflow-hidden">
        <section className="relative mx-auto max-w-6xl px-4 pb-12 pt-16 text-center sm:px-6 sm:pb-16 sm:pt-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-100/80 px-4 py-1.5 text-sm font-medium text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-300">
            <Sparkles className="size-4" />
            Simple, transparent pricing
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl md:text-7xl dark:text-white">
            Give every document a <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">voice.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
            Start free, then unlock unlimited listening, premium voices, and voice cloning when you need more.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /> 14-day guarantee</span>
            <span className="flex items-center gap-2"><LockKeyhole className="size-4 text-blue-600" /> Secure payment</span>
            <span className="flex items-center gap-2"><CircleCheck className="size-4 text-indigo-600" /> Cancel anytime</span>
          </div>
        </section>

        <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6" aria-label="Pricing plans">
          <div className="grid items-stretch gap-6 lg:grid-cols-2">
            <article className="flex flex-col rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-white/5">
              <div className="mb-8">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  <Headphones className="size-6" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Free</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">$0</span>
                  <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">forever</span>
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-300">The essentials for discovering a better way to read.</p>
              </div>

              <ul className="mb-8 space-y-3" aria-label="Free plan features">
                {freeFeatures.map((feature) => <FeatureItem key={feature}>{feature}</FeatureItem>)}
              </ul>

              <Button asChild className={cn(navbarSecondaryButtonClass, "mt-auto h-12 w-full font-semibold")}>
                <Link href="/">Start listening free <ArrowRight className="size-4" /></Link>
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">No credit card required</p>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-[2rem] border border-blue-300/80 bg-white/85 p-6 shadow-[0_35px_100px_-35px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-blue-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-indigo-400/10 blur-3xl" />
              <div className="relative mb-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 text-blue-700 backdrop-blur">
                    <Zap className="size-6" />
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Most popular</span>
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Premium</p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-slate-950">$14.99</span>
                  <span className="pb-1 text-sm text-slate-500">/ month</span>
                </div>
                <p className="mt-4 text-slate-600">For learners and professionals who listen every day.</p>
              </div>

              <ul className="relative mb-8 space-y-3" aria-label="Premium plan features">
                {premiumFeatures.map((feature) => <FeatureItem key={feature}>{feature}</FeatureItem>)}
              </ul>

              <div className="relative mt-auto">
                <BuyButton label="Get Premium" />
                <p className="mt-3 text-center text-xs text-slate-500">Billed monthly · Cancel anytime</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      <section className="border-y border-blue-200/70 bg-blue-50/40 py-20 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Compare plans</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">Choose the room you need to listen</h2>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-900/70">
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,.85fr)_minmax(0,.85fr)] gap-3 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-900 sm:px-7 dark:bg-white/5 dark:text-white">
              <span>Feature</span>
              <span>Free</span>
              <span className="text-blue-700 dark:text-blue-300">Premium</span>
            </div>
            {comparisonRows.map((row) => (
              <div key={row.feature} className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,.85fr)_minmax(0,.85fr)] items-center gap-3 border-t border-slate-200 px-4 py-5 text-xs sm:px-7 sm:text-sm dark:border-white/10">
                <span className="font-medium text-slate-900 dark:text-white">{row.feature}</span>
                <ComparisonValue value={row.free} />
                <ComparisonValue value={row.premium} premium />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Why Premium</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">Built for your listening workflow</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: FileAudio, title: "More room to work", description: "Upload files up to 50 MB and turn every supported document into downloadable audio." },
            { icon: WandSparkles, title: "Your own voice", description: "Create a familiar listening experience with Premium voice cloning." },
            { icon: Sparkles, title: "Premium voices", description: "Choose richer, natural-sounding voices for study, accessibility, and focused work." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200/80 bg-white/80 p-7 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <item.icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Questions, answered</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">Pricing FAQ</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`} className="rounded-2xl border border-slate-200 bg-white/85 px-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <AccordionTrigger className="min-h-14 py-5 text-base font-semibold text-slate-950 hover:no-underline dark:text-white">{faq.question}</AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 px-6 py-14 text-center shadow-2xl sm:px-12 sm:py-18">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Start listening in minutes</h2>
            <p className="mt-5 text-lg leading-relaxed text-blue-100/75">Upload your first document free. Upgrade only when you are ready for more voices, more files, and more freedom.</p>
            <Button asChild className={cn(navbarSecondaryButtonClass, "mt-8 h-12 px-6 font-semibold text-white")}>
              <Link href="/">Try Invocly free <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
