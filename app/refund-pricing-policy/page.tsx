import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, type LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Refund & Pricing Policy | Invocly",
  description: "Understand Invocly's monthly pricing, cancellation terms, and 14-day money-back guarantee for new customers.",
}

const sections: LegalSection[] = [
  {
    id: "pricing",
    title: "Pricing",
    content: (
      <div className="space-y-4">
        <p>Invocly offers a free plan and a Premium monthly subscription. Current plan features and prices are shown on our <Link href="/pricing">Pricing page</Link> before you subscribe.</p>
        <p>Prices may change as the service evolves. If a price change affects an existing subscription, we will provide at least 30 days’ notice before the new price takes effect.</p>
      </div>
    ),
  },
  {
    id: "billing",
    title: "Billing and renewals",
    content: <p>Premium subscriptions are billed monthly and renew automatically until canceled. The applicable price, billing interval, and payment details are presented during secure checkout.</p>,
  },
  {
    id: "guarantee",
    title: "14-day money-back guarantee",
    content: <p>New Premium customers may request a full refund within 14 days of their initial purchase if they are not satisfied with the service. The guarantee applies to the first subscription payment and not to later recurring renewals.</p>,
  },
  {
    id: "recurring-payments",
    title: "Recurring payments and partial periods",
    content: <p>We do not provide refunds or credits for partial months after the initial 14-day guarantee period. When you cancel, Premium access remains available until the end of the current paid billing period.</p>,
  },
  {
    id: "cancellations",
    title: "Canceling your subscription",
    content: <p>You can cancel at any time through the subscription management option in your account. Cancel before the next renewal date to avoid the following monthly charge.</p>,
  },
  {
    id: "request-refund",
    title: "Requesting a refund",
    content: <p>To request an eligible refund, email <a href="mailto:hello@invocly.com">hello@invocly.com</a> from the address connected to your account. Include enough information for us to locate the subscription and briefly explain the request.</p>,
  },
]

export default function RefundPricingPolicyPage() {
  return (
    <LegalPage
      eyebrow="Billing policy"
      title="Refund & Pricing Policy"
      description="Simple monthly billing, clear cancellation terms, and a 14-day guarantee for your first Premium purchase."
      updatedAt="July 27, 2026"
      sections={sections}
    />
  )
}
