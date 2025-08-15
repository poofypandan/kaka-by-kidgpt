import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Activity, Settings, Shield, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Child {
  id: string;
  first_name: string;
  grade: number;
  birthdate?: string;
  daily_limit_min: number;
  used_today_min: number;
  parent_id: string;
  user_id: string;
}

interface ChildSession {
  id: string;
  child_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  safety_alerts_count: number;
}

const ChildProfile = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [sessions, setSessions] = useState<ChildSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChildData = async () => {
    if (!childId) return;

    try {
      setLoading(true);
      
      // Load child data
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();

      if (childError) {
        console.error('Error loading child:', childError);
        toast.error('Gagal memuat data anak');
        return;
      }

      setChild(childData);

      // Load recent sessions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: sessionData, error: sessionError } = await supabase
        .from('child_sessions')
        .select('*')
        .eq('child_id', childId)
        .gte('started_at', sevenDaysAgo.toISOString())
        .order('started_at', { ascending: false })
        .limit(10);

      if (!sessionError) {
        setSessions(sessionData || []);
      }

    } catch (error) {
      console.error('Error loading child data:', error);
      toast.error('Gagal memuat data anak');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildData();
  }, [childId]);

  const startChatWithChild = () => {
    navigate(`/child-chat/${childId}`);
  };

  const editChildProfile = () => {
    navigate(`/settings`);
  };

  const viewActivityHistory = () => {
    navigate(`/activities`);
  };

  const getSafetyStatus = () => {
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.started_at).toDateString();
      const today = new Date().toDateString();
      return sessionDate === today;
    });

    const totalAlerts = todaySessions.reduce((sum, s) => sum + s.safety_alerts_count, 0);
    
    if (totalAlerts === 0) return { status: 'Aman', color: 'bg-green-500' };
    if (totalAlerts <= 2) return { status: 'Waspada', color: 'bg-yellow-500' };
    return { status: 'Perhatian', color: 'bg-red-500' };
  };

  const getTodayUsage = () => {
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.started_at).toDateString();
      const today = new Date().toDateString();
      return sessionDate === today;
    });

    return todaySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  };

  const getAge = () => {
    if (!child?.birthdate) return null;
    const today = new Date();
    const birthDate = new Date(child.birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat profil anak...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Profil anak tidak ditemukan</p>
          <Button onClick={() => navigate('/family-dashboard')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const age = getAge();
  const safetyStatus = getSafetyStatus();
  const todayUsage = getTodayUsage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/family-dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Dashboard
          </Button>
        </div>

        {/* Child Profile Header */}
        <Card className="mb-6 border-orange-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20 border-4 border-orange-200">
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-2xl font-bold">
                  {child.first_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{child.first_name}</h1>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  {age && <span>Umur: {age} tahun</span>}
                  <span>Kelas: {child.grade}</span>
                  <Badge 
                    className={`${safetyStatus.color} text-white`}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {safetyStatus.status}
                  </Badge>
                </div>
                <div className="mt-3">
                  <p className="text-lg text-orange-700 font-medium">
                    🎯 Kaka siap mengobrol dengan {child.first_name}!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={startChatWithChild}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Mulai Chat</h3>
              <p className="text-sm text-muted-foreground">Chat dengan Kaka AI</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={viewActivityHistory}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Aktivitas</h3>
              <p className="text-sm text-muted-foreground">Lihat riwayat aktivitas</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={editChildProfile}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Pengaturan</h3>
              <p className="text-sm text-muted-foreground">Kelola profil anak</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Penggunaan Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-800">{todayUsage}</span>
                <span className="text-sm text-muted-foreground">/ {child.daily_limit_min} menit</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((todayUsage / child.daily_limit_min) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Star className="mr-2 h-4 w-4" />
                Status Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${safetyStatus.color}`}></div>
                <span className="text-lg font-semibold text-gray-800">{safetyStatus.status}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.started_at).toDateString();
                  const today = new Date().toDateString();
                  return sessionDate === today;
                }).reduce((sum, s) => sum + s.safety_alerts_count, 0)} peringatan hari ini
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                Aktivitas Minggu Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-800">{sessions.length}</span>
                <span className="text-sm text-muted-foreground">sesi</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {sessions.reduce((sum, s) => sum + s.duration_minutes, 0)} total menit
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Sesi Chat - {session.duration_minutes} menit
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.started_at).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    {session.safety_alerts_count > 0 && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        {session.safety_alerts_count} peringatan
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Belum ada aktivitas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {child.first_name} belum memulai chat dengan Kaka
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChildProfile;