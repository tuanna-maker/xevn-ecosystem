/**
 * @CODE-MEMORY
 * Screen:     /reports — Báo cáo tổng hợp
 * UC:         HRM-PR-06 · HRM-OP-04 · UC-BP-REC-08 (recruitment tab O8)
 * BR:         BR-RPT-SCOPE-01 · BR-REC-08-REPORTS-ONE
 * SRS:        docs/hrm/SRS.md · FR-UC-BP-REC-08
 * TechSpec:   PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01 §11
 * Purpose:    Load Reports tabs via Nest aggregates. Recruitment = same dashboard DTO subset.
 * WorkItem:   P1-HRM-MENU-QA-REPORTS-FIX · PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-07-17
 *
 * must_keep:  U65 no seed; company scope coerce; HRM-PR-06 recon wired
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Recruitment tab → GET /recruitment/dashboard?year= — DENY buildRecruitmentReportFromApi
 * Why: BA O8 · AC-REC-08-10
 * must_keep: other report tabs · turnover override · U65
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getEmployeesSummary,
  getOperationsSummary,
  getPayrollReconciliationSummary,
  getRecruitmentDashboard,
  listEmployeeContracts,
  listEmployees,
  listExpiringContracts,
  listLeaveRequests,
  type HrmEmployeeSummary,
} from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import {
  buildContractReportFromApi,
  buildLeaveReportFromApi,
  buildTurnoverReportFromApi,
  mapOperationsSummaryReport,
  mapPayrollReconciliation,
  mapRecruitmentReportFromNestDashboard,
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

export type DepartmentHeadcount = { name: string; value: number };

export type ReportsActiveTab =
  | 'overview'
  | 'recruitment'
  | 'contracts'
  | 'leave'
  | 'turnover'
  | 'services'
  | 'tools';

function needsTabPayload(tab: ReportsActiveTab): boolean {
  return tab === 'recruitment' || tab === 'contracts' || tab === 'leave' || tab === 'turnover';
}

function departmentHeadcountsFromSummary(empSummary: HrmEmployeeSummary): DepartmentHeadcount[] {
  return (empSummary.by_department ?? [])
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: d.department.length > 15 ? `${d.department.substring(0, 15)}...` : d.department,
      value: d.count,
    }));
}

export function useReportsData(year: number, activeTab: ReportsActiveTab = 'overview') {
  const [isLoading, setIsLoading] = useState(true);
  const [recruitment, setRecruitment] = useState<RecruitmentReport | null>(null);
  const [contracts, setContracts] = useState<ContractReport | null>(null);
  const [leave, setLeave] = useState<LeaveReport | null>(null);
  const [turnover, setTurnover] = useState<TurnoverReport | null>(null);
  const [operationsSummary, setOperationsSummary] = useState<OperationsSummaryReport | null>(null);
  const [employeeTotal, setEmployeeTotal] = useState<number | null>(null);
  const [departmentHeadcounts, setDepartmentHeadcounts] = useState<DepartmentHeadcount[]>([]);
  const [payrollReconciliation, setPayrollReconciliation] = useState<
    NonNullable<OperationsSummaryReport['payrollReconciliation']> | null
  >(null);
  const { currentCompanyId } = useAuth();

  const fetchTabPayload = useCallback(
    async (companyId: string, activeTotal: number) => {
      const [dashRes, expiringRes, contractRes, leaveRes, employeeRes] = await Promise.all([
        getRecruitmentDashboard({ company_id: companyId, year }),
        listExpiringContracts({ company_id: companyId, days: 30 }),
        listEmployeeContracts({ company_id: companyId, page_size: HRM_API_MAX_PAGE_SIZE }),
        listLeaveRequests({ company_id: companyId }),
        listEmployees({
          company_id: companyId,
          include_archived: true,
          page: 1,
          page_size: HRM_API_MAX_PAGE_SIZE,
        }),
      ]);

      setRecruitment(mapRecruitmentReportFromNestDashboard(dashRes));
      setContracts(
        buildContractReportFromApi(contractRes.data ?? [], expiringRes.total ?? 0, year),
      );
      setLeave(buildLeaveReportFromApi(leaveRes.data ?? [], year));
      setTurnover(
        buildTurnoverReportFromApi(employeeRes.data ?? [], year, new Date(), {
          totalActiveOverride: activeTotal,
        }),
      );
    },
    [year],
  );

  const fetchAll = useCallback(async () => {
    if (!currentCompanyId) {
      setIsLoading(false);
      return;
    }
    const companyId = coerceHrmListCompanyId(currentCompanyId);
    setIsLoading(true);

    try {
      const [opsSummary, recon, empSummary] = await Promise.all([
        getOperationsSummary(companyId),
        getPayrollReconciliationSummary(companyId),
        getEmployeesSummary({ company_id: companyId, include_archived: true }),
      ]);

      const mappedOps = mapOperationsSummaryReport(opsSummary);
      const reconMapped = mapPayrollReconciliation(recon);
      if (reconMapped) {
        mappedOps.payrollReconciliation = reconMapped;
      }
      setOperationsSummary(mappedOps);
      setPayrollReconciliation(reconMapped);

      const activeTotal = empSummary.active_count ?? empSummary.total ?? 0;
      setEmployeeTotal(activeTotal);
      setDepartmentHeadcounts(departmentHeadcountsFromSummary(empSummary));

      if (needsTabPayload(activeTab)) {
        await fetchTabPayload(companyId, activeTotal);
      }
    } catch (error) {
      console.error('Reports API fetch failed:', error);
      setOperationsSummary(null);
      setEmployeeTotal(null);
      setDepartmentHeadcounts([]);
      setPayrollReconciliation(null);
      setRecruitment(null);
      setContracts(null);
      setLeave(null);
      setTurnover(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, activeTab, fetchTabPayload]);

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
    departmentHeadcounts,
    payrollReconciliation,
    /** Payslips dump removed — use payrollReconciliation (HRM-PR-06). */
    payrollNetTotal: null as number | null,
    refetch: fetchAll,
  };
}
