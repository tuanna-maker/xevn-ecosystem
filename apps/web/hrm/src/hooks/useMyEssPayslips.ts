/**
 * @CODE-MEMORY
 * Screen:     /payroll · Phiếu của tôi (ESS)
 * UC:         FR-UC-BP-PAY-08 · F-PAY-PAYSLIP-01
 * BR:         own-only · CEO 403 · F5 after confirm
 * SRS:        SRS_HRM_ENTERPRISE FR-UC-BP-PAY-08
 * TechSpec:   Nest GET/POST /payroll/me/payslips*
 * Purpose:    React Query-less hook — list / get / confirm ESS payslips (display-ready).
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-ESS-FE-01
 * Coded:      2026-08-07
 * Callers:    EssPayslipsPanel
 * Callees:    hrmApi listMyPayslips / getMyPayslipById / confirmMyPayslip · resolveEssPayslipCompanyId
 * must_keep:  L1 API SEAL · no FE formula · payroll_e2e_ready=false · U65
 * SOLID:      Hook owns fetch/mutate; panel owns presentation
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-pay-ess-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-ESS-FE-02
 * change_mode: FIX
 * What: company_id via resolveEssPayslipCompanyId + JWT (normalize) — stop coerceHrmListCompanyId holding→main
 * Why: QA-02 FAIL D-PAY-ESS-FE-SCOPE-COERCE — browser GET me/payslips?company_id=main → 409
 * must_keep: L1 SEAL · CEO main 403 · no seed · payroll_e2e_ready=false
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { isHrmApiDataMode } from '@/lib/hrmDataMode';
import { getPortalJwtEssCompanyId } from '@/lib/hrmSpreadsheetScope';
import { resolveEssPayslipCompanyId } from '@/lib/essPayslipUi';
import {
  confirmMyPayslip,
  getMyPayslipById,
  listMyPayslips,
  type HrmEssPayslipDetail,
  type HrmEssPayslipRow,
} from '@/integrations/hrmApi';

function readQueryCompanyId(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('companyId');
}

export function useMyEssPayslips() {
  const { currentCompanyId } = useAuth();
  const [payslips, setPayslips] = useState<HrmEssPayslipRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [detail, setDetail] = useState<HrmEssPayslipDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const useApi = isHrmApiDataMode();

  // ESS must match JWT OU (holding) — never coerceHrmListCompanyId holding→main.
  const companyId = useMemo(
    () =>
      resolveEssPayslipCompanyId({
        jwtCompanyId: getPortalJwtEssCompanyId(),
        queryCompanyId: readQueryCompanyId(),
        authCompanyId: currentCompanyId,
      }),
    [currentCompanyId],
  );

  const refetch = useCallback(async () => {
    if (!companyId) {
      setPayslips([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }
    if (!useApi) {
      setPayslips([]);
      setFetchError('Chế độ phiếu lương ESS chưa sẵn sàng — mở HRM từ Command Center hoặc đăng nhập NV.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const response = await listMyPayslips({ company_id: companyId });
      setPayslips(response.data ?? []);
    } catch (error: unknown) {
      setPayslips([]);
      setFetchError(toErrorMessage(error, 'Không thể tải phiếu lương của bạn'));
    } finally {
      setIsLoading(false);
    }
  }, [companyId, useApi]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const openDetail = useCallback(
    async (payslipId: string) => {
      if (!companyId) {
        setDetailError('Thiếu phạm vi công ty.');
        return;
      }
      setDetailLoading(true);
      setDetailError(null);
      try {
        const row = await getMyPayslipById(payslipId, companyId);
        setDetail(row);
      } catch (error: unknown) {
        setDetail(null);
        setDetailError(toErrorMessage(error, 'Không thể tải chi tiết phiếu lương'));
      } finally {
        setDetailLoading(false);
      }
    },
    [companyId],
  );

  const closeDetail = useCallback(() => {
    setDetail(null);
    setDetailError(null);
  }, []);

  const confirm = useCallback(
    async (payslipId: string): Promise<HrmEssPayslipDetail | null> => {
      if (!companyId) {
        setDetailError('Thiếu phạm vi công ty.');
        return null;
      }
      setConfirming(true);
      setDetailError(null);
      try {
        const updated = await confirmMyPayslip(payslipId, companyId);
        setDetail(updated);
        setPayslips((prev) =>
          prev.map((row) =>
            row.id === payslipId
              ? {
                  ...row,
                  ess_confirmed: updated.ess_confirmed,
                  employee_confirmed_at: updated.employee_confirmed_at,
                  employee_confirmed_by: updated.employee_confirmed_by,
                  status: updated.status,
                }
              : row,
          ),
        );
        return updated;
      } catch (error: unknown) {
        setDetailError(toErrorMessage(error, 'Không thể xác nhận phiếu lương'));
        return null;
      } finally {
        setConfirming(false);
      }
    },
    [companyId],
  );

  return {
    payslips,
    isLoading,
    fetchError,
    refetch,
    detail,
    detailLoading,
    detailError,
    openDetail,
    closeDetail,
    confirm,
    confirming,
    useApiMode: useApi,
    companyId,
  };
}
