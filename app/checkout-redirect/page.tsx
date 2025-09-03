'use client'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { useEffect } from 'react';

function CheckoutRedirectPage() {
    const { user, } = useUser()
    const subscriptionId = process.env.NEXT_PUBLIC_POLAR_SUBSCRIPTION_ID || ""

    if(!subscriptionId) {
        console.error('subscriptionId is required!')
        redirect('/')
    }
    
    useEffect(() => {
        redirect(`/checkout/?products=${subscriptionId}&customerExternalId=${user?.id}&customerEmail=${user?.emailAddresses[0].emailAddress}`)
    },[user])   

    return (
        <div>
            Loading...
        </div>
    )
}

export default CheckoutRedirectPage
