import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChildMode } from '@/components/ChildModeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Users, Star } from 'lucide-react';
import { calculateAge } from '@/lib/grade';
import { useChildren, type Child } from '@/hooks/useChildren';

export default function ChildSelection() {
  const { user, loading: authLoading } = useAuth();
  const { setChildMode, setChildren } = useChildMode();
  const { children, loading, refreshChildren } = useChildren();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    // Set children in context when they change
    setChildren(children);
  }, [user, authLoading, navigate, children, setChildren]);

  const handleChildSelect = (child: Child) => {
    setChildMode(child);
  };

  const getAgeDisplay = (birthdate?: string) => {
    if (!birthdate) return '';
    const age = calculateAge(new Date(birthdate));
    return `${age} tahun`;
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/parent')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
              alt="Kaka Logo" 
              className="h-8 w-16 object-contain"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Pilih Anak yang Akan Bermain
            </h1>
            <p className="text-gray-600">
              Ketuk profil anak untuk mulai belajar bersama Kaka
            </p>
          </div>

          {children.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Belum Ada Profil Anak</h3>
                <p className="text-gray-600 mb-4">
                  Tambahkan profil anak terlebih dahulu di dashboard orang tua
                </p>
                <Button onClick={() => navigate('/parent')}>
                  Kembali ke Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card 
                  key={child.id}
                  className="cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-primary/20 bg-white/90 backdrop-blur-sm"
                  onClick={() => handleChildSelect(child)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {child.first_name.charAt(0).toUpperCase()}
                    </div>
                    <CardTitle className="text-xl text-gray-800">
                      {child.first_name}
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Badge variant="outline" className="bg-blue-50">
                        Kelas {child.grade}
                      </Badge>
                      {child.birthdate && (
                        <Badge variant="outline" className="bg-purple-50">
                          {getAgeDisplay(child.birthdate)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="text-center space-y-3">
                    {/* Usage Progress */}
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300"
                        style={{ 
                          width: `${Math.min((child.used_today_min / child.daily_limit_min) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="text-sm">
                      <span className={`font-medium ${getUsageColor(child.used_today_min, child.daily_limit_min)}`}>
                        {child.used_today_min} / {child.daily_limit_min} menit
                      </span>
                      <p className="text-gray-500 text-xs">waktu belajar hari ini</p>
                    </div>

                    {/* Play button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      size="lg"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Mulai Bermain
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Indonesian cultural elements */}
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center space-x-4 text-2xl">
              <span>🇮🇩</span>
              <span className="text-lg font-medium text-gray-600">
                Belajar dengan budaya Indonesia
              </span>
              <span>📚</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}