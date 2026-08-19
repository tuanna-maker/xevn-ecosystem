/**
 * @CODE-MEMORY
 * Screen:     /recruitment — form đổi trạng thái UV (effective catalog)
 * UC:         AC-PLT-REC-02 · AC-PLT-REC-05 · BR-PLT-06
 * BR:         Consumer binds F-REC-CAT-EFF — cấm FE hardcode six starter SoT khi catalog >0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §3.3
 * API_DESIGN: GET /recruitment/pipeline-stages/effective
 * Purpose:    React Query cache cho effective pipeline-stage catalog + hiredOutcomeKey.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * Coded:      2026-08-07
 * Callers:    CandidatesTab · JobCandidatesDialog · CandidateFormDialog · Recruitment (hire + kanban)
 * Callees:    listEffectiveRecPipelineStages · recPipelineStagesToPickerOptions
 * must_keep:  empty → soft-allow starter display; retire ẩn; U65 no seed; recruitment_uat_ready=false · JD/IV/YCTD
 * SOLID:      RQ read owner — Settings panel mutate → invalidate cùng key
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Callers expand — Recruitment kanban columns + ScheduleInterviewDialog soft-gate consume items/catalogCount
 * Why: VAL-REC-CNS-04/05 · RETAIN picker consumers
 * must_keep: hiredOutcomeKey · empty soft-allow · no UAT flip
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveRecPipelineStages } from '@/integrations/hrmApi';
import {
  recPipelineStagesToPickerOptions,
  resolveRecPipelineStageLabel,
} from '@/lib/recPipelineStageCatalog';

export const REC_PIPELINE_STAGES_EFFECTIVE_QUERY_KEY = 'hrm-rec-pipeline-stages-effective';

export function recPipelineStagesEffectiveQueryKey(companyId: string | null | undefined) {
  return [REC_PIPELINE_STAGES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useRecPipelineStagesEffective(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: recPipelineStagesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveRecPipelineStages({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const stageOptions = useMemo(
    () => recPipelineStagesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const hiredOutcomeKey = query.data?.hiredOutcomeKey ?? null;

  const stageDisplayLabel = (code: string | null | undefined, fallback?: string | null) =>
    resolveRecPipelineStageLabel(stageOptions, code, fallback);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [REC_PIPELINE_STAGES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    stageOptions,
    hiredOutcomeKey,
    catalogCount: query.data?.items?.length ?? 0,
    stageDisplayLabel,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
