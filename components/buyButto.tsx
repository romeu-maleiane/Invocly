import { Button } from './ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useSubscription } from '@/hooks/use-subscription'

function BuyButton() {
    const { user, } = useUser()
    const { currentPlan } = useSubscription()
    const subscriptionId = process.env.NEXT_PUBLIC_POLAR_SUBSCRIPTION_ID

    if (user && currentPlan.id === "premium") {
        return (
            <Button className="md:w-[100%] h-fit text-center rounded-2xl border border-gray-500/20 bg-gray-500/10 py-1 px-2 text-base font-medium text-gray-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-gray-500/15 hover:border-gray-500/30 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 disabled:pointer-events-none disabled:opacity-50">
                Active Plan
            </Button>
        )
    }

    return !user ? (
        <SignInButton forceRedirectUrl={'checkout-redirect'}>
            <Button className="md:w-[100%] h-fit text-center cursor-pointer rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 text-base font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50">
                Upgrade to Premium
            </Button>
        </SignInButton>
    ) : (
        <Link href={`/checkout/?products=${subscriptionId}&customerExternalId=${user?.id}&customerEmail=${user?.emailAddresses[0].emailAddress}`}>
            <Button className="md:w-[100%] h-fit text-center cursor-pointer rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 text-base font-medium text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50">
                Upgrade to Premium
            </Button>
        </Link>
    )

}

export default BuyButton
