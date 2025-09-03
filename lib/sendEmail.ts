'use server'
import { Resend } from 'resend'
import { BillingEmailTemplate } from '../components/billingEmailTemplate';
import { SubscriptionExpiredEmail } from '@/components/expiredSubscriptionEmailTemplate';
import { SubscriptionCancelledEmail } from '@/components/subscriptionCancelledEmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendBillingEmail = async ({ name, email }: { name: string, email: string }) => {
    try {
        const { error } = await resend.emails.send({
            from: 'Invocly <not-reply@billing.invocly.com>',
            to: [email],
            subject: 'Thanks for subscribing to Invocly',
            react: BillingEmailTemplate({ firstName: name }),
        });

        if(error) throw new Error(error.message)

    } catch (error) {
        console.error('Send Billing Email Error: ', error)
    }
}

export const sendSubscriptionExpiredEmail = async ({ name, email }: { name: string, email: string }) => {
    try {
        const { error } = await resend.emails.send({
            from: 'Invocly <not-reply@billing.invocly.com>',
            to: [email],
            subject: 'Invocly premium expired',
            react: SubscriptionExpiredEmail({ firstName: name }),
        });

        if(error) throw new Error(error.message)

    } catch (error) {
        console.error('Send Subscription Expired Email Error: ', error)
    }
}

export const sendSubscritionCancelledEmail = async ({ name, email }: { name: string, email: string }) => {
    try {
        const { error } = await resend.emails.send({
            from: 'Invocly <not-reply@billing.invocly.com>',
            to: [email],
            subject: 'Invocly premium cancelled',
            react: SubscriptionCancelledEmail({ firstName: name }),
        });

        if(error) throw new Error(error.message)

    } catch (error) {
        console.error('Send BillingEmail Error: ', error)
    }
}