import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useFamilyAuth } from '@/hooks/useFamilyAuth';
import { useAuth } from '@/hooks/useAuth';

interface RoleBasedRoutingProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackRoute?: string;
}

export function RoleBasedRouting({ 
  children, 
  allowedRoles, 
  fallbackRoute = '/auth' 
}: RoleBasedRoutingProps) {
  const { user, loading: authLoading } = useAuth();
  const { familyMember, loading: familyLoading } = useFamilyAuth();

  // Show loading while authentication and family data is being fetched
  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding if no family member found
  if (!familyMember) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if user's role is allowed
  const userRole = familyMember.role;
  const hasPermission = allowedRoles.includes(userRole);

  if (!hasPermission) {
    return <Navigate to={fallbackRoute} replace />;
  }

  return <>{children}</>;
}

// Convenience components for common role combinations
export function ParentRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRouting allowedRoles={['primary_parent', 'secondary_parent']}>
      {children}
    </RoleBasedRouting>
  );
}

export function ChildRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRouting allowedRoles={['child']} fallbackRoute="/parent">
      {children}
    </RoleBasedRouting>
  );
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <RoleBasedRouting allowedRoles={['primary_parent']} fallbackRoute="/family-dashboard">
      {children}
    </RoleBasedRouting>
  );
}