"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col justify-center  gap-2 items-center text-center">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-blue-600">
            Blog
          </Link>
          <Link href="/refund-pricing-policy" className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-blue-600">
            Refund & Pricing Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-blue-600">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 underline hover:text-blue-600">
            Privacy Policy
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Invocly. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Made with ❤️ by <Link href="https://x.com/Romeu_Maleiane" className="text-sm py-0 text-gray-600 dark:text-gray-400 underline hover:text-blue-600">R.A.M</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
