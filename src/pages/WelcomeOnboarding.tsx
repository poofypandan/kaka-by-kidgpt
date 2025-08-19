import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, MessageCircle, Shield, BarChart3, Users, Heart } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';

const onboardingSteps = [
  {
    icon: Heart,
    title: 'Selamat Datang di Kaka!',
    description: 'Platform pembelajaran AI yang aman dan menyenangkan untuk anak-anak Indonesia',
    content: 'Kaka adalah teman belajar virtual yang dirancang khusus untuk anak-anak Indonesia dengan mempertimbangkan nilai-nilai budaya dan keamanan digital.',
    action: 'Mulai Tour'
  },
  {
    icon: MessageCircle,
    title: 'Chat Pertama dengan Kaka',
    description: 'Mari berkenalan dengan Kaka, teman belajar AI yang ramah',
    content: 'Kaka dapat membantu anak belajar berbagai mata pelajaran, menjawab pertanyaan, dan bermain permainan edukatif. Semua dalam bahasa yang mudah dipahami.',
    action: 'Coba Chat'
  },
  {
    icon: Shield,
    title: 'Fitur Keamanan',
    description: 'Sistem keamanan berlapis untuk melindungi anak Anda',
    content: 'Filter konten otomatis, monitoring percakapan real-time, dan notifikasi instant ke orang tua memastikan pengalaman belajar yang aman.',
    action: 'Pelajari Keamanan'
  },
  {
    icon: BarChart3,
    title: 'Monitoring Orang Tua',
    description: 'Dashboard lengkap untuk memantau aktivitas belajar anak',
    content: 'Lihat progress belajar, waktu penggunaan, topik yang dibahas, dan laporan keamanan lengkap dalam satu dashboard yang mudah dipahami.',
    action: 'Lihat Dashboard'
  }
];

export default function WelcomeOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/family-dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/family-dashboard');
  };

  const currentStepData = onboardingSteps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-2xl">
        <Card className="relative overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          <CardHeader className="text-center pt-8">
            <div className="mx-auto p-4 bg-primary rounded-full w-fit mb-4">
              <Icon className="h-12 w-12 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl mb-2">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.content}
              </p>
            </div>

            {/* Demo content based on step */}
            {currentStep === 0 && (
              <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl">🐨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Kaka by KidGPT</h3>
                    <p className="text-sm text-muted-foreground">Teman belajar AI yang aman untuk anak Indonesia</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🐨</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Halo! Aku Kaka, teman belajarmu. Apa yang ingin kita pelajari hari ini?</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/10 rounded-lg ml-8">
                  <p className="text-sm">Halo Kaka! Bisakah kamu bantu aku belajar matematika?</p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🐨</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Tentu saja! Matematika itu menyenangkan. Mau belajar tentang apa? Penjumlahan, pengurangan, atau yang lain?</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Filter Konten</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Otomatis memblokir konten tidak pantas</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Monitoring Real-time</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pantau percakapan secara langsung</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-xs text-muted-foreground">Anak Aktif</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-xs text-muted-foreground">Menit Hari Ini</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>

              <div className="flex gap-2">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleSkip}>
                  Lewati
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === onboardingSteps.length - 1 ? 'Mulai' : 'Lanjut'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}