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
            <Button className="w-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed" disabled>
                Active Plan
            </Button>
        )
    }

    return !user ? (
        <SignInButton forceRedirectUrl={'checkout-redirect'}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade to Premium
            </Button>
        </SignInButton>
    ) : (
        <Link href={`/checkout/?products=${subscriptionId}&customerExternalId=${user?.id}&customerEmail=${user?.emailAddresses[0].emailAddress}`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade to Premium
            </Button>
        </Link>
    )

}

export default BuyButton
