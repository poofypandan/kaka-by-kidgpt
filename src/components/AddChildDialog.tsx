import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "./ui/DatePicker";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    birthDate: undefined as Date | undefined,
    timeLimit: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("Nama depan harus diisi");
      return false;
    }

    if (!formData.birthDate) {
      setError("Tanggal lahir harus diisi");
      return false;
    }

    // Validate age (3-18 years)
    const today = new Date();
    const birthYear = formData.birthDate.getFullYear();
    const age = today.getFullYear() - birthYear;
    
    if (age < 3 || age > 18) {
      setError("Anak harus berusia antara 3-18 tahun");
      return false;
    }

    if (formData.timeLimit < 15 || formData.timeLimit > 180) {
      setError("Batas waktu harus antara 15-180 menit");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate age and grade for smart defaults
      const today = new Date();
      const age = today.getFullYear() - formData.birthDate!.getFullYear();
      const estimatedGrade = Math.max(1, Math.min(12, age - 5)); // Rough estimate: age 6 = grade 1
      
      // Save to database using the Supabase function
      const { data: childId, error } = await supabase.rpc('create_child_profile', {
        p_first_name: formData.firstName.trim(),
        p_birthdate: formData.birthDate!.toISOString().split('T')[0], // Convert to YYYY-MM-DD
        p_grade: estimatedGrade,
        p_daily_limit_min: formData.timeLimit
      });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!childId) {
        throw new Error('Failed to create child profile');
      }

      toast.success(`Profil ${formData.firstName} berhasil dibuat!`);

      // Reset form
      setFormData({
        firstName: "",
        birthDate: undefined,
        timeLimit: 60,
      });

      // Close modal
      setIsOpen(false);
      
      // Refresh parent data FIRST to ensure it's available when navigating
      console.log('Child profile created successfully, refreshing parent data...');
      onChildAdded();
      
      // Small delay to ensure refresh completes, then navigate
      setTimeout(() => {
        console.log('Navigating to success page...');
        navigate(`/child-profile-success?name=${encodeURIComponent(formData.firstName)}&age=${age}`);
      }, 200);
    } catch (err) {
      console.error('Error creating child profile:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan profil");
      toast.error("Gagal menyimpan profil anak");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        firstName: "",
        birthDate: undefined,
        timeLimit: 60,
      });
      setError("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          Tambah Profil Anak
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Profil Anak</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nama Depan *</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Masukkan nama depan anak (contoh: Jardani)"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal Lahir *</Label>
            <DatePicker
              value={formData.birthDate}
              onChange={(date) =>
                setFormData({ ...formData, birthDate: date })
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Batas Waktu (menit)</Label>
            <Input
              id="timeLimit"
              type="number"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({ ...formData, timeLimit: Number(e.target.value) })
              }
              min="15"
              max="180"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500">
              Disarankan: 60 menit per sesi bermain anak usia sekolah
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}