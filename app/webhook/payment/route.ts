"use server";
import { updatePlan } from "@/models/updatePlan";
import crypto from "node:crypto";

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", {
      status: 500,
    });
  }

  // First, make sure the request is from Lemon Squeezy.
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  const digestHex = hmac.update(rawBody).digest("hex");
  const digest = Uint8Array.from(Buffer.from(digestHex, "hex"));
  const signatureHeader = request.headers.get("X-Signature") || "";
  const signature = Uint8Array.from(Buffer.from(signatureHeader, "hex"));

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response("Invalid signature", {
      status: 500,
    });
  }

  const body = JSON.parse(rawBody);

  const customerName = body.data.attributes.user_name
  const customerEmail = body.data.attributes.user_email;

  if (body.meta.event_name === "subscription_created") {
    await updatePlan({plan: 'premium', name: customerName, email: customerEmail})
    console.log('subscription created with success')
    // send email
    return new Response("Subscription Complete", { status: 200 });
  }

  if (body.meta.event_name === "subscription_cancelled" || body.meta.event_name === "subscription_expired") {
    await updatePlan({plan: 'free', name: customerName, email: customerEmail})
    console.log('subscription cancelled with success')
    // send email
    return new Response("Subscription Complete", { status: 200 });
  }

  return new Response("Webhook Processed", { status: 200 });
}