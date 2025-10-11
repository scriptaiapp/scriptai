import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.created": {
                const session = event.data.object as any;
                const subscriptionId = session.subscription;
                const customerId = session.customer;
                let userId = session.metadata?.user_id ?? session.metadata?.userId;

                if (!userId) {
                    try {
                        const customer = await stripe.customers.retrieve(customerId);
                        userId = (customer as any).metadata?.user_id ?? (customer as any).metadata?.userId;
                    } catch (err) {
                        console.error("Failed to retrieve Stripe customer:", err);
                    }
                }

                if (!userId) {
                    console.warn("No userId found for subscription.created event, skipping credit increment.");
                    break;
                }

                console.log("subscription created", session);

                // Read current credits and update
                try {
                    const { data: userRow, error: fetchError } = await supabase
                        .from("profiles")
                        .select("credits")
                        .eq("user_id", userId)
                        .single();

                    if (fetchError) {
                        console.error("Failed to fetch user for credit update:", fetchError);
                        break;
                    }

                    const currentCredits = (userRow as any)?.credits ?? 0;
                    console.log("currentCredits: ", currentCredits)
                    const newCredits = currentCredits + 60;

                    const { error: updateError } = await supabase
                        .from("profiles")
                        .update({ credits: newCredits })
                        .eq("user_id", userId);

                    if (updateError) {
                        console.error("Failed to update user credits:", updateError);
                        break;
                    }

                    console.log(`Added 60 credits to user ${userId}. New total: ${newCredits}`);
                } catch (err) {
                    console.error("Error updating credits:", err);
                }

                // await db.user.update({
                //   where: { id: userId },
                //   data: {
                //     stripeSubscriptionId: subscriptionId,
                //     status: "active",
                //   },
                // });
                break;
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const userId = (customer as any).metadata.userId;
                console.log(invoice, "invoice")

                // await db.user.update({
                //   where: { id: userId },
                //   data: { status: "active" },
                // });
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const userId = (customer as any).metadata.userId;
                console.log(invoice, "invoice")

                // await db.user.update({
                //   where: { id: userId },
                //   data: { status: "past_due" },
                // });
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as any;
                const customerId = subscription.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const userId = (customer as any).metadata.userId;

                // await db.user.update({
                //   where: { id: userId },
                //   data: { status: "canceled" },
                // });
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error("Webhook handler failed:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
