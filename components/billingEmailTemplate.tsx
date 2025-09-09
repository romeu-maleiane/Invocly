import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Button,
  Hr,
} from '@react-email/components';

export const BillingEmailTemplate = ({ firstName }: { firstName: string }) => {

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to Invocly Premium! Thank you for joining us.</Preview>
      <Tailwind>
        <Body className="bg-[#F0F9FA] py-[40px] font-sans">
          <Container className="bg-[#FFFFFF] mx-auto px-[24px] py-[32px] rounded-[8px] max-w-[600px]">
            {/* Logo */}
            <Section className="text-center mb-[32px]">
              <Img
                src="https://invocly.com/placeholder-logo.png"
                alt="Invocly"
                className="w-full h-auto object-cover max-w-[200px] mx-auto"
              />
            </Section>

            {/* Main Content */}
            <Section>
              <Heading className="text-[#111827] text-[28px] font-bold mb-[24px] text-center">
                Welcome to Invocly Premium! 🎉
              </Heading>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Hi {firstName},
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Thank you so much for choosing Invocly Premium! We're incredibly grateful for your trust in our document-to-speech conversion platform.
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                With your new Premium subscription, you now have access to exclusive features that will make your document-to-speech experience even more amazing:
              </Text>

              {/* Premium Features */}
              <Section className="bg-blue-50 p-[20px] rounded-[8px] mb-[24px]">
                <Text className="text-[#111827] text-[16px] mb-[12px] leading-[24px] font-semibold">
                  ✨ Your new Premium benefits:
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • Unlimited document conversions
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • Voice cloning feature
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • Premium voices 
                </Text>
                <Text className="text-[#111827] text-[14px] leading-[20px]">
                  • 50MB file size limit
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • Priority support
                </Text>
              </Section>
              
              <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                We're here to ensure you have the best possible experience with Invocly. If you have any questions or need assistance, our support team is always ready to help you make the most of your Premium features.
              </Text>

              {/* CTA Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href="https://invocly.com"
                  className="bg-[#2563EB] text-white px-[32px] py-[12px] rounded-[8px] text-[16px] font-semibold box-border"
                >
                  Start Using Premium
                </Button>
              </Section>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Once again, thank you for being part of the Invocly family. We're excited to see how you'll make the most of your new Premium features!
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[32px] leading-[24px]">
                With gratitude,<br />
                The Invocly Team
              </Text>
            </Section>

            {/* Divider */}
            <Hr className="border-[#E5E7EB] my-[32px]" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-[#6B7280] text-[12px] mb-[16px] leading-[16px]">
                <Link href="https://invocly.com" className="text-[#2563EB]">Refund & Pricing Policy</Link> | 
                <Link href="https://invocly.com" className="text-[#2563EB]"> Terms of Service</Link> | 
                <Link href="https://invocly.com" className="text-[#2563EB]"> Privacy Policy</Link>
              </Text>
              
              <Text className="text-[#6B7280] text-[12px] m-0 leading-[16px]">
                © 2025 Invocly. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

