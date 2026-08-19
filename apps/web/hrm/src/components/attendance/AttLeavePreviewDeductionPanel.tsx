/**
 * @CODE-MEMORY
 * Screen:     /attendance → Nghỉ phép → Tạo đơn · Preview trừ quỹ (ATT-08)
 * UC:         UC-BP-ATT-08 · FR-UC-BP-ATT-08 Diễn biến #1/#2 · AC-ATT-08-PREVIEW/ENGINE/HOL-MISS/PATH
 * BR:         BR-BP-LV-05 · Nest /core DENY · client-days ≠ ATT-08 DONE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md F-ATT-LEAVE-01
 * Purpose:    Panel shell gọi POST …/leave-requests/preview-deduction khi LIVE;
 *             stub-safe ABSENT (no fake T6→T2=4); surface HOL-MISS chặn nộp;
 *             display-ready Ngày calendar / Ngày trừ quỹ / Ngày loại; honesty footers.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    components/attendance/LeaveTab.tsx create dialog
 * Callees:    previewLeaveDeduction · attLeaveRing
 * FEActions:  | Thao tác | Handler | API |
 *             | Đổi khoảng/loại | loadPreview | POST /attendance/leave-requests/preview-deduction |
 * must_keep:  ATT02QC1-MSLQZUK7 · PLT/CORE · Nest /core DENY · U65 · no fake engine when ABSENT
 * SOLID:      Panel owns residual preview; LeaveTab RETAIN list/create peers
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: LIVE bind POST …/preview-deduction · R-ATT-08-PREVIEW-FE CLOSED badge;
 *       onPreviewReady → parent submit deductible_units; unit day|hour VI;
 *       Ngày trừ quỹ (working_days / deductible_units) ≠ calendar_days SoT.
 * Why: BE-01 READY · UC-BP-ATT-08 · BR-BP-LV-05 · AC-ATT-08-ENGINE/UNIT/ALIGN
 * must_keep: Nest /core 0 · no fake T6→T2=4 · HOL-MISS block · honesty ≠DONE · PAY OUT · printable false
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md §4.6
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { previewLeaveDeduction } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  ATT_08_HOL_MISS_CODE,
  assertAtt08GoldWorkingDaysNotCalendar,
  att08HonestyBannerText,
  att08HolMissMessage,
  att08PreviewAbsentBannerText,
  att08PreviewLiveBadgeText,
  att08UnitLabelVi,
  buildAtt08PreviewDeductionBody,
  isAtt08HolMissError,
  isAtt08PreviewAbsentError,
  parseAtt08PreviewDeductionEnvelope,
  type Att08PreviewDeductionEnvelope,
} from '@/lib/attLeaveRing';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type AttLeavePreviewBlockReason = 'HOL-MISS' | 'GOLD-FAIL' | null;

export type AttLeavePreviewDeductionPanelProps = {
  employeeId: string;
  companyId?: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  hours?: number | null;
  /** Notify parent — HOL-MISS / GOLD-FAIL ⇒ disable submit. */
  onBlockChange?: (blocked: boolean, reason: AttLeavePreviewBlockReason) => void;
  /** LIVE envelope for ALIGN submit (deductible_units) — null when ABSENT/error. */
  onPreviewReady?: (env: Att08PreviewDeductionEnvelope | null) => void;
};

const emptyEnv = (): Att08PreviewDeductionEnvelope =>
  parseAtt08PreviewDeductionEnvelope(null);

