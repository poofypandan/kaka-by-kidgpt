import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'primary_parent' | 'secondary_parent' | 'child';

interface FamilyMember {
  id: string;
  family_id: string;
  role: UserRole;
  name: string;
  age?: number;
  phone?: string;
  daily_time_limit: number;
  content_filter_level: string;
  islamic_content_enabled: boolean;
}

interface Family {
  id: string;
  name: string;
  invite_code?: string;
  invite_expires_at?: string;
}

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      loadUserRole();
    } else if (!user && !authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadUserRole = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user's internal ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user?.id)
        .single();

      if (userError) throw userError;

      // Get family member data with family info
      const { data: familyMemberData, error: memberError } = await supabase
        .from('family_members')
        .select(`
          *,
          families (
            id,
            name,
            invite_code,
            invite_expires_at
          )
        `)
        .eq('user_id', userData.id)
        .single();

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          // No family member found - user needs to create or join a family
          setFamilyMember(null);
          setFamily(null);
        } else {
          throw memberError;
        }
      } else {
        setFamilyMember(familyMemberData as FamilyMember);
        setFamily(familyMemberData.families);
      }
    } catch (error: any) {
      console.error('Error loading user role:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isParent = () => {
    return familyMember?.role === 'primary_parent' || familyMember?.role === 'secondary_parent';
  };

  const isPrimaryParent = () => {
    return familyMember?.role === 'primary_parent';
  };

  const isChild = () => {
    return familyMember?.role === 'child';
  };

  const hasFamily = () => {
    return family !== null && familyMember !== null;
  };

  const hasRole = (roles: UserRole[]) => {
    return familyMember ? roles.includes(familyMember.role) : false;
  };

  return {
    familyMember,
    family,
    role: familyMember?.role || null,
    loading: loading || authLoading,
    error,
    isParent,
    isPrimaryParent,
    isChild,
    hasFamily,
    hasRole,
    refetch: loadUserRole
  };
}