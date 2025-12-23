import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const { price_id, sub_type } = await req.json();

    const { data: existing } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", user?.id)
        .single()

    const subscriptionId = existing?.stripe_subscription_id

    const subscription: any = await stripe.subscriptions.retrieve(existing?.stripe_subscription_id);
    const subscriptionItemId = subscription.items.data[0].id;

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
            {
                id: subscriptionItemId,
                price: price_id,
            },
        ],
        proration_behavior: "none",
    });

    return NextResponse.json({ message: "Success!, New plan will start at the end of the month", updatedSubscription, status: 200 });
}