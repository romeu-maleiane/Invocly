import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, type LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Privacy Policy | Invocly",
  description: "Learn what information Invocly collects, why it is used, how it is protected, and the choices available to you.",
}

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: <p>This Privacy Policy explains how Invocly (“we,” “us,” or “our”) collects, uses, and shares information when you use our website and document-to-audio services.</p>,
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <ul>
        <li><strong>Account information:</strong> details such as your name and email address when you create or manage an account.</li>
        <li><strong>Billing information:</strong> subscription and transaction details. Payment credentials are handled by our payment provider.</li>
        <li><strong>Usage information:</strong> information about how you interact with pages, features, and conversion tools.</li>
        <li><strong>Uploaded content:</strong> documents, text, and voice samples you submit so we can provide the requested audio or voice feature.</li>
      </ul>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    content: (
      <ul>
        <li>Provide, maintain, secure, and troubleshoot the Invocly service.</li>
        <li>Process subscriptions and manage plan access.</li>
        <li>Communicate with you about your account, support requests, and important service updates.</li>
        <li>Understand feature usage and improve the quality and accessibility of Invocly.</li>
      </ul>
    ),
  },
  {
    id: "sharing",
    title: "Sharing and disclosure",
    content: <p>We do not sell or rent your personal information. We may share limited information with service providers that help us operate Invocly, including authentication, cloud hosting, analytics, email, speech processing, and payment providers. They may process information only for the services they provide to us.</p>,
  },
  {
    id: "content-processing",
    title: "Document and voice processing",
    content: <p>Your uploaded content is processed to perform the conversion or voice feature you request. We limit retention to what is reasonably necessary to deliver and operate the service, resolve technical issues, and meet legal obligations.</p>,
  },
  {
    id: "data-security",
    title: "Data security",
    content: <p>We use reasonable technical and organizational safeguards designed to protect information from unauthorized access, loss, misuse, or disclosure. No internet transmission or storage system can be guaranteed to be completely secure.</p>,
  },
  {
    id: "your-rights",
    title: "Your rights and choices",
    content: <p>Depending on where you live, you may have the right to access, correct, delete, or restrict the processing of your personal information, or object to certain uses. You can also manage your account and subscription settings through Invocly.</p>,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: <p>We may update this policy as our services or legal obligations change. We will post the latest version here and update the date shown at the top of the page. Please review it periodically.</p>,
  },
  {
    id: "related-policies",
    title: "Related policies",
    content: <p>For additional information, review our <Link href="/terms-of-service">Terms of Service</Link> and <Link href="/refund-pricing-policy">Refund & Pricing Policy</Link>.</p>,
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="A straightforward explanation of the information Invocly uses to deliver your audio securely."
      updatedAt="July 27, 2026"
      sections={sections}
    />
  )
}
