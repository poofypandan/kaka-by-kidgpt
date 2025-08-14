"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar } from 'lucide-react';
import { detectGradeFromBirthdate, getGradeDisplayText, isValidGradeOverride } from '@/lib/grade';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [dailyLimit, setDailyLimit] = useState('60');
  const [gradeOverride, setGradeOverride] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate date limits for HTML5 date input
  const today = new Date();
  const currentYear = today.getFullYear();
  const maxDate = today.toISOString().split('T')[0]; // Today
  const minDate = `${currentYear - 20}-01-01`; // 20 years ago

  const gradeDetection = birthdate ? detectGradeFromBirthdate(new Date(birthdate)) : null;
  const canSubmit = firstName.trim() && birthdate && gradeDetection?.grade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !gradeDetection?.grade) return;

    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get or create parent record
      let parentId: string;
      
      const { data: existingParent } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParent) {
        parentId = existingParent.id;
      } else {
        // Create parent record
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!userRecord) throw new Error('User record not found');

        const { data: newParent, error: createParentError } = await supabase
          .from('parents')
          .insert({
            user_id: userRecord.id,
            full_name: user.email || 'Parent'
          })
          .select('id')
          .single();

        if (createParentError) throw createParentError;
        parentId = newParent.id;
      }

      // Get user record for child creation
      const { data: userRecord } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userRecord) throw new Error('User record not found');

      // Create child record
      const override = gradeOverride ? parseInt(gradeOverride) : null;
      const finalGrade = override && isValidGradeOverride(override) ? override : gradeDetection.grade;
      
      const { data: newChild, error: childError } = await supabase
        .from('children')
        .insert({
          user_id: userRecord.id,
          parent_id: parentId,
          first_name: firstName.trim(),
          grade: finalGrade,
          birthdate: birthdate,
          detected_grade: gradeDetection.grade,
          grade_override: override && isValidGradeOverride(override) ? override : null,
          daily_limit_min: parseInt(dailyLimit),
          daily_minutes_limit: parseInt(dailyLimit)
        })
        .select('*')
        .single();

      if (childError) throw childError;

      // Create default conversation for the child
      const { error: conversationError } = await supabase
        .from('conversations')
        .insert({
          child_id: newChild.id,
          title: `Chat dengan Kaka - ${firstName}`
        });

      if (conversationError) {
        console.warn('Failed to create default conversation:', conversationError);
      }

      toast({
        title: "Profil anak berhasil ditambahkan! 🎉",
        description: `${firstName} telah ditambahkan dengan ${getGradeDisplayText(finalGrade)}. Batas waktu harian: ${dailyLimit} menit.`
      });

      // Reset form
      setFirstName('');
      setBirthdate('');
      setDailyLimit('60');
      setGradeOverride('');
      setOpen(false);
      onChildAdded();

    } catch (error) {
      console.error('Error adding child:', error);
      toast({
        title: "Gagal menambahkan profil anak",
        description: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Calendar className="mr-2 h-4 w-4" />
          Tambah Profil Anak
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Tambah Profil Anak</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name Field */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              Nama Depan *
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Masukkan nama depan anak (contoh: Jardani)"
              required
              className="h-11"
            />
            {firstName.trim() && firstName.length < 2 && (
              <p className="text-sm text-amber-600">Nama minimal 2 karakter</p>
            )}
          </div>

          {/* Birth Date Field */}
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="text-sm font-medium">
              Tanggal Lahir *
            </Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              min={minDate}
              max={maxDate}
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Pilih tanggal lahir untuk deteksi kelas otomatis
            </p>
          </div>

          {/* Grade Detection Display */}
          {gradeDetection && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Deteksi Kelas</Label>
              <div className="p-4 bg-muted/50 rounded-lg border">
                {gradeDetection.grade ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm font-medium">
                        Kaka mendeteksi: <span className="text-primary font-semibold">{getGradeDisplayText(gradeDetection.grade)}</span>
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground pl-4">{gradeDetection.reason}</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gradeOverride" className="text-xs font-medium">
                        Ubah kelas (opsional)
                      </Label>
                      <Select value={gradeOverride} onValueChange={setGradeOverride}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Gunakan deteksi otomatis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Gunakan deteksi otomatis</SelectItem>
                          {[1, 2, 3, 4, 5, 6].map(grade => (
                            <SelectItem key={grade} value={grade.toString()}>
                              {getGradeDisplayText(grade)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{gradeDetection.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Daily Time Limit Field */}
          <div className="space-y-2">
            <Label htmlFor="dailyLimit" className="text-sm font-medium">
              Batas Waktu Harian (menit)
            </Label>
            <Input
              id="dailyLimit"
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              min="10"
              max="180"
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Disarankan:</span> 30-60 menit per hari untuk anak usia sekolah
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={!canSubmit || loading}
              className="min-w-[100px]"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}