'use client'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/hooks/use-subscription"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useState, useEffect } from "react"
import { VoiceOption } from "@/components/voice-selection"
import { getVoices } from "@/lib/getVoices"

import Link from 'next/link'

export function Header() {
    const { currentPlan, } = useSubscription()
    const { user } = useUser()

    return (
        <header className="flex justify-between items-center p-4  dark:bg-gray-800 ">
            <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image src='/placeholder-logo.png' alt='Logo' width={40} height={20} className="h-10 w-auto" />
                    <span className="text-xl font-semibold text-gray-900 dark:text-white">Home</span>
                </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {user && (<div className='flex items-center gap-2 sm:gap-4'>
                    <Badge variant={currentPlan.id === "premium" ? "default" : "secondary"} className="text-sm py-1 rounded-full">
                        {currentPlan.name} Plan
                    </Badge>
                </div>)}

                <div className='flex items-center gap-2 sm:gap-4'>
                    <SignedOut>
                        <SignInButton />
                        <SignUpButton>
                            <Button size='sm' className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full">
                                Sign Up
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>  
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </header>
    )
}
