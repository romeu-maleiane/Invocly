import type { Metadata } from "next"
import { LegalPage, type LegalSection } from "@/components/legal-page"

export const metadata: Metadata = {
  title: "Terms of Service | Invocly",
  description: "The terms that govern your use of Invocly's document-to-audio service, accounts, subscriptions, and uploaded content.",
}

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: <p>Welcome to Invocly. These Terms of Service (“Terms”) govern your use of our website and services. By accessing or using Invocly, you agree to be bound by these Terms.</p>,
  },
  {
    id: "our-services",
    title: "Our services",
    content: <p>Invocly converts text from supported document formats into audio files. We offer free and paid plans with different features, usage limits, voice options, and file-size limits.</p>,
  },
  {
    id: "user-accounts",
    title: "User accounts",
    content: <p>Some features require an account. You are responsible for keeping your account credentials confidential and for activity that takes place through your account. Please provide accurate information and notify us if you believe your account has been compromised.</p>,
  },
  {
    id: "user-content",
    title: "Your content",
    content: <p>You retain ownership of the content you upload. You grant Invocly a limited, non-exclusive right to process and temporarily store that content only as needed to provide the document-to-audio service to you.</p>,
  },
  {
    id: "prohibited-activities",
    title: "Prohibited activities",
    content: (
      <div className="space-y-4">
        <p>You may not use Invocly for illegal, harmful, or unauthorized purposes. This includes:</p>
        <ul>
          <li>Uploading content that infringes intellectual-property or privacy rights.</li>
          <li>Uploading unlawful, defamatory, malicious, or abusive content.</li>
          <li>Attempting to disrupt, reverse engineer, or gain unauthorized access to the service.</li>
          <li>Using voice features to impersonate or deceive others without permission.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    content: <p>We may suspend or terminate access when these Terms are breached, the service is misused, or doing so is necessary to protect Invocly, our users, or third parties. You may stop using the service at any time and can manage an active subscription from your account.</p>,
  },
  {
    id: "warranties",
    title: "Disclaimer of warranties",
    content: <p>Invocly is provided “as is” and “as available,” without warranties of any kind to the extent permitted by law. We do not guarantee that the service will always be uninterrupted, error-free, or suitable for every purpose.</p>,
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: <p>To the extent permitted by law, Invocly will not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses resulting from your use of the service.</p>,
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: <p>We may update these Terms as the service evolves. The latest version will be posted on this page with a revised update date. Continued use of Invocly after an update means you accept the revised Terms.</p>,
  },
]

export default function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      description="Clear rules for using Invocly, managing your account, and working with document and voice features."
      updatedAt="July 27, 2026"
      sections={sections}
    />
  )
}
