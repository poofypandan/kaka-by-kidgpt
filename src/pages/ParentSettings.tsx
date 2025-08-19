import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, Bell, Clock, Phone, Users, Smartphone, Eye, AlertTriangle, Heart } from 'lucide-react';
import SafetyDashboard from '@/components/SafetyDashboard';
import { LanguageToggle } from '@/components/LanguageToggle';
import FamilyValuesSettings from '@/components/FamilyValuesSettings';

export default function ParentSettings() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    contentFilter: true,
    parentNotifications: true,
    autoLogout: true,
    logoutMinutes: 30,
    emergencyContact: '+62',
    phoneVerification: false,
    realTimeMonitoring: true,
    weeklyReports: true,
    safetyAlerts: true,
    bedtimeMode: false,
    bedtimeStart: '20:00',
    bedtimeEnd: '06:00'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/parent')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('settings.backToDashboard')}
            </Button>
            
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <h1 className="text-xl font-bold text-gray-800">{t('settings.parentSettings')}</h1>
              <img 
                src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
                alt="Kaka Logo" 
                className="h-8 w-16 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="safety" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 shadow-lg">
            <TabsTrigger value="safety">{t('settings.security')}</TabsTrigger>
            <TabsTrigger value="values">{t('values.familyValues')}</TabsTrigger>
            <TabsTrigger value="monitoring">{t('settings.monitoring')}</TabsTrigger>
            <TabsTrigger value="schedule">{t('settings.schedule')}</TabsTrigger>
            <TabsTrigger value="account">{t('settings.account')}</TabsTrigger>
          </TabsList>

          <TabsContent value="safety" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Pengaturan Keamanan Konten
                </CardTitle>
                <CardDescription>
                  Kontrol tingkat keamanan dan filtering konten untuk anak-anak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Filter Konten Aktif</Label>
                    <p className="text-sm text-gray-600">
                      Memblokir konten yang tidak pantas secara otomatis
                    </p>
                  </div>
                  <Switch
                    checked={settings.contentFilter}
                    onCheckedChange={(value) => handleSettingChange('contentFilter', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Notifikasi Orang Tua</Label>
                    <p className="text-sm text-gray-600">
                      Terima peringatan untuk konten yang berpotensi berbahaya
                    </p>
                  </div>
                  <Switch
                    checked={settings.parentNotifications}
                    onCheckedChange={(value) => handleSettingChange('parentNotifications', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Peringatan Keamanan</Label>
                    <p className="text-sm text-gray-600">
                      Notifikasi segera untuk percakapan yang memerlukan perhatian
                    </p>
                  </div>
                  <Switch
                    checked={settings.safetyAlerts}
                    onCheckedChange={(value) => handleSettingChange('safetyAlerts', value)}
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Keamanan Aktif</span>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Filtering bahasa tidak pantas (Bahasa Indonesia & Inggris)</li>
                    <li>• Deteksi konten kekerasan dan berbahaya</li>
                    <li>• Blokir permintaan informasi pribadi</li>
                    <li>• Monitoring percakapan real-time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-500" />
                  Kontak Darurat
                </CardTitle>
                <CardDescription>
                  Nomor yang dapat dihubungi anak dalam situasi darurat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emergency-contact">Nomor Telepon Darurat</Label>
                  <Input
                    id="emergency-contact"
                    type="tel"
                    value={settings.emergencyContact}
                    onChange={(e) => handleSettingChange('emergencyContact', e.target.value)}
                    placeholder="+62 812 xxxx xxxx"
                    className="mt-2"
                  />
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Fitur Darurat</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Tombol "Panggil Ayah/Ibu" selalu terlihat di semua halaman anak
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values" className="space-y-6">
            <FamilyValuesSettings familyId="demo-family-id" />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  Monitoring & Pelaporan
                </CardTitle>
                <CardDescription>
                  Kontrol bagaimana Anda memantau aktivitas anak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Monitoring Real-time</Label>
                    <p className="text-sm text-gray-600">
                      Lihat aktivitas anak secara langsung
                    </p>
                  </div>
                  <Switch
                    checked={settings.realTimeMonitoring}
                    onCheckedChange={(value) => handleSettingChange('realTimeMonitoring', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Laporan Mingguan</Label>
                    <p className="text-sm text-gray-600">
                      Ringkasan aktivitas dan pembelajaran anak setiap minggu
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(value) => handleSettingChange('weeklyReports', value)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Verifikasi Telepon</Label>
                    <p className="text-sm text-gray-600">
                      SMS konfirmasi untuk aktivitas sensitif
                    </p>
                  </div>
                  <Switch
                    checked={settings.phoneVerification}
                    onCheckedChange={(value) => handleSettingChange('phoneVerification', value)}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Yang Dipantau:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Semua percakapan dengan Kaka</li>
                    <li>• Aktivitas yang dipilih anak</li>
                    <li>• Waktu penggunaan aplikasi</li>
                    <li>• Topik pembelajaran yang diminati</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Safety Dashboard Integration */}
            <SafetyDashboard />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Pengaturan Jadwal & Waktu
                </CardTitle>
                <CardDescription>
                  Atur waktu penggunaan dan jadwal anak
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto-logout</Label>
                    <p className="text-sm text-gray-600">
                      Keluar otomatis setelah tidak aktif
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoLogout}
                    onCheckedChange={(value) => handleSettingChange('autoLogout', value)}
                  />
                </div>

                {settings.autoLogout && (
                  <div>
                    <Label htmlFor="logout-minutes">Waktu Auto-logout (menit)</Label>
                    <Input
                      id="logout-minutes"
                      type="number"
                      value={settings.logoutMinutes}
                      onChange={(e) => handleSettingChange('logoutMinutes', parseInt(e.target.value))}
                      min={5}
                      max={120}
                      className="mt-2 w-32"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Mode Tidur</Label>
                    <p className="text-sm text-gray-600">
                      Batasi akses pada jam tidur anak
                    </p>
                  </div>
                  <Switch
                    checked={settings.bedtimeMode}
                    onCheckedChange={(value) => handleSettingChange('bedtimeMode', value)}
                  />
                </div>

                {settings.bedtimeMode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bedtime-start">Mulai Tidur</Label>
                      <Input
                        id="bedtime-start"
                        type="time"
                        value={settings.bedtimeStart}
                        onChange={(e) => handleSettingChange('bedtimeStart', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bedtime-end">Bangun Tidur</Label>
                      <Input
                        id="bedtime-end"
                        type="time"
                        value={settings.bedtimeEnd}
                        onChange={(e) => handleSettingChange('bedtimeEnd', e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Informasi Akun
                </CardTitle>
                <CardDescription>
                  Kelola akun dan profil orang tua
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                </div>

                <div>
                  <Label>Status Akun</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Aktif
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">PIN Mode Orang Tua</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    PIN saat ini: <strong>1234</strong> (untuk demo)
                  </p>
                  <Button variant="outline" size="sm">
                    Ubah PIN
                  </Button>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <Button variant="outline">
                    Unduh Data Anak
                  </Button>
                  <Button variant="outline">
                    Ekspor Laporan
                  </Button>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Keluar dari Akun
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}