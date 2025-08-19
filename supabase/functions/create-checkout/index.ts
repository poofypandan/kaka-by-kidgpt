import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Plan configurations for Indonesian market
const PLAN_CONFIGS = {
  'growing-minds': {
    name: 'Growing Minds',
    price: 55000, // IDR
    limits: { children: 2, monthlyMessages: 500, parentAccounts: 1 }
  },
  'bright-futures': {
    name: 'Bright Futures',
    price: 75000, // IDR
    limits: { children: 4, monthlyMessages: 1500, parentAccounts: 2 }
  },
  'limitless-potential': {
    name: 'Limitless Potential',
    price: 255000, // IDR
    limits: { children: -1, monthlyMessages: -1, parentAccounts: 4 }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { planId, limits, priceInCents } = await req.json();
    if (!planId || !PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS]) {
      throw new Error("Invalid plan ID");
    }

    const planConfig = PLAN_CONFIGS[planId as keyof typeof PLAN_CONFIGS];
    logStep("Plan configuration retrieved", { planId, planConfig });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "idr",
            product_data: { 
              name: planConfig.name,
              description: `Paket ${planConfig.name} - Hingga ${planConfig.limits.children === -1 ? 'unlimited' : planConfig.limits.children} anak, ${planConfig.limits.monthlyMessages === -1 ? 'unlimited' : planConfig.limits.monthlyMessages} pesan/bulan`
            },
            unit_amount: planConfig.price * 100, // Convert IDR to cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/subscription?canceled=true`,
      metadata: {
        plan_id: planId,
        user_id: user.id,
        children_limit: planConfig.limits.children.toString(),
        monthly_messages_limit: planConfig.limits.monthlyMessages.toString(),
        parent_accounts_limit: planConfig.limits.parentAccounts.toString()
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});