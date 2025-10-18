import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";


export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { price_id, sub_type } = await req.json();

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()
    // const { data: profile } = await supabase
    //   .from("profiles")
    //   .select("full_name")
    //   .eq("user_id", user.id)
    //   .single()

      
    //   let customerId = existing?.stripe_customer_id
    //   console.log(existing, "profile")

    // if (!customerId) {
    //   const customer = await stripe.customers.create({
    //     name: profile?.full_name,
    //     metadata: { user_id: user.id, sub_type: sub_type },
    //     email: user.email
    //   })
    //   customerId = customer.id
    // }

    // const session = await stripe.checkout.sessions.create({
    //   mode: "subscription",
    //   payment_method_types: ["card"],
    //   customer: customerId,
    //   line_items: [
    //     {
    //       price: price_id, // e.g. "price_12345"
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    //   metadata: {
    //     user_id: user.id
    //   }
    // });


   

    return NextResponse.json({
      // url: session.url
      url: "Done"

    });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
