"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RefundPricingPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Refund & Pricing Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold">Pricing Policy</h2>
            <p>
              Our pricing is designed to be transparent and flexible, with different plans to suit your needs. We offer both monthly and annual subscription plans. You can find detailed information about our plans on our pricing page.
            </p>
            <p>
              Prices are subject to change, but we will notify you of any changes at least 30 days in advance.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">Refund Policy</h2>
            <p>
              We offer a 14-day money-back guarantee for new customers. If you are not satisfied with our service, you can request a full refund within 14 days of your initial purchase.
            </p>
            <p>
              For recurring subscriptions, we do not offer refunds for partial months of service. If you cancel your subscription, you will retain access to the service until the end of your current billing period.
            </p>
            <p>
              To request a refund, please contact our support team with your account information and the reason for your request.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
