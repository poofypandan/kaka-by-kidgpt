import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  tier: string;
  paymentMethod: string;
  amount: number;
  currency: string;
}

const MIDTRANS_CONFIG = {
  serverKey: Deno.env.get('MIDTRANS_SERVER_KEY'),
  isProduction: Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true',
  clientKey: Deno.env.get('MIDTRANS_CLIENT_KEY'),
};

const TIER_CONFIGS = {
  basic: {
    name: 'Paket Dasar Kaka',
    price: 49000, // IDR 49,000
    features: ['2 anak', '500 pesan/bulan', '1 akun orangtua']
  },
  premium: {
    name: 'Paket Premium Kaka', 
    price: 99000, // IDR 99,000
    features: ['5 anak', '2000 pesan/bulan', '2 akun orangtua', 'Laporan detail']
  },
  unlimited: {
    name: 'Paket Tak Terbatas Kaka',
    price: 149000, // IDR 149,000
    features: ['Anak tak terbatas', 'Pesan tak terbatas', 'Akun orangtua tak terbatas', 'Dukungan prioritas']
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const requestBody: PaymentRequest = await req.json();
    const { tier, paymentMethod, amount, currency } = requestBody;

    console.log('Creating Midtrans payment:', { tier, paymentMethod, amount, currency });

    // Validate tier
    const tierConfig = TIER_CONFIGS[tier as keyof typeof TIER_CONFIGS];
    if (!tierConfig) {
      throw new Error('Invalid subscription tier');
    }

    // Get family information
    const { data: familyMember } = await supabaseClient
      .from('family_members')
      .select(`
        family_id,
        families!inner (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (!familyMember) {
      throw new Error('Family not found');
    }

    // Generate unique order ID
    const orderId = `KAKA-${familyMember.family_id.slice(0, 8)}-${Date.now()}`;

    // Prepare Midtrans transaction data
    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Parent',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      },
      item_details: [
        {
          id: tier,
          name: tierConfig.name,
          price: amount,
          quantity: 1,
          category: 'Subscription'
        }
      ],
      enabled_payments: getEnabledPayments(paymentMethod),
      callbacks: {
        finish: `${req.headers.get('origin')}/payment-success?order_id=${orderId}`,
        error: `${req.headers.get('origin')}/payment-error?order_id=${orderId}`,
        pending: `${req.headers.get('origin')}/payment-pending?order_id=${orderId}`
      },
      custom_field1: familyMember.family_id,
      custom_field2: tier,
      custom_field3: user.id
    };

    // Create Midtrans transaction
    const midtransUrl = MIDTRANS_CONFIG.isProduction 
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const midtransAuth = btoa(`${MIDTRANS_CONFIG.serverKey}:`);
    
    const midtransResponse = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${midtransAuth}`,
      },
      body: JSON.stringify(transactionData)
    });

    if (!midtransResponse.ok) {
      const errorData = await midtransResponse.text();
      console.error('Midtrans API error:', errorData);
      throw new Error('Failed to create payment transaction');
    }

    const midtransResult = await midtransResponse.json();

    // Record payment attempt in database
    const { error: paymentError } = await supabaseClient
      .from('payment_history')
      .insert({
        family_id: familyMember.family_id,
        amount: amount,
        currency: currency,
        payment_method: paymentMethod,
        payment_provider: 'midtrans',
        transaction_id: orderId,
        status: 'pending',
        metadata: {
          tier: tier,
          midtrans_token: midtransResult.token,
          payment_method: paymentMethod
        }
      });

    if (paymentError) {
      console.error('Failed to record payment history:', paymentError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: midtransResult.redirect_url,
        token: midtransResult.token,
        order_id: orderId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getEnabledPayments(paymentMethod: string): string[] {
  const paymentMap: Record<string, string[]> = {
    'dana': ['gopay', 'shopeepay', 'other_qris'],
    'gopay': ['gopay'],
    'ovo': ['other_qris'],
    'shopeepay': ['shopeepay'],
    'bca': ['bank_transfer'],
    'mandiri': ['bank_transfer'],
    'bni': ['bank_transfer'],
    'bri': ['bank_transfer'],
    'alfamart': ['cstore'],
    'indomaret': ['cstore'],
    'kredivo': ['kredivo'],
    'akulaku': ['akulaku']
  };

  return paymentMap[paymentMethod] || ['bank_transfer', 'gopay', 'other_qris'];
}