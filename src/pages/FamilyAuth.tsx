import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Users, UserPlus, LogIn, Phone, Shield, Heart } from 'lucide-react';

export default function FamilyAuth() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<'create' | 'join' | 'login'>('create');
  
  // Create family form
  const [familyName, setFamilyName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Join family form
  const [inviteCode, setInviteCode] = useState('');
  const [secondaryParentName, setSecondaryParentName] = useState('');
  const [secondaryParentPhone, setSecondaryParentPhone] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondaryPassword, setSecondaryPassword] = useState('');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/family-dashboard" replace />;
  }

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim() || !parentName.trim() || !parentPhone.trim() || !email.trim() || !password.trim()) {
      toast.error(t('family.fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      // First, create auth account
      const { error: authError } = await signUpWithEmail(email, password);
      if (authError) {
        throw authError;
      }

      // Wait a moment for user creation to complete
      setTimeout(async () => {
        try {
          const { data: familyId, error: familyError } = await supabase.rpc('create_family_account', {
            p_family_name: familyName,
            p_parent_name: parentName,
            p_parent_phone: parentPhone
          });

          if (familyError) throw familyError;

          toast.success('Akun keluarga berhasil dibuat!');
          navigate('/family-dashboard');
        } catch (error: any) {
          console.error('Family creation error:', error);
          toast.error('Gagal membuat akun keluarga: ' + error.message);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Gagal membuat akun: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !secondaryParentName.trim() || !secondaryParentPhone.trim() || !secondaryEmail.trim() || !secondaryPassword.trim()) {
      toast.error('Mohon lengkapi semua data');
      return;
    }

    setIsSubmitting(true);
    try {
      // First, create auth account
      const { error: authError } = await signUpWithEmail(secondaryEmail, secondaryPassword);
      if (authError) {
        throw authError;
      }

      // Wait a moment for user creation to complete
      setTimeout(async () => {
        try {
          const { data: familyId, error: familyError } = await supabase.rpc('join_family_with_code', {
            p_invite_code: inviteCode.toUpperCase(),
            p_parent_name: secondaryParentName,
            p_parent_phone: secondaryParentPhone
          });

          if (familyError) throw familyError;

          toast.success('Berhasil bergabung dengan keluarga!');
          navigate('/family-dashboard');
        } catch (error: any) {
          console.error('Join family error:', error);
          toast.error('Gagal bergabung: ' + error.message);
        }
      }, 2000);

    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error('Gagal membuat akun: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Mohon masukkan email dan password');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signInWithEmail(loginEmail, loginPassword);
      if (error) {
        throw error;
      }
      toast.success('Berhasil masuk');
      navigate('/family-dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Gagal masuk: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <LanguageToggle />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary">Kaka by KidGPT</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {t('auth.welcomeMessage')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('cultural.pancasilaValues')}
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Selamat Datang di Kaka</CardTitle>
            <CardDescription>
              Pilih cara untuk memulai perjalanan belajar aman bersama keluarga
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Buat Keluarga
                </TabsTrigger>
                <TabsTrigger value="join" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Bergabung
                </TabsTrigger>
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">{t('family.createFamily')}</h3>
                  <p className="text-sm text-muted-foreground">{t('family.createFamilyDesc')}</p>
                </div>
                
                <form onSubmit={handleCreateFamily} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="familyName">Nama Keluarga</Label>
                      <Input
                        id="familyName"
                        type="text"
                        placeholder="Keluarga Budi"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Nama Anda</Label>
                      <Input
                        id="parentName"
                        type="text"
                        placeholder="Budi Santoso"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Nomor WhatsApp
                    </Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      placeholder="+62812-3456-7890"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="budi@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Membuat Akun...' : 'Buat Akun Keluarga'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="join" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">Bergabung dengan Keluarga</h3>
                  <p className="text-sm text-muted-foreground">Masukkan kode undangan dari pasangan Anda</p>
                </div>
                
                <form onSubmit={handleJoinFamily} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Kode Undangan</Label>
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="ABC12345"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      required
                      maxLength={8}
                      className="text-center text-lg font-mono tracking-widest"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryParentName">Nama Anda</Label>
                      <Input
                        id="secondaryParentName"
                        type="text"
                        placeholder="Siti Santoso"
                        value={secondaryParentName}
                        onChange={(e) => setSecondaryParentName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryParentPhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Nomor WhatsApp
                      </Label>
                      <Input
                        id="secondaryParentPhone"
                        type="tel"
                        placeholder="+62812-9876-5432"
                        value={secondaryParentPhone}
                        onChange={(e) => setSecondaryParentPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryEmail">Email</Label>
                    <Input
                      id="secondaryEmail"
                      type="email"
                      placeholder="siti@example.com"
                      value={secondaryEmail}
                      onChange={(e) => setSecondaryEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryPassword">Password</Label>
                    <Input
                      id="secondaryPassword"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={secondaryPassword}
                      onChange={(e) => setSecondaryPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Bergabung...' : 'Bergabung dengan Keluarga'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">Masuk ke Akun</h3>
                  <p className="text-sm text-muted-foreground">Masuk dengan akun keluarga yang sudah ada</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <Input
                      id="loginPassword"
                      type="password"
                      placeholder="Password Anda"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Masuk...' : 'Masuk ke Akun'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Footer info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Keamanan & Privasi</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Kaka by KidGPT menggunakan teknologi AI yang aman dengan monitoring orang tua penuh, 
                filter konten yang dapat disesuaikan, dan perlindungan data yang ketat sesuai standar internasional.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}