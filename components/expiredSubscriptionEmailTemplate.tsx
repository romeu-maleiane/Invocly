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

export const SubscriptionExpiredEmail = ({ firstName }: { firstName: string }) => {

    return (
        <Html lang="en" dir="ltr">
            <Head />
            <Preview>Your Invocly Premium subscription has expired. Renew now to continue enjoying premium features!</Preview>
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
                                Your Premium Subscription Has Expired
                            </Heading>

                            <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                                Hi {firstName},
                            </Text>

                            <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                                We hope you've been enjoying your Invocly Premium experience! We wanted to let you know that your Premium subscription expired on {getFormattedDate(new Date())}.
                            </Text>

                            <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                                Don't worry though – your account is still active, and you can continue using Invocly with our free features. However, you'll no longer have access to your Premium benefits until you renew your subscription.
                            </Text>

                            {/* What You're Missing */}
                            <Section className="bg-blue-50 p-[20px] rounded-[8px] mb-[24px] border-l-4 border-red-400">
                                <Text className="text-[#111827] text-[16px] mb-[12px] leading-[24px] font-semibold">
                                    ⚠️ Premium features you're missing out on:
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
                                    • Advanced audio controls
                                </Text>
                                <Text className="text-[#111827] text-[14px] leading-[20px]">
                                    • 50MB file size limit
                                </Text>
                                <Text className="text-[#111827] text-[14px] mb-[8px] leading-[20px]">
                                    • Priority support
                                </Text>
                            </Section>

                            <Text className="text-[#111827] text-[16px] mb-[24px] leading-[24px]">
                                The good news is that renewing is quick and easy! You can get back to enjoying all your Premium features in just a few clicks, and all your previous settings and preferences will be restored automatically.
                            </Text>

                            {/* CTA Buttons */}
                            <Section className="text-center mb-[32px]">
                                <Button
                                    href="https://invocly.com"
                                    className="bg-[#2563EB] text-white px-[32px] py-[12px] rounded-[8px] text-[16px] font-semibold box-border mb-[12px] inline-block"
                                >
                                    Renew Premium Now
                                </Button>
                                <br />
                                <Link href="https://invocly.com" className="text-[#2563EB] text-[14px] underline">
                                    View pricing plans
                                </Link>
                            </Section>

                            <Text className="text-[#111827] text-[16px] mb-[20px] leading-[24px]">
                                If you have any questions about your subscription or need help with renewal, our support team is here to assist you. We'd love to have you back as a Premium member!
                            </Text>

                            <Text className="text-[#111827] text-[16px] mb-[32px] leading-[24px]">
                                Thank you for being part of the Invocly community.<br />
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
                                © {new Date().getFullYear()} Invocly. All rights reserved.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};
