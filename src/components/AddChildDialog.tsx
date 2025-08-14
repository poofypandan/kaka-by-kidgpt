import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "./ui/DatePicker";
import { toast } from "sonner";

interface AddChildDialogProps {
  onChildAdded: () => void;
}

export function AddChildDialog({ onChildAdded }: AddChildDialogProps) {
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
      // For now, simulate success since we don't have the actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setFormData({
        firstName: "",
        birthDate: undefined,
        timeLimit: 60,
      });

      // Show success message
      toast.success("Profil anak berhasil ditambahkan!");

      // Close modal and refresh parent
      setIsOpen(false);
      onChildAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
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