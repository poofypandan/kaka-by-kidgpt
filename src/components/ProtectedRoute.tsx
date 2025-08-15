import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiresFamily?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requiresFamily = true 
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { familyMember, family, loading: roleLoading, hasRole } = useUserRole();
  const { isDemoMode, demoData } = useDemoMode();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow demo mode to bypass auth and role checks
  if (isDemoMode && demoData.user) {
    return <>{children}</>;
  }

  // Check authentication
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check family membership requirement
  if (requiresFamily && (!family || !familyMember)) {
    return <Navigate to="/family-auth" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && familyMember && !hasRole(allowedRoles)) {
    // Redirect based on user's actual role
    if (familyMember.role === 'child') {
      return <Navigate to="/child-dashboard" replace />;
    } else {
      return <Navigate to="/family-dashboard" replace />;
    }
  }

  return <>{children}</>;
}