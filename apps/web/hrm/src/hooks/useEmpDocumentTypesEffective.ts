/**
 * @CODE-MEMORY
 * Screen:     /settings · EMP — effective document-type picker cache
 * UC:         AC-PLT-EMP-02/03 · BR-PLT-06
 * BR:         Consumer binds F-EMP-CAT-EFF-01 — cấm FE hardcode cccd|cv|…
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3
 * API_DESIGN: GET /employees/document-types/effective
 * Purpose:    React Query cache cho effective EMP document catalog.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * Coded:      2026-08-07
 * Callers:    EmpDocumentTypeSettingsPanel (preview picker)
 * Callees:    listEffectiveEmpDocumentTypes · empDocumentTypesToPickerOptions
 * must_keep:  empty → []; retire ẩn; U65 no seed; hrm_personnel_uat_ready=false
 * SOLID:      RQ read owner — Settings panel mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveEmpDocumentTypes } from '@/integrations/hrmApi';
import {
  empDocumentTypesToPickerOptions,
  resolveEmpDocumentTypeLabel,
} from '@/lib/empDocumentTypeCatalog';

export const EMP_DOCUMENT_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-emp-document-types-effective';

export function empDocumentTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [EMP_DOCUMENT_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useEmpDocumentTypesEffective(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: empDocumentTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveEmpDocumentTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const documentTypeOptions = useMemo(
    () => empDocumentTypesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const documentTypeDisplayLabel = (code: string | null | undefined) =>
    resolveEmpDocumentTypeLabel(documentTypeOptions, code);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [EMP_DOCUMENT_TYPES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    documentTypeOptions,
    documentTypeDisplayLabel,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
