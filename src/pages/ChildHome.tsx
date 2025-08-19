import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildMode } from '@/components/ChildModeContext';
import { useDemoMode } from '@/hooks/useDemoMode';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageCircle, BookOpen, Gamepad2, Music, Palette, Globe, Shield, Clock, Phone, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ChildHome() {
  const { currentChild, exitChildMode, isChildMode, autoLogoutMinutes, lastActivity } = useChildMode();
  const { isDemoMode, demoData, exitDemo } = useDemoMode();
  const { t } = useTranslation();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Allow demo mode to bypass child mode checks
    if (isDemoMode) {
      return;
    }
    
    if (!isChildMode || !currentChild) {
      navigate('/child-selection');
      return;
    }
  }, [isChildMode, currentChild, navigate, isDemoMode]);

  // Timer display
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      const remaining = Math.max(0, autoLogoutMinutes - timeDiff);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, autoLogoutMinutes]);

  const activities = [
    {
      id: 'chat',
      title: t('child.chatWithKaka'),
      description: t('child.askKakaAnything'),
      icon: MessageCircle,
      color: 'from-blue-400 to-blue-600',
      action: () => navigate('/chat')
    },
    {
      id: 'stories',
      title: t('child.nusantaraStories'),
      description: t('child.listenFolktales'),
      icon: BookOpen,
      color: 'from-green-400 to-green-600',
      action: () => navigate('/activities?tab=stories')
    },
    {
      id: 'games',
      title: t('child.educationalGames'),
      description: t('child.playLearnCulture'),
      icon: Gamepad2,
      color: 'from-purple-400 to-purple-600',
      action: () => navigate('/activities?tab=games')
    },
    {
      id: 'songs',
      title: t('child.indonesianChildrenSongs'),
      description: t('child.singTraditionalSongs'),
      icon: Music,
      color: 'from-pink-400 to-pink-600',
      action: () => navigate('/activities?tab=songs')
    },
    {
      id: 'drawing',
      title: t('child.drawingColoring'),
      description: t('child.createTraditionalArt'),
      icon: Palette,
      color: 'from-yellow-400 to-orange-500',
      action: () => navigate('/activities?tab=drawing')
    },
    {
      id: 'geography',
      title: t('child.exploreIndonesia'),
      description: t('child.knowDiversityArchipelago'),
      icon: Globe,
      color: 'from-indigo-400 to-indigo-600',
      action: () => navigate('/activities?tab=geography')
    }
  ];

  const handleParentMode = () => {
    setShowPinDialog(true);
  };

  const handlePinSubmit = () => {
    // Simple PIN for demo - in production, use secure authentication
    if (pin === '1234') {
      setShowPinDialog(false);
      setPin('');
      if (isDemoMode) {
        exitDemo();
        navigate('/parent');
      } else {
        exitChildMode();
      }
    } else {
      toast.error('PIN salah! Coba lagi.');
      setPin('');
    }
  };

  const handleEmergencyCall = () => {
    // In a real app, this would trigger emergency protocols
    toast.success('Memanggil orang tua...');
    if (isDemoMode) {
      exitDemo();
      navigate('/parent');
    } else {
      exitChildMode();
    }
  };

  const formatTimeLeft = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hrs > 0 ? `${hrs}j ${mins}m` : `${mins}m`;
  };

  // Get current child from demo data or child mode
  const displayChild = isDemoMode ? demoData.children[0] : currentChild;
  
  if (!displayChild && !isDemoMode) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Child-friendly header */}
      <header className="bg-white/90 backdrop-blur-sm border-b-4 border-rainbow shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
                alt="Kaka Logo" 
                className="h-12 w-24 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Halo, {displayChild?.first_name || 'Teman'}! 👋
                </h1>
                <p className="text-gray-600">Mau belajar apa hari ini?</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  {formatTimeLeft(timeLeft)}
                </span>
              </div>

              {/* Emergency call button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmergencyCall}
                className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
              >
                <Phone className="h-4 w-4 mr-1" />
                Panggil Ayah/Ibu
              </Button>

              {/* Parent mode access */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleParentMode}
                className="p-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl animate-pulse">
            {displayChild?.first_name?.charAt(0).toUpperCase() || 'K'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Selamat Datang di Dunia Kaka! 🌟
          </h2>
          <p className="text-gray-600 text-lg">
            Pilih aktivitas seru yang ingin kamu lakukan
          </p>
        </div>

        {/* Main chat button */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-500 border-0 shadow-2xl transform hover:scale-105 transition-transform duration-200">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-16 w-16 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Chat dengan Kaka 💬
              </h3>
              <p className="text-blue-100 mb-6">
                Tanya apa saja ke Kaka! Dia siap membantu belajar
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/chat')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-xl shadow-lg text-lg"
              >
                Mulai Chat Sekarang! ✨
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {activities.slice(1).map((activity) => {
            const IconComponent = activity.icon;
            return (
              <Card 
                key={activity.id}
                className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl bg-white/90 backdrop-blur-sm border-2 border-transparent hover:border-primary/20"
                onClick={activity.action}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-sm lg:text-base">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 text-xs lg:text-sm">
                    {activity.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Indonesian cultural elements */}
        <div className="text-center py-8">
          <div className="flex justify-center items-center space-x-4 text-3xl mb-4">
            <span>🇮🇩</span>
            <span>🏛️</span>
            <span>🎭</span>
            <span>🎪</span>
            <span>🎨</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Belajar Budaya Indonesia Bersama Kaka
          </h3>
          <p className="text-gray-600">
            Mengenal keragaman dan kekayaan Nusantara dengan cara yang menyenangkan
          </p>
        </div>

        {/* Safety reminder */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Kaka Selalu Menjaga Keamanan</h4>
                <p className="text-green-600 text-sm">
                  Semua percakapan dipantau untuk memastikan pengalaman belajar yang aman
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* PIN Dialog for Parent Access */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Akses Mode Orang Tua</DialogTitle>
            <DialogDescription>
              Masukkan PIN untuk kembali ke dashboard orang tua
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Masukkan PIN (1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
              className="text-center text-lg"
              maxLength={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinDialog(false)}>
              Batal
            </Button>
            <Button onClick={handlePinSubmit}>
              Masuk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}