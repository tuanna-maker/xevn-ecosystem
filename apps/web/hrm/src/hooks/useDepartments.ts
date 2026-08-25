import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { loadCompanyDepartments, CatalogDepartmentRow } from '@/lib/hrmDepartmentCatalog';
import type { HrmSpreadsheetScope } from '@/integrations/hrmApi';

export interface Department extends CatalogDepartmentRow {}

export function useDepartments(opts?: { enabled?: boolean; companyId?: string; scope?: HrmSpreadsheetScope | null }) {
  const enabled = opts?.enabled !== false;
  const { currentCompanyId } = useAuth();
  const activeCompanyId = opts?.companyId && opts.companyId !== 'ALL_COMPANY' ? opts.companyId : currentCompanyId;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !activeCompanyId) {
      setDepartments([]);
      setIsLoading(false);
      return;
    }

    const fetchDepartments = async () => {
      setIsLoading(true);
      try {
        const { rows, fetchError } = await loadCompanyDepartments(activeCompanyId, opts?.scope);
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
  }, [activeCompanyId, enabled, opts?.scope]);

  return { departments, isLoading };
}
