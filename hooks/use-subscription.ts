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
  const { user } = useUser()
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [usage, setUsage] = useState<number>(0)
  const {setRemainingDocs} = useContext(GlobalContext)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSubscription() {
      setIsLoading(true)

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("plan")
          .eq("id", user.id)
          .single()

        if (data) {
          setCurrentPlan(data.plan.trim())
        } else {
          setCurrentPlan("free")
        }
      } else {
        setCurrentPlan("free")
      }

      const usageKey = "usage_guest"
      const savedUsage = Number.parseInt(localStorage?.getItem(usageKey) || "0")
      setUsage(savedUsage)


      setIsLoading(false)
    }

    loadSubscription()
  }, [user])

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
    isLoading,
    incrementUsage,
    canUseFeature,
    canProcessDocument,
  }
}
