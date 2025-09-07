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

export const NewUserWelcomeEmail = ({ firstName }: { firstName: string }) => {

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to Invocly! Transform your documents into lifelike speech in seconds.</Preview>
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
                Welcome to Invocly! 🎉
              </Heading>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Hi {firstName},
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Welcome to Invocly! We're thrilled to have you join our community of users who are transforming the way they consume written content through lifelike speech conversion.
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                You've just unlocked a powerful tool that will make your documents more accessible, help you multitask better, and give your eyes a well-deserved break. Let's get you started!
              </Text>

              {/* Getting Started Steps */}
              <Section className="bg-blue-50 p-[20px] rounded-[8px] mb-[24px]">
                <Text className="text-[#111827] text-[16px] mb-[16px] leading-[24px] font-semibold">
                  🚀 Getting started is easy:
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[12px] leading-[20px]">
                  <strong>Step 1:</strong> Upload your first document (PDF, Word, or text file)
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[12px] leading-[20px]">
                  <strong>Step 2:</strong> Choose from our selection of natural-sounding voices
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[12px] leading-[20px]">
                  <strong>Step 3:</strong> Hit convert and listen to your document come to life!
                </Text>
                <Text className="text-[#111827] text-[14px] leading-[20px]">
                  <strong>Step 4:</strong> Download your audio file or listen online
                </Text>
              </Section>

              {/* CTA Button */}
              <Section className="text-center mb-[32px]">
                <Button
                  href="https://invocly.com"
                  className="bg-[#2563EB] text-white px-[32px] py-[12px] rounded-[8px] text-[16px] font-semibold box-border"
                >
                  Convert Your First Document
                </Button>
              </Section>

              {/* Free Plan Features */}
              <Text className="text-[#111827] text-[16px] mb-[16px] leading-[24px]">
                With your free account, you can:
              </Text>
              
              <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                ✓ Convert up to 3 documents
              </Text>
              <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                ✓ Access to basic voice selection
              </Text>
              <Text className="text-[#111827] text-[14px] mb-[24px] leading-[20px]">
                ✓ 5MB file size limit
              </Text>

              {/* Premium Upgrade Section */}
              <Section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-[24px] rounded-[8px] mb-[24px] border border-blue-200">
                <Text className="text-[#111827] text-[18px] mb-[16px] leading-[24px] font-bold text-center">
                  🌟 Ready for the full Invocly experience?
                </Text>
                
                <Text className="text-[#111827] text-[16px] mb-[16px] leading-[24px]">
                  Upgrade to Premium and unlock the complete power of document-to-speech conversion:
                </Text>
                
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  📄 <strong>Unlimited documents</strong> - Convert as many files as you need
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  🎭 <strong>Voice cloning feature</strong> - Create custom voices that sound like you
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  🎤 <strong>Premium voices</strong> - Studio-quality, lifelike speech options
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  🎛️ <strong>Advanced audio controls</strong> - Fine-tune speed, pitch, and more
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                  📁 <strong>50MB file size limit</strong> - Handle larger documents with ease
                </Text>
                <Text className="text-[#111827] text-[14px] mb-[20px] leading-[20px]">
                  💬 <strong>Priority support</strong> - Get help when you need it most
                </Text>

                <Section className="text-center">
                  <Button
                    href="https://invocly.com"
                    className="bg-[#2563EB] text-white px-[32px] py-[12px] rounded-[8px] text-[16px] font-semibold box-border"
                  >
                    Upgrade to Premium
                  </Button>
                  <br />
                  <Text className="text-[#2563EB] text-[14px] mt-[8px] leading-[20px]">
                    Start your free!
                  </Text>
                </Section>
              </Section>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Whether you're a student looking to absorb information faster, a professional who needs to multitask, someone with accessibility needs who benefits from audio content, or anyone who simply prefers listening to reading, Invocly is here to make your life easier.
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                Have questions? Our friendly support team is always ready to help you get the most out of Invocly. Just reply to this email or visit our help center.
              </Text>
              
              <Text className="text-[#111827] text-[16px] mb-[32px] leading-[24px]">
                Welcome aboard, and happy converting!<br />
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