export function AttLeavePreviewDeductionPanel({
  employeeId,
  companyId,
  leaveType,
  startDate,
  endDate,
  halfDay,
  hours,
  onBlockChange,
  onPreviewReady,
}: AttLeavePreviewDeductionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [previewAbsent, setPreviewAbsent] = useState(false);
  const [holMiss, setHolMiss] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [env, setEnv] = useState<Att08PreviewDeductionEnvelope>(emptyEnv);
  const onBlockRef = useRef(onBlockChange);
  onBlockRef.current = onBlockChange;
  const onReadyRef = useRef(onPreviewReady);
  onReadyRef.current = onPreviewReady;

  const ready =
    Boolean(employeeId?.trim()) &&
    Boolean(leaveType?.trim()) &&
    Boolean(startDate?.trim()) &&
    Boolean(endDate?.trim());

  const notifyBlock = useCallback((blocked: boolean, reason: AttLeavePreviewBlockReason) => {
    onBlockRef.current?.(blocked, reason);
  }, []);

  const notifyReady = useCallback((next: Att08PreviewDeductionEnvelope | null) => {
    onReadyRef.current?.(next);
  }, []);

  const loadPreview = useCallback(async () => {
    if (!ready) {
      setEnv(emptyEnv());
      setPreviewAbsent(false);
      setHolMiss(false);
      setLoadError(null);
      notifyBlock(false, null);
      notifyReady(null);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const body = buildAtt08PreviewDeductionBody({
        employeeId,
        companyId,
        leaveType,
        startDate,
        endDate,
        halfDay,
        hours,
      });
      // Physical F-ATT-LEAVE-01 — DENY Nest /core leave SoT.
      const raw = await previewLeaveDeduction(body);
      const parsed = parseAtt08PreviewDeductionEnvelope(raw);
      if (!assertAtt08GoldWorkingDaysNotCalendar(parsed)) {
        setLoadError(
          'Preview không hợp lệ: ngày trừ quỹ trùng calendar (FAIL BR-BP-LV-05). Không dùng làm trừ quỹ.',
        );
        setEnv(parsed);
        setPreviewAbsent(false);
        setHolMiss(false);
        notifyBlock(true, 'GOLD-FAIL');
        notifyReady(null);
        return;
      }
      setEnv(parsed);
      setPreviewAbsent(!parsed.envelopePresent);
      setHolMiss(false);
      notifyBlock(false, null);
      notifyReady(parsed.envelopePresent ? parsed : null);
    } catch (error: unknown) {
      if (isAtt08HolMissError(error)) {
        setHolMiss(true);
        setPreviewAbsent(false);
        setEnv(emptyEnv());
        setLoadError(att08HolMissMessage());
        notifyBlock(true, 'HOL-MISS');
        notifyReady(null);
        return;
      }
      if (isAtt08PreviewAbsentError(error)) {
        // Residual ABSENT — stub-safe · cấm fake T6→T2=4.
        setPreviewAbsent(true);
        setHolMiss(false);
        setEnv(emptyEnv());
        setLoadError(null);
        notifyBlock(false, null);
        notifyReady(null);
        return;
      }
      const msg = toErrorMessage(
        error,
        error instanceof ApiClientError
          ? error.message
          : 'Không xem trước được ngày trừ quỹ.',
      );
      setLoadError(msg);
      setPreviewAbsent(false);
      setHolMiss(false);
      setEnv(emptyEnv());
      notifyBlock(false, null);
      notifyReady(null);
    } finally {
      setLoading(false);
    }
  }, [
    ready,
    employeeId,
    companyId,
    leaveType,
    startDate,
    endDate,
    halfDay,
    hours,
    notifyBlock,
    notifyReady,
  ]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  return (
    <div
      className="rounded-card border border-xevn-border bg-xevn-surface/80 p-3 space-y-2"
      data-testid="att-08-preview-deduction-panel"
      data-work-item="PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-xevn-text">
            Xem trước ngày trừ quỹ (ATT-08)
          </p>
          {previewAbsent ? (
            <Badge variant="outline" className=" hidden  border-amber-300">
              {att08PreviewAbsentBannerText().slice(0, 28)}…
            </Badge>
          ) : holMiss ? (
            <Badge variant="destructive">{ATT_08_HOL_MISS_CODE}</Badge>
          ) : env.envelopePresent ? (
            <Badge className="bg-emerald-600 text-white" data-testid="att-08-preview-live">
              LIVE · {att08PreviewLiveBadgeText()}
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => void loadPreview()}
          disabled={!ready || loading}
          aria-label="Tải lại preview trừ quỹ"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {!ready ? (
        <p className="text-xs text-xevn-textSecondary">
          Chọn nhân viên, loại phép và khoảng ngày để xem trước số trừ quỹ (engine BR-BP-LV-05).
        </p>
      ) : null}

      {previewAbsent && ready ? (
        <Alert className="border-amber-200 bg-amber-50/80" data-testid="att-08-preview-absent">
          <AlertTitle className="text-sm text-amber-900">Preview tạm ABSENT</AlertTitle>
          <AlertDescription className="text-xs text-amber-900/90">
            {att08PreviewAbsentBannerText()}
          </AlertDescription>
        </Alert>
      ) : null}

      {holMiss ? (
        <Alert variant="destructive" data-testid="att-08-hol-miss">
          <AlertTitle className="text-sm">Chặn nộp — thiếu lịch lễ</AlertTitle>
          <AlertDescription className="text-xs space-y-1">
            <p>{att08HolMissMessage()}</p>
            <p data-testid="att-08-hol-miss-cta-admin">
              Mở Chấm công → Cài đặt → Lịch lễ / Tết để khai năm (thin ≠ ATT-03b DONE).
            </p>
          </AlertDescription>
        </Alert>
      ) : null}

      {loadError && !holMiss && !previewAbsent ? (
        <Alert variant="destructive">
          <AlertTitle className="text-sm">Lỗi preview</AlertTitle>
          <AlertDescription className="text-xs">{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {env.envelopePresent && !holMiss ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm"
          data-testid="att-08-preview-display-ready"
        >
          <div className="rounded-input border border-xevn-border/60 p-2">
            <p className="text-xs text-xevn-textSecondary">Ngày calendar</p>
            <p className="font-semibold text-xevn-text tabular-nums">
              {env.calendarDays ?? '—'}
            </p>
            <p className="text-[10px] text-xevn-textSecondary mt-0.5">
              ≠ trừ quỹ (DENY SoT)
            </p>
          </div>
          <div className="rounded-input border border-emerald-200 bg-emerald-50/50 p-2">
            <p className="text-xs text-xevn-textSecondary">Ngày trừ quỹ</p>
            <p className="font-semibold text-emerald-800 tabular-nums">
              {env.workingDays ?? '—'}
            </p>
            <p className="text-[10px] text-emerald-800/80 mt-0.5">working_days</p>
          </div>
          <div className="rounded-input border border-emerald-200 bg-emerald-50/50 p-2">
            <p className="text-xs text-xevn-textSecondary">Đơn vị trừ</p>
            <p className="font-semibold text-emerald-800 tabular-nums">
              {env.deductibleUnits ?? '—'}
              {env.unit ? ` (${att08UnitLabelVi(env.unit)})` : ''}
            </p>
            <p className="text-[10px] text-emerald-800/80 mt-0.5">deductible_units</p>
          </div>
          <div className="rounded-input border border-xevn-border/60 p-2">
            <p className="text-xs text-xevn-textSecondary">Unit (Q-LEAVE-UNIT)</p>
            <p className="font-semibold text-xevn-text">
              {env.unit ? `${env.unit} · ${att08UnitLabelVi(env.unit)}` : '—'}
            </p>
          </div>
        </div>
      ) : null}

      {env.excludedDays.length > 0 ? (
        <div className="text-xs text-xevn-textSecondary space-y-1" data-testid="att-08-excluded-days">
          <p className="font-medium text-xevn-text">Ngày loại (T7/CN/Lễ)</p>
          <ul className="list-disc pl-4">
            {env.excludedDays.map((d) => (
              <li key={`${d.date}-${d.reason}`}>
                {d.date}
                {d.labelVi ? ` — ${d.labelVi}` : ''} ({d.reason})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {env.warnings.length > 0 ? (
        <ul className="text-xs text-amber-800 list-disc pl-4" data-testid="att-08-preview-warnings">
          {env.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}

      <p
        className="text-[11px] leading-snug text-xevn-textSecondary"
        data-testid="att-08-honesty"
      >
        {att08HonestyBannerText()}
      </p>
    </div>
  );
}
