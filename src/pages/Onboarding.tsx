import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type UserRole = 'PARENT' | 'CHILD';

export default function Onboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('PARENT');
  const [childName, setChildName] = useState('');
  const [childGrade, setChildGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async () => {
    if (role === 'CHILD' && (!childName || !childGrade)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Harap isi nama dan kelas anak",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        role,
        ...(role === 'CHILD' && {
          child_name: childName,
          child_grade: parseInt(childGrade)
        })
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Berhasil!",
        description: "Profil berhasil diatur",
      });

      // Redirect based on role
      if (role === 'PARENT') {
        navigate('/parent');
      } else {
        navigate('/app');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat mengatur profil",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg border-0" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
            🎒
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Selamat datang!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Mari atur profil Anda untuk pengalaman yang lebih baik
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Saya adalah:</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PARENT" id="parent" />
                <Label htmlFor="parent" className="cursor-pointer">
                  Orang tua atau wali
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CHILD" id="child" />
                <Label htmlFor="child" className="cursor-pointer">
                  Anak yang ingin belajar
                </Label>
              </div>
            </RadioGroup>
          </div>

          {role === 'CHILD' && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="childName">Nama Anak</Label>
                <Input
                  id="childName"
                  type="text"
                  placeholder="Nama lengkap anak"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childGrade">Kelas</Label>
                <Input
                  id="childGrade"
                  type="number"
                  placeholder="Contoh: 3"
                  min="1"
                  max="12"
                  value={childGrade}
                  onChange={(e) => setChildGrade(e.target.value)}
                  className="border-border"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-medium"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {role === 'PARENT' ? 'Lanjutkan sebagai Orang Tua' : 'Lanjutkan sebagai Anak'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}