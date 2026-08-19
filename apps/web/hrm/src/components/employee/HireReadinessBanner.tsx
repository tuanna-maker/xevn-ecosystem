/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile — banner sẵn sàng Hire-to-Pay bước 5
 * UC:         FR-UC-BP-REC-07 · AC-HTP-05-01..03
 * BR:         Honest unavailable khi BE chưa expose; không giả ready_for_payroll
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.6
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-HTP-05
 * Purpose:    GET hire-readiness → banner ready / blocked / unavailable.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-01
 * Coded:      2026-08-06
 * Callers:    EmployeeProfile.tsx (contract / general)
 * Callees:    getEmployeeHireReadiness · hireReadinessUi · HDSD_MUTATE_TEST_IDS
 * FEActions:  Mount profile → fetch → F5 vẫn idempotent
 * BEChain:    GET /api/hrm/employees/:id/hire-readiness
 * Impact:     Claim ready khi 404 → payroll bước 6 sai
 * must_keep:  Honesty unavailable; U65 no seed; hrm_personnel_uat_ready=false
 * SOLID:      Presentational + hook fetch trong component hẹp
 * LastVerified: docs/qa/evidence/po-hrm-e2e-link-emp-fe-01.md
 */

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeHireReadiness } from '@/integrations/hrmApi';
import { ApiClientError } from '@/lib/apiError';
import {
  hireReadinessBannerLabel,
  resolveHireReadinessUiState,
  type HireReadinessUiState,
} from '@/lib/hireReadinessUi';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react';

interface HireReadinessBannerProps {
  employeeId: string;
}

export function HireReadinessBanner({ employeeId }: HireReadinessBannerProps) {
  const { currentCompanyId } = useAuth();
  const [state, setState] = useState<HireReadinessUiState>({ kind: 'loading' });

  useEffect(() => {
    if (!employeeId || !currentCompanyId) {
      setState({
        kind: 'unavailable',
        reason: 'Thiếu phạm vi công ty — không kiểm tra bước 5.',
      });
      return;
    }
    let cancelled = false;
    setState({ kind: 'loading' });
    void (async () => {
      try {
        const raw = await getEmployeeHireReadiness(employeeId, currentCompanyId);
        if (cancelled) return;
        setState(resolveHireReadinessUiState({ loading: false, raw }));
      } catch (error: unknown) {
        if (cancelled) return;
        const status =
          error instanceof ApiClientError ? (error.status ?? null) : null;
        const code =
          error instanceof ApiClientError ? (error.code ?? null) : null;
        setState(
          resolveHireReadinessUiState({
            loading: false,
            errorStatus: status,
            errorCode: code,
          }),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employeeId, currentCompanyId]);

  const label = hireReadinessBannerLabel(state);
  const variant =
    state.kind === 'ready'
      ? 'default'
      : state.kind === 'blocked'
        ? 'destructive'
        : 'default';

  return (
    <Alert
      variant={variant}
      className="border-xevn-border"
      data-testid={HDSD_MUTATE_TEST_IDS.hireReadinessBanner}
      data-htp05-state={state.kind}
    >
      {state.kind === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state.kind === 'ready' ? (
        <CheckCircle2 className="h-4 w-4 text-xevn-success" />
      ) : state.kind === 'blocked' ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Info className="h-4 w-4 text-xevn-textSecondary" />
      )}
      <AlertTitle className="text-sm font-semibold text-xevn-text">
        Sẵn sàng Hire-to-Pay bước 5
      </AlertTitle>
      <AlertDescription className="text-sm text-xevn-textSecondary">{label}</AlertDescription>
    </Alert>
  );
}
