/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Dialog Chấp nhận offer → create+prefill hồ sơ NS
 * UC:         UC-BP-REC-07 · AC-REC-07-01/02/03/04 · EX-01..06
 * BR:         BR-BP-LC-01 · BR-REC-HIRE-PATH/GATE/STAGE/NO-REKEY · O1/O3/O4/O6/O8
 * SRS:        FR-UC-BP-REC-07 Diễn biến #1–#2 · HTP handoff #3
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md F-REC-HIRE-01 · APP-02 · HTP-05
 * Purpose:    Hiển thị prefill UV+YCTD (không re-key); POST …/applications/:id/accept-offer;
 *             rồi POST transitions hired-outcome; GET hire-readiness; Network /recruitment/ only.
 * WorkItem:   PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidatesTab · CandidateDetailView (via parent)
 * Callees:    postRecruitmentApplicationAcceptOffer · postRecruitmentCandidateTransition · getEmployeeHireReadiness
 * must_keep:  no Nest /rec · no mail=hire · no PAY invent · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-fe-01.md
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import {
  getEmployeeHireReadiness,
  postRecruitmentApplicationAcceptOffer,
  postRecruitmentCandidateTransition,
  type HrmAcceptOfferResult,
  type HrmHireReadiness,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  buildAcceptOfferPrefillSnapshot,
  formatAcceptOfferSuccessToast,
  formatHireExpectedStartVi,
  isOfferReadyStage,
  REC_HIRE_MAIL_NOT_HIRE_VI,
  REC_HIRE_NEO_REQUIRED_VI,
  REC_HIRE_NO_REKEY_HINT_VI,
  REC_HIRE_OFFER_NOT_READY_VI,
  REC_HIRE_STAGE_AFTER_ACCEPT_FAIL_VI,
  REC_HIRE_STAGE_AFTER_ACCEPT_VI,
  resolveApplicationIdForAcceptOffer,
  type RecAcceptOfferCandidate,
} from '@/lib/recCandidateAcceptOffer';
import { buildContractWorkspacePath } from '@/lib/contractWorkspaceDeepLink';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import {
  hireReadinessBannerLabel,
  mapHireReadinessDto,
  resolveHireReadinessUiState,
  HTP_NO_ACTIVE_CONTRACT,
} from '@/lib/hireReadinessUi';

export type CandidateAcceptOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: RecAcceptOfferCandidate | null;
  onSuccess?: (result: HrmAcceptOfferResult) => void | Promise<void>;
};

