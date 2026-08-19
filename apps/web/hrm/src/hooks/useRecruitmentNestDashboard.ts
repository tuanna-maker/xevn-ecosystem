/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → Dashboard («bao giờ đủ người»)
 * UC:         UC-BP-REC-08 · AC-REC-08-01..10
 * BR:         BR-REC-08-BE-FORMULA · VAL-01/02 · U19 scope · U65
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-08 Diễn biến #1–#3
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md F-REC-DASH-01/02
 * Purpose:    React Query — GET Nest dashboard only (include=yctd). Clear data on error (no stale).
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    RecruitmentNestDashboardPanel
 * Callees:    getRecruitmentDashboard · toErrorMessage
 * FEActions:  filter year|from-to → GET → toast PERIOD-400/SCOPE-409 · bind DTO
 * Impact:     Keep FE aggregator as KH SoT = FAIL AC-09
 * must_keep:  Physical path · F5 filter via URL · honesty false · C-SLICE
 * SOLID:      Hook SRP — display-only bind; no domain aggregate
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Replace FE job-postings aggregator SoT with Nest GET
 * Why: BA O1–O10 · SOLID 25 §3.1 · AC-REC-08-09
 * must_keep: J-HRM-05 YCTD detail · board kanban separate · U65
 */

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { toast } from '@/hooks/use-toast';
import {
  getRecruitmentDashboard,
  type HrmRecruitmentDashboardDto,
  type HrmRecruitmentDashboardQuery,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';

export type RecDashPeriodMode = 'year' | 'range';

export type UseRecruitmentNestDashboardParams = {
  enabled: boolean;
  mode: RecDashPeriodMode;
  year: number;
  from: string;
  to: string;
  departmentKey?: string;
  positionKey?: string;
};

function buildQuery(
  companyId: string,
  params: UseRecruitmentNestDashboardParams,
): HrmRecruitmentDashboardQuery | null {
  const base: HrmRecruitmentDashboardQuery = {
    company_id: companyId,
    include: 'yctd',
  };
  if (params.departmentKey?.trim()) base.department_key = params.departmentKey.trim();
  if (params.positionKey?.trim()) base.position_key = params.positionKey.trim();

  if (params.mode === 'year') {
    if (!Number.isFinite(params.year) || params.year < 2000 || params.year > 2100) return null;
    return { ...base, year: params.year };
  }
  const from = params.from.trim();
  const to = params.to.trim();
  if (!/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) return null;
  if (from > to) return null;
  return { ...base, from, to };
}

export function useRecruitmentNestDashboard(params: UseRecruitmentNestDashboardParams) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = coerceHrmListCompanyId(listCompanyId || currentCompanyId || '');

  const queryParams = useMemo(
    () => (companyId ? buildQuery(companyId, params) : null),
    [companyId, params],
  );

  const query = useQuery({
    queryKey: ['recruitment_nest_dashboard', queryParams],
    queryFn: async (): Promise<HrmRecruitmentDashboardDto> => {
      if (!queryParams) {
        throw new ApiClientError({
          status: 400,
          code: 'HRM-REC-DASH-PERIOD-400',
          message: 'Kỳ lọc không hợp lệ. Chọn năm hoặc khoảng from–to (yyyy-MM).',
        });
      }
      return getRecruitmentDashboard(queryParams);
    },
    enabled: params.enabled && !!companyId && !!queryParams,
    retry: false,
    // Never keep previous success payload after filter/error (AC-REC-08-EX-01).
    placeholderData: undefined,
  });

  useEffect(() => {
    if (!query.isError || !query.error) return;
    toast({
      title: 'Không tải được bảng điều khiển tuyển',
      description: toErrorMessage(
        query.error,
        'Không tải được chỉ số tuyển dụng. Kiểm tra kỳ lọc và phạm vi đơn vị.',
      ),
      variant: 'destructive',
    });
  }, [query.isError, query.error]);

  const data = query.isError ? null : (query.data ?? null);

  return {
    companyId,
    queryParams,
    data,
    loading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
