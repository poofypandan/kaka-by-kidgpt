import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MIDTRANS_CONFIG = {
  serverKey: Deno.env.get('MIDTRANS_SERVER_KEY'),
  isProduction: Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { transactionId } = await req.json();

    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    console.log('Checking payment status for:', transactionId);

    // Check Midtrans transaction status
    const midtransUrl = MIDTRANS_CONFIG.isProduction 
      ? `https://api.midtrans.com/v2/${transactionId}/status`
      : `https://api.sandbox.midtrans.com/v2/${transactionId}/status`;

    const midtransAuth = btoa(`${MIDTRANS_CONFIG.serverKey}:`);
    
    const midtransResponse = await fetch(midtransUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${midtransAuth}`,
      },
    });

    if (!midtransResponse.ok) {
      throw new Error('Failed to check payment status');
    }

    const paymentStatus = await midtransResponse.json();
    console.log('Midtrans payment status:', paymentStatus);

    // Update payment history in database
    const { error: updateError } = await supabaseClient
      .from('payment_history')
      .update({
        status: mapMidtransStatus(paymentStatus.transaction_status),
        metadata: {
          ...paymentStatus,
          updated_at: new Date().toISOString()
        }
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      console.error('Failed to update payment history:', updateError);
    }

    // If payment is successful, update subscription
    if (paymentStatus.transaction_status === 'settlement' || 
        paymentStatus.transaction_status === 'capture') {
      
      // Get payment record to find family and tier info
      const { data: paymentRecord } = await supabaseClient
        .from('payment_history')
        .select('family_id, metadata')
        .eq('transaction_id', transactionId)
        .single();

      if (paymentRecord && paymentRecord.metadata?.tier) {
        const tier = paymentRecord.metadata.tier;
        const familyId = paymentRecord.family_id;

        // Update or create subscription
        const { error: subscriptionError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            family_id: familyId,
            tier: tier,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            payment_method: paymentRecord.metadata?.payment_method || 'midtrans',
            last_payment_date: new Date().toISOString()
          }, {
            onConflict: 'family_id'
          });

        if (subscriptionError) {
          console.error('Failed to update subscription:', subscriptionError);
        } else {
          console.log('Subscription updated successfully for family:', familyId);
        }

        // Update family billing status
        const { error: familyError } = await supabaseClient
          .from('families')
          .update({
            subscription_tier: tier,
            billing_status: 'active',
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', familyId);

        if (familyError) {
          console.error('Failed to update family billing:', familyError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction_status: paymentStatus.transaction_status,
        payment_status: mapMidtransStatus(paymentStatus.transaction_status),
        midtrans_data: paymentStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment status check error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to check payment status'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function mapMidtransStatus(midtransStatus: string): string {
  const statusMap: Record<string, string> = {
    'capture': 'paid',
    'settlement': 'paid',
    'pending': 'pending',
    'deny': 'failed',
    'cancel': 'cancelled',
    'expire': 'expired',
    'failure': 'failed'
  };

  return statusMap[midtransStatus] || 'unknown';
}