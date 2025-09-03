import { sendBillingEmail } from "@/lib/sendBillingEmail";
import { updatePlan } from "@/models/updatePlan";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onSubscriptionActive: async (payload) => {
        const customerId = payload.data.customer.externalId
        const customerName = payload.data.customer.name?.split(' ') || ''
        const customerEmail = payload.data.customer.email
        await updatePlan({ plan: 'premium', id: customerId || '', email: customerEmail })
        sendBillingEmail({ name: customerName[0], email: customerEmail })
    },
    onSubscriptionRevoked: async (payload) => {
        const customerId = payload.data.customer.externalId
        const customerEmail = payload.data.customer.email
        await updatePlan({ plan: 'free', id: customerId || '', email: customerEmail })
    },
    onSubscriptionCanceled: async (payload) => {
        const customerId = payload.data.customer.externalId
        const customerEmail = payload.data.customer.email
        await updatePlan({ plan: 'free', id: customerId || '', email: customerEmail })
    },
});