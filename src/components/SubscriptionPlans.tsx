import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const plans = [
  {
    id: 'growing-minds',
    name: 'growingMinds',
    price: 55000,
    stripePrice: 'price_growing_minds_idr', // Will be configured in Stripe
    icon: Zap,
    color: 'bg-green-500',
    limits: { children: 2, monthlyMessages: 500, parentAccounts: 1 },
    features: [
      'basicChat',
      'safetyFilter', 
      'parentDashboard',
      'upTo2Children',
      'messages500PerMonth',
      'oneParentAccount'
    ]
  },
  {
    id: 'bright-futures',
    name: 'brightFutures',
    price: 75000,
    stripePrice: 'price_bright_futures_idr',
    icon: Star,
    color: 'bg-blue-500',
    popular: true,
    limits: { children: 4, monthlyMessages: 1500, parentAccounts: 2 },
    features: [
      'basicChat',
      'safetyFilter',
      'parentDashboard',
      'upTo4Children',
      'messages1500PerMonth', 
      'twoParentAccounts',
      'advancedSafetyMonitoring',
      'learningReports'
    ]
  },
  {
    id: 'limitless-potential',
    name: 'limitlessPotential',
    price: 255000,
    stripePrice: 'price_limitless_potential_idr',
    icon: Crown,
    color: 'bg-purple-500',
    limits: { children: -1, monthlyMessages: -1, parentAccounts: 4 },
    features: [
      'basicChat',
      'safetyFilter',
      'parentDashboard',
      'unlimitedChildren',
      'unlimitedMessages',
      'upTo4ParentAccounts',
      'premiumSafetyMonitoring',
      'advancedAnalytics',
      'prioritySupport',
      'customContentPreferences'
    ]
  }
];

export function SubscriptionPlans() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleSelectPlan = async (planId: string, limits: any) => {
    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planId,
          limits,
          priceInCents: plans.find(p => p.id === planId)?.price * 100 // Convert IDR to cents 
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Gagal membuat sesi pembayaran');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-primary mb-4">
          {t('subscription.title')}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pilih paket yang sesuai dengan kebutuhan keluarga Anda. Semua paket termasuk keamanan tingkat tinggi dan dukungan 24/7.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isPlanLoading = selectedPlan === plan.id && isLoading;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:scale-105 ${
                plan.popular ? 'border-primary shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Terpopuler
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className={`mx-auto w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  {t(`subscription.${plan.name}`)}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground">
                    /{t('subscription.monthly')}
                  </span>
                </div>
              </CardHeader>

               <CardContent>
                 <div className="mb-4 text-center">
                   <div className="text-xs text-muted-foreground mb-2">Plan ini termasuk:</div>
                   <div className="flex justify-center gap-4 text-xs">
                     <span>👶 {plan.limits.children === -1 ? 'Unlimited' : plan.limits.children} anak</span>
                     <span>💬 {plan.limits.monthlyMessages === -1 ? 'Unlimited' : plan.limits.monthlyMessages} pesan/bulan</span>
                     <span>👨‍👩‍👧‍👦 {plan.limits.parentAccounts} orang tua</span>
                   </div>
                 </div>
                 <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">
                        {t(`subscription.features.${feature}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan.id, plan.limits)}
                  disabled={isLoading}
                  className="w-full h-12 text-base"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {isPlanLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Memproses...
                    </>
                  ) : (
                    t('subscription.selectPlan')
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Metode pembayaran: Transfer Bank, GoPay, OVO, DANA, dan kartu kredit</p>
        <p>Semua harga dalam Rupiah (IDR). Dapat dibatalkan kapan saja.</p>
      </div>
    </div>
  );
}