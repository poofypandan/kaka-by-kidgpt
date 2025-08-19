import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Subscription {
  id: string;
  family_id: string;
  tier: string;
  status: string;
  current_period_end?: string;
  payment_method?: string;
  last_payment_date?: string;
}

export interface PaymentOption {
  id: string;
  name: string;
  type: 'digital_wallet' | 'bank_transfer' | 'convenience_store' | 'installment';
  icon: string;
  description: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  // Digital Wallets
  { id: 'dana', name: 'DANA', type: 'digital_wallet', icon: '💳', description: 'Bayar dengan DANA' },
  { id: 'gopay', name: 'GoPay', type: 'digital_wallet', icon: '🏍️', description: 'Bayar dengan GoPay' },
  { id: 'ovo', name: 'OVO', type: 'digital_wallet', icon: '🟡', description: 'Bayar dengan OVO' },
  { id: 'shopeepay', name: 'ShopeePay', type: 'digital_wallet', icon: '🛒', description: 'Bayar dengan ShopeePay' },
  
  // Bank Transfer
  { id: 'bca', name: 'BCA', type: 'bank_transfer', icon: '🏦', description: 'Transfer Bank BCA' },
  { id: 'mandiri', name: 'Mandiri', type: 'bank_transfer', icon: '🏦', description: 'Transfer Bank Mandiri' },
  { id: 'bni', name: 'BNI', type: 'bank_transfer', icon: '🏦', description: 'Transfer Bank BNI' },
  { id: 'bri', name: 'BRI', type: 'bank_transfer', icon: '🏦', description: 'Transfer Bank BRI' },
  
  // Convenience Stores
  { id: 'alfamart', name: 'Alfamart', type: 'convenience_store', icon: '🏪', description: 'Bayar di Alfamart' },
  { id: 'indomaret', name: 'Indomaret', type: 'convenience_store', icon: '🏪', description: 'Bayar di Indomaret' },
  
  // Installments (Premium tier only)
  { id: 'kredivo', name: 'Kredivo', type: 'installment', icon: '💰', description: 'Cicilan 0% dengan Kredivo' },
  { id: 'akulaku', name: 'Akulaku', type: 'installment', icon: '💰', description: 'Cicilan dengan Akulaku' },
];

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get family member data first
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.user.id)
        .single();

      if (familyError) {
        throw new Error('Family member not found');
      }

      // Get subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('family_id', familyMember.family_id)
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }

      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (tier: string, paymentMethod: string, amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-midtrans-payment', {
        body: {
          tier,
          paymentMethod,
          amount,
          currency: 'IDR'
        }
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error creating payment:', err);
      toast.error('Gagal membuat pembayaran');
      throw err;
    }
  };

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: { transactionId }
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error checking payment status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return {
    subscription,
    loading,
    error,
    paymentOptions: PAYMENT_OPTIONS,
    createPayment,
    checkPaymentStatus,
    refetch: fetchSubscription
  };
}