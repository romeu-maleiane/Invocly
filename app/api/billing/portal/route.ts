import { Polar } from "@polar-sh/sdk";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user via Clerk
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Retrieve the Polar access token
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("POLAR_ACCESS_TOKEN environment variable is not defined");
      return new NextResponse("Server Configuration Error", { status: 500 });
    }

    // 3. Initialize Polar client
    const polar = new Polar({
      accessToken: accessToken,
    });

    // 4. Create customer portal session using the Clerk User ID as external ID
    const session = await polar.customerSessions.create({
      externalCustomerId: userId,
    });

    if (!session || !session.customerPortalUrl) {
      console.error("Failed to create customer session from Polar.sh", session);
      return NextResponse.redirect(new URL("/?error=portal_failed", req.nextUrl.origin));
    }

    // 5. Perform secure 307 redirect to the customer portal URL
    return NextResponse.redirect(session.customerPortalUrl);
  } catch (error) {
    console.error("Error creating Polar billing session:", error);
    // If the customer doesn't exist or hasn't paid, redirect them back with error details
    return NextResponse.redirect(new URL("/?error=no_billing_found", req.nextUrl.origin));
  }
}
