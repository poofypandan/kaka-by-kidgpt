import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Loader2, BookOpen, Users, Shield } from 'lucide-react';
import DemoMode from '@/components/DemoMode';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { isDemoMode, demoUserType, startDemo } = useDemoMode();
  const [profileLoading, setProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showDemoMode, setShowDemoMode] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfile();
  }, [user]);

  // Check if we should show demo mode
  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      // Show demo mode if no user and not in demo
      setShowDemoMode(true);
    }
  }, [loading, user, isDemoMode]);

  // Handle demo mode
  if (isDemoMode && demoUserType) {
    if (demoUserType === 'parent') {
      return <Navigate to="/parent" replace />;
    } else {
      return <Navigate to="/child-home" replace />;
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show demo mode if no user
  if (showDemoMode && !user) {
    return <DemoMode onStartDemo={startDemo} />;
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user exists but no profile, redirect to onboarding
  if (!userProfile) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has profile but no role, redirect to onboarding
  if (!userProfile.role) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect based on role
  if (userProfile.role === 'PARENT') {
    return <Navigate to="/parent" replace />;
  } else if (userProfile.role === 'CHILD') {
    return <Navigate to="/child-home" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                🎒
              </div>
              <h1 className="text-xl font-bold text-primary">Kaka</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Halo, {user.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Selamat datang di Kaka! 🎉
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Platform belajar yang aman dan menyenangkan untuk anak-anak Indonesia
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Pembelajaran Interaktif</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Chat dengan Kaka untuk belajar berbagai mata pelajaran dengan cara yang menyenangkan
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Aman & Terpantau</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Orang tua dapat memantau aktivitas belajar dan mengatur batas waktu penggunaan
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Kurikulum Merdeka</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Materi pembelajaran sesuai dengan Kurikulum Merdeka dan nilai-nilai Pancasila
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Siap untuk mulai belajar?</CardTitle>
              <CardDescription>
                Sistem sedang dalam tahap pengembangan. Fitur chat dengan Kaka akan segera tersedia!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/chat'}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium"
              >
                Mulai Chat dengan Kaka! 🐨
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
