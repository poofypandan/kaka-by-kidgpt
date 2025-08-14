import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface DemoModeProps {
  onStartDemo: (demoType: 'parent' | 'child') => void;
}

export default function DemoMode({ onStartDemo }: DemoModeProps) {
  const { toast } = useToast();

  const handleDemoStart = (type: 'parent' | 'child') => {
    toast({
      title: "Demo Mode Dimulai",
      description: `Selamat datang di demo ${type === 'parent' ? 'Parent Dashboard' : 'Kaka Kids Mode'}!`,
    });
    onStartDemo(type);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20 p-4">
      <Card className="w-full max-w-2xl backdrop-blur-sm bg-card/95 border-0 rounded-2xl" 
            style={{ boxShadow: 'var(--shadow-soft)' }}>
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-32 h-16 flex items-center justify-center">
            <img 
              src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
              alt="Kaka Logo" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl font-bold text-primary">
              Kaka by KidGPT
            </CardTitle>
            <Badge variant="secondary" className="text-xs">DEMO</Badge>
          </div>
          <CardDescription className="text-muted-foreground text-base">
            Coba langsung fitur lengkap Kaka! Pilih mode yang ingin Anda jelajahi.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Parent Demo */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group"
                  onClick={() => handleDemoStart('parent')}>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xl mb-2">
                  👨‍👩‍👧‍👦
                </div>
                <CardTitle className="text-lg text-center group-hover:text-primary transition-colors">
                  Demo Orang Tua
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center mb-4">
                  Jelajahi dashboard kontrol, monitoring keamanan, dan pengaturan profil anak
                </CardDescription>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Dashboard Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Kelola Profil Anak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Pengaturan Keamanan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Laporan Aktivitas</span>
                  </div>
                </div>
                <Button className="w-full mt-4 group-hover:scale-[1.02] transition-transform">
                  Mulai Demo Orang Tua
                </Button>
              </CardContent>
            </Card>

            {/* Child Demo */}
            <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors cursor-pointer group"
                  onClick={() => handleDemoStart('child')}>
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-accent to-orange-400 rounded-full flex items-center justify-center text-white text-xl mb-2">
                  🐨
                </div>
                <CardTitle className="text-lg text-center group-hover:text-accent transition-colors">
                  Demo Anak
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-center mb-4">
                  Rasakan pengalaman chat dengan Kaka dan aktivitas edukatif yang menyenangkan
                </CardDescription>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Chat dengan Kaka AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Aktivitas Edukatif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Interface Ramah Anak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Fitur Keamanan</span>
                  </div>
                </div>
                <Button variant="secondary" className="w-full mt-4 group-hover:scale-[1.02] transition-transform">
                  Mulai Demo Anak
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Mode demo menggunakan data contoh dan tidak menyimpan informasi apapun
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">Data Sample</Badge>
              <Badge variant="outline" className="text-xs">Tidak Perlu Login</Badge>
              <Badge variant="outline" className="text-xs">Fitur Lengkap</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}