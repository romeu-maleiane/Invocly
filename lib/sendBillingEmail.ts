'use server'
import { Resend } from 'resend'
import { BillingEmailTemplate } from '../components/billingEmailTemplate';

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
        console.error('Send BillingEmail Error: ', error)
    }
}