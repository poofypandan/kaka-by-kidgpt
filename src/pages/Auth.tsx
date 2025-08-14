import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { FloatingKoala, WavingKoala, SleepingKoala, TwinkleStar, FloatingHeart, FloatingCloud } from '@/components/KoalaCharacters';

export default function Auth() {
  const { user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Harap isi email dan password",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = isSignUp 
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) {
        let errorMessage = "Terjadi kesalahan";
        
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = "Email atau password salah";
        } else if (error.message?.includes('User already registered')) {
          errorMessage = "Email sudah terdaftar, silakan login";
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = "Silakan cek email untuk konfirmasi akun";
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      } else if (isSignUp) {
        toast({
          title: "Berhasil!",
          description: "Akun berhasil dibuat. Silakan cek email untuk konfirmasi.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan sistem",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal login dengan Google",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan sistem",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <TwinkleStar className="absolute top-12 left-12 z-0" style={{ animationDelay: '0s' }} />
      <TwinkleStar className="absolute top-20 right-20 z-0" style={{ animationDelay: '1s' }} />
      <TwinkleStar className="absolute bottom-24 left-20 z-0" style={{ animationDelay: '2s' }} />
      
      <FloatingHeart className="absolute top-32 left-1/4 z-0" style={{ animationDelay: '0.5s' }} />
      <FloatingHeart className="absolute bottom-40 right-1/3 z-0" style={{ animationDelay: '1.5s' }} />
      
      <FloatingCloud className="absolute top-16 right-12 z-0" style={{ animationDelay: '0.8s' }} />
      <FloatingCloud className="absolute bottom-20 left-16 z-0" style={{ animationDelay: '2.2s' }} />

      {/* Koala Characters */}
      <FloatingKoala className="absolute top-8 left-8 z-10 hidden sm:block" />
      <WavingKoala className="absolute bottom-8 right-8 z-10 hidden sm:block" />
      <SleepingKoala className="absolute top-1/2 right-4 z-10 hidden lg:block" />

      {/* Main Card */}
      <Card className="w-full max-w-md relative z-20 backdrop-blur-sm bg-card/95 border-0 rounded-2xl" 
            style={{ boxShadow: 'var(--shadow-soft)' }}>
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-32 h-16 flex items-center justify-center">
            <img 
              src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
              alt="Kakak Logo" 
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Hai! Ada yang mau kamu tanya?
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Kaka siap membantu! 🐨
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 shadow-sm rounded-xl py-3 transition-all duration-200 hover:scale-[1.02]"
            variant="outline"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <div className="mr-2 w-4 h-4 bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 rounded-full" />
            )}
            Login dengan Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">Atau</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50 rounded-xl p-1">
              <TabsTrigger value="login" className="rounded-lg">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Daftar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="orangtua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="kid-friendly-input"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="kid-friendly-input"
                />
              </div>
              <Button 
                onClick={() => handleEmailAuth(false)}
                disabled={isSubmitting}
                className="kid-friendly-button w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Login
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="orangtua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="kid-friendly-input"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="kid-friendly-input"
                />
              </div>
              <Button 
                onClick={() => handleEmailAuth(true)}
                disabled={isSubmitting}
                className="kid-friendly-button w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Daftar Akun
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}