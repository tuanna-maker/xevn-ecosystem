import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadCompanyDepartments, CatalogDepartmentRow } from '@/lib/hrmDepartmentCatalog';

export interface Department extends CatalogDepartmentRow {}

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
