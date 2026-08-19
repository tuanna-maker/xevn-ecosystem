/**
 * @CODE-MEMORY
 * Screen:     /payroll · /settings · EMP Đãi ngộ — Nest salary_components effective cache
 * UC:         AC-PLT-PAY-01/01b · AC-PAY-COMP-01 · BR-PLT-02 · L-PAY-AC-02/04
 * BR:         Consumer binds F-PLT-PAY-COMP-01 — cấm Settings extension sole SoT · cấm invent/seed
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md §4
 * API_DESIGN: GET /api/hrm/payroll/salary-components
 * Purpose:    React Query cache Nest salary_components cho consumer pickers (peer EMP/DEC/ATT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * Coded:      2026-08-07
 * Callers:    PayFormulaAuthorPanel · EmployeeCompensationPanel · PaySheetTemplateSettingsPanel (optional) · SalaryTemplatesTab
 * Callees:    listSalaryComponents · nestSalaryComponentsToPickerOptions
 * must_keep:  empty → []; retire ẩn; U65 no seed; payroll_e2e_ready=false; admin CREATE path riêng
 * SOLID:      RQ read owner — admin mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listSalaryComponents, type HrmSalaryComponentRow } from '@/integrations/hrmApi';
import {
  nestSalaryComponentSoftWarn,
  nestSalaryComponentsToIdPickerOptions,
  nestSalaryComponentsToPickerOptions,
  PAY_SALARY_COMPONENT_EMPTY_NEST_HINT,
  PAY_SALARY_COMPONENT_UAT_HONESTY,
  resolveNestSalaryComponentLabel,
  withNestSalaryComponentHistoryOption,
} from '@/lib/salaryComponentCatalog';

export const SALARY_COMPONENTS_EFFECTIVE_QUERY_KEY = 'hrm-pay-salary-components-effective';

export function salaryComponentsEffectiveQueryKey(companyId: string | null | undefined) {
  return [SALARY_COMPONENTS_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useSalaryComponentsEffective(opts?: {
  enabled?: boolean;
  /** When editing a retired code, keep it selectable for history. */
  historyCode?: string | null;
}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: salaryComponentsEffectiveQueryKey(companyId),
    queryFn: async () => {
      const res = await listSalaryComponents(companyId!);
      return (res.data ?? []) as HrmSalaryComponentRow[];
    },
    enabled,
    staleTime: 30_000,
  });

  const items = query.data ?? [];

  const componentOptions = useMemo(() => {
    const base = nestSalaryComponentsToPickerOptions(items);
    return withNestSalaryComponentHistoryOption(base, opts?.historyCode);
  }, [items, opts?.historyCode]);

  const componentIdOptions = useMemo(
    () => nestSalaryComponentsToIdPickerOptions(items),
    [items],
  );

  const componentDisplayLabel = (code: string | null | undefined) =>
    resolveNestSalaryComponentLabel(componentOptions, code);

  const softWarnForCode = (code: string | null | undefined) =>
    nestSalaryComponentSoftWarn(componentOptions.length, code, componentOptions);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [SALARY_COMPONENTS_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items,
    componentOptions,
    componentIdOptions,
    componentDisplayLabel,
    softWarnForCode,
    emptyNestHint: PAY_SALARY_COMPONENT_EMPTY_NEST_HINT,
    hasEffectiveCatalog: componentOptions.length > 0,
    honestyReady: PAY_SALARY_COMPONENT_UAT_HONESTY,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
