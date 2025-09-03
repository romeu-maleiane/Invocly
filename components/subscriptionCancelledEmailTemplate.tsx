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
import { getFormattedDate } from '@/lib/utils';

export const SubscriptionCancelledEmail = ({ firstName }: { firstName: string }) => {

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Invocly Premium subscription has been cancelled. We're sorry to see you go!</Preview>
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
                We're Sorry to See You Go
              </Heading>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Hi {firstName},
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                We wanted to confirm that your Invocly Premium subscription has been successfully cancelled as of {getFormattedDate(new Date())}. While we're sad to see you go, we completely understand that circumstances change.
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                Your account will remain active, and you can continue using Invocly with our free features. All your documents and settings will be preserved, so you won't lose any of your work.
              </Text>

              {/* What Happens Next */}
              <Section className="bg-[#2563EB]/10 p-[20px] rounded-[8px] mb-[24px]">
                <Text className="text-[#111827] text-[16px] mb-[12px] leading-[24px] font-semibold">
                  📋 What happens next:
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • Your account switches to our free plan immediately
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • All your documents and history remain safe
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • You can still convert documents with basic features
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  • No further charges will be made to your account
                </Text>
                <Text className="text-[#111827] text-[14px] leading-[20px]">
                  • You can reactivate Premium anytime you want
                </Text>
              </Section>
              
              <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                We'd love to know how we could have served you better. If you have a moment, we'd really appreciate your feedback to help us improve Invocly for everyone.
              </Text>

              {/* CTA Buttons */}
              <Section className="text-center mb-[32px]">
                <Button
                  href="https://invocly.com"
                  className="bg-[#2563EB] text-white px-[32px] py-[12px] rounded-[8px] text-[16px] font-semibold box-border mb-[12px] inline-block"
                >
                  Share Your Feedback
                </Button>
                <br />
                <Link href="https://invocly.com" className="text-[#2563EB] text-[14px] underline">
                  Continue with free plan
                </Link>
              </Section>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Remember, you're always welcome back! If you ever decide to give Premium another try, we'll be here with all the features you loved, plus any new improvements we've made along the way.
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[32px] leading-[24px]">
                Thank you for being part of our journey. We wish you all the best!<br />
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

