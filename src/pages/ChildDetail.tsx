import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MessageCircle, 
  Settings, 
  Trash2, 
  Clock, 
  Shield, 
  Activity,
  Eye,
  Heart,
  Calendar,
  Timer
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number;
  daily_time_limit: number;
  content_filter_level: string;
  islamic_content_enabled: boolean;
}

interface ChildSession {
  id: string;
  duration_minutes: number;
  safety_alerts_count: number;
  started_at: string;
  ended_at?: string;
}

export default function ChildDetail() {
  const { childId } = useParams();
  const navigate = useNavigate();
  
  const [child, setChild] = useState<FamilyMember | null>(null);
  const [sessions, setSessions] = useState<ChildSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChildData();
    }
  }, [childId]);

  const loadChildData = async () => {
    try {
      setLoading(true);
      
      // Get child details
      const { data: childData, error: childError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', childId)
        .single();

      if (childError) throw childError;
      setChild(childData);

      // Get recent sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('child_sessions')
        .select('*')
        .eq('child_id', childId)
        .order('started_at', { ascending: false })
        .limit(10);

      if (!sessionError) {
        setSessions(sessionData || []);
      }

    } catch (error: any) {
      console.error('Error loading child data:', error);
      toast.error('Gagal memuat data anak');
      navigate('/family-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startChatWithChild = () => {
    navigate(`/child-chat/${childId}`);
  };

  const editChildProfile = () => {
    navigate(`/edit-child/${childId}`);
  };

  const removeChildProfile = async () => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', childId);

      if (error) throw error;

      toast.success(`Profil ${child?.name} berhasil dihapus`);
      navigate('/family-dashboard');
    } catch (error: any) {
      console.error('Error removing child:', error);
      toast.error('Gagal menghapus profil anak');
    }
  };

  const getSafetyStatus = () => {
    const todayAlerts = sessions
      .filter(s => new Date(s.started_at).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.safety_alerts_count, 0);
    
    if (todayAlerts === 0) return { status: 'safe', color: 'success', label: 'Aman', icon: Shield };
    if (todayAlerts <= 2) return { status: 'caution', color: 'warning', label: 'Perhatian', icon: Eye };
    return { status: 'alert', color: 'destructive', label: 'Peringatan', icon: Activity };
  };

  const getTodayUsage = () => {
    return sessions
      .filter(s => new Date(s.started_at).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.duration_minutes, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profil anak tidak ditemukan</p>
          <Button onClick={() => navigate('/family-dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const safety = getSafetyStatus();
  const todayUsage = getTodayUsage();
  const SafetyIcon = safety.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/10">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/family-dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {child.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-bold">{child.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {child.age ? `${child.age} tahun` : 'Profil Anak'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={safety.color === 'warning' ? 'destructive' : safety.color as any} className="flex items-center gap-1">
                <SafetyIcon className="h-3 w-3" />
                {safety.label}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Button 
            size="lg" 
            onClick={startChatWithChild}
            className="h-16 text-lg gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <MessageCircle className="h-6 w-6" />
            Mulai Chat dengan Kaka
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={editChildProfile}
            className="h-16 text-lg gap-3"
          >
            <Settings className="h-6 w-6" />
            Pengaturan Anak
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="lg"
                className="h-16 text-lg gap-3"
              >
                <Trash2 className="h-6 w-6" />
                Hapus Profil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Profil Anak</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus profil {child.name}? 
                  Tindakan ini tidak dapat dibatalkan dan akan menghapus semua riwayat percakapan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={removeChildProfile} className="bg-destructive hover:bg-destructive/90">
                  Hapus Profil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usia</p>
                  <p className="text-2xl font-bold">{child.age || '-'} tahun</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waktu Hari Ini</p>
                  <p className="text-2xl font-bold">{todayUsage} min</p>
                  <p className="text-xs text-muted-foreground">dari {child.daily_time_limit} min</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Filter Konten</p>
                  <p className="text-lg font-bold capitalize">{child.content_filter_level}</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nilai Keluarga</p>
                  <p className="text-lg font-bold">{child.islamic_content_enabled ? 'Kustom' : 'Universal'}</p>
                </div>
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Riwayat Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      Chat Session - {session.duration_minutes} menit
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.started_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.safety_alerts_count > 0 && (
                      <Badge variant="destructive">
                        {session.safety_alerts_count} peringatan
                      </Badge>
                    )}
                    <Badge variant="outline">
                      <Timer className="h-3 w-3 mr-1" />
                      {session.duration_minutes}m
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada aktivitas</p>
                <p className="text-sm text-muted-foreground">
                  Mulai chat dengan Kaka untuk melihat riwayat aktivitas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}