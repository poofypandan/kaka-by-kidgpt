import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDemoMode } from '@/hooks/useDemoMode';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  roles?: string[];
  requireProfile?: boolean;
}

export function AuthGuard({ children, roles, requireProfile = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { isDemoMode, demoData } = useDemoMode();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow demo mode to bypass auth
  if (isDemoMode && demoData.user) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If roles are specified but user doesn't have required role
  // This would require fetching user profile from database
  // For now, we'll implement basic auth guard
  
  return <>{children}</>;
}

export function requireAuth(roles?: string[]) {
  return function AuthHOC(Component: React.ComponentType) {
    return function AuthenticatedComponent(props: any) {
      return (
        <AuthGuard roles={roles}>
          <Component {...props} />
        </AuthGuard>
      );
    };
  };
}