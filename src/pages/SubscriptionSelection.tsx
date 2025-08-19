import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { Check, Star, Crown, Zap, CreditCard, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LanguageToggle } from '@/components/LanguageToggle';

const plans = [
  {
    id: 'growing-minds',
    name: 'Growing Minds',
    price: 55000,
    stripePrice: 'price_growing_minds_idr',
    icon: Zap,
    color: 'bg-green-500',
    limits: { children: 2, monthlyMessages: 500, parentAccounts: 1 },
    features: [
      'Chat dasar dengan Kaka',
      'Filter keamanan standar', 
      'Dashboard orang tua',
      'Maksimal 2 anak',
      '500 pesan per bulan',
      '1 akun orang tua'
    ]
  },
  {
    id: 'bright-futures',
    name: 'Bright Futures',
    price: 75000,
    stripePrice: 'price_bright_futures_idr',
    icon: Star,
    color: 'bg-blue-500',
    popular: true,
    limits: { children: 4, monthlyMessages: 1500, parentAccounts: 2 },
    features: [
      'Chat dasar dengan Kaka',
      'Filter keamanan standar',
      'Dashboard orang tua',
      'Maksimal 4 anak',
      '1,500 pesan per bulan', 
      '2 akun orang tua',
      'Monitoring keamanan lanjutan',
      'Laporan pembelajaran'
    ]
  },
  {
    id: 'limitless-potential',
    name: 'Limitless Potential',
    price: 255000,
    stripePrice: 'price_limitless_potential_idr',
    icon: Crown,
    color: 'bg-purple-500',
    limits: { children: -1, monthlyMessages: -1, parentAccounts: 4 },
    features: [
      'Chat dasar dengan Kaka',
      'Filter keamanan standar',
      'Dashboard orang tua',
      'Anak tanpa batas',
      'Pesan tanpa batas',
      'Maksimal 4 akun orang tua',
      'Monitoring keamanan premium',
      'Analytics mendalam',
      'Dukungan prioritas',
      'Preferensi konten khusus'
    ]
  }
];

export default function SubscriptionSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          priceInCents: plans.find(p => p.id === planId)?.price * 100
        }
      });

      if (error) throw error;

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

  const handleFreeTrial = () => {
    toast.success('Memulai trial gratis 7 hari!');
    navigate('/welcome-onboarding');
  };

  const handleSkip = () => {
    navigate('/welcome-onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                <Heart className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-primary">Kaka</h1>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Pilih Paket Berlangganan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Dapatkan akses penuh ke platform pembelajaran aman dengan paket yang sesuai kebutuhan keluarga Anda.
          </p>
          
          <div className="flex justify-center gap-4">
            <Button onClick={handleFreeTrial} variant="outline" size="lg">
              Mulai Trial Gratis 7 Hari
            </Button>
            <Button onClick={handleSkip} variant="ghost" size="lg">
              Lewati untuk Sekarang
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground">
                      /bulan
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4 text-center">
                    <div className="text-xs text-muted-foreground mb-2">Paket ini termasuk:</div>
                    <div className="flex justify-center gap-4 text-xs">
                      <span>👶 {plan.limits.children === -1 ? 'Unlimited' : plan.limits.children} anak</span>
                      <span>💬 {plan.limits.monthlyMessages === -1 ? 'Unlimited' : plan.limits.monthlyMessages} pesan/bulan</span>
                      <span>👨‍👩‍👧‍👦 {plan.limits.parentAccounts} orang tua</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

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
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pilih Paket
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>💳 Metode pembayaran: Transfer Bank, GoPay, OVO, DANA, dan kartu kredit</p>
          <p>🔒 Semua harga dalam Rupiah (IDR). Dapat dibatalkan kapan saja.</p>
          <p>✨ Trial gratis 7 hari tanpa komitmen pembayaran</p>
        </div>
      </main>
    </div>
  );
}