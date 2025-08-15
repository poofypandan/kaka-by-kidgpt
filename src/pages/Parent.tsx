import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { AuthGuard } from '@/components/AuthGuard';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, BarChart3, Shield } from 'lucide-react';
import { AddChildDialog } from '@/components/AddChildDialog';
import SafetyDashboard from '@/components/SafetyDashboard';
import { useState, useEffect } from 'react';
import { useChildren } from '@/hooks/useChildren';

function ParentDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { isDemoMode, demoData, exitDemo } = useDemoMode();
  const { children: fetchedChildren, loading, refreshChildren } = useChildren();
  const [children, setChildren] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Add loading state and auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // For demo mode, continue to current dashboard
  // For real users, redirect to family dashboard
  useEffect(() => {
    if (!isDemoMode && user) {
      console.log('Redirecting to family dashboard...');
      navigate('/family-dashboard', { replace: true });
    }
  }, [isDemoMode, user, navigate]);

  useEffect(() => {
    // Use demo data if in demo mode, otherwise use fetched children
    if (isDemoMode) {
      setChildren(demoData.children);
    } else {
      setChildren(fetchedChildren);
    }
  }, [isDemoMode, demoData.children, fetchedChildren]);

  const handleSignOut = async () => {
    if (isDemoMode) {
      exitDemo();
      window.location.href = '/';
    } else {
      await signOut();
    }
  };

  const totalLearningTime = children.reduce((sum, child) => sum + (child.used_today_min || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-20 flex items-center justify-center">
              <img 
                src="/lovable-uploads/3c6d677b-f566-47d7-8a38-d8f86401741b.png" 
                alt="Kakak Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pembelajaran yang Aman</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Hello!</p>
              <p className="text-xs text-muted-foreground">
                {isDemoMode ? 'Demo Parent' : user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your children's learning activities and safety
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="safety">Safety Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Children
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
              <p className="text-xs text-muted-foreground">
                Active children profiles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Learning Time
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLearningTime} min</div>
              <p className="text-xs text-muted-foreground">
                Today's total learning time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Safety Status
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Active</div>
              <p className="text-xs text-muted-foreground">
                All conversations monitored
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Children List */}
        {children.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Profil Anak</CardTitle>
                <CardDescription>
                  Kelola profil dan pengaturan untuk setiap anak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {child.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{child.first_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Kelas {child.final_grade || child.grade}</span>
                            {child.grade_override && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                                Manual
                              </span>
                            )}
                            <span>•</span>
                            <span>{child.daily_limit_min} menit/hari</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <p className="font-medium">{child.used_today_min || 0} min</p>
                          <p className="text-muted-foreground">hari ini</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

          {/* Getting Started Section */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  {children.length === 0 ? "Getting Started" : "Tambah Anak Lain"}
                </CardTitle>
                <CardDescription>
                  {children.length === 0 
                    ? "Set up your first child's profile to begin monitoring their learning journey"
                    : "Tambahkan profil anak lainnya untuk monitoring yang lebih lengkap"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddChildDialog onChildAdded={refreshChildren} />
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          <TabsContent value="safety">
            <SafetyDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function Parent() {
  return (
    <AuthGuard>
      <ParentDashboard />
    </AuthGuard>
  );
}