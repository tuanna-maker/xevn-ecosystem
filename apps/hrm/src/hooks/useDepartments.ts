import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Department {
  id: string;
  name: string;
  code: string | null;
  company_id: string;
  employee_count: number | null;
  manager_name: string | null;
  manager_email: string | null;
  parent_id: string | null;
  level: number | null;
  status: string;
  description: string | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export function useDepartments() {
  const { currentCompanyId } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentCompanyId) {
      setDepartments([]);
      setIsLoading(false);
      return;
    }

    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .eq('company_id', currentCompanyId)
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, [currentCompanyId]);

  return { departments, isLoading };
}
