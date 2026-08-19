/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → BH — timeline action dialog (CORE-10)
 * UC:         FR-UC-BP-CORE-10 · AC-SI-TL-01..05
 * BR:         close|stop|suspend|change_rate|resume — pass-through amounts, no FE formulas
 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.5
 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-SI-03
 * Purpose:    UI actions + periods list; POST action → refetch F5.
 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-01
 * Coded:      2026-08-06
 * Callers:    EmployeeInsurance.tsx
 * Callees:    postEmployeeInsuranceAction · insuranceTimelineActions · HDSD testids
 * FEActions:  Chọn action → ngày hiệu lực → Lưu → periods cập nhật
 * BEChain:    POST /api/hrm/employee-insurances/:id/actions
 * Impact:     FE invent % → OS 28 FAIL; silent PATCH contribution → AC-SI-TL FAIL
 * must_keep:  Action vocab 1:1; display-ready periods; U65 no seed
 * SOLID:      Panel tách khỏi CRUD insurance form
 * LastVerified: docs/qa/evidence/po-hrm-e2e-link-emp-fe-04.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-03
 * change_mode: FIX
 * What: Confirm panel always mounts root when enrollment row rendered; action id = enrollment PK
 * Why: R-EMP-SI-FE-ACTION-UI — hide panel when enrollments exist is forbidden
 * must_keep: Action vocab 1:1; no FE formulas; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-04
 * change_mode: FIX
 * What: Pass currentCompanyId into buildInsuranceActionBody → body.company_id
 * Why: R-EMP-SI-ACTION-COMPANY-ID-BODY P0 — POST 400 when company_id query-only
 * must_keep: FE-03 tab=insurance mount + HDSD action/submit testids; D1/D2/D6 untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-EMP-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: Periods list + dialog surface use formatInsurancePeriodDateVi (dd/MM/yyyy)
 * Why: OBS-SI-DATE-ISO — no ISO leak on SI stop/periods after F5
 * must_keep: D5 body company_id; action vocab; ViDateField entry; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: periods statusLabelVi + vi-VN amounts; surface HRM-SI-ACTION-400 / ACTION-400 (no silent success)
 * Why: R-CORE-10-DISP · AC-SI-TL-03 · API-01 CONFIRMED RETAIN · Nest /core DENY
 * must_keep: Action vocab 1:1; body company_id; CORE-09/07 seals; U65; honesty false
 */


import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ViDateField } from '@/components/ui/ViDateField';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { postEmployeeInsuranceAction } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  isInsuranceActionValidationError,
} from '@/lib/empCoreSiRing';
import {
  INSURANCE_ACTION_LABELS_VI,
  allowedInsuranceActionsForStatus,
  buildInsuranceActionBody,
  formatInsurancePeriodDateVi,
  mapInsurancePeriods,
  type InsuranceRatePeriodDisplay,
  type InsuranceTimelineAction,
} from '@/lib/insuranceTimelineActions';
import {
  HDSD_MUTATE_TEST_IDS,
  hdsdInsuranceActionTestId,
} from '@/lib/hdsdMutateTestIds';
import { Loader2 } from 'lucide-react';

export type InsuranceTimelineHost = {
  id: string;
  status: string;
  contribution: number;
  employer_contribution: number;
  periods?: unknown;
};

interface InsuranceTimelineActionsPanelProps {
  insurance: InsuranceTimelineHost;
  onActionComplete: () => void | Promise<void>;
}

export function InsuranceTimelineActionsPanel({
  insurance,
  onActionComplete,
}: InsuranceTimelineActionsPanelProps) {
  const { currentCompanyId } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<InsuranceTimelineAction | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [contribution, setContribution] = useState(insurance.contribution);
  const [employerContribution, setEmployerContribution] = useState(
    insurance.employer_contribution,
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const allowed = useMemo(
    () => allowedInsuranceActionsForStatus(insurance.status),
    [insurance.status],
  );

  const periods: InsuranceRatePeriodDisplay[] = useMemo(
    () => mapInsurancePeriods(insurance.periods),
    [insurance.periods],
  );

  const openAction = (next: InsuranceTimelineAction) => {
    setAction(next);
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    setSuspendReason('');
    setContribution(insurance.contribution);
    setEmployerContribution(insurance.employer_contribution);
    setNotes('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!action || !currentCompanyId) return;
    const built = buildInsuranceActionBody({
      company_id: currentCompanyId,
      action,
      effective_from: effectiveFrom,
      suspend_reason: suspendReason,
      contribution,
      employer_contribution: employerContribution,
      notes,
    });
    if (!built.ok) {
      toast.error(built.message);
      return;
    }
    setSaving(true);
    try {
      await postEmployeeInsuranceAction(insurance.id, currentCompanyId, built.body);
      toast.success(`Đã ghi thao tác «${INSURANCE_ACTION_LABELS_VI[action]}» — F5 để xem timeline.`);
      setDialogOpen(false);
      await onActionComplete();
    } catch (error: unknown) {
      // AC-SI-TL-03 — suspend thiếu căn cứ / thiếu effective_from → ACTION-400; no silent success
      const code =
        error instanceof ApiClientError ? error.code : undefined;
      const base = toErrorMessage(
        error,
        'Không thể ghi thao tác bảo hiểm (F-CORE-SI-03).',
      );
      if (isInsuranceActionValidationError(code)) {
        toast.error(
          `${base} [${code ?? 'HRM-SI-ACTION-400'}] — thiếu ngày hiệu lực hoặc căn cứ tạm hoãn.`,
        );
      } else {
        toast.error(base);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 space-y-2" data-testid={HDSD_MUTATE_TEST_IDS.insuranceTimelineRoot}>
      {allowed.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allowed.map((a) => (
            <Button
              key={a}
              type="button"
              size="sm"
              variant="outline"
              data-testid={hdsdInsuranceActionTestId(a, insurance.id)}
              onClick={() => openAction(a)}
            >
              {INSURANCE_ACTION_LABELS_VI[a]}
            </Button>
          ))}
        </div>
      )}

      {periods.length > 0 && (
        <ul
          className="space-y-1 rounded-md border border-xevn-border p-2 text-xs text-xevn-textSecondary"
          data-testid={HDSD_MUTATE_TEST_IDS.insurancePeriodsList}
        >
          {periods.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {p.statusLabelVi}
              </Badge>
              <span>
                {formatInsurancePeriodDateVi(p.effective_from)}
                {p.effective_to
                  ? ` → ${formatInsurancePeriodDateVi(p.effective_to)}`
                  : ' → …'}
              </span>
              {p.contribution != null && (
                <span>NV: {p.contributionLabelVi ?? Number(p.contribution).toLocaleString('vi-VN')}</span>
              )}
              {p.employer_contribution != null && (
                <span>DN: {p.employerContributionLabelVi ?? Number(p.employer_contribution).toLocaleString('vi-VN')}</span>
              )}
              {p.suspend_reason ? (
                <span className="italic">Căn cứ: {p.suspend_reason}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid={HDSD_MUTATE_TEST_IDS.insuranceActionDialog}>
          <DialogHeader>
            <DialogTitle>
              {action ? INSURANCE_ACTION_LABELS_VI[action] : 'Thao tác bảo hiểm'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label>Ngày hiệu lực *</Label>
              <ViDateField value={effectiveFrom} onValueChange={setEffectiveFrom} />
            </div>
            {action === 'suspend' && (
              <div className="space-y-2">
                <Label>Lý do tạm hoãn *</Label>
                <Textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}
            {action === 'change_rate' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Mức đóng NV *</Label>
                  <ViMoneyInput value={contribution} onValueChange={setContribution} />
                </div>
                <div className="space-y-2">
                  <Label>Mức đóng DN *</Label>
                  <ViMoneyInput
                    value={employerContribution}
                    onValueChange={setEmployerContribution}
                  />
                </div>
                <p className="col-span-2 text-xs text-xevn-textSecondary">
                  FE chỉ gửi mức — BE append period mới (không đè im lặng).
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={saving}
              data-testid={HDSD_MUTATE_TEST_IDS.insuranceActionSubmit}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thao tác
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
