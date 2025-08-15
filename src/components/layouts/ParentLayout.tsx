import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Home, 
  Users, 
  Shield, 
  Settings, 
  AlertTriangle,
  Bell,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

interface ParentLayoutProps {
  children: ReactNode;
}

export function ParentLayout({ children }: ParentLayoutProps) {
  const { familyMember, family } = useUserRole();
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/family-dashboard',
      icon: Home,
      roles: ['primary_parent', 'secondary_parent']
    },
    {
      name: 'Anak-anak',
      href: '/children',
      icon: Users,
      roles: ['primary_parent', 'secondary_parent']
    },
    {
      name: 'Keamanan',
      href: '/safety',
      icon: Shield,
      roles: ['primary_parent', 'secondary_parent']
    },
    {
      name: 'Pengaturan',
      href: '/settings',
      icon: Settings,
      roles: ['primary_parent', 'secondary_parent']
    },
    {
      name: 'Tagihan',
      href: '/billing',
      icon: Users,
      roles: ['primary_parent']
    }
  ];

  const handleEmergencyOverride = () => {
    // TODO: Implement emergency override functionality
    navigate('/emergency-override');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredNavItems = navigationItems.filter(item => 
    familyMember && item.roles.includes(familyMember.role)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <span className="font-bold text-foreground">Kaka Family</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Family info */}
          <div className="p-6 border-b">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {family?.name?.charAt(0) || 'F'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{family?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {familyMember?.role === 'primary_parent' ? 'Orang Tua Utama' : 'Orang Tua'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Emergency Override */}
          <div className="p-6 border-t">
            <Button 
              variant="outline" 
              className="w-full mb-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleEmergencyOverride}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Override Darurat
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            {/* Real-time status indicators */}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                Keluarga Aktif
              </Badge>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-xs">
                3
              </Badge>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}