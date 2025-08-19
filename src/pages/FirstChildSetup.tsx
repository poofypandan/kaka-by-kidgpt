import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { DatePicker } from '@/components/ui/DatePicker';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Baby, Calendar, GraduationCap, Clock, Shield, Heart } from 'lucide-react';

export default function FirstChildSetup() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    grade: '',
    birthdate: undefined as Date | undefined,
    contentFilterLevel: 'moderate',
    dailyTimeLimit: [60],
    interests: [] as string[]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interests = [
    'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Sains', 
    'Sejarah', 'Olahraga', 'Seni', 'Musik', 'Membaca', 'Menulis'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.age || !formData.grade) {
      toast.error('Mohon lengkapi semua field yang wajib');
      return;
    }

    if (!user) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create child profile
      const { data: childId, error: childError } = await supabase.rpc('create_child_profile', {
        p_first_name: formData.firstName,
        p_birthdate: formData.birthdate?.toISOString().split('T')[0] || null,
        p_grade: parseInt(formData.grade),
        p_daily_limit_min: formData.dailyTimeLimit[0]
      });

      if (childError) throw childError;

      // Create content filter settings
      await supabase
        .from('content_filter_settings')
        .insert({
          child_id: childId,
          filter_level: formData.contentFilterLevel,
          log_all_conversations: true,
          parent_notification_threshold: 70
        });

      toast.success('Profil anak berhasil dibuat!');
      navigate('/subscription-selection');
    } catch (error: any) {
      console.error('Child setup error:', error);
      toast.error('Gagal membuat profil anak: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4">
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
            <h1 className="text-3xl font-bold text-primary">Kaka</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Profil Anak Pertama
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Informasi Anak
            </CardTitle>
            <CardDescription>
              Buat profil anak pertama untuk memulai pengalaman belajar yang aman dan menyenangkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nama Anak *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Contoh: Andi"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Usia *</Label>
                  <Select 
                    value={formData.age} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih usia" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => i + 3).map(age => (
                        <SelectItem key={age} value={age.toString()}>
                          {age} tahun
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal Lahir
                  </Label>
                  <DatePicker
                    date={formData.birthdate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, birthdate: date }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Kelas *
                  </Label>
                  <Select 
                    value={formData.grade} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Kelas 1 SD</SelectItem>
                      <SelectItem value="2">Kelas 2 SD</SelectItem>
                      <SelectItem value="3">Kelas 3 SD</SelectItem>
                      <SelectItem value="4">Kelas 4 SD</SelectItem>
                      <SelectItem value="5">Kelas 5 SD</SelectItem>
                      <SelectItem value="6">Kelas 6 SD</SelectItem>
                      <SelectItem value="7">Kelas 7 SMP</SelectItem>
                      <SelectItem value="8">Kelas 8 SMP</SelectItem>
                      <SelectItem value="9">Kelas 9 SMP</SelectItem>
                      <SelectItem value="10">Kelas 10 SMA</SelectItem>
                      <SelectItem value="11">Kelas 11 SMA</SelectItem>
                      <SelectItem value="12">Kelas 12 SMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Level Filter Konten
                </Label>
                <Select 
                  value={formData.contentFilterLevel} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contentFilterLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Ketat - Perlindungan maksimal</SelectItem>
                    <SelectItem value="moderate">Sedang - Seimbang</SelectItem>
                    <SelectItem value="basic">Dasar - Fleksibilitas lebih</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Filter ketat direkomendasikan untuk anak di bawah 10 tahun
                </p>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Batas Waktu Harian: {formData.dailyTimeLimit[0]} menit
                </Label>
                <Slider
                  value={formData.dailyTimeLimit}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dailyTimeLimit: value }))}
                  max={180}
                  min={30}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30 menit</span>
                  <span>3 jam</span>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Minat dan Hobi (Opsional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {interests.map(interest => (
                    <Button
                      key={interest}
                      type="button"
                      variant={formData.interests.includes(interest) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleInterest(interest)}
                      className="h-8 text-xs"
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Keamanan & Privasi</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Semua percakapan anak akan dipantau secara otomatis. Anda akan mendapat 
                  notifikasi jika ada konten yang perlu perhatian khusus.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/family-setup')}
                  className="w-full"
                >
                  Kembali
                </Button>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Membuat Profil...' : 'Lanjutkan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}