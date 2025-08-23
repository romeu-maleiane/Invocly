'use client'
import { createCheckoutUrl } from '@/lib/lemon-squeezy/server';
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect } from 'react';

function CheckoutRedirectPage() {
    const { user, } = useUser()
    const NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID = process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID
    if(!NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID) {
        console.error('NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID is required!')
        redirect('/')
    }
    useEffect(() => {
         const handleCheckoutUrl = async() => {
            const checkoutUrl = await createCheckoutUrl({
                variantId: NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID,
                embed: false,
                userEmail: user?.emailAddresses[0].emailAddress || undefined,
                userId: user?.id || undefined
            });
            console.log('Checkout Url',checkoutUrl)
            redirect(checkoutUrl || '/')
        }
        handleCheckoutUrl()
    },[user])   

    return (
        <div>
            Loading...
        </div>
    )
}

export default CheckoutRedirectPage
