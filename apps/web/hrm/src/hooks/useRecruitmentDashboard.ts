import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments } from '@/hooks/useDepartments';
import { useKanbanCandidates } from '@/hooks/useKanbanCandidates';
import {
  aggregateCandidatesByAppliedMonth,
  aggregateCandidatesByDepartment,
  buildCandidateCompanySlugMap,
  buildCandidateDepartmentMap,
  buildRecruitmentCostSummary,
  sumActiveJobPostingHeadcount,
  type RecruitmentBarChartRow,
  type RecruitmentCostSummary,
  type RecruitmentLineChartRow,
} from '@/lib/recruitmentDashboardAggregator';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listCandidateApplications, listJobPostings } from '@/integrations/hrmApi';

export function useRecruitmentDashboard(enabled: boolean) {
  const { currentCompanyId } = useAuth();
  const {
    candidates,
    loading: candidatesLoading,
    stats,
    updateCandidateStage,
    refetch,
  } = useKanbanCandidates();
  const { departments, isLoading: departmentsLoading } = useDepartments({ enabled });

  const { operatingUnitLabelMap } = useHrmOperatingUnitFilter();

  const enrichmentQuery = useQuery({
    queryKey: ['recruitment_dashboard_enrichment', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) {
        return {
          departmentByCandidateId: new Map<string, string>(),
          companySlugByCandidateId: new Map<string, string>(),
          targetHeadcount: 0,
        };
      }
      const [applicationsRes, jobPostingsRes] = await Promise.all([
        listCandidateApplications({ company_id: currentCompanyId }),
        listJobPostings({ company_id: currentCompanyId }),
      ]);
      const jobPostings = jobPostingsRes.data ?? [];
      return {
        departmentByCandidateId: buildCandidateDepartmentMap(applicationsRes.data ?? [], jobPostings),
        companySlugByCandidateId: buildCandidateCompanySlugMap(applicationsRes.data ?? [], jobPostings),
        targetHeadcount: sumActiveJobPostingHeadcount(jobPostings),
      };
    },
    enabled: enabled && !!currentCompanyId,
  });

  const operatingUnitLabels = operatingUnitLabelMap;

  const catalogDepartmentNames = useMemo(
    () => departments.map((dept) => dept.name).filter(Boolean),
    [departments],
  );

  const dashboardCandidates = useMemo(
    () =>
      candidates.map((candidate) => ({
        id: candidate.id,
        appliedDate: candidate.appliedDate,
        source: candidate.source,
      })),
    [candidates],
  );

  const departmentChartData: RecruitmentBarChartRow[] = useMemo(
    () =>
      aggregateCandidatesByDepartment(
        dashboardCandidates,
        enrichmentQuery.data?.departmentByCandidateId,
        catalogDepartmentNames,
        enrichmentQuery.data?.companySlugByCandidateId,
        operatingUnitLabels,
      ),
    [
      dashboardCandidates,
      enrichmentQuery.data?.departmentByCandidateId,
      enrichmentQuery.data?.companySlugByCandidateId,
      catalogDepartmentNames,
      operatingUnitLabels,
    ],
  );

  const monthlyChartData: RecruitmentLineChartRow[] = useMemo(
    () => aggregateCandidatesByAppliedMonth(dashboardCandidates),
    [dashboardCandidates],
  );

  const costSummary: RecruitmentCostSummary = useMemo(
    () => buildRecruitmentCostSummary(dashboardCandidates),
    [dashboardCandidates],
  );

  const targetHeadcount = enrichmentQuery.data?.targetHeadcount ?? 0;

  return {
    candidates,
    candidatesLoading,
    stats,
    updateCandidateStage,
    refetch,
    departmentChartData,
    monthlyChartData,
    costSummary,
    targetHeadcount,
    loading:
      candidatesLoading ||
      enrichmentQuery.isLoading ||
      (enabled && departmentsLoading && catalogDepartmentNames.length === 0),
  };
}
