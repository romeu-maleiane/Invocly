import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"

const footerLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/terms-of-service", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/refund-pricing-policy", label: "Refunds" },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image src="/placeholder-logo.png" alt="" width={36} height={36} className="h-8 w-auto" />
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Turn documents into natural audio.</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-3" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md text-sm font-medium text-slate-600 underline-offset-4 transition-colors hover:text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-slate-300 dark:hover:text-blue-400">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200/70 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between dark:text-slate-400">
          <p>© {new Date().getFullYear()} Invocly. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="size-3.5 fill-rose-500 text-rose-500" aria-label="care" /> by
            <Link href="https://x.com/Romeu_Maleiane" className="font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400">R.A.M</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
