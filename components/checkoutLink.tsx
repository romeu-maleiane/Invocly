'use client'
import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'


interface CheckoutLinkProps {
    checkoutUrl: string
}
function CheckoutLink({ checkoutUrl }: CheckoutLinkProps) {
    return (
        <Link href={checkoutUrl}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Upgrade to Premium
            </Button>
        </Link>
    )
}

export default CheckoutLink
