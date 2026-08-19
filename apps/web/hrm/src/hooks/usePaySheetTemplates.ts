import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listPaySheetTemplates, type HrmPaySheetTemplateRecord } from '@/integrations/hrmApi';

/**
 * @CODE-MEMORY
 * Screen:     /payroll · Tạo kỳ — picker mẫu bảng lương
 * UC:         AC-PAY-TPL-03
 * Purpose:    Load active pay-sheet-templates for period bind — NOT salary-templates enroll pack.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01
 * must_keep:  active_only · cấm merge pack API
 */
export function usePaySheetTemplates(opts?: { activeOnly?: boolean; enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const activeOnly = opts?.activeOnly ?? true;

  return useQuery<HrmPaySheetTemplateRecord[]>({
    queryKey: ['pay-sheet-templates', currentCompanyId, activeOnly],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await listPaySheetTemplates({
        company_id: currentCompanyId,
        active_only: activeOnly,
        status: activeOnly ? 'active' : undefined,
      });
      return res.items.filter((row) => !row.archivedAt);
    },
    enabled: Boolean(currentCompanyId) && (opts?.enabled ?? true),
    staleTime: 60_000,
  });
}
