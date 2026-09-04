/**
 * @CODE-MEMORY
 * Screen:     /attendance — chi tiết bảng chấm công → panel Ký chốt
 * UC:         UC-BP-ATT-11
 * BR:         BR-BP-TS-02 · R-SIGN-01
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11
 * TechSpec:   TECHSPEC_HRM_ENTERPRISE.md §6.4 · F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02
 * Purpose:    Hiển thị bước ký NV→QL→HCNS; POST signatures + POST close theo evaluator BE.
 * WorkItem:   PO-HRM-BP-ATT-SIGN-FE-01
 * Coded:      2026-08-05
 * Callers:    pages/Attendance.tsx → renderWeeklyAttendance
 * Callees:    hrmApi list/create signatures · closeAttendanceSheet
 * must_keep:  Không một nút Chốt khi can_close=false; nhãn VI; không seed
 * SOLID:      Tách panel khỏi Attendance.tsx god view
 * LastVerified: docs/qa/evidence/po-hrm-bp-att-sign-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-BP-ATT-SIGN-FE-SUBMIT-01
 * change_mode: ADD
 * What: Nút Gửi chờ ký (draft|open) → POST submit → panel att-sign-panel
 * Why: FR-UC-BP-ATT-10 funnel · UF-HRM-ATT-SIGN prereq · QA submitButtonCount=0
 * Spec: FR-UC-BP-ATT-10 · F-ATT-SHEET-01 · UC-BP-ATT-11 handoff
 * must_keep: att-sign-panel-hold-draft honesty; không sign trên nháp; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-PAY-ATT-CLOSE-FE-01
 * change_mode: FIX
 * What: statusBoost sau POST submit → panel chuyển draft→submitted ngay; loadSignatures sau mutate
 * Why: QA R-ATT-SHEET-SUBMIT-SIGN-GAP — parent refetch lag khiến att-sheet-submit vẫn hiện sau 2xx
 * Spec: FR-UC-BP-ATT-10 · J-HRM-06c
 * must_keep: att-sheet-submit · att-sign-confirm-* · att-sign-close-sheet
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01
 * change_mode: ADD | FIX
 * What: Toast AGG line_count / AGG_EMPTY_ENROLLMENT honesty; CTA Tổng hợp lại (/aggregate);
 *       Mở lại bảng (/reopen) trên closed (non-Jul product path); density hint Clock-In/OT
 * Why: R-PAY-F-ATT-LINE-AC4-BIND — sheet window density without seed so PAY bag can bind
 * Spec: F-ATT-SHEET-AGG-01 OPEN-Q2 C · F-ATT-SHEET-03 · FR-UC-BP-ATT-10
 * must_keep: sign ladder; close gate; Jul CB-BAG not auto-touched; payroll_e2e_ready=false; U65
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Draft/open CTA Tổng hợp kỳ → POST …/aggregate; display-ready sheet_id·status·statusLabelVi·
 *       line_count·warnings[]·lines gold (payable=std+paidLeave+otW · late_penalty display · unpaid∉);
 *       submit MUST AGG toast+panel; HOL/MEAL footer OUT; honesty ≠AGG=DONE · Nest /core 0
 * Why: UC-BP-ATT-10 / FR-UC-BP-ATT-10 · API-01 F.1 RETAIN · J-HRM-ATT-10-01..06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md §4–§6
 * must_keep: ATT-11 sign ladder · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C preview · CFG≠ATT-02 ·
 *            printable false · DENY att_leave_hold · ≠ ATT-11/PAY DONE · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Bind SignPanel submitted → GET/POST …/signatures · POST …/close · POST …/reopen;
 *       display-ready header_id·status·statusLabelVi(FE-derive)·steps[]·missing_mandatory_roles[]·
 *       can_close·policy_ready?; FIXED_GĐ1 3 personas; reject+comment → can_close false;
 *       close event timesheet.closed response-only; honesty ≠LIVE=ATT-11 DONE · Nest /core 0
 * Why: UC-BP-ATT-11 / FR-UC-BP-ATT-11 · API-01 F.1 RETAIN · J-HRM-ATT-11-01..06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md §4–§8
 * must_keep: ATT10QC1-MSLWGUYH ≠ AGG=DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT ·
 *            ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · CFG≠ATT-02 · printable false ·
 *            DENY att_leave_hold · DENY second sign ledger · ≠ invent CSUM/INBOX/PAY DONE · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, PenLine, RefreshCw, ShieldCheck, Undo2, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';
import { toErrorMessage } from '@/lib/apiError';
import { formatAttSheetAggToast } from '@/lib/attSheetAggUi';
import {
  att10HonestyBannerText,
  att10HolMealFooterText,
  att10LinesDispResidualText,
  parseAtt10SheetAggDisplay,
  type Att10SheetAggDisplay,
} from '@/lib/attSheet10Ring';
import {
  ATT_11_FIXED_GD1_PERSONAS,
  att11CsumInboxFooterText,
  att11FixedGd1FooterText,
  att11HonestyBannerText,
  att11PersonaLabelVi,
  parseAtt11SignaturesDisplay,
  type Att11SignaturesDisplay,
} from '@/lib/attSheet11Ring';
import { formatDisplayDate } from '@/lib/formatDisplayDate';
import {
  aggregateAttendanceSheet,
  closeAttendanceSheet,
  createAttendanceSheetSignature,
  listAttendanceSheetSignatures,
  reopenAttendanceSheet,
  submitAttendanceSheetForSign,
  type AttendanceSheetPersonaRole,
  type HrmAttendanceSheetAggResult,
  type HrmAttendanceSheetSignaturesPayload,
} from '@/integrations/hrmApi';

const SIGN_LADDER: ReadonlyArray<{
  persona_role: AttendanceSheetPersonaRole;
  step_code: string;
  labelKey: string;
  labelDefault: string;
}> = [
  { persona_role: 'employee', step_code: 'employee', labelKey: 'attSign.stepEmployee', labelDefault: 'Nhân viên' },
  {
    persona_role: 'direct_manager',
    step_code: 'direct_manager',
    labelKey: 'attSign.stepManager',
    labelDefault: 'Quản lý trực tiếp',
  },
  { persona_role: 'hr_admin', step_code: 'hr_admin', labelKey: 'attSign.stepHr', labelDefault: 'HCNS / C&B' },
];

export function sheetStatusViLabel(status: string | undefined, t: (k: string, d?: string) => string): string {
  switch (status) {
    case 'submitted':
      return t('attSign.statusSubmitted', 'Chờ ký');
    case 'closed':
      return t('attSign.statusClosed', 'Đã chốt');
    case 'draft':
      return t('attSign.statusDraft', 'Nháp');
    case 'open':
      return t('attSign.statusOpen', 'Đang mở');
    default:
      return status ? String(status) : '—';
  }
}

type AttendanceSheetSignPanelProps = {
  sheetId: string;
  companyId: string;
  sheetStatus: string;
  onSheetMutated: () => void | Promise<void>;
};

type BusyRole = AttendanceSheetPersonaRole | 'close' | 'submit' | 'aggregate' | 'reopen' | null;

export function AttendanceSheetSignPanel({
  sheetId,
  companyId,
  sheetStatus = 'draft',
  onSheetMutated,
}: AttendanceSheetSignPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { employees } = useEmployees(false, companyId);

  const empMap = useMemo(() => {
    const map = new Map<string, { code: string; name: string }>();
    for (const emp of employees) {
      map.set(emp.id, { code: emp.employee_code, name: emp.full_name });
    }
    return map;
  }, [employees]);
  const [payload, setPayload] = useState<HrmAttendanceSheetSignaturesPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [busyRole, setBusyRole] = useState<BusyRole>(null);
  /** Optimistic status after POST submit/reopen before parent list refetch completes. */
  const [statusBoost, setStatusBoost] = useState<string | null>(null);
  const [lastAgg, setLastAgg] = useState<HrmAttendanceSheetAggResult | null>(null);
  const [aggDisplay, setAggDisplay] = useState<Att10SheetAggDisplay | null>(null);
  const [signDisplay, setSignDisplay] = useState<Att11SignaturesDisplay | null>(null);
  const [lastCloseEvent, setLastCloseEvent] = useState<string | null>(null);
  const [lastPolicyReady, setLastPolicyReady] = useState<boolean | null>(null);

  useEffect(() => {
    setStatusBoost(null);
    setLastAgg(null);
    setAggDisplay(null);
    setSignDisplay(null);
    setLastCloseEvent(null);
    setLastPolicyReady(null);
  }, [sheetId]);

  const resolvedSheetStatus = statusBoost ?? payload?.status ?? sheetStatus;
  const effectiveStatus = payload?.status ?? resolvedSheetStatus;
  const panelVisible = effectiveStatus === 'submitted' || effectiveStatus === 'closed';

  const loadSignatures = useCallback(async () => {
    if (!sheetId || !companyId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await listAttendanceSheetSignatures(sheetId, companyId);
      setPayload(data);
      setSignDisplay(parseAtt11SignaturesDisplay(data));
    } catch (error: unknown) {
      setLoadError(toErrorMessage(error, t('attSign.loadError', 'Không tải được trạng thái ký.')));
      setPayload(null);
      setSignDisplay(null);
    } finally {
      setIsLoading(false);
    }
  }, [sheetId, companyId, t]);

  useEffect(() => {
    if (!panelVisible && resolvedSheetStatus !== 'submitted' && resolvedSheetStatus !== 'closed') {
      setPayload(null);
      return;
    }
    void loadSignatures();
  }, [loadSignatures, panelVisible, resolvedSheetStatus, sheetId]);

  const approvedRoles = useMemo(() => {
    const set = new Set<string>();
    for (const step of payload?.steps ?? []) {
      if (step.outcome === 'approved') set.add(String(step.persona_role));
    }
    return set;
  }, [payload?.steps]);

  const stepRows = useMemo(() => {
    return SIGN_LADDER.map((def) => {
      const match = (payload?.steps ?? []).find((s) => String(s.persona_role) === def.persona_role);
      const approved = match?.outcome === 'approved';
      const rejected = match?.outcome === 'rejected';
      return { ...def, match, approved, rejected };
    });
  }, [payload?.steps]);

  const priorStepsApproved = (role: AttendanceSheetPersonaRole): boolean => {
    const idx = SIGN_LADDER.findIndex((s) => s.persona_role === role);
    if (idx <= 0) return true;
    for (let i = 0; i < idx; i += 1) {
      if (!approvedRoles.has(SIGN_LADDER[i].persona_role)) return false;
    }
    return true;
  };

  const applyAggToast = (result: HrmAttendanceSheetAggResult | null | undefined) => {
    if (result) setLastAgg(result);
    const parsed = parseAtt10SheetAggDisplay(result);
    if (parsed) setAggDisplay(parsed);
    const copy = formatAttSheetAggToast(result);
    toast({
      title: copy.titleKey === 'notice' ? t('hk.notice', 'Lưu ý') : t('messages.success'),
      description: copy.description,
    });
  };

  const handleSign = async (role: AttendanceSheetPersonaRole, stepCode: string) => {
    setBusyRole(role);
    try {
      const result = await createAttendanceSheetSignature(sheetId, companyId, {
        step_code: stepCode,
        persona_role: role,
        outcome: 'approved',
      });
      if (typeof result?.policy_ready === 'boolean') {
        setLastPolicyReady(result.policy_ready);
      }
      toast({
        title: t('messages.success'),
        description: t('attSign.signSuccess', 'Đã ghi nhận xác nhận ký.'),
      });
      await loadSignatures();
      await onSheetMutated();
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('attSign.signError', 'Không ghi nhận được bước ký.')),
        variant: 'destructive',
      });
    } finally {
      setBusyRole(null);
    }
  };

  const handleReject = async (role: AttendanceSheetPersonaRole, stepCode: string) => {
    const comment = window.prompt(
      t(
        'attSign.rejectCommentPrompt',
        'Nhập lý do từ chối (bắt buộc — BR-BP-TS-02):',
      ),
    );
    if (comment == null) return;
    const trimmed = comment.trim();
    if (!trimmed) {
      toast({
        title: t('messages.error'),
        description: t('attSign.rejectCommentRequired', 'Từ chối cần lý do (HRM-ATT-SIGN-422).'),
        variant: 'destructive',
      });
      return;
    }
    setBusyRole(role);
    try {
      const result = await createAttendanceSheetSignature(sheetId, companyId, {
        step_code: stepCode,
        persona_role: role,
        outcome: 'rejected',
        comment: trimmed,
      });
      if (typeof result?.policy_ready === 'boolean') {
        setLastPolicyReady(result.policy_ready);
      } else {
        setLastPolicyReady(false);
      }
      toast({
        title: t('hk.notice', 'Lưu ý'),
        description: t(
          'attSign.rejectSuccess',
          'Đã ghi nhận từ chối — không được Chốt (can_close=false).',
        ),
      });
      await loadSignatures();
      await onSheetMutated();
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('attSign.rejectError', 'Không ghi nhận được từ chối.')),
        variant: 'destructive',
      });
    } finally {
      setBusyRole(null);
    }
  };

  const handleSubmitForSign = async () => {
    setBusyRole('submit');
    try {
      const result = await submitAttendanceSheetForSign(sheetId, companyId);
      if (result?.status) {
        setStatusBoost(result.status);
      }
      applyAggToast(result);
      await onSheetMutated();
      if (result?.status === 'submitted' || result?.status === 'closed') {
        await loadSignatures();
      }
    } catch (error: unknown) {
      setStatusBoost(null);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('attSign.submitError', 'Không gửi được chờ ký.')),
        variant: 'destructive',
      });
    } finally {
      setBusyRole(null);
    }
  };

  const handleAggregate = async () => {
    setBusyRole('aggregate');
    try {
      const result = await aggregateAttendanceSheet(sheetId, companyId);
      applyAggToast(result);
      await onSheetMutated();
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('attSign.aggregateError', 'Không tổng hợp được kỳ bảng công.')),
        variant: 'destructive',
      });
    } finally {
      setBusyRole(null);
    }
  };

  const handleReopen = async () => {
    setBusyRole('reopen');
    try {
      const result = await reopenAttendanceSheet(sheetId, companyId, {
        reopen_reason: 'FE product path — chuẩn bị tổng hợp lại sau chấm công / tăng ca trong kỳ',
      });
      setLastAgg(null);
      setAggDisplay(null);
      setLastCloseEvent(null);
      setLastPolicyReady(null);
      setStatusBoost(result?.status ?? 'submitted');
      toast({
        title: t('messages.success'),
        description: t(
          'attSign.reopenSuccess',
          'Đã mở lại bảng công. Chấm công / tăng ca trong kỳ rồi bấm Tổng hợp lại.',
        ),
      });
      await onSheetMutated();
      await loadSignatures();
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('attSign.reopenError', 'Không mở lại được bảng công.')),
        variant: 'destructive',
      });
    } finally {
      setBusyRole(null);
    }
  };

  const handleClose = async () => {
    setBusyRole('close');
    try {
      const result = await closeAttendanceSheet(sheetId, companyId);
      const eventName = result?.event ? String(result.event) : null;
      setLastCloseEvent(eventName);
      setStatusBoost(result?.status ?? 'closed');
      toast({
        title: t('messages.success'),
        description: eventName
          ? t(
              'attSign.closeSuccessEvent',
              'Đã chốt bảng chấm công (event: {{event}} — response-only · ≠ invent PAY DONE).',
              { event: eventName },
            )
          : t('attSign.closeSuccess', 'Đã chốt bảng chấm công.'),
      });
      await loadSignatures();
      await onSheetMutated();
    } catch (error: unknown) {
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('attSign.closeError', 'Không chốt được bảng công.')),
        variant: 'destructive',
      });
    } finally {
      setBusyRole(null);
    }
  };

  const emptyAggHint =
    lastAgg && formatAttSheetAggToast(lastAgg).emptyEnrollment ? (
      <Alert
        className="border-amber-300 bg-amber-50"
        data-testid="att-sheet-agg-empty-hint"
      >
        <AlertTitle className="text-base font-bold text-xevn-text">
          {t('attSign.emptyEnrollmentTitle', 'Chưa có điểm danh trong kỳ')}
        </AlertTitle>
        <AlertDescription className="text-[15px] text-xevn-textSecondary">
          {t(
            'attSign.emptyEnrollmentHint',
            'Vào Chấm công → Clock-In (thủ công) nếu hôm nay nằm trong kỳ bảng, hoặc Đơn từ → Tăng ca (chọn ngày trong kỳ) → Duyệt; rồi bấm Tổng hợp lại. Không dùng seed.',
          )}
        </AlertDescription>
      </Alert>
    ) : null;

  const dispResidual =
    aggDisplay != null ? att10LinesDispResidualText(aggDisplay) : null;

  const aggDisplayPanel =
    aggDisplay != null ? (
      <div
        className="rounded-input border border-xevn-border bg-xevn-surface/80 p-3 space-y-3"
        data-testid="att-10-agg-display"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-xevn-border text-xevn-text font-semibold"
            data-testid="att-10-sheet-id"
          >
            sheet: {aggDisplay.sheetId ?? sheetId}
          </Badge>
          <Badge
            variant="outline"
            className="border-xevn-border text-xevn-textSecondary font-semibold"
            data-testid="att-10-status-label"
          >
            {aggDisplay.statusLabelVi}
            <span className="ml-1 text-xevn-textMuted">({aggDisplay.status})</span>
          </Badge>
          <Badge
            variant="outline"
            className="border-xevn-border text-xevn-text font-semibold"
            data-testid="att-10-line-count"
          >
            {t('attSign.lineCountBadge', 'Dòng công')}: {aggDisplay.lineCount}
          </Badge>
        </div>
        {aggDisplay.warnings.length > 0 ? (
          <ul
            className="list-disc pl-5 text-sm text-amber-800 space-y-0.5"
            data-testid="att-10-warnings"
          >
            {aggDisplay.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        ) : null}
        {aggDisplay.linesEnvelopePresent && aggDisplay.lines.length > 0 ? (
          <div className="overflow-x-auto" data-testid="att-10-lines-table">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-xevn-border text-xevn-textSecondary">
                  <th className="py-1.5 pr-2 font-semibold">NV</th>
                  <th className="py-1.5 pr-2 font-semibold">Chuẩn</th>
                  <th className="py-1.5 pr-2 font-semibold">Phép paid</th>
                  <th className="py-1.5 pr-2 font-semibold">OT×hs</th>
                  <th className="py-1.5 pr-2 font-semibold">Unpaid</th>
                  <th className="py-1.5 pr-2 font-semibold">Phạt</th>
                  <th className="py-1.5 pr-2 font-semibold">Tính lương</th>
                  <th className="py-1.5 font-semibold">Công</th>
                </tr>
              </thead>
              <tbody>
                {aggDisplay.lines.map((line) => (
                  <tr
                    key={line.employeeId}
                    className="border-b border-xevn-border/60"
                    data-testid={`att-10-line-${line.employeeId}`}
                    data-payable-gold={line.payableGoldOk ? 'ok' : 'fail'}
                  >
                    <td className="py-1.5 pr-2 text-xevn-text font-medium">
                      {(() => {
                        const found = empMap.get(line.employeeId);
                        if (found) return `${found.code} - ${found.name}`;
                        if (line.employeeName && line.employeeName !== line.employeeId) return line.employeeName;
                        return line.employeeId;
                      })()}
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums">{line.standardHours}</td>
                    <td className="py-1.5 pr-2 tabular-nums">{line.paidLeaveHours}</td>
                    <td className="py-1.5 pr-2 tabular-nums">{line.otHoursWeighted}</td>
                    <td className="py-1.5 pr-2 tabular-nums text-xevn-textMuted">
                      {line.unpaidLeaveHours}
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums" data-testid="att-10-late-penalty">
                      {line.latePenaltyHours}
                    </td>
                    <td
                      className={`py-1.5 pr-2 tabular-nums font-semibold ${
                        line.payableGoldOk ? 'text-amber-700' : 'text-red-700'
                      }`}
                      data-testid="att-10-payable"
                    >
                      {line.payableHours}
                    </td>
                    <td className="py-1.5 tabular-nums">{line.workDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {dispResidual ? (
          <p className="text-sm text-xevn-textSecondary" data-testid="att-10-disp-residual">
            {dispResidual}
          </p>
        ) : null}
      </div>
    ) : null;

  const honestyBanner = null;

  const effectiveSignDisplay = useMemo(() => {
    if (!signDisplay) return null;
    if (signDisplay.policyReady != null || lastPolicyReady == null) return signDisplay;
    return { ...signDisplay, policyReady: lastPolicyReady };
  }, [signDisplay, lastPolicyReady]);

  const signDisplayPanel =
    effectiveSignDisplay != null ? (
      <div
        className="rounded-input border border-xevn-border bg-xevn-surface/80 p-3 space-y-3"
        data-testid="att-11-sign-display"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-xevn-border text-xevn-textSecondary font-semibold"
            data-testid="att-11-status-label"
          >
            {effectiveSignDisplay.statusLabelVi}
          </Badge>
        </div>
        {effectiveSignDisplay.missingMandatoryRoles.length > 0 ? (
          <p className="text-sm text-amber-800" data-testid="att-11-missing-roles">
            {t('attSign.missingRolesList', 'Thiếu bước bắt buộc')}:{' '}
            {effectiveSignDisplay.missingMandatoryRoles
              .map((r) => att11PersonaLabelVi(r))
              .join(' · ')}
          </p>
        ) : (
          <p className="text-sm text-green-800" data-testid="att-11-missing-roles-empty">
            {t('attSign.noMissingRoles', 'Đủ 3 bước xác nhận (Nhân viên · Quản lý · HR).')}
          </p>
        )}
        {effectiveSignDisplay.hasRejected ? (
          <Alert
            variant="destructive"
            className="py-2"
            data-testid="att-11-reject-block"
          >
            <AlertDescription className="text-sm">
              {t(
                'attSign.rejectBlocksClose',
                'Có bước từ chối — cần xử lý lại trước khi ký chốt.',
              )}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    ) : null;

  const att11HonestyBanner = null;

  if (!panelVisible) {
    if (resolvedSheetStatus === 'draft' || resolvedSheetStatus === 'open') {
      return (
        <div className="space-y-3" data-testid="att-10-draft-cluster">
          <Alert
            className="border-xevn-border bg-xevn-surface"
            data-testid="att-sign-panel-hold-draft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <AlertTitle className="text-base font-bold text-xevn-text">
                  {t('attSign.aggPanelTitle', 'Tổng hợp bảng công')}
                </AlertTitle>
                <AlertDescription className="text-[15px] text-xevn-textSecondary">
                  {t(
                    'attSign.draftAggHint',
                    'Tổng hợp dữ liệu giờ công tính lương theo kỳ và chuyển hồ sơ sang bước chờ xác nhận/ký chốt.',
                  )}
                </AlertDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-xevn-border text-xevn-text"
                  disabled={busyRole !== null}
                  data-testid="att-sheet-aggregate-draft"
                  onClick={() => void handleAggregate()}
                >
                  {busyRole === 'aggregate' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" aria-hidden />
                  )}
                  {t('attSign.aggregatePeriod', 'Tổng hợp kỳ')}
                </Button>
                <Button
                  type="button"
                  className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                  disabled={busyRole !== null}
                  data-testid="att-sheet-submit"
                  onClick={() => void handleSubmitForSign()}
                >
                  {busyRole === 'submit' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('attSign.submitForSign', 'Gửi chờ ký')
                  )}
                </Button>
              </div>
            </div>
            {emptyAggHint}
          </Alert>
          {aggDisplayPanel}
        </div>
      );
    }
    return null;
  }

  const canClose =
    (effectiveSignDisplay?.canClose ?? payload?.can_close === true) &&
    effectiveStatus === 'submitted';
  const canAggregate = effectiveStatus === 'submitted';
  const canReopen = effectiveStatus === 'closed';

  return (
    <div className="space-y-3">
      <Card
        className="rounded-card border-xevn-border bg-xevn-surface p-4 space-y-4"
        data-testid="att-sign-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-xevn-primary" aria-hidden />
            <h3 className="text-lg font-bold text-xevn-text">
              {t('attSign.panelTitle', 'Ký chốt bảng công')}
            </h3>
            <Badge
              variant="outline"
              className="border-xevn-border text-xevn-textSecondary font-semibold"
              data-testid="att-sign-sheet-status-badge"
            >
              {effectiveSignDisplay?.statusLabelVi ??
                sheetStatusViLabel(effectiveStatus, t)}
            </Badge>
            {aggDisplay != null || lastAgg != null ? (
              <Badge
                variant="outline"
                className="border-xevn-border text-xevn-text font-semibold"
                data-testid="att-sheet-agg-line-count"
              >
                {t('attSign.lineCountBadge', 'Dòng công')}:{' '}
                {Math.max(
                  0,
                  Number(aggDisplay?.lineCount ?? lastAgg?.line_count) || 0,
                )}
              </Badge>
            ) : null}
          </div>
          {canClose ? (
            <span className="text-sm text-green-700 font-medium" data-testid="att-sign-can-close-hint">
              {t('attSign.readyToClose', 'Đủ điều kiện chốt bảng')}
            </span>
          ) : null}
        </div>

        {emptyAggHint}
        {aggDisplayPanel}
        {signDisplayPanel}

        {loadError ? (
          <Alert variant="destructive" data-testid="att-sign-load-error">
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}

        {isLoading && !payload ? (
          <div className="flex items-center gap-2 text-xevn-textSecondary" role="status">
            <Loader2 className="w-5 h-5 animate-spin text-xevn-primary" />
            {t('attSign.loading', 'Đang tải bước ký…')}
          </div>
        ) : (
          <ul className="space-y-3" data-testid="att-sign-steps-list">
            {stepRows.map((row) => {
              const canSignThis =
                effectiveStatus === 'submitted' &&
                !row.approved &&
                !row.rejected &&
                priorStepsApproved(row.persona_role);
              const stepTestId = `att-sign-step-${row.persona_role}`;
              return (
                <li
                  key={row.persona_role}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-input border border-xevn-border px-3 py-2"
                  data-testid={stepTestId}
                >
                  <div>
                    <p className="font-semibold text-xevn-text">{t(row.labelKey, row.labelDefault)}</p>
                    {row.match?.signed_at ? (
                      <p className="text-sm text-xevn-textSecondary">
                        {t('attSign.signedAt', 'Ký lúc')}: {formatDisplayDate(String(row.match.signed_at))}
                      </p>
                    ) : (
                      <p className="text-sm text-xevn-textSecondary">
                        {row.approved
                          ? t('attSign.approved', 'Đã xác nhận')
                          : t('attSign.pending', 'Chờ xác nhận')}
                      </p>
                    )}
                    {row.rejected && row.match?.comment ? (
                      <p
                        className="text-sm text-red-700"
                        data-testid={`att-sign-reject-comment-${row.persona_role}`}
                      >
                        {t('attSign.rejectReason', 'Lý do')}: {String(row.match.comment)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {row.approved ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <Check className="w-3 h-3 mr-1" aria-hidden />
                        {t('attSign.approved', 'Đã xác nhận')}
                      </Badge>
                    ) : row.rejected ? (
                      <Badge variant="destructive">{t('attSign.rejected', 'Từ chối')}</Badge>
                    ) : canSignThis ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
                          disabled={busyRole !== null}
                          data-testid={`att-sign-confirm-${row.persona_role}`}
                          onClick={() => void handleSign(row.persona_role, row.step_code)}
                        >
                          {busyRole === row.persona_role ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            t('attSign.confirm', 'Xác nhận')
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-300 text-red-700 hover:bg-red-50"
                          disabled={busyRole !== null}
                          data-testid={`att-sign-reject-${row.persona_role}`}
                          onClick={() => void handleReject(row.persona_role, row.step_code)}
                        >
                          <X className="w-3 h-3" aria-hidden />
                          {t('attSign.reject', 'Từ chối')}
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xevn-textSecondary">
                        {t('attSign.waitPrior', 'Chờ bước trước')}
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-xevn-border">
          <p className="text-sm text-xevn-textSecondary">
            {effectiveSignDisplay?.missingMandatoryRoles?.length ||
            payload?.missing_mandatory_roles?.length
              ? t('attSign.missingRoles', 'Còn thiếu bước bắt buộc trên bảng.')
              : effectiveStatus === 'closed'
                ? t('attSign.closedReadonly', 'Bảng đã chốt — mở lại nếu cần tổng hợp lại sau điểm danh.')
                : t('attSign.closeHint', 'Chốt khi đủ ba bước NV, QL và HCNS.')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {canAggregate ? (
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-xevn-border text-xevn-text"
                disabled={busyRole !== null}
                data-testid="att-sheet-aggregate"
                onClick={() => void handleAggregate()}
              >
                {busyRole === 'aggregate' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" aria-hidden />
                )}
                {t('attSign.aggregateAgain', 'Tổng hợp lại')}
              </Button>
            ) : null}
            {canReopen ? (
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-xevn-border text-xevn-text"
                disabled={busyRole !== null}
                data-testid="att-sheet-reopen"
                onClick={() => void handleReopen()}
              >
                {busyRole === 'reopen' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Undo2 className="w-4 h-4" aria-hidden />
                )}
                {t('attSign.reopenSheet', 'Mở lại bảng')}
              </Button>
            ) : null}
            <Button
              type="button"
              className="gap-2 bg-xevn-primary hover:bg-xevn-primaryPressed text-white"
              disabled={!canClose || busyRole !== null}
              data-testid="att-sign-close-sheet"
              onClick={() => void handleClose()}
            >
              {busyRole === 'close' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" aria-hidden />
              )}
              {t('attSign.closeSheet', 'Chốt bảng công')}
            </Button>
          </div>
        </div>
      </Card>
      {att11HonestyBanner}
      {honestyBanner}
    </div>
  );
}
