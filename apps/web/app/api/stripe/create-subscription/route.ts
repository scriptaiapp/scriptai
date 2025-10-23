import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";


export async function POST(req: Request) {
  const supabase = await createClient();
  const pro__plan = process.env.NEXT_PUBLIC_PRO_PRICE
    const enterprice_plan = process.env.NEXT_PUBLIC__ENTERPRICE_PLAN
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { sub_type, plan_id, stripe_customer_id } = await req.json();

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, plan_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single()
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
    
    // if(existing?.plan_id === plan_id){
    //   return NextResponse.json({ error: `${sub_type} is your active plan, Please select a different active. plan if you want to upgrade` }, { status: 400 });
    // }

    let customerId;

    if(stripe_customer_id) {
      customerId = stripe_customer_id
    }else {
        const customer = await stripe.customers.create({
        name: profile?.full_name,
        metadata: { user_id: user.id },
        email: user.email
      })
      customerId = customer.id
    }

    


    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price: sub_type === "Pro" ? pro__plan : enterprice_plan,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        user_id: user.id,
        sub_type: sub_type,
        plan_id: plan_id
      },
      subscription_data: {
    metadata: {
      user_id: user.id,
      sub_type,
      plan_id,
    }
  }
    });




    return NextResponse.json({
      url: session.url

    });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
