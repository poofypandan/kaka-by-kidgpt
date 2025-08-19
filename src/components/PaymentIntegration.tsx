import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PaymentOption } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface PaymentIntegrationProps {
  selectedTier: string;
  amount: number;
  onPaymentSuccess?: () => void;
  onPaymentCancel?: () => void;
}

export function PaymentIntegration({ 
  selectedTier, 
  amount, 
  onPaymentSuccess,
  onPaymentCancel 
}: PaymentIntegrationProps) {
  const { t } = useTranslation();
  const { paymentOptions, createPayment } = useSubscription();
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const groupedPayments = {
    digital_wallet: paymentOptions.filter(option => option.type === 'digital_wallet'),
    bank_transfer: paymentOptions.filter(option => option.type === 'bank_transfer'),
    convenience_store: paymentOptions.filter(option => option.type === 'convenience_store'),
    installment: paymentOptions.filter(option => option.type === 'installment'),
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePayment = async () => {
    if (!selectedPayment) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = await createPayment(selectedTier, selectedPayment, amount);
      
      if (paymentData?.redirect_url) {
        // Redirect to Midtrans payment page
        window.location.href = paymentData.redirect_url;
      } else {
        toast.success('Pembayaran berhasil diproses');
        onPaymentSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Gagal memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentOptionCard = ({ option }: { option: PaymentOption }) => (
    <Label 
      htmlFor={option.id} 
      className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <RadioGroupItem value={option.id} id={option.id} />
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-2xl">{option.icon}</span>
        <div>
          <div className="font-medium">{option.name}</div>
          <div className="text-sm text-muted-foreground">{option.description}</div>
        </div>
      </div>
    </Label>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('subscription.paymentMethods')}
            <Badge variant="secondary">{formatPrice(amount)}</Badge>
          </CardTitle>
          <CardDescription>
            {t('subscription.selectPaymentMethod')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
            {/* Digital Wallets */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                💳 {t('subscription.digitalWallets')}
              </h4>
              {groupedPayments.digital_wallet.map(option => (
                <PaymentOptionCard key={option.id} option={option} />
              ))}
            </div>

            {/* Bank Transfer */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                🏦 {t('subscription.bankTransfer')}
              </h4>
              {groupedPayments.bank_transfer.map(option => (
                <PaymentOptionCard key={option.id} option={option} />
              ))}
            </div>

            {/* Convenience Stores */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                🏪 {t('subscription.convenienceStores')}
              </h4>
              {groupedPayments.convenience_store.map(option => (
                <PaymentOptionCard key={option.id} option={option} />
              ))}
            </div>

            {/* Installments (Premium tier only) */}
            {selectedTier === 'premium' && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  💰 {t('subscription.installments')}
                </h4>
                {groupedPayments.installment.map(option => (
                  <PaymentOptionCard key={option.id} option={option} />
                ))}
              </div>
            )}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          onClick={handlePayment}
          disabled={!selectedPayment || isProcessing}
          className="flex-1"
        >
          {isProcessing ? 'Memproses...' : `${t('subscription.payNow')} ${formatPrice(amount)}`}
        </Button>
        <Button
          variant="outline"
          onClick={onPaymentCancel}
          disabled={isProcessing}
        >
          {t('common.cancel')}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>🔒 {t('subscription.securePayment')}</p>
        <p>{t('subscription.cancellationPolicy')}</p>
      </div>
    </div>
  );
}