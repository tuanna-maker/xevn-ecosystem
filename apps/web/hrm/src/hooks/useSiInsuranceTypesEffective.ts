/**
 * @CODE-MEMORY
 * Screen:     /insurance · EmployeeInsurance · Settings SI rate-cfg — effective type picker
 * UC:         AC-PLT-SI-INS-01 · BR-PLT-06 · VAL-SI-CNS-04
 * BR:         Consumer binds F-SI-CAT-EFF-01 — cấm Settings MD insurance_types sole SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md §4
 * API_DESIGN: GET /contracts-insurance/insurance-types/effective
 * Purpose:    React Query cache cho effective SI insurance-type catalog (Nest + REF; SI wins).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    InsurancePolicyMasterPanel · AddInsuranceDialog · EmployeeInsurance · SettingsDefaultsPanel
 * Callees:    listEffectiveSiInsuranceTypes · siInsuranceTypesToPickerOptions
 * must_keep:  empty → []; retire ẩn; U65 no seed; enrollment/CTR seals; printable/personnel false
 * SOLID:      RQ read owner — Settings panel mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveSiInsuranceTypes } from '@/integrations/hrmApi';
import {
  resolveSiInsuranceTypeLabel,
  siInsuranceTypesToPickerOptions,
  siInsuranceTypesToRateCfgPickerOptions,
  withSiInsuranceTypeHistoryOption,
} from '@/lib/siInsuranceTypeCatalog';

export const SI_INSURANCE_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-si-insurance-types-effective';

export function siInsuranceTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [SI_INSURANCE_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useSiInsuranceTypesEffective(opts?: {
  enabled?: boolean;
  /** When editing a retired/archived key, keep it selectable for history. */
  historyKey?: string | null;
}) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: siInsuranceTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveSiInsuranceTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const items = query.data?.items ?? [];

  const insuranceTypeOptions = useMemo(() => {
    const base = siInsuranceTypesToPickerOptions(items);
    return withSiInsuranceTypeHistoryOption(base, opts?.historyKey);
  }, [items, opts?.historyKey]);

  const rateCfgTypeOptions = useMemo(
    () => siInsuranceTypesToRateCfgPickerOptions(items),
    [items],
  );

  const insuranceTypeDisplayLabel = (code: string | null | undefined) =>
    resolveSiInsuranceTypeLabel(insuranceTypeOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [SI_INSURANCE_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items,
    insuranceTypeOptions,
    rateCfgTypeOptions,
    insuranceTypeDisplayLabel,
    hasEffectiveCatalog: items.length > 0,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
