"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function TermsOfService() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <section>
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p>
                Welcome to Invocly! These Terms of Service ("Terms") govern your use of our website and services. By using our services, you agree to these Terms.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">2. Our Services</h2>
              <p>
                Invocly provides a service that converts text from various document formats into audio files. We offer different subscription plans with varying features and limits.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">3. User Accounts</h2>
              <p>
                To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">4. User Content</h2>
              <p>
                You retain ownership of the content you upload to our service. By uploading content, you grant us a non-exclusive license to use, process, and store your content to provide our services to you.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">5. Prohibited Activities</h2>
              <p>
                You may not use our services for any illegal or unauthorized purpose. You may not upload content that is infringing, defamatory, or otherwise unlawful.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">6. Termination</h2>
              <p>
                We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">7. Disclaimer of Warranties</h2>
              <p>
                Our services are provided "as is" and "as available" without any warranties of any kind. We do not warrant that our services will be uninterrupted or error-free.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
              <p>
                In no event shall Invocly be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on our website.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
