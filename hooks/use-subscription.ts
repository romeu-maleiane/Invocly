"use client"

import { useState, useEffect } from "react"

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
    features: ["Up to 3 documents per day", "4 standard voices", "Basic audio controls"],
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
    price: 9.99,
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
  const [currentPlan, setCurrentPlan] = useState<string>("free")
  const [dailyUsage, setDailyUsage] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load subscription data from localStorage or API
    const savedPlan = localStorage.getItem("subscription_plan") || "free"
    const savedUsage = Number.parseInt(localStorage.getItem("daily_usage") || "0")
    const lastUsageDate = localStorage.getItem("last_usage_date")
    const today = new Date().toDateString()

    // Reset daily usage if it's a new day
    if (lastUsageDate !== today) {
      setDailyUsage(0)
      localStorage.setItem("daily_usage", "0")
      localStorage.setItem("last_usage_date", today)
    } else {
      setDailyUsage(savedUsage)
    }

    setCurrentPlan(savedPlan)
    setIsLoading(false)
  }, [])

  const upgradeToPremium = () => {
    setCurrentPlan("premium")
    localStorage.setItem("subscription_plan", "premium")
  }

  const incrementUsage = () => {
    const newUsage = dailyUsage + 1
    setDailyUsage(newUsage)
    localStorage.setItem("daily_usage", newUsage.toString())
    localStorage.setItem("last_usage_date", new Date().toDateString())
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
    upgradeToPremium,
    incrementUsage,
    canUseFeature,
    canProcessDocument,
    getRemainingDocuments,
  }
}
