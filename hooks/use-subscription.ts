"use client"

import { useState, useEffect, useContext } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"
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
    features: [
      "Up to 3 documents", 
      "2 standard voices",
    ],
    limits: {
      Documents: 3,
      maxFileSize: 5,
      voiceCloning: false,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 14.99,
    features: [
      "Unlimited documents",
      "Voice cloning feature",
      "Premium voices",
      "50MB file size limit",
    ],
    limits: {
      Documents: null,
      maxFileSize: 50,
      voiceCloning: true,
    },
  },
}

export function useSubscription() {
  const { isLoaded: isUserLoaded, user } = useUser()
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [usage, setUsage] = useState<number>(0)
  const {setRemainingDocs} = useContext(GlobalContext)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false)
  const [resolvedIdentity, setResolvedIdentity] = useState<string | null>(null)
  const supabase = createClient()
  const activeIdentity = isUserLoaded ? user?.id ?? "guest" : null

  useEffect(() => {
    if (!isUserLoaded || !activeIdentity) return

    let cancelled = false

    async function loadSubscription() {
      setIsLoading(true)
      let nextPlan = "free"
      let nextUsage = 0
      let nextPlanConfirmed = !user

      try {
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("plan")
            .eq("id", user.id)
            .maybeSingle()

          if (error) throw error

          const normalizedPlan = data?.plan?.trim().toLowerCase()
          nextPlan = normalizedPlan && PLANS[normalizedPlan] ? normalizedPlan : "free"
          nextPlanConfirmed = true
        }

        const savedUsage = Number.parseInt(localStorage.getItem("usage_guest") || "0")
        nextUsage = Number.isNaN(savedUsage) ? 0 : savedUsage
      } catch {
        nextPlan = "free"
        nextUsage = 0
        nextPlanConfirmed = false
      } finally {
        if (!cancelled) {
          setCurrentPlan(nextPlan)
          setUsage(nextUsage)
          setIsPlanConfirmed(nextPlanConfirmed)
          setResolvedIdentity(activeIdentity)
          setIsLoading(false)
        }
      }
    }

    loadSubscription()

    return () => {
      cancelled = true
    }
  }, [activeIdentity, isUserLoaded])

  const incrementUsage = () => {
    if (currentPlan === "premium" && user) {
      return
    }

    const newUsage = usage + 1
    setUsage(newUsage)
    const usageKey = "usage_guest"

    localStorage.setItem(usageKey, newUsage.toString())
  }

  const canUseFeature = (feature: keyof SubscriptionPlan["limits"]) => {
    const plan = PLANS[currentPlan]
    return plan.limits[feature]
  }

  const canProcessDocument = () => {
    const plan = PLANS[currentPlan]
    if (plan.limits.Documents === null) return true
    return usage < plan.limits.Documents
  }

  useEffect(() => {
    const plan = PLANS[currentPlan]
    if (plan.limits.Documents === null)  return setRemainingDocs(null)
    setRemainingDocs(Math.max(0, plan.limits.Documents - usage))
  }, [usage])

  return {
    currentPlan: PLANS[currentPlan],
    usage,
    isLoading: isLoading || !isUserLoaded || resolvedIdentity !== activeIdentity,
    isPlanConfirmed: isPlanConfirmed && resolvedIdentity === activeIdentity,
    incrementUsage,
    canUseFeature,
    canProcessDocument,
  }
}
