/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tabs Đãi ngộ / Lịch sử
 * UC:         UC-BP-CORE-02 · UC-HRM-CI-08..11 · UC-HRM-INT-03
 * BR:         BR-CD-F5-01..07 · BR-BP-SEC-02 · AC-CORE-CB-01/02
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-02 · docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md F-CORE-EMP-02
 * Purpose:    Load active/list/history compensation packages; create + revise
 *             (versioned) — never PATCH lines in place; bank/MST on C&B SoT only.
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 *
 * Callers:
 *   - EmployeeCompensationPanel.tsx
 *   - EmployeeCompensationHistoryPanel.tsx
 *
 * Callees:
 *   - createCompensationPackage / reviseCompensationPackage / list* / getActive*
 *
 * FE-Actions:
 *   | User action     | Handler           | API                                      |
 *   |-----------------|-------------------|------------------------------------------|
 *   | Lưu gói mới     | createPackage     | POST .../compensation-packages           |
 *   | Tăng lương      | revisePackage     | POST .../:id/revise                      |
 *   | Mở tab Lịch sử  | refetchHistory     | GET .../compensation-history             |
 *
 * Impact:     U65 F5 persist; payroll reads active package not contracts.salary
 * must_keep:  Scope company_id + JWT same as contracts; revise not overwrite
 * SOLID:      Hook owns server state; panel owns form UX
 * LastVerified: useEmployeeCompensation.test.ts · compensationLines.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01
 * change_mode: ADD (restore transitive)
 * What: Khôi phục useEmployeeCompensation từ stash 43c479a (callee của Compensation panels)
 * must_keep: company_id scope · revise not overwrite · U65 · no EMP BE rewrite
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01
 * change_mode: ADD
 * What: Lines from panel already include component_code (SRC-02); passthrough unchanged
 * Why: R-EMP-SH-FE-CB-CLICK — create/revise POST body must keep component_code
 * must_keep: revise not overwrite · company_id scope · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Passthrough bank_account / bank_name / bank_branch / tax_id on create+revise;
 *       toast AuthZ-403 / OVERLAP / VAL via toErrorMessage; physical packages* only.
 * Why: UC-BP-CORE-02 O1/O6 · API-01 F-CORE-EMP-02 bank/MST · AC-CORE-CB-02 public still clean
 * must_keep: DENY Nest /core SoT · same-form public+salary · FE invent payslip · CORE-01≠C&B DONE · U65 · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-fe-01.md
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import {
  createCompensationPackage,
  getActiveCompensationPackage,
  listCompensationHistory,
  listCompensationPackages,
  reviseCompensationPackage,
  type HrmCompensationBankTaxInput,
  type HrmCompensationHistoryRecord,
  type HrmCompensationLineInput,
  type HrmCompensationPackageRecord,
} from '@/integrations/hrmApi';
import { toast } from 'sonner';

export function useEmployeeCompensation(employeeId: string | undefined) {
  const { currentCompanyId } = useAuth();
  const useApi = shouldSkipSupabaseDataFetches();
  const [packages, setPackages] = useState<HrmCompensationPackageRecord[]>([]);
  const [active, setActive] = useState<HrmCompensationPackageRecord | null>(null);
  const [history, setHistory] = useState<HrmCompensationHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setPackages([]);
      setActive(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }
    if (!useApi) {
      setPackages([]);
      setActive(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const [listRes, activeRes] = await Promise.all([
        listCompensationPackages({
          company_id: currentCompanyId,
          employee_id: employeeId,
          page_size: 50,
        }),
        getActiveCompensationPackage({
          company_id: currentCompanyId,
          employee_id: employeeId,
        }),
      ]);
      setPackages(listRes.data ?? []);
      setActive(activeRes);
    } catch (error: unknown) {
      const message = toErrorMessage(error, 'Không thể tải gói đãi ngộ');
      setFetchError(message);
      setPackages([]);
      setActive(null);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId, useApi]);

  const refetchHistory = useCallback(async () => {
    if (!employeeId || !currentCompanyId || !useApi) {
      setHistory([]);
      return;
    }
    setIsHistoryLoading(true);
    try {
      const res = await listCompensationHistory({
        company_id: currentCompanyId,
        employee_id: employeeId,
        page_size: 50,
      });
      setHistory(res.data ?? []);
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể tải lịch sử đãi ngộ'));
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [employeeId, currentCompanyId, useApi]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createPackage = useCallback(
    async (input: {
      effective_from: string;
      lines: HrmCompensationLineInput[];
      change_reason?: string;
      contract_id?: string;
      link_to_contract?: boolean;
    } & HrmCompensationBankTaxInput): Promise<boolean> => {
      if (!employeeId || !currentCompanyId || !useApi) return false;
      try {
        await createCompensationPackage({
          company_id: currentCompanyId,
          employee_id: employeeId,
          effective_from: input.effective_from,
          change_reason: input.change_reason,
          contract_id: input.contract_id,
          link_to_contract: input.link_to_contract ?? Boolean(input.contract_id),
          lines: input.lines,
          bank_account: input.bank_account,
          bank_name: input.bank_name,
          bank_branch: input.bank_branch,
          tax_id: input.tax_id,
        });
        toast.success('Đã tạo gói đãi ngộ');
        await refetch();
        return true;
      } catch (error: unknown) {
        toast.error(toErrorMessage(error, 'Không thể tạo gói đãi ngộ'));
        return false;
      }
    },
    [employeeId, currentCompanyId, useApi, refetch],
  );

  const revisePackage = useCallback(
    async (input: {
      packageId: string;
      effective_from: string;
      lines: HrmCompensationLineInput[];
      change_reason?: string;
    } & HrmCompensationBankTaxInput): Promise<boolean> => {
      if (!currentCompanyId || !useApi) return false;
      try {
        await reviseCompensationPackage(input.packageId, currentCompanyId, {
          effective_from: input.effective_from,
          change_reason: input.change_reason,
          lines: input.lines,
          bank_account: input.bank_account,
          bank_name: input.bank_name,
          bank_branch: input.bank_branch,
          tax_id: input.tax_id,
        });
        toast.success('Đã tạo phiên bản đãi ngộ mới (tăng lương)');
        await refetch();
        return true;
      } catch (error: unknown) {
        toast.error(toErrorMessage(error, 'Không thể điều chỉnh gói đãi ngộ'));
        return false;
      }
    },
    [currentCompanyId, useApi, refetch],
  );

  return {
    packages,
    active,
    history,
    isLoading,
    isHistoryLoading,
    fetchError,
    useApi,
    refetch,
    refetchHistory,
    createPackage,
    revisePackage,
  };
}
