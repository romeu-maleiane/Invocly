import { Button } from './ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'

function BuyButton() {
    const { user, } = useUser()
    const subscriptionId = process.env.NEXT_PUBLIC_POLAR_SUBSCRIPTION_ID

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
