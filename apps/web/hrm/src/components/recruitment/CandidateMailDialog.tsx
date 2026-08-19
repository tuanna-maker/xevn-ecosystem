/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Dialog gửi thư tuyển theo mẫu (UV–YCTD)
 * UC:         UC-BP-REC-06 · AC-REC-06-01/02 · EX-01/02 · ALT-02/03
 * BR:         BR-BP-MAIL-01 · BR-REC-ME-PATH/MAIL-ONE/FAIL-NO-FAKE · O1/O3/O7/O8/O12
 * SRS:        FR-UC-BP-REC-06 Diễn biến #1 · special gửi thất bại
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md F-REC-MAIL-01
 * Purpose:    Chọn template_code CFG · CC khi interview_invite · POST …/candidates/:id/mail;
 *             GET outbox+log F5; Network /recruitment/ only; không ghi stage.
 * WorkItem:   PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidatesTab · CandidateDetailView (via parent)
 * Callees:    sendRecruitmentCandidateMail · listRecruitmentCandidateMail · recCandidateMailEval
 * must_keep:  no Nest /rec · no Campaign · no stage mutate · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md
 */
import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  listRecruitmentCandidateMail,
  sendRecruitmentCandidateMail,
  type HrmRecMailOutboxRow,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  formatRecMailQueuedAtVi,
  formatRecMailStatusVi,
  isRecMailInviteTemplate,
  parseEmailList,
  REC_MAIL_SUCCESS_TOAST_VI,
  REC_MAIL_TEMPLATE_CODES,
  REC_MAIL_TEMPLATE_LABEL_VI,
  resolveLaneACandidateIdForMailEval,
  validateRecMailForm,
  type RecMailEvalCandidate,
  type RecMailTemplateCode,
} from '@/lib/recCandidateMailEval';

export type CandidateMailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: RecMailEvalCandidate | null;
  onSuccess?: () => void | Promise<void>;
};

