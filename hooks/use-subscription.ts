"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/lib/supabase/client"

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  limits: {
    dailyDocuments: number | null // null = unlimited
    maxFileSize: number // in MB
    voiceCloning: boolean
    batchProcessing: boolean
    priorityProcessing: boolean
  }
}

export const PLANS: Record<string, SubscriptionPlan> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    features: ["Up to 3 documents per day", "2 standard voices", "Basic audio controls"],
    limits: {
      dailyDocuments: 3,
      maxFileSize: 5,
      voiceCloning: false,
      batchProcessing: false,
      priorityProcessing: false,
    },
  },
  premium: {
    id: "premium",
    name: "Premium",
    price: 14.99,
    features: [
      "Unlimited documents",
      "Voice cloning feature",
      "Advanced audio controls",
      "50MB file size limit",
      "Priority processing",
      "Batch processing",
    ],
    limits: {
      dailyDocuments: null,
      maxFileSize: 50,
      voiceCloning: true,
      batchProcessing: true,
      priorityProcessing: true,
    },
  },
}

export function useSubscription() {
  const { user } = useUser()
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [dailyUsage, setDailyUsage] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSubscription() {
      setIsLoading(true)
      const today = new Date().toDateString()

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("plan")
          .eq("id", user.id)
          .single()

        if (data) {
          setCurrentPlan(data.plan)
        } else {
          setCurrentPlan("free")
        }
      } else {
        setCurrentPlan("free")
      }

      const usageKey = user ? `daily_usage_${user.id}` : "daily_usage_guest"
      const lastUsageDateKey = user ? `last_usage_date_${user.id}` : "last_usage_date_guest"

      const savedUsage = Number.parseInt(localStorage.getItem(usageKey) || "0")
      const lastUsageDate = localStorage.getItem(lastUsageDateKey)

      if (lastUsageDate !== today) {
        setDailyUsage(0)
        localStorage.setItem(usageKey, "0")
        localStorage.setItem(lastUsageDateKey, today)
      } else {
        setDailyUsage(savedUsage)
      }

      setIsLoading(false)
    }

    loadSubscription()
  }, [user])

  const incrementUsage = async () => {
    if (currentPlan === "premium" && user) {
      return
    }

    const newUsage = dailyUsage + 1
    setDailyUsage(newUsage)
    const today = new Date().toDateString()
    const usageKey = user ? `daily_usage_${user.id}` : "daily_usage_guest"
    const lastUsageDateKey = user ? `last_usage_date_${user.id}` : "last_usage_date_guest"

    localStorage.setItem(usageKey, newUsage.toString())
    localStorage.setItem(lastUsageDateKey, today)
  }

  const canUseFeature = (feature: keyof SubscriptionPlan["limits"]) => {
    const plan = PLANS[currentPlan]
    return plan.limits[feature]
  }

  const canProcessDocument = () => {
    const plan = PLANS[currentPlan]
    if (plan.limits.dailyDocuments === null) return true
    return dailyUsage < plan.limits.dailyDocuments
  }

  const getRemainingDocuments = () => {
    const plan = PLANS[currentPlan]
    if (plan.limits.dailyDocuments === null) return null
    return Math.max(0, plan.limits.dailyDocuments - dailyUsage)
  }

  return {
    currentPlan: PLANS[currentPlan],
    dailyUsage,
    isLoading,
    incrementUsage,
    canUseFeature,
    canProcessDocument,
    getRemainingDocuments,
  }
}
