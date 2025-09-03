import { updatePlan } from "@/models/updatePlan";
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onSubscriptionActive: async (payload) => {
        const customerId = payload.data.customer.externalId
        const customerEmail = payload.data.customer.email
        await updatePlan({ plan: 'premium', id: customerId || '', email: customerEmail })
        console.log('subscription created with success')
    },
    onSubscriptionRevoked: async (payload) => {
        const customerId = payload.data.customer.externalId
        const customerEmail = payload.data.customer.email
        await updatePlan({ plan: 'free', id: customerId || '', email: customerEmail })
        console.log('subscription cancelled with success')
    },
    onSubscriptionCanceled: async (payload) => {
        const customerId = payload.data.customer.externalId
        const customerEmail = payload.data.customer.email
        await updatePlan({ plan: 'free', id: customerId || '', email: customerEmail })
        console.log('subscription cancelled with success')
    },
});