import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Users, Share2, Heart, Star, Shield } from 'lucide-react';

export default function FamilySetup() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    familyName: '',
    culturalPreferences: {
      respectValues: true,
      religiousTolerance: true,
      gotongRoyong: true,
      honesty: true
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentData, setParentData] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    // Get parent data from session storage
    const storedParentData = sessionStorage.getItem('parentData');
    if (storedParentData) {
      setParentData(JSON.parse(storedParentData));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.familyName.trim()) {
      toast.error('Mohon masukkan nama keluarga');
      return;
    }

    if (!user || !parentData) {
      toast.error('Data orang tua tidak ditemukan');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create family account
      const { data: familyId, error: familyError } = await supabase.rpc('create_family_account', {
        p_family_name: formData.familyName,
        p_parent_name: parentData.fullName,
        p_parent_phone: parentData.phone || ''
      });

      if (familyError) throw familyError;

      // Generate invite code for spouse
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      setInviteCode(code);

      // Store family preferences in notification_preferences
      await supabase
        .from('family_settings')
        .update({
          notification_preferences: formData.culturalPreferences
        })
        .eq('family_id', familyId);

      toast.success('Keluarga berhasil dibuat!');
      
      // Clear session storage
      sessionStorage.removeItem('parentData');
      
      // Navigate to next step
      navigate('/first-child-setup');
    } catch (error: any) {
      console.error('Family setup error:', error);
      toast.error('Gagal membuat keluarga: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Kode undangan disalin ke clipboard');
    }
  };

  if (inviteCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary rounded-full w-fit mb-4">
                <Share2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle>Keluarga Berhasil Dibuat!</CardTitle>
              <CardDescription>
                Bagikan kode undangan ini dengan pasangan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="p-6 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Kode Undangan Keluarga</p>
                  <p className="text-3xl font-mono font-bold text-primary tracking-widest">
                    {inviteCode}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={copyInviteCode} variant="outline" className="w-full">
                  Salin Kode Undangan
                </Button>
                <Button onClick={() => navigate('/first-child-setup')} className="w-full">
                  Lanjutkan Ke Setup Anak
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Kode ini berlaku selama 24 jam</p>
                <p>Pasangan dapat bergabung melalui halaman "Bergabung dengan Keluarga"</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            Setup Keluarga
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Informasi Keluarga
            </CardTitle>
            <CardDescription>
              Setel preferensi dan nilai-nilai keluarga Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="familyName">Nama Keluarga *</Label>
                <Input
                  id="familyName"
                  type="text"
                  placeholder="Contoh: Keluarga Santoso"
                  value={formData.familyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, familyName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">Nilai-Nilai Keluarga</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pilih nilai-nilai yang ingin ditanamkan dalam pendidikan anak
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="respect" 
                      checked={formData.culturalPreferences.respectValues}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          culturalPreferences: { ...prev.culturalPreferences, respectValues: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="respect" className="text-sm">
                      Nilai Sopan Santun dan Hormat
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="tolerance" 
                      checked={formData.culturalPreferences.religiousTolerance}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          culturalPreferences: { ...prev.culturalPreferences, religiousTolerance: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="tolerance" className="text-sm">
                      Toleransi dan Keberagaman
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="gotongRoyong" 
                      checked={formData.culturalPreferences.gotongRoyong}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          culturalPreferences: { ...prev.culturalPreferences, gotongRoyong: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="gotongRoyong" className="text-sm">
                      Gotong Royong dan Kerjasama
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="honesty" 
                      checked={formData.culturalPreferences.honesty}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          culturalPreferences: { ...prev.culturalPreferences, honesty: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="honesty" className="text-sm">
                      Kejujuran dan Integritas
                    </Label>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Langkah Selanjutnya</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Setelah membuat keluarga, Anda akan mendapat kode undangan untuk pasangan 
                  dan dapat melanjutkan ke pengaturan profil anak pertama.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Membuat Keluarga...' : 'Buat Keluarga'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}