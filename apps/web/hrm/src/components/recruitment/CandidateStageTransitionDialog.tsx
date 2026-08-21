/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Dialog đổi trạng thái UV theo YCTD
 * UC:         UC-BP-REC-05 · AC-REC-05-01/02/04 · ALT-01 · EX-01/02/03
 * BR:         BR-REC-STG-EFF/REJECT/REV · BR-BP-CV-02
 * SRS:        FR-UC-BP-REC-05 Diễn biến #0b/#1 · #1c/#1d
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md F-REC-APP-02
 * Purpose:    EFF picker + note bắt buộc khi reject + POST …/candidates/:id/transitions;
 *             empty EFF → CTA admin; Network /recruitment/ only.
 * WorkItem:   PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidatesTab
 * Callees:    postRecruitmentCandidateTransition · useRecPipelineStagesEffective · helpers
 * must_keep:  no Nest /rec · no pool stage as FR-05 SoT · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md
 */
import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import { postRecruitmentCandidateTransition } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  isRecStageRejectOutcome,
  isRecStageReverseTransition,
  REC_STAGE_REJECT_REASON_REQUIRED_VI,
  REC_STAGE_TRANSITION_EMPTY_CTA_VI,
  REC_STAGE_TRANSITION_SUCCESS_VI,
  resolveLaneACandidateIdForTransition,
  type RecStageTransitionCandidate,
} from '@/lib/recCandidateStageTransition';

export type CandidateStageTransitionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: RecStageTransitionCandidate | null;
  /** Prefill when opened from list Select. */
  initialToStage?: string | null;
  onSuccess?: () => void | Promise<void>;
};

export function CandidateStageTransitionDialog({
  open,
  onOpenChange,
  candidate,
  initialToStage,
  onSuccess,
}: CandidateStageTransitionDialogProps) {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const {
    items,
    stageOptions,
    catalogCount,
    stageDisplayLabel,
    isLoading: catalogLoading,
  } = useRecPipelineStagesEffective({ enabled: open });

  const [toStage, setToStage] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fromStage = (candidate?.stage ?? candidate?.status ?? '').trim() || null;
  const laneAId = candidate ? resolveLaneACandidateIdForTransition(candidate) : null;

  useEffect(() => {
    if (!open) return;
    const pref = (initialToStage ?? '').trim();
    setToStage(pref || fromStage || '');
    setNote('');
  }, [open, initialToStage, fromStage, candidate?.id]);

  const rejectRequired = useMemo(
    () => isRecStageRejectOutcome(items, toStage, catalogCount),
    [items, toStage, catalogCount],
  );

  const isReverse = useMemo(
    () => isRecStageReverseTransition(items, fromStage, toStage),
    [items, fromStage, toStage],
  );

  const canSubmit =
    Boolean(laneAId && currentCompanyId && toStage.trim()) &&
    catalogCount > 0 &&
    (!rejectRequired || note.trim().length > 0) &&
    !submitting;

  const handleSubmit = async () => {
    if (!candidate || !laneAId || !currentCompanyId) return;
    const stage = toStage.trim();
    if (!stage) return;
    if (catalogCount <= 0) {
      toast({
        title: 'Chưa có danh mục giai đoạn',
        description: REC_STAGE_TRANSITION_EMPTY_CTA_VI,
        variant: 'destructive',
      });
      return;
    }
    if (rejectRequired && !note.trim()) {
      toast({
        title: 'Thiếu lý do từ chối',
        description: REC_STAGE_REJECT_REASON_REQUIRED_VI,
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await postRecruitmentCandidateTransition(laneAId, currentCompanyId, {
        to_stage: stage,
        note: note.trim() || undefined,
        is_reverse: isReverse || undefined,
      });
      toast({
        title: 'Thành công',
        description: REC_STAGE_TRANSITION_SUCCESS_VI,
      });
      onOpenChange(false);
      await onSuccess?.();
    } catch (error: unknown) {
      toast({
        title: 'Không đổi được giai đoạn',
        description: toErrorMessage(error, 'Không cập nhật được trạng thái UV–YCTD'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="rec-stage-transition-dialog"
      >
        <DialogHeader>
          <DialogTitle>Đổi trạng thái pipeline (UV–YCTD)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-sm text-muted-foreground">
            {candidate?.full_name ? (
              <>
                Ứng viên <span className="font-medium text-foreground">{candidate.full_name}</span>
                {fromStage ? (
                  <>
                    {' '}
                    · hiện tại:{' '}
                    <Badge variant="secondary" className="align-middle">
                      {stageDisplayLabel(fromStage, fromStage)}
                    </Badge>
                  </>
                ) : null}
              </>
            ) : (
              'Chọn giai đoạn hiệu lực rồi Lưu. Lịch sử append-only sau 2xx.'
            )}
          </p>

          {catalogLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh mục giai đoạn…
            </div>
          ) : catalogCount <= 0 ? (
            <div
              className="rounded-lg border border-dashed border-xevn-border bg-muted/30 p-3 text-sm text-muted-foreground"
              data-testid="rec-stage-transition-empty-cta"
            >
              {REC_STAGE_TRANSITION_EMPTY_CTA_VI}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="rec-stage-to">Trạng thái mới</Label>
              <Select
                value={toStage || undefined}
                onValueChange={setToStage}
                disabled={submitting}
              >
                <SelectTrigger
                  id="rec-stage-to"
                  className="h-10"
                  data-testid="rec-stage-transition-select"
                >
                  <SelectValue placeholder="Chọn giai đoạn hiệu lực" />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {rejectRequired ? (
            <div className="space-y-2">
              <Label htmlFor="rec-stage-reject-note">
                Lý do từ chối <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rec-stage-reject-note"
                data-testid="rec-stage-reject-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do từ chối / rút hồ sơ…"
                rows={3}
                disabled={submitting}
                className="resize-y"
              />
            </div>
          ) : catalogCount > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="rec-stage-note">Ghi chú (tuỳ chọn)</Label>
              <Textarea
                id="rec-stage-note"
                data-testid="rec-stage-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú chuyển giai đoạn…"
                rows={2}
                disabled={submitting}
                className="resize-y"
              />
            </div>
          ) : null}

          {isReverse && catalogCount > 0 ? (
            <p className="text-xs text-muted-foreground" data-testid="rec-stage-reverse-hint">
              Đây là đảo chiều giai đoạn — hệ thống vẫn ghi lịch sử nếu CFG cho phép.
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            data-testid="rec-stage-transition-save"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu…
              </>
            ) : (
              'Lưu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
