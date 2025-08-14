import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface FamilyMember {
  id: string;
  family_id: string;
  role: 'primary_parent' | 'secondary_parent' | 'child';
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

export function useFamilyAuth() {
  const { user, loading: authLoading } = useAuth();
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      loadFamilyMemberData();
    } else if (!user && !authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadFamilyMemberData = async () => {
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
      console.error('Error loading family member data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createFamily = async (familyName: string, parentName: string, parentPhone: string) => {
    try {
      const { data: familyId, error } = await supabase.rpc('create_family_account', {
        p_family_name: familyName,
        p_parent_name: parentName,
        p_parent_phone: parentPhone
      });

      if (error) throw error;

      // Reload family data
      await loadFamilyMemberData();
      return { success: true, familyId };
    } catch (error: any) {
      console.error('Error creating family:', error);
      return { success: false, error: error.message };
    }
  };

  const joinFamily = async (inviteCode: string, parentName: string, parentPhone: string) => {
    try {
      const { data: familyId, error } = await supabase.rpc('join_family_with_code', {
        p_invite_code: inviteCode.toUpperCase(),
        p_parent_name: parentName,
        p_parent_phone: parentPhone
      });

      if (error) throw error;

      // Reload family data
      await loadFamilyMemberData();
      return { success: true, familyId };
    } catch (error: any) {
      console.error('Error joining family:', error);
      return { success: false, error: error.message };
    }
  };

  const addChild = async (childName: string, age: number, dailyTimeLimit: number = 60) => {
    try {
      if (!family) throw new Error('No family found');

      const { data: childId, error } = await supabase.rpc('add_child_to_family', {
        p_family_id: family.id,
        p_child_name: childName,
        p_age: age,
        p_daily_time_limit: dailyTimeLimit
      });

      if (error) throw error;

      return { success: true, childId };
    } catch (error: any) {
      console.error('Error adding child:', error);
      return { success: false, error: error.message };
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

  return {
    familyMember,
    family,
    loading: loading || authLoading,
    error,
    createFamily,
    joinFamily,
    addChild,
    isParent,
    isPrimaryParent,
    isChild,
    hasFamily,
    refetch: loadFamilyMemberData
  };
}