"use client"

import Image from "next/image"
import Link from "next/link"
import { SignInButton, SignOutButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { BookOpen, CreditCard, Headphones, Home, LogIn, LogOut, Menu, UserPlus, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { navbarPrimaryButtonClass, navbarSecondaryButtonClass } from "@/components/marketing-styles"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMyAudios?: () => void
}

const navigationLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/blog", label: "Blog", icon: BookOpen },
]

const mobileMenuItemClass =
  "flex min-h-11 w-full cursor-pointer select-none items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 outline-none transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700"

export function Header({ onMyAudios }: HeaderProps) {
  const { currentPlan } = useSubscription()
  const { isLoaded, user } = useUser()

  return (
    <header className="relative flex items-center justify-between px-3 py-3 sm:p-4 dark:bg-gray-800">
      <Link href="/" className="flex min-h-11 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40" aria-label="Invocly home">
        <Image src="/placeholder-logo.png" alt="" width={40} height={20} className="h-8 w-auto sm:h-10" priority />
      </Link>

      <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">
        {navigationLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-white/40 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-2 lg:flex lg:gap-4">
        {user && (
          <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className={`rounded-full py-1 text-sm ${currentPlan.id === "premium" ? "bg-blue-600" : ""}`}>
            {currentPlan.name} Plan
          </Badge>
        )}

        {!isLoaded ? (
          <div className="h-11 w-24 rounded-2xl border border-white/70 bg-white/40" aria-hidden="true" />
        ) : !user ? (
          <>
            <SignInButton>
              <Button className={navbarSecondaryButtonClass}>Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button className={navbarPrimaryButtonClass}>Try for free</Button>
            </SignUpButton>
          </>
        ) : (
          <>
            {onMyAudios && (
              <Button className={navbarSecondaryButtonClass} variant="outline" onClick={onMyAudios}>
                My Audios
              </Button>
            )}
            <UserButton>
              {currentPlan.id === "premium" && (
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Manage Subscription"
                    labelIcon={<Zap className="size-4 text-blue-600" />}
                    onClick={() => { window.location.href = "/api/billing/portal" }}
                  />
                </UserButton.MenuItems>
              )}
            </UserButton>
          </>
        )}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            className={cn(navbarSecondaryButtonClass, "size-11 p-0 lg:hidden")}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            collisionPadding={12}
            className="z-50 min-w-64 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          >
            <DropdownMenu.Label className="px-3 pb-1.5 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Navigation
            </DropdownMenu.Label>

            {navigationLinks.map((link) => (
              <DropdownMenu.Item key={link.href} asChild>
                <Link href={link.href} className={mobileMenuItemClass}>
                  <link.icon className="size-4.5 text-slate-500" aria-hidden="true" />
                  {link.label}
                </Link>
              </DropdownMenu.Item>
            ))}

            <DropdownMenu.Separator className="my-2 h-px bg-slate-200" />

            {!isLoaded ? (
              <div className="mx-2 my-1 h-11 rounded-xl bg-slate-100" aria-hidden="true" />
            ) : !user ? (
              <>
                <SignInButton>
                  <DropdownMenu.Item className={mobileMenuItemClass}>
                    <LogIn className="size-4.5 text-slate-500" aria-hidden="true" />
                    Sign In
                  </DropdownMenu.Item>
                </SignInButton>
                <SignUpButton>
                  <DropdownMenu.Item className={cn(mobileMenuItemClass, "bg-blue-500/10 text-blue-700 hover:bg-blue-500/15")}>
                    <UserPlus className="size-4.5 text-blue-600" aria-hidden="true" />
                    Try for free
                  </DropdownMenu.Item>
                </SignUpButton>
              </>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-xs font-medium text-slate-500">Current plan</span>
                  <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className={currentPlan.id === "premium" ? "bg-blue-600" : ""}>
                    {currentPlan.name}
                  </Badge>
                </div>

                {onMyAudios && (
                  <DropdownMenu.Item className={mobileMenuItemClass} onSelect={onMyAudios}>
                    <Headphones className="size-4.5 text-slate-500" aria-hidden="true" />
                    My Audios
                  </DropdownMenu.Item>
                )}

                {currentPlan.id === "premium" && (
                  <DropdownMenu.Item asChild>
                    <Link href="/api/billing/portal" className={mobileMenuItemClass}>
                      <Zap className="size-4.5 text-blue-600" aria-hidden="true" />
                      Manage subscription
                    </Link>
                  </DropdownMenu.Item>
                )}

                <SignOutButton>
                  <DropdownMenu.Item className={cn(mobileMenuItemClass, "text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 data-[highlighted]:bg-rose-50 data-[highlighted]:text-rose-700")}>
                    <LogOut className="size-4.5" aria-hidden="true" />
                    Sign out
                  </DropdownMenu.Item>
                </SignOutButton>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  )
}
