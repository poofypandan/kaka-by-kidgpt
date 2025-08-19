import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Shield, 
  MessageCircle, 
  Settings, 
  Bell, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Phone,
  BarChart3,
  Activity,
  Eye,
  Timer,
  Heart
} from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  role: 'primary_parent' | 'secondary_parent' | 'child';
  age?: number;
  daily_time_limit: number;
  phone?: string;
}

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

interface Family {
  id: string;
  name: string;
  invite_code?: string;
  invite_expires_at?: string;
}

interface ChildSession {
  id: string;
  child_id: string;
  duration_minutes: number;
  safety_alerts_count: number;
  started_at: string;
  ended_at?: string;
}

interface FamilyNotification {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  child_id?: string;
}

export default function FamilyDashboard() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<FamilyMember[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [childSessions, setChildSessions] = useState<ChildSession[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    try {
      setLoading(true);
      
      // Get current user info first
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log('FamilyDashboard - Current auth user:', authUser?.id);
      
      if (!authUser) {
        throw new Error('No authenticated user');
      }

      // Get user from public.users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError || !userData) {
        console.error('User not found in users table:', userError);
        throw new Error('User data not found');
      }

      // Check if user has parent record
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('id, user_id')
        .eq('user_id', userData.id)
        .maybeSingle();

      console.log('FamilyDashboard - Parent data:', parentData);
      
      if (parentData) {
        // User is using the children/parents system - load children directly
        setCurrentUserRole('parent');
        
        // Get children from children table
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', parentData.id);
          
        console.log('FamilyDashboard - Children data:', childrenData);
        
        if (!childrenError) {
          setChildren(childrenData || []);
        }
        
        // Set empty family for now
        setFamily({ id: 'legacy', name: 'Keluarga' });
        setFamilyMembers([]);
        setParents([]);
      } else {
        // Try family system as fallback
        try {
          // First get parent data to get parent_id
          const { data: parentData, error: parentError } = await supabase
            .from('parents')
            .select('id, full_name')
            .eq('user_id', userData.id)
            .single();

          if (!parentError && parentData) {
            setCurrentUserRole('parent');
            
            // Load children directly from children table
            const { data: childrenData, error: childrenError } = await supabase
              .from('children')
              .select('*')
              .eq('parent_id', parentData.id);

            if (!childrenError && childrenData) {
              setChildren(childrenData);
            } else {
              console.error('Error loading children:', childrenError);
              setChildren([]);
            }

            // Set family info (simplified for now)
            setFamily({ id: parentData.id, name: 'Keluarga ' + parentData.full_name });
            setFamilyMembers([]);
            setParents([]);
          } else {
            throw new Error('No parent data found');
          }
        } catch (error) {
          console.log('No parent data found, showing empty state');
          setCurrentUserRole('parent');
          setFamily({ id: 'none', name: 'Keluarga' });
          setChildren([]);
          setFamilyMembers([]);
          setParents([]);
        }
      }

      // Get notifications (skip for now to avoid errors)
      setNotifications([]);

      // Load child sessions after children are loaded
      await loadChildSessions();

    } catch (error: any) {
      console.error('Error loading family data:', error);
      toast.error('Gagal memuat data keluarga');
    } finally {
      setLoading(false);
    }
  };

  const loadChildSessions = async () => {
    try {
      if (children.length === 0) return;

      // Get today's child sessions
      const today = new Date().toISOString().split('T')[0];
      const childIds = children.map(c => c.id);
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('child_sessions')
        .select('*')
        .gte('started_at', today)
        .in('child_id', childIds);

      if (!sessionError) {
        setChildSessions(sessionData || []);
      }
    } catch (error) {
      console.error('Error loading child sessions:', error);
    }
  };

  // Real-time subscription for children changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('family-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children'
        },
        () => {
          // Reload family data when children are added/modified
          loadFamilyData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members'
        },
        () => {
          // Reload family data when family members are added/modified
          loadFamilyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Load sessions when children change
  useEffect(() => {
    if (children.length > 0) {
      loadChildSessions();
    }
  }, [children]);

  const generateNewInviteCode = async () => {
    try {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from('families')
        .update({
          invite_code: inviteCode,
          invite_expires_at: expiresAt.toISOString()
        })
        .eq('id', family?.id);

      if (error) throw error;

      setFamily(prev => prev ? {
        ...prev,
        invite_code: inviteCode,
        invite_expires_at: expiresAt.toISOString()
      } : null);

      toast.success('Kode undangan baru telah dibuat');
    } catch (error: any) {
      console.error('Error generating invite code:', error);
      toast.error('Gagal membuat kode undangan');
    }
  };

  const startChildSession = (childId: string) => {
    // Navigate to child selection page first to set child mode
    navigate('/child-selection');
  };

  const getSafetyStatus = (childId: string) => {
    const todaySessions = childSessions.filter(s => s.child_id === childId);
    const totalAlerts = todaySessions.reduce((sum, s) => sum + s.safety_alerts_count, 0);
    
    if (totalAlerts === 0) return { status: 'safe', color: 'success', label: 'Aman' };
    if (totalAlerts <= 2) return { status: 'caution', color: 'warning', label: 'Perhatian' };
    return { status: 'alert', color: 'destructive', label: 'Peringatan' };
  };

  const getTodayUsage = (childId: string) => {
    const todaySessions = childSessions.filter(s => s.child_id === childId);
    return todaySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/family-auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/10">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Heart className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">Kaka Family</h1>
                  <p className="text-sm text-muted-foreground">{family?.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageToggle />
              
              <Badge variant="outline" className="hidden md:flex">
                {currentUserRole === 'primary_parent' ? t('family.primaryParent') :
                 currentUserRole === 'secondary_parent' ? t('family.secondaryParent') : 'Anak'}
              </Badge>
              
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1 py-0 text-xs min-w-0 h-5">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
              
              <Button variant="outline" size="icon" onClick={() => navigate('/family-settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" onClick={handleSignOut}>
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.children')}</span>
            </TabsTrigger>
            <TabsTrigger value="safety" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.security')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t('dashboard.reports')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalChildren')}</p>
                      <p className="text-2xl font-bold">{children.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('dashboard.todayTime')}</p>
                      <p className="text-2xl font-bold">
                        {childSessions.reduce((sum, s) => sum + s.duration_minutes, 0)} min
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('dashboard.safetyStatus')}</p>
                      <p className="text-2xl font-bold text-green-600">{t('dashboard.safe')}</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('dashboard.notifications')}</p>
                      <p className="text-2xl font-bold">{notifications.length}</p>
                    </div>
                    <Bell className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Children Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('dashboard.children')}
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard.todayActivitySafety')}
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   {children.map((child) => {
                     const safety = getSafetyStatus(child.id);
                     const todayUsage = getTodayUsage(child.id);
                     
                 return (
                    <div 
                      key={child.id} 
                      className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/child-profile/${child.id}`)}
                    >
                     <div className="flex items-center gap-3">
                       <Avatar className="group-hover:scale-105 transition-transform">
                         <AvatarFallback className="bg-primary text-primary-foreground">
                           {child.first_name.charAt(0)}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-medium group-hover:text-primary transition-colors">{child.first_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {todayUsage}/{child.daily_limit_min} {t('dashboard.minutesToday')}
                          </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <Badge variant={safety.color as any}>
                         {safety.label}
                       </Badge>
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/child-chat/${child.id}`);
                          }}
                          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Chat
                        </Button>
                     </div>
                   </div>
                 );
                   })}
                  
                    {children.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">Belum ada anak yang ditambahkan</p>
                        <Button onClick={() => navigate('/onboarding')}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Tambah Anak
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Family Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Aktivitas Keluarga
                  </CardTitle>
                  <CardDescription>
                    Ringkasan aktivitas terbaru
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {notification.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />}
                      {notification.severity === 'high' && <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />}
                      {notification.severity === 'medium' && <Bell className="h-4 w-4 text-blue-500 mt-0.5" />}
                      {notification.severity === 'low' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {notifications.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">Tidak ada notifikasi</p>
                      <p className="text-sm text-muted-foreground">Keluarga Anda aman!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Kelola Anak</h2>
                <p className="text-muted-foreground">Tambah dan kelola profil anak-anak dalam keluarga</p>
              </div>
              <Button onClick={() => navigate('/add-child')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Tambah Anak
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => {
                const safety = getSafetyStatus(child.id);
                const todayUsage = getTodayUsage(child.id);
                
                return (
                  <Card 
                    key={child.id} 
                    className="group hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/child-profile/${child.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                         <Avatar className="h-16 w-16 group-hover:scale-105 transition-transform">
                           <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                             {child.first_name.charAt(0)}
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                           <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                             {child.first_name}
                           </h3>
                           <p className="text-muted-foreground">
                             Kelas {child.grade}
                           </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={safety.color as any}>
                              {safety.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-muted-foreground">Waktu hari ini</span>
                           <span className="font-medium">{todayUsage}/{child.daily_limit_min} menit</span>
                         </div>
                         
                         <div className="w-full bg-muted rounded-full h-2">
                           <div 
                             className="bg-primary h-2 rounded-full transition-all"
                             style={{ width: `${Math.min((todayUsage / child.daily_limit_min) * 100, 100)}%` }}
                           />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                           <Button 
                             size="sm" 
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/child-chat/${child.id}`);
                             }}
                             className="flex-1"
                           >
                             <MessageCircle className="h-4 w-4 mr-2" />
                             Chat
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm"
                             onClick={(e) => {
                               e.stopPropagation();
                               navigate(`/child-profile/${child.id}`);
                             }}
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/edit-child/${child.id}`);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Dashboard Keamanan</h2>
              <p className="text-muted-foreground">Monitor percakapan dan keamanan anak secara real-time</p>
            </div>

            {/* Safety alerts and monitoring content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Peringatan Keamanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Tidak ada peringatan keamanan</p>
                    <p className="text-sm text-muted-foreground">Semua percakapan aman!</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Keluarga & Undangan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Anggota Keluarga</h4>
                    <div className="space-y-2">
                      {parents.map((parent) => (
                        <div key={parent.id} className="flex items-center justify-between">
                          <span className="text-sm">{parent.name}</span>
                          <Badge variant="outline">
                            {parent.role === 'primary_parent' ? 'Utama' : 'Kedua'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {currentUserRole === 'primary_parent' && (
                    <div>
                      <h4 className="font-medium mb-2">Undang Orang Tua Kedua</h4>
                      {family?.invite_code ? (
                        <div className="space-y-2">
                          <div className="p-3 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Kode Undangan</p>
                            <p className="text-lg font-mono font-bold">{family.invite_code}</p>
                            <p className="text-xs text-muted-foreground">
                              Berlaku sampai: {family.invite_expires_at && 
                                new Date(family.invite_expires_at).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={generateNewInviteCode}>
                            Buat Kode Baru
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={generateNewInviteCode}>
                          Buat Kode Undangan
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Laporan & Analitik</h2>
              <p className="text-muted-foreground">Analisis pola penggunaan dan perkembangan anak</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Penggunaan Mingguan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Grafik akan tersedia setelah beberapa hari penggunaan</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Topik Pembelajaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Data topik akan muncul setelah sesi chat</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}