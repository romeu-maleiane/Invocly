'use server'
import { InsertUser } from "@/models/insertUser"
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from 'svix'
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server"

export const POST = async (request: NextRequest) => {
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!CLERK_WEBHOOK_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SECRET");
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    let event: WebhookEvent;

    try {
        event = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", {
            status: 400,
        });
    }

    if (event.type === 'user.created') {
        const { id, last_name, first_name, email_addresses } = event.data
        await InsertUser(id, first_name || '', last_name || '', email_addresses[0].email_address)
    }

    // send email
    console.log('User inserted successfuly')
    return NextResponse.json({ received: true }, { status: 200 })
}