export function CandidateMailDialog({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: CandidateMailDialogProps) {
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const laneAId = candidate ? resolveLaneACandidateIdForMailEval(candidate) : null;

  const [templateCode, setTemplateCode] = useState<RecMailTemplateCode>('fail_cv');
  const [toRaw, setToRaw] = useState('');
  const [ccRaw, setCcRaw] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingOutbox, setLoadingOutbox] = useState(false);
  const [outbox, setOutbox] = useState<HrmRecMailOutboxRow[]>([]);

  const loadOutbox = useCallback(async () => {
    if (!open || !laneAId || !currentCompanyId) {
      setOutbox([]);
      return;
    }
    setLoadingOutbox(true);
    try {
      const res = await listRecruitmentCandidateMail(laneAId, currentCompanyId, { limit: 20 });
      setOutbox(res.items);
    } catch (error) {
      setOutbox([]);
      if (import.meta.env.DEV) {
        console.warn('[CandidateMailDialog] list mail outbox', error);
      }
    } finally {
      setLoadingOutbox(false);
    }
  }, [open, laneAId, currentCompanyId]);

  useEffect(() => {
    if (!open || !candidate) return;
    setTemplateCode('fail_cv');
    setToRaw((candidate.email ?? '').trim());
    setCcRaw('');
    void loadOutbox();
  }, [open, candidate?.id, candidate?.email, loadOutbox]);

  const inviteNeedsCc = isRecMailInviteTemplate(templateCode);

  const handleSubmit = async () => {
    if (!candidate || !laneAId || !currentCompanyId) {
      toast({
        title: 'Không gửi được thư',
        description: 'Thiếu liên kết UV–YCTD (Lane A).',
        variant: 'destructive',
      });
      return;
    }
    const to = parseEmailList(toRaw);
    const cc = parseEmailList(ccRaw);
    const gate = validateRecMailForm({
      laneAId,
      templateCode,
      to,
      ccInterviewers: cc,
    });
    if (!gate.ok) {
      toast({
        title: 'Thiếu thông tin thư',
        description: gate.message,
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendRecruitmentCandidateMail(laneAId, currentCompanyId, {
        template_code: templateCode,
        to,
        cc_interviewers: inviteNeedsCc ? cc : cc.length > 0 ? cc : undefined,
        application_id: candidate.application_id ?? undefined,
      });
      const statusLabel = formatRecMailStatusVi(result.status);
      toast({
        title: 'Đã gửi / xếp hàng thư',
        description: `${REC_MAIL_SUCCESS_TOAST_VI} · ${statusLabel}`,
      });
      await loadOutbox();
      await onSuccess?.();
    } catch (error) {
      toast({
        title: 'Gửi thư thất bại',
        description: toErrorMessage(error, 'Không xếp hàng được thư. Kiểm tra mẫu / CC / phạm vi.'),
        variant: 'destructive',
      });
      await loadOutbox();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="rec-mail-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Gửi thư theo mẫu
          </DialogTitle>
        </DialogHeader>

        {!laneAId ? (
          <p className="text-sm text-destructive" data-testid="rec-mail-neo-missing">
            UV chưa gắn YCTD (Lane A) — không gửi thư FR-06. Gắn yêu cầu tuyển trước.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {candidate?.full_name ?? 'UV'} · Lane A{' '}
              <code className="text-[10px]">{laneAId.slice(0, 8)}…</code>
              {' · '}Network chỉ <code className="text-[10px]">/recruitment/…/mail</code>
            </p>

            <div className="space-y-2">
              <Label htmlFor="rec-mail-template">Mẫu thư (template_code)</Label>
              <Select
                value={templateCode}
                onValueChange={(v) => setTemplateCode(v as RecMailTemplateCode)}
              >
                <SelectTrigger id="rec-mail-template" data-testid="rec-mail-template">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REC_MAIL_TEMPLATE_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {REC_MAIL_TEMPLATE_LABEL_VI[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-mail-to">Người nhận (to)</Label>
              <Input
                id="rec-mail-to"
                data-testid="rec-mail-to"
                value={toRaw}
                onChange={(e) => setToRaw(e.target.value)}
                placeholder="email@xe.vn"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-mail-cc">
                CC interviewer{inviteNeedsCc ? ' (bắt buộc)' : ' (tuỳ chọn)'}
              </Label>
              <Input
                id="rec-mail-cc"
                data-testid="rec-mail-cc"
                value={ccRaw}
                onChange={(e) => setCcRaw(e.target.value)}
                placeholder="pv1@xe.vn, pv2@xe.vn"
              />
              {inviteNeedsCc ? (
                <p className="text-xs text-muted-foreground">
                  BR-BP-MAIL-01 — thiếu CC → 400 HRM-REC-MAIL-CC-REQUIRED · không đổi stage.
                </p>
              ) : null}
            </div>

            <div className="rounded-md border p-3 space-y-2" data-testid="rec-mail-outbox-panel">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Nhật ký thư (outbox)</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadOutbox()}
                  disabled={loadingOutbox}
                  data-testid="rec-mail-outbox-refresh"
                >
                  {loadingOutbox ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
              {outbox.length === 0 ? (
                <p className="text-xs text-muted-foreground">Chưa có thư xếp hàng / đã gửi.</p>
              ) : (
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {outbox.map((row, idx) => {
                    const id = row.outbox_id || row.id || `row-${idx}`;
                    const logCount = Array.isArray(row.log) ? row.log.length : 0;
                    return (
                      <li
                        key={id}
                        className="text-xs flex flex-wrap items-center gap-2 border-b border-border/50 pb-1"
                        data-testid="rec-mail-outbox-row"
                      >
                        <Badge variant="outline">{formatRecMailStatusVi(row.status)}</Badge>
                        <span>{row.template_code ?? '—'}</span>
                        <span className="text-muted-foreground">
                          {formatRecMailQueuedAtVi(row.sent_at || row.queued_at)}
                        </span>
                        {logCount > 0 ? (
                          <span className="text-muted-foreground">log×{logCount}</span>
                        ) : null}
                        {row.error_message ? (
                          <span className="text-destructive truncate max-w-[12rem]">
                            {row.error_message}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            type="button"
            data-testid="rec-mail-submit"
            disabled={!laneAId || submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Gửi thư
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
