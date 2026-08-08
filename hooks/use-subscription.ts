"use client"

import { useCallback, useContext, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { GlobalContext } from "@/lib/globalContext"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    Documents: number | null
    maxFileSize: number
    voiceCloning: boolean
  }
}

export const PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    features: ["Up to 3 documents", "2 standard voices"],
    limits: { Documents: 3, maxFileSize: 5, voiceCloning: false },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 14.99,
    features: ["Unlimited documents", "Voice cloning feature", "Premium voices", "50MB file size limit"],
    limits: { Documents: null, maxFileSize: 50, voiceCloning: true },
  },
}

type UsageResponse = {
  plan: "free" | "premium"
  usage: number
  limit: number | null
  remaining: number | null
}

export function useSubscription() {
  const { isLoaded: isUserLoaded, user } = useUser()
  const [currentPlan, setCurrentPlan] = useState<"free" | "premium">("free")
  const [usage, setUsage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const { setRemainingDocs } = useContext(GlobalContext)
  const activeIdentity = isUserLoaded ? user?.id ?? "guest" : null

  const refreshUsage = useCallback(() => setRefreshVersion((value) => value + 1), [])

  useEffect(() => {
    if (!isUserLoaded || !activeIdentity) return
    let cancelled = false

    async function loadSubscription() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/audio/usage", { cache: "no-store" })
        if (!response.ok) throw new Error("Unable to load subscription")
        const data = (await response.json()) as UsageResponse
        if (cancelled) return
        setCurrentPlan(data.plan === "premium" ? "premium" : "free")
        setUsage(Number.isFinite(data.usage) ? data.usage : 0)
        setIsPlanConfirmed(true)
      } catch {
        if (cancelled) return
        setCurrentPlan("free")
        setUsage(0)
        setIsPlanConfirmed(false)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadSubscription()
    return () => {
      cancelled = true
    }
  }, [activeIdentity, isUserLoaded, refreshVersion])

  const incrementUsage = (remaining?: number | null) => {
    if (currentPlan === "premium") return
    const limit = PLANS.free.limits.Documents ?? 3
    setUsage((current) =>
      typeof remaining === "number" ? Math.max(0, limit - remaining) : Math.min(limit, current + 1),
    )
  }

  const canUseFeature = (feature: keyof SubscriptionPlan["limits"]) => PLANS[currentPlan].limits[feature]
  const canProcessDocument = () => {
    const limit = PLANS[currentPlan].limits.Documents
    return limit === null || usage < limit
  }

  useEffect(() => {
    const limit = PLANS[currentPlan].limits.Documents
    setRemainingDocs(limit === null ? null : Math.max(0, limit - usage))
  }, [currentPlan, setRemainingDocs, usage])

  return {
    currentPlan: PLANS[currentPlan],
    usage,
    isLoading: isLoading || !isUserLoaded,
    isPlanConfirmed,
    incrementUsage,
    refreshUsage,
    canUseFeature,
    canProcessDocument,
  }
}
