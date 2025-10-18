import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/webhook";
import { SubType } from "@/types/subscription";



export async function POST(req: Request) {
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
            case "checkout.session.completed": {
                const session = event.data.object as any;
                const subscriptionId = session.subscription;
                const customerId = session.customer;
                let userId = session.metadata?.user_id;
                let sub_type: SubType = session.metadata?.sub_type;
                console.log("customerId: ", session)

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

                // console.log("subscription created", userId);

                // Read current credits and update
                try {
                    const { data: userRow, error: fetchError } = await supabaseAdmin
                        .from("profiles")
                        .select("credits")
                        .eq("user_id", userId)
                        .single();

                    if (fetchError) {
                        console.error("Failed to fetch user for credit update:", fetchError);
                        break;
                    }
                    const amount_to_add = sub_type === "Pro" ? 300 : 1000;
                    const currentCredits = (userRow as any)?.credits ?? 0;
                    const newCredits = currentCredits + amount_to_add

                    const { error: updateError } = await supabaseAdmin
                        .from("profiles")
                        .update({ credits: newCredits })
                        .eq("user_id", userId);

                    if (updateError) {
                        console.error("Failed to update user credits:", updateError);
                        break;
                    }

                    const { data: existing, error } = await supabaseAdmin
                        .from("subscriptions")
                        .select("stripe_customer_id, stripe_subscription_id")
                        .eq("user_id", userId)
                        .single()

                    let ExistingCustomerId = existing?.stripe_customer_id

                     const subscription_data: any = await stripe.subscriptions.retrieve(subscriptionId);
                        const subscriptionItemEndDate = subscription_data.items.data[0].current_period_end;
                        const expires = new Date(subscriptionItemEndDate * 1000)
                        console.log("subscriptionItemEndDate: ",subscriptionItemEndDate)
                   
                    if (ExistingCustomerId !== customerId) {
                        const { error } = await supabaseAdmin.from("subscriptions").upsert({
                            user_id: userId,
                            // payment_details: session,
                            stripe_customer_id: customerId,
                            stripe_subscription_id: session.subscription,
                            subscription_type: sub_type,
                            subscription_end_date: expires.toUTCString()
                        })

                        if (error) {
                            console.log(error, "errorrr")
                            return NextResponse.json({ message: 'Something happened', error }, { status: 401 });
                        }

                    }
                    if (ExistingCustomerId === customerId) {
                        const { error } = await supabaseAdmin.from("subscriptions").update({
                            // payment_details: session,
                            stripe_subscription_id: session.subscription,
                            subscription_type: sub_type.toLocaleLowerCase(),
                            subscription_end_date: expires.toUTCString()
                        }).eq("user_id", userId);

                        if (error) {
                            console.log(error, "errorrr")
                            return NextResponse.json({ message: 'Something happened', error }, { status: 401 });
                        }
                    }
                } catch (err) {
                    console.error("Error updating credits:", err);
                }
                break;
            }

            case "customer.subscription.created": {
                const sub = event.data.object as any;
                
                console.log(sub)
                break;
            }
            case "invoice.payment_succeeded": {
                const invoice = event.data.object as any;
                const customerId = invoice.customer;
                const customer = await stripe.customers.retrieve(customerId);
                const userId = (customer as any).metadata.userId;
                // console.log(invoice, "invoice")

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
                // console.log(invoice, "invoice")

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

                const { error } = await supabaseAdmin.from("subscriptions").update({
                    subscription_type: "cancelled",
                }).eq("user_id", userId);
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
