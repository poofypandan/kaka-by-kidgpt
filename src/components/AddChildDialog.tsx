import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { detectGradeFromBirthdate, getGradeDisplayText, isValidGradeOverride } from '@/lib/grade';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [birthdate, setBirthdate] = useState<Date>();
  const [dailyLimit, setDailyLimit] = useState('60');
  const [gradeOverride, setGradeOverride] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const gradeDetection = birthdate ? detectGradeFromBirthdate(birthdate) : null;
  const canSubmit = firstName.trim() && birthdate && gradeDetection?.grade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !gradeDetection?.grade) return;

    setLoading(true);
    try {
      // Get current user's parent record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: parents, error: parentError } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (parentError) {
        // Create parent record if it doesn't exist
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
        
        // Create child record
        const override = gradeOverride ? parseInt(gradeOverride) : null;
        const { error: childError } = await supabase
          .from('children')
          .insert({
            user_id: userRecord.id,
            parent_id: newParent.id,
            first_name: firstName.trim(),
            grade: gradeDetection.grade, // Use existing grade field
            birthdate: format(birthdate!, 'yyyy-MM-dd'),
            detected_grade: gradeDetection.grade,
            grade_override: override && isValidGradeOverride(override) ? override : null,
            daily_limit_min: parseInt(dailyLimit), // Use existing field name
            daily_minutes_limit: parseInt(dailyLimit)
          });

        if (childError) throw childError;
      } else {
        // Create child record with existing parent
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (!userRecord) throw new Error('User record not found');

        const override = gradeOverride ? parseInt(gradeOverride) : null;
        const { error: childError } = await supabase
          .from('children')
          .insert({
            user_id: userRecord.id,
            parent_id: parents.id,
            first_name: firstName.trim(),
            grade: gradeDetection.grade, // Use existing grade field
            birthdate: format(birthdate!, 'yyyy-MM-dd'),
            detected_grade: gradeDetection.grade,
            grade_override: override && isValidGradeOverride(override) ? override : null,
            daily_limit_min: parseInt(dailyLimit), // Use existing field name
            daily_minutes_limit: parseInt(dailyLimit)
          });

        if (childError) throw childError;
      }

      toast({
        title: "Profil anak berhasil ditambahkan!",
        description: `${firstName} telah ditambahkan dengan ${getGradeDisplayText(gradeOverride ? parseInt(gradeOverride) : gradeDetection.grade)}.`
      });

      // Reset form
      setFirstName('');
      setBirthdate(undefined);
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
        <Button>Tambah Profil Anak</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Profil Anak</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nama Depan *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Masukkan nama depan anak"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal Lahir *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdate ? format(birthdate, 'dd MMMM yyyy', { locale: id }) : "Pilih tanggal lahir"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={birthdate}
                  onSelect={setBirthdate}
                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {gradeDetection && (
            <div className="space-y-2">
              <Label>Deteksi Kelas</Label>
              <div className="p-3 bg-muted rounded-lg">
                {gradeDetection.grade ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      🎯 Kaka mendeteksi: <strong>{getGradeDisplayText(gradeDetection.grade)}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground">{gradeDetection.reason}</p>
                    
                    <div className="space-y-1">
                      <Label htmlFor="gradeOverride" className="text-xs">Ubah kelas (opsional)</Label>
                      <Select value={gradeOverride} onValueChange={setGradeOverride}>
                        <SelectTrigger className="h-8">
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
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{gradeDetection.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dailyLimit">Batas Waktu Harian (menit)</Label>
            <Input
              id="dailyLimit"
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              min="10"
              max="180"
              required
            />
            <p className="text-xs text-muted-foreground">
              Disarankan: 30-60 menit per hari untuk anak usia sekolah
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}