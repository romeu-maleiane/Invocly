// 'use server'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { createCheckoutUrl } from '@/lib/lemon-squeezy/server'
import CheckoutLink from './checkoutLink'
import { SignInButton, useUser } from '@clerk/nextjs'

function BuyButton() {
    const { user, } = useUser()
    const [checkoutUrl, setCheckoutUrl] = useState<string>('')

    useEffect(() => {
         const handleCheckoutUrl = async () => {

            const checkoutUrl = await createCheckoutUrl({
                variantId: "964059",
                embed: false,
                userEmail: user?.emailAddresses[0].emailAddress || undefined,
                userId: user?.id || undefined
            });
            setCheckoutUrl(checkoutUrl || '')
        }
        handleCheckoutUrl()
    }, [user])

    return !user ? (
        <SignInButton forceRedirectUrl={'checkout-redirect'}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade to Premium
            </Button>
        </SignInButton>
    ) : (
        <CheckoutLink checkoutUrl={checkoutUrl || '/'} />
    )

}

export default BuyButton
