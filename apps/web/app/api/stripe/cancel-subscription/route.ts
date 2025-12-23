import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

   try {
     const { data: existing } = await supabase
        .from("subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", user?.id)
        .single()

    const subscriptionId = existing?.stripe_subscription_id
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });

   return NextResponse.json(updatedSubscription);
   } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
   }
}