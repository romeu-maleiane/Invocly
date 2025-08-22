'use server'
import { InsertUser } from "@/models/insertUser"
import { type NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
    const event = await request.json()

    if(event.type === 'user.created'){
        const { id, last_name, first_name,  email_addresses } = event.data
        await InsertUser(id, first_name, last_name, email_addresses[0])
    }

    console.log('User inserted successfuly')
    return NextResponse.json({ received: true }, { status: 200 })
}
