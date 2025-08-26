"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-md mt-auto">
      <div className="container mx-auto px-4 py-6 flex justify-between gap-3 items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-wrap">
          © {new Date().getFullYear()} Invocly. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/refund-pricing-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
            Refund & Pricing Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
