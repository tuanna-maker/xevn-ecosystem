import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getOperationsSummary,
  listEmployeeContracts,
  listEmployees,
  listExpiringContracts,
  listLeaveRequests,
  listPayrollPayslips,
  listRecruitmentCandidates,
} from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import {
  buildContractReportFromApi,
  buildLeaveReportFromApi,
  buildRecruitmentReportFromApi,
  buildTurnoverReportFromApi,
  mapOperationsSummaryReport,
  type ContractReport,
  type LeaveReport,
  type OperationsSummaryReport,
  type RecruitmentReport,
  type TurnoverReport,
} from '@/hooks/reportsApiAggregator';

export type {
  RecruitmentReport,
  ContractReport,
  LeaveReport,
  TurnoverReport,
  OperationsSummaryReport,
};

export function useReportsData(year: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [recruitment, setRecruitment] = useState<RecruitmentReport | null>(null);
  const [contracts, setContracts] = useState<ContractReport | null>(null);
  const [leave, setLeave] = useState<LeaveReport | null>(null);
  const [turnover, setTurnover] = useState<TurnoverReport | null>(null);
  const [operationsSummary, setOperationsSummary] = useState<OperationsSummaryReport | null>(null);
  const [employeeTotal, setEmployeeTotal] = useState<number | null>(null);
  const [payrollNetTotal, setPayrollNetTotal] = useState<number | null>(null);
  const { currentCompanyId } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!currentCompanyId) {
      setIsLoading(false);
      return;
    }
    const companyId = coerceHrmListCompanyId(currentCompanyId);
    setIsLoading(true);

    try {
      const [opsSummary, recruitmentRes, expiringRes, contractRes, leaveRes, employeeRes, payslipRes] =
        await Promise.all([
          getOperationsSummary(companyId),
          listRecruitmentCandidates({
            company_id: companyId,
            page: 1,
            page_size: HRM_API_MAX_PAGE_SIZE,
          }),
          listExpiringContracts({ company_id: companyId, days: 30 }),
          listEmployeeContracts({ company_id: companyId, page_size: HRM_API_MAX_PAGE_SIZE }),
          listLeaveRequests({ company_id: companyId }),
          listEmployees({ company_id: companyId, page_size: HRM_API_MAX_PAGE_SIZE }),
          listPayrollPayslips({ company_id: companyId }),
        ]);

      setOperationsSummary(mapOperationsSummaryReport(opsSummary));
      setEmployeeTotal(employeeRes.total ?? employeeRes.data?.length ?? 0);
      const netSum = (payslipRes.data ?? []).reduce((sum, row) => {
        const n = Number.parseFloat(String(row.net_amount ?? 0));
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);
      setPayrollNetTotal(netSum);
      setRecruitment(buildRecruitmentReportFromApi(recruitmentRes.data ?? [], year));
      setContracts(
        buildContractReportFromApi(
          contractRes.data ?? [],
          expiringRes.total ?? 0,
          year,
        ),
      );
      setLeave(buildLeaveReportFromApi(leaveRes.data ?? [], year));
      setTurnover(buildTurnoverReportFromApi(employeeRes.data ?? [], year));
    } catch (error) {
      console.error('Reports API fetch failed:', error);
      setOperationsSummary(null);
      setEmployeeTotal(null);
      setPayrollNetTotal(null);
      setRecruitment(null);
      setContracts(null);
      setLeave(null);
      setTurnover(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, year]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    isLoading,
    recruitment,
    contracts,
    leave,
    turnover,
    operationsSummary,
    employeeTotal,
    payrollNetTotal,
    refetch: fetchAll,
  };
}
