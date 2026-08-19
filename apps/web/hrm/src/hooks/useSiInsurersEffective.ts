/**
 * @CODE-MEMORY
 * Screen:     /insurance · AddInsuranceDialog — effective insurer picker
 * UC:         AC-PLT-SI-INSURER-01 · BR-PLT-06 · VAL-SI-INR-CNS-01 · E3 AC-INS-02
 * BR:         Consumer binds F-SI-CAT-INS-EFF-01 — cấm Settings MD insurers sole SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md §4
 * API_DESIGN: GET /contracts-insurance/insurers/effective
 * Purpose:    React Query cache cho effective SI insurer catalog (Nest + REF; SI wins).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    InsurancePolicyMasterPanel · AddInsuranceDialog · SiInsurerSettingsPanel
 * Callees:    listEffectiveSiInsurers · siInsurersToPickerOptions
 * must_keep:  empty → []; retire ẩn; U65 no seed; SI type L1 RETAIN; enrollment/CTR seals; printable/personnel false
 * SOLID:      RQ read owner — Settings panel mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveSiInsurers } from '@/integrations/hrmApi';
import {
  resolveSiInsurerLabel,
  siInsurersToPickerOptions,
  withSiInsurerHistoryOption,
} from '@/lib/siInsurerCatalog';

export const SI_INSURERS_EFFECTIVE_QUERY_KEY = 'hrm-si-insurers-effective';

export function siInsurersEffectiveQueryKey(companyId: string | null | undefined) {
  return [SI_INSURERS_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useSiInsurersEffective(opts?: {
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
    queryKey: siInsurersEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveSiInsurers({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const items = query.data?.items ?? [];

  const insurerOptions = useMemo(() => {
    const base = siInsurersToPickerOptions(items);
    return withSiInsurerHistoryOption(base, opts?.historyKey);
  }, [items, opts?.historyKey]);

  const insurerDisplayLabel = (code: string | null | undefined) =>
    resolveSiInsurerLabel(insurerOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [SI_INSURERS_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items,
    insurerOptions,
    insurerDisplayLabel,
    hasEffectiveCatalog: items.length > 0,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
