/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → panel «Kích hoạt Hoạt động»
 * UC:         UC-BP-CORE-07 · FR-UC-BP-CORE-07
 * BR:         BR-BP-LC-02 · AC-CORE-07-01..05 · ≠-CHK-DONE · ≠-PATCH-DONE · MK-06
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-07 Luồng #1–#2 · Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md F-CORE-ACT-01
 * Purpose:    CTA bind can_activate / blocking_items / effective_date; POST …/activate;
 *             GATE 409 toast; footer checklist≠DONE · free PATCH≠DONE · soft≠CORE-06 DONE;
 *             Nest /core DENY · no invent PAY/ATT/CORE-09 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeProfile (general tab)
 * Callees:    useEmployeeActivate · empCoreActRing · ViDateField
 * must_keep:  CORE03QC1 CHK ≠ CORE-07 DONE · CORE06 soft≠DONE · honesty false · U65 · C-SLICE
 * LastVerified: poHrmMvpGd1Core07ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * change_mode: ADD
 * What: Profile activate CTA + blocking_items list + effective_date + honesty footer
 * Why: UC-BP-CORE-07 residual FE · J-HRM-CORE-07-01..05 U65
 * must_keep: Nest /core 0 · soft≠CORE-06 DONE · checklist≠DONE · free PATCH≠DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * change_mode: ADD
 * What: Embed EmployeeActivateEnrollConfirmStrip when status Hoạt động
 * Why: AC-ATT-12-FE-CONFIRM · J-HRM-ATT-12-05 · GET panel + activate_default shift
 * must_keep: CORE-07 CTA · ≠ FR-12 DONE · DENY merge buckets
 */

import { Loader2, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ViDateField } from '@/components/ui/ViDateField';
import { useEmployeeActivate } from '@/hooks/useEmployeeActivate';
import type { HrmEmployeeRecord } from '@/integrations/hrmApi';
import {
  CORE_07_ACT_NE_DONE_FOOTER_VI,
  CORE_07_UAT_HONESTY,
  formatActivatedAtDisplay,
  isActivateEligibleStatus,
  isActivatedStatus,
} from '@/lib/empCoreActRing';
import { Link } from 'react-router-dom';
import { EmployeeActivateEnrollConfirmStrip } from '@/components/employee/EmployeeActivateEnrollConfirmStrip';

export interface EmployeeActivatePanelProps {
  employeeId: string;
  status: string;
  /** Optional BE envelope fields from detail GET when LIVE. */
  employeeRecord?: Partial<HrmEmployeeRecord> | null;
  onActivated?: () => void | Promise<void>;
}

export function EmployeeActivatePanel({
  employeeId,
  status,
  employeeRecord,
  onActivated,
}: EmployeeActivatePanelProps) {
  void CORE_07_UAT_HONESTY; // honesty false — do not flip

  const {
    loading,
    mutating,
    envelope,
    canActivateCta,
    effectiveDateIso,
    setEffectiveDateIso,
    activate,
  } = useEmployeeActivate({
    employeeId,
    status,
    employeeRecord,
    onActivated,
  });

  if (isActivatedStatus(status)) {
    return (
      <div className="space-y-3">
        <Card
          className="rounded-card border-xevn-border shadow-soft"
          data-testid="hdsd-emp-activate-panel-active"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              Hồ sơ đang Hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-xevn-textSecondary">
              Ngày hiệu lực:{' '}
              <span className="font-medium text-xevn-text" data-testid="hdsd-emp-activate-activated-at">
                {formatActivatedAtDisplay(
                  employeeRecord?.activated_at ??
                    employeeRecord?.activatedAt ??
                    envelope.activated_at,
                )}
              </span>
            </p>
            <p
              className="text-[11px] leading-snug text-xevn-textSecondary"
              data-testid="hdsd-emp-activate-core07-footer"
            >
              {CORE_07_ACT_NE_DONE_FOOTER_VI}
            </p>
          </CardContent>
        </Card>
        <EmployeeActivateEnrollConfirmStrip employeeId={employeeId} />
      </div>
    );
  }

  if (!isActivateEligibleStatus(status)) {
    return null;
  }

  return (
    <Card
      className="rounded-card border-xevn-border shadow-soft"
      data-testid="hdsd-emp-activate-panel"
      data-can-activate={canActivateCta ? '1' : '0'}
      data-checklist-complete={envelope.checklist_complete ? '1' : '0'}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
          <Zap className="h-4 w-4 text-primary" aria-hidden />
          Kích hoạt Hoạt động
        </CardTitle>
        <p className="text-xs text-xevn-textSecondary">
          Khi checklist bắt buộc đã xác nhận — chuyển «Chờ hoàn thiện» → «Hoạt động»
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div
            className="flex items-center justify-center gap-2 py-6 text-sm text-xevn-textSecondary"
            data-testid="hdsd-emp-activate-loading"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Đang kiểm tra checklist…
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className={
                  canActivateCta
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                }
                data-testid="hdsd-emp-activate-can-activate-badge"
              >
                {canActivateCta ? 'Đủ điều kiện kích hoạt' : 'Chưa đủ checklist'}
              </Badge>
              <Badge variant="outline" data-testid="hdsd-emp-activate-status-label">
                {envelope.statusLabelVi}
              </Badge>
            </div>

            {!canActivateCta && envelope.blocking_items.length > 0 ? (
              <div
                className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2"
                data-testid="hdsd-emp-activate-blocking-items"
              >
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-900">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  Còn giấy tờ chặn kích hoạt
                </p>
                <ul className="space-y-1">
                  {envelope.blocking_items.map((it) => (
                    <li
                      key={`${it.documentTypeKey}-${it.status}`}
                      className="text-xs text-amber-900"
                      data-testid="hdsd-emp-activate-blocking-row"
                    >
                      {it.nameVi}{' '}
                      
                    </li>
                  ))}
                </ul>
                <Button asChild variant="link" className="mt-1 h-auto p-0 text-primary" size="sm">
                  <Link
                    to={`?tab=documents`}
                    data-testid="hdsd-emp-activate-open-documents"
                  >
                    Mở tab Giấy tờ
                  </Link>
                </Button>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="emp-activate-effective-date" className="text-xs font-medium">
                Ngày hiệu lực (dd/MM/yyyy)
              </Label>
              <ViDateField
                id="emp-activate-effective-date"
                value={effectiveDateIso}
                onValueChange={(v) => setEffectiveDateIso(v)}
                data-testid="hdsd-emp-activate-effective-date"
              />
            </div>

            <Button
              type="button"
              className="w-full"
              disabled={mutating || !canActivateCta || !effectiveDateIso}
              onClick={() => void activate()}
              data-testid="hdsd-emp-activate-submit"
            >
              {mutating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Đang kích hoạt…
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" aria-hidden />
                  Kích hoạt Hoạt động
                </>
              )}
            </Button>
          </>
        )}

        <p
          className="text-[11px] leading-snug text-xevn-textSecondary"
          data-testid="hdsd-emp-activate-core07-footer"
        >
          {CORE_07_ACT_NE_DONE_FOOTER_VI}
        </p>
      </CardContent>
    </Card>
  );
}