export function CandidateAcceptOfferDialog({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: CandidateAcceptOfferDialogProps) {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    items,
    catalogCount,
    hiredOutcomeKey,
    stageDisplayLabel,
    isLoading: catalogLoading,
  } = useRecPipelineStagesEffective({ enabled: open });

  const applicationId = candidate ? resolveApplicationIdForAcceptOffer(candidate) : null;
  const prefill = useMemo(
    () => (candidate ? buildAcceptOfferPrefillSnapshot(candidate) : null),
    [candidate],
  );
  const currentStage = (candidate?.stage ?? candidate?.status ?? '').trim();
  const offerReady = isOfferReadyStage(items, currentStage, catalogCount);
  const alreadyLinked = Boolean((candidate?.employee_id ?? '').trim());

  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<HrmAcceptOfferResult | null>(null);
  const [stageDone, setStageDone] = useState(false);
  const [htp, setHtp] = useState<HrmHireReadiness | null>(null);
  const [htpError, setHtpError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNote('');
    setResult(null);
    setStageDone(false);
    setHtp(null);
    setHtpError(null);
  }, [open, candidate?.id]);

  const hiredTarget = (hiredOutcomeKey ?? '').trim();

  const loadHtp = async (employeeId: string, companyId: string) => {
    try {
      const raw = await getEmployeeHireReadiness(employeeId, companyId);
      setHtp(raw);
      setHtpError(null);
    } catch (error) {
      setHtp(null);
      setHtpError(toErrorMessage(error, 'Không đọc được sẵn sàng bước 5 (HTP-05).'));
    }
  };

  const handleSubmit = async () => {
    if (!candidate || !applicationId || !currentCompanyId) {
      toast({
        title: 'Không chấp nhận offer',
        description: REC_HIRE_NEO_REQUIRED_VI,
        variant: 'destructive',
      });
      return;
    }
    if (!offerReady && !alreadyLinked) {
      toast({
        title: 'Chưa offer-ready',
        description: REC_HIRE_OFFER_NOT_READY_VI,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, code } = await postRecruitmentApplicationAcceptOffer(
        applicationId,
        currentCompanyId,
        {
          expected_start_date: prefill?.expected_start_date || undefined,
          note: note.trim() || undefined,
        },
      );
      setResult(data);
      toast({
        title: 'Chấp nhận offer thành công',
        description: formatAcceptOfferSuccessToast(data.mode, code),
      });

      let transitionOk = Boolean(data.history_id || data.hired_outcome_stage);
      if (!transitionOk && hiredTarget) {
        try {
          const tr = await postRecruitmentCandidateTransition(applicationId, currentCompanyId, {
            to_stage: hiredTarget,
            note: note.trim() || 'Chấp nhận offer — hired-outcome',
          });
          transitionOk = true;
          setStageDone(true);
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  history_id: tr.history_id ?? tr.history?.id ?? prev.history_id,
                  hired_outcome_stage: tr.stage ?? hiredTarget,
                }
              : prev,
          );
          toast({
            title: 'Đã cập nhật giai đoạn',
            description: REC_HIRE_STAGE_AFTER_ACCEPT_VI,
          });
        } catch (stageErr) {
          setStageDone(false);
          toast({
            title: 'Hồ sơ đã tạo — giai đoạn chưa ghi',
            description: toErrorMessage(stageErr, REC_HIRE_STAGE_AFTER_ACCEPT_FAIL_VI),
            variant: 'destructive',
          });
        }
      } else if (transitionOk) {
        setStageDone(true);
      }

      if (data.employee_id) {
        await loadHtp(data.employee_id, data.company_id || currentCompanyId);
      }
      await onSuccess?.(data);
    } catch (error) {
      toast({
        title: 'Chấp nhận offer thất bại',
        description: toErrorMessage(error, 'Không tạo/gắn được hồ sơ nhân sự.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const htpLabel = htpError
    ? htpError
    : htp
      ? hireReadinessBannerLabel(
          resolveHireReadinessUiState({
            loading: false,
            raw: mapHireReadinessDto(htp) ?? htp,
          }),
        )
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-testid="rec-accept-offer-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Chấp nhận offer
          </DialogTitle>
        </DialogHeader>

        {!applicationId ? (
          <p className="text-sm text-destructive" data-testid="rec-accept-offer-neo-missing">
            {REC_HIRE_NEO_REQUIRED_VI}
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground" data-testid="rec-accept-offer-hint">
              {REC_HIRE_NO_REKEY_HINT_VI}
              {' · '}
              Network chỉ{' '}
              <code className="text-[10px]">/recruitment/applications/…/accept-offer</code>
              {' · '}
              {REC_HIRE_MAIL_NOT_HIRE_VI}
            </p>

            {!offerReady && !alreadyLinked ? (
              <p className="text-sm text-destructive" data-testid="rec-accept-offer-not-ready">
                {REC_HIRE_OFFER_NOT_READY_VI}
                {currentStage
                  ? ` (hiện tại: ${stageDisplayLabel(currentStage, currentStage)})`
                  : ''}
              </p>
            ) : null}

            {alreadyLinked ? (
              <Badge variant="secondary" data-testid="rec-accept-offer-idempotent-hint">
                Đã có soft link — bấm xác nhận để xác nhận lại (idempotent)
              </Badge>
            ) : null}

            {prefill ? (
              <div
                className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2 text-sm"
                data-testid="rec-accept-offer-prefill"
              >
                <PrefillRow label="Họ tên" value={prefill.full_name} testId="rec-accept-prefill-name" />
                <PrefillRow label="Email" value={prefill.email} testId="rec-accept-prefill-email" />
                <PrefillRow
                  label="Điện thoại"
                  value={prefill.phone || '—'}
                  testId="rec-accept-prefill-phone"
                />
                <PrefillRow
                  label="Đơn vị (company_id)"
                  value={prefill.company_id || '—'}
                  testId="rec-accept-prefill-company"
                />
                <PrefillRow
                  label="Vị trí"
                  value={prefill.position_label || prefill.position_key || '—'}
                  testId="rec-accept-prefill-position"
                />
                <PrefillRow
                  label="YCTD"
                  value={prefill.yctd_label || prefill.requisition_id || '—'}
                  testId="rec-accept-prefill-yctd"
                />
                <PrefillRow
                  label="Ngày dự kiến nhận việc"
                  value={formatHireExpectedStartVi(prefill.expected_start_date)}
                  testId="rec-accept-prefill-start"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="rec-accept-offer-note">Ghi chú (tuỳ chọn)</Label>
              <Textarea
                id="rec-accept-offer-note"
                data-testid="rec-accept-offer-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú nội bộ — không nhập lại họ tên / email"
                disabled={submitting || Boolean(result)}
              />
            </div>

            {catalogLoading ? (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Đang tải catalog giai đoạn…
              </p>
            ) : hiredTarget ? (
              <p className="text-xs text-muted-foreground" data-testid="rec-accept-offer-hired-target">
                Sau accept sẽ ghi giai đoạn hired-outcome:{' '}
                <strong>{stageDisplayLabel(hiredTarget, hiredTarget)}</strong>
              </p>
            ) : (
              <p className="text-xs text-warning" data-testid="rec-accept-offer-no-hired-key">
                Catalog chưa có hired-outcome — accept vẫn tạo hồ sơ; dùng «Đổi trạng thái» sau.
              </p>
            )}

            {result ? (
              <div
                className="rounded-lg border border-success/40 bg-success/5 p-3 space-y-2 text-sm"
                data-testid="rec-accept-offer-result"
              >
                <div className="flex items-center gap-2 font-medium text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  Hồ sơ đã tạo/gắn
                </div>
                <PrefillRow
                  label="employee_id"
                  value={result.employee_id}
                  testId="rec-accept-result-employee-id"
                />
                <PrefillRow
                  label="Mã NV"
                  value={result.employee_code || '—'}
                  testId="rec-accept-result-code"
                />
                <PrefillRow
                  label="Trạng thái hồ sơ"
                  value={result.status || 'pending_docs'}
                  testId="rec-accept-result-status"
                />
                <PrefillRow
                  label="Mode"
                  value={result.mode || '—'}
                  testId="rec-accept-result-mode"
                />
                {stageDone || result.history_id ? (
                  <PrefillRow
                    label="history_id"
                    value={result.history_id || 'đã ghi'}
                    testId="rec-accept-result-history"
                  />
                ) : null}
                {htpLabel ? (
                  <p className="text-xs pt-1" data-testid="rec-accept-offer-htp">
                    HTP-05: {htpLabel}
                    {htp?.blockers?.includes(HTP_NO_ACTIVE_CONTRACT) ||
                    (!htp?.active_contract && htp) ? (
                      <span className="block text-warning mt-1">
                        Thiếu HĐ hiệu lực cùng pháp nhân — hoàn thiện hợp đồng (CORE) trước bước
                        lương.
                      </span>
                    ) : null}
                  </p>
                ) : null}
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="mt-1"
                  data-testid="rec-accept-offer-create-contract"
                  onClick={() => {
                    onOpenChange(false);
                    const path = buildContractWorkspacePath('create', {
                      prefill: {
                        subject_type: 'employee',
                        employee_id: result.employee_id,
                      },
                    });
                    navigate(hrmPathWithEmbedSearch(path));
                  }}
                >
                  Tạo HĐ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  data-testid="rec-accept-offer-open-employee"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/employees/${encodeURIComponent(result.employee_id)}`);
                  }}
                >
                  Mở hồ sơ nhân sự
                </Button>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>
            {result ? 'Đóng' : 'Hủy'}
          </Button>
          {!result ? (
            <Button
              type="button"
              data-testid="rec-accept-offer-submit"
              disabled={
                submitting ||
                !applicationId ||
                !currentCompanyId ||
                (!offerReady && !alreadyLinked)
              }
              onClick={() => void handleSubmit()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý…
                </>
              ) : alreadyLinked ? (
                'Xác nhận lại (idempotent)'
              ) : (
                'Xác nhận chấp nhận offer'
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrefillRow({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="flex justify-between gap-3" data-testid={testId}>
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  );
}
