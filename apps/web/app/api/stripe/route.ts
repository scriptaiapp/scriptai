import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

     if (userError || !user) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    const charges = await stripe.charges.list({
        customer: existing?.stripe_customer_id, // Customer ID
        limit: 100,
    });

    // Or using PaymentIntents (recommended for newer integrations)
    const paymentIntents = await stripe.paymentIntents.list({
        customer: existing?.stripe_customer_id,
        limit: 100,
    });
    return NextResponse.json({
      charges,
      paymentIntents

    });
    } catch (error:any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}