/**
 * @CODE-MEMORY
 * Screen:     /settings · /decisions — effective decision-type picker cache
 * UC:         AC-PLT-DEC-01..06 · BR-PLT-06 · VAL-DEC-CNS
 * BR:         Consumer binds F-DEC-CAT-EFF-01 — cấm FE hardcode appointment|HRD_* closed SoT
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §3
 * API_DESIGN: GET /decisions/decision-types/effective
 * Purpose:    React Query cache cho effective DEC decision catalog (dual SoT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
 * Coded:      2026-08-07
 * Callers:    DecDecisionTypeSettingsPanel · Decisions.tsx
 * Callees:    listEffectiveDecDecisionTypes · decDecisionTypesToPickerOptions
 * must_keep:  empty → []; retire ẩn; U65 no seed; decisions UAT=false; F-CORE-DEC create/approve
 * SOLID:      RQ read owner — Settings panel mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveDecDecisionTypes } from '@/integrations/hrmApi';
import {
  decDecisionTypesToPickerOptions,
  resolveDecDecisionTypeLabel,
  withDecDecisionTypeHistoryOption,
} from '@/lib/decDecisionTypeCatalog';

export const DEC_DECISION_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-dec-decision-types-effective';

export function decDecisionTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [DEC_DECISION_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useDecDecisionTypesEffective(opts?: {
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
    queryKey: decDecisionTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveDecDecisionTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const items = query.data?.items ?? [];

  const decisionTypeOptions = useMemo(() => {
    const base = decDecisionTypesToPickerOptions(items);
    return withDecDecisionTypeHistoryOption(base, opts?.historyKey);
  }, [items, opts?.historyKey]);

  const personBoundKeys = useMemo(
    () => items.filter((r) => r.isPersonBound).map((r) => r.decisionTypeKey),
    [items],
  );

  const workHistoryKeys = useMemo(
    () => items.filter((r) => r.writesWorkHistory).map((r) => r.decisionTypeKey),
    [items],
  );

  const decisionTypeDisplayLabel = (code: string | null | undefined) =>
    resolveDecDecisionTypeLabel(decisionTypeOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [DEC_DECISION_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items,
    decisionTypeOptions,
    personBoundKeys,
    workHistoryKeys,
    decisionTypeDisplayLabel,
    hasEffectiveCatalog: items.length > 0,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
