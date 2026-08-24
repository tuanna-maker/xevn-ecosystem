import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadCompanyDepartments } from '@/lib/hrmDepartmentCatalog';

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

export function useDepartments(opts?: { enabled?: boolean }) {
  const enabled = opts?.enabled !== false;
  const { currentCompanyId } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !currentCompanyId) {
      setDepartments([]);
      setIsLoading(false);
      return;
    }

    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const { rows, fetchError } = await loadCompanyDepartments(currentCompanyId);
        if (fetchError) {
          console.error('Error fetching departments:', fetchError);
        }
        setDepartments(rows);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDepartments();
  }, [currentCompanyId, enabled]);

  return { departments, isLoading };
}
