import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from './useEmployees';

export function useEmployee(employeeId: string | undefined) {
  const { memberships } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId || memberships.length === 0) {
      setEmployee(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const companyIds = memberships.map(m => m.company_id);

    try {
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .in('company_id', companyIds)
        .is('deleted_at', null)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setError('Không tìm thấy nhân viên');
        setEmployee(null);
      } else {
        setEmployee(data);
      }
    } catch (err: any) {
      console.error('Error fetching employee:', err);
      setError('Không thể tải thông tin nhân viên');
      setEmployee(null);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, memberships]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return {
    employee,
    isLoading,
    error,
    refetch: fetchEmployee,
  };
}
