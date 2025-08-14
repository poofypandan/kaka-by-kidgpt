import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Child {
  id: string;
  first_name: string;
  grade: number;
  birthdate?: string;
  daily_limit_min: number;
  used_today_min: number;
}

export function useChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('children')
        .select('id, first_name, grade, birthdate, daily_limit_min, used_today_min')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched children:', data);
      const childrenData = data || [];
      setChildren(childrenData);
      return childrenData;
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Gagal memuat data anak');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refreshChildren = () => {
    fetchChildren();
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  return {
    children,
    loading,
    refreshChildren,
    fetchChildren
  };
}