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
    dailyDocuments: number | null // null = unlimited
    maxFileSize: number // in MB
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
      "Basic audio controls"
    ],
    limits: {
      dailyDocuments: 3,
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
      "Advanced audio controls",
      "50MB file size limit",
    ],
    limits: {
      dailyDocuments: null,
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
      const today = new Date().toDateString()

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

      const usageKey = user ? `usage_${user.id}` : "usage_guest"
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
    const usageKey = user ? `usage_${user.id}` : "usage_guest"

    localStorage.setItem(usageKey, newUsage.toString())
  }

  const canUseFeature = (feature: keyof SubscriptionPlan["limits"]) => {
    const plan = PLANS[currentPlan]
    return plan.limits[feature]
  }

  const canProcessDocument = () => {
    const plan = PLANS[currentPlan]
    if (plan.limits.dailyDocuments === null) return true
    return usage < plan.limits.dailyDocuments
  }

  useEffect(() => {
    const plan = PLANS[currentPlan]
    if (plan.limits.dailyDocuments === null)  return setRemainingDocs(null)
    setRemainingDocs(Math.max(0, plan.limits.dailyDocuments - usage))
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
