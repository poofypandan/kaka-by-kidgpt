import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Heart, Phone, Mail, Lock, User, Globe } from 'lucide-react';

export default function ParentRegistration() {
  const { signUpWithEmail } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    language: 'id',
    termsAccepted: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (!formData.termsAccepted) {
      toast.error('Mohon setujui syarat dan ketentuan');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUpWithEmail(formData.email, formData.password);
      if (error) throw error;

      // Store additional data for family setup
      sessionStorage.setItem('parentData', JSON.stringify({
        fullName: formData.fullName,
        phone: formData.phone,
        language: formData.language
      }));

      toast.success('Akun berhasil dibuat! Lanjutkan dengan setup keluarga.');
      navigate('/family-setup');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Gagal membuat akun: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <LanguageToggle />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary">Kaka</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Daftar sebagai Orang Tua
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Orang Tua</CardTitle>
            <CardDescription>
              Buat akun orang tua untuk memulai perjalanan belajar yang aman
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nama Lengkap *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Nomor WhatsApp
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+62812-3456-7890"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Konfirmasi Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ketik ulang password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Bahasa Utama
                </Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked as boolean }))}
                />
                <Label htmlFor="terms" className="text-sm">
                  Saya setuju dengan{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Syarat dan Ketentuan
                  </a>{' '}
                  serta{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Kebijakan Privasi
                  </a>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Membuat Akun...' : 'Daftar dan Lanjutkan'}
              </Button>

              <div className="text-center">
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={() => navigate('/auth')}
                >
                  Sudah punya akun? Masuk di sini
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}