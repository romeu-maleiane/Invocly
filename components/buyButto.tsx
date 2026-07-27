"use client"

import Link from "next/link"
import { SignInButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"
import { cn } from "@/lib/utils"
import { navbarPrimaryButtonClass } from "@/components/marketing-styles"

interface BuyButtonProps {
  className?: string
  label?: string
  activeLabel?: string
}

const baseClassName = cn(navbarPrimaryButtonClass, "h-12 w-full font-semibold")

function BuyButton({ className, label = "Upgrade to Premium", activeLabel = "Your current plan" }: BuyButtonProps) {
  const { user } = useUser()
  const { currentPlan } = useSubscription()
  const subscriptionId = process.env.NEXT_PUBLIC_POLAR_SUBSCRIPTION_ID
  const buttonClassName = cn(baseClassName, className)

  if (user && currentPlan.id === "premium") {
    return (
      <Button disabled className={cn(buttonClassName, "border-slate-200 bg-slate-100 text-slate-500 opacity-75")}>
        {activeLabel}
      </Button>
    )
  }

  if (!user) {
    return (
      <SignInButton forceRedirectUrl="/checkout-redirect">
        <Button className={buttonClassName}>{label}</Button>
      </SignInButton>
    )
  }

  const customerEmail = user.emailAddresses[0]?.emailAddress ?? ""
  const checkoutUrl = `/checkout/?products=${encodeURIComponent(subscriptionId ?? "")}&customerExternalId=${encodeURIComponent(user.id)}&customerEmail=${encodeURIComponent(customerEmail)}`

  return (
    <Button asChild className={buttonClassName}>
      <Link href={checkoutUrl}>{label}</Link>
    </Button>
  )
}

export default BuyButton
