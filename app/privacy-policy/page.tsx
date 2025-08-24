"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              This Privacy Policy describes how Invocly ("we", "us", or "our") collects, uses, and discloses your personal information when you use our website and services.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <p>
              We may collect the following types of information:
            </p>
            <ul className="list-disc list-inside">
              <li>
                <strong>Personal Information:</strong> When you create an account, you may provide us with personal information such as your name, email address, and payment information.
              </li>
              <li>
                <strong>Usage Information:</strong> We may collect information about how you use our services, such as the pages you visit and the features you use.
              </li>
              <li>
                <strong>Content:</strong> We collect the content you upload to our services in order to provide our text-to-audio conversion service.
              </li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
            <p>
              We may use your information for the following purposes:
            </p>
            <ul className="list-disc list-inside">
              <li>To provide and maintain our services.</li>
              <li>To process your payments and subscriptions.</li>
              <li>To communicate with you about your account and our services.</li>
              <li>To improve our services and develop new features.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold">4. Information Sharing and Disclosure</h2>
            <p>
              We do not sell or rent your personal information to third parties. We may share your information with third-party service providers who assist us in providing our services, such as payment processors and cloud hosting providers.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">5. Data Security</h2>
            <p>
              We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. You can also object to the processing of your personal information or request that we restrict the processing of your personal information.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold">7. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
