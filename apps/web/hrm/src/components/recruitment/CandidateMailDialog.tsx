/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Dialog gửi thư tuyển theo mẫu (UV–YCTD)
 * UC:         UC-BP-REC-06 · AC-REC-06-01/02 · EX-01/02 · ALT-02/03
 * BR:         BR-BP-MAIL-01 · BR-REC-ME-PATH/MAIL-ONE/FAIL-NO-FAKE · O1/O3/O7/O8/O12
 * Purpose:    Chọn mẫu active từ CFG · sửa subject/body · POST …/mail; không ghi stage.
 * WorkItem:   PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01 · PO-HRM-REC-MAIL-TEMPLATES-CFG-01
 * must_keep:  no Nest /rec · no Campaign · no stage mutate · U65 · honesty false · C-SLICE
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { useToast } from '@/hooks/use-toast';
import {
  listRecruitmentCandidateMail,
  listRecruitmentMailTemplates,
  sendRecruitmentCandidateMail,
  type HrmRecMailOutboxRow,
  type HrmRecMailTemplateItem,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import {
  fillRecMailPlaceholders,
  formatRecMailQueuedAtVi,
  formatRecMailStatusVi,
  isDeliverableEmailAddress,
  isRecMailInviteTemplate,
  parseEmailList,
  REC_MAIL_CC_HINT_VI,
  REC_MAIL_LOCAL_STUB_TOAST_VI,
  REC_MAIL_PROVIDER_FAIL_TOAST_VI,
  REC_MAIL_SMTP_SENT_TOAST_VI,
  REC_MAIL_TO_UNDELIVERABLE_VI,
  resolveLaneACandidateIdForMailEval,
  validateRecMailForm,
  type RecMailEvalCandidate,
} from '@/lib/recCandidateMailEval';

export type CandidateMailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: RecMailEvalCandidate | null;
  onSuccess?: () => void | Promise<void>;
};

function resolveMailTemplateVars(
  candidate: RecMailEvalCandidate | null,
  companyId: string | null | undefined,
) {
  const position =
    (candidate?.yctd_title ?? '').trim() ||
    (candidate?.position_name ?? '').trim() ||
    (candidate?.position ?? '').trim() ||
    'Vị trí tuyển dụng';
  const company =
    (candidate?.company_id ?? '').trim() ||
    (companyId ?? '').trim() ||
    'Công ty';
  return {
    candidate_name: (candidate?.full_name ?? '').trim() || 'Ứng viên',
    position,
    company,
  };
}

export function CandidateMailDialog({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: CandidateMailDialogProps) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || 'main').trim();
  const { toast } = useToast();
  const laneAId = candidate ? resolveLaneACandidateIdForMailEval(candidate) : null;
  const settingsHref = hrmPathWithEmbedSearch('/settings?tab=rec-mail-templates');

  const [templates, setTemplates] = useState<HrmRecMailTemplateItem[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateCode, setTemplateCode] = useState('');
  const [toRaw, setToRaw] = useState('');
  const [ccRaw, setCcRaw] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingOutbox, setLoadingOutbox] = useState(false);
  const [outbox, setOutbox] = useState<HrmRecMailOutboxRow[]>([]);

  const activeTemplates = useMemo(
    () => templates.filter((t) => t.active),
    [templates],
  );

  const loadOutbox = useCallback(async () => {
    if (!open || !laneAId || !companyId) {
      setOutbox([]);
      return;
    }
    setLoadingOutbox(true);
    try {
      const res = await listRecruitmentCandidateMail(laneAId, companyId, { limit: 20 });
      setOutbox(res.items);
    } catch (error) {
      setOutbox([]);
      if (import.meta.env.DEV) {
        console.warn('[CandidateMailDialog] list mail outbox', error);
      }
    } finally {
      setLoadingOutbox(false);
    }
  }, [open, laneAId, companyId]);

  const applyCatalogTemplate = useCallback(
    (tpl: HrmRecMailTemplateItem) => {
      const vars = resolveMailTemplateVars(candidate, companyId);
      setSubject(fillRecMailPlaceholders(tpl.subject, vars));
      setBodyText(fillRecMailPlaceholders(tpl.body, vars));
    },
    [candidate, companyId],
  );

  const loadTemplates = useCallback(async () => {
    if (!open || !companyId) {
      setTemplates([]);
      return;
    }
    setLoadingTemplates(true);
    try {
      const res = await listRecruitmentMailTemplates(companyId);
      const items = Array.isArray(res.items) ? res.items : [];
      setTemplates(items);
      const activeList = items.filter((t) => t.active === true);
      const preferred =
        activeList.find((t) => t.code === 'interview_invite') ??
        activeList[0] ??
        null;
      if (preferred) {
        setTemplateCode(preferred.code);
        applyCatalogTemplate(preferred);
      } else {
        setTemplateCode('');
        setSubject('');
        setBodyText('');
      }
    } catch (error) {
      setTemplates([]);
      setTemplateCode('');
      setSubject('');
      setBodyText('');
      toast({
        title: 'Không tải được mẫu thư',
        description: toErrorMessage(error, 'Kiểm tra Cài đặt → Mẫu thư tuyển hoặc thử lại.'),
        variant: 'destructive',
      });
      if (import.meta.env.DEV) {
        console.warn('[CandidateMailDialog] list mail templates', error);
      }
    } finally {
      setLoadingTemplates(false);
    }
  }, [open, companyId, applyCatalogTemplate, toast]);

  useEffect(() => {
    if (!open || !candidate) return;
    setToRaw((candidate.email ?? '').trim());
    setCcRaw('');
    void loadTemplates();
    void loadOutbox();
  }, [open, candidate?.id, candidate?.email, loadTemplates, loadOutbox]);

  const inviteNeedsCc = isRecMailInviteTemplate(templateCode);

  const handleTemplateChange = (value: string) => {
    setTemplateCode(value);
    const tpl = activeTemplates.find((t) => t.code === value);
    if (tpl) applyCatalogTemplate(tpl);
  };

  const handleSubmit = async () => {
    if (!candidate || !laneAId || !companyId) {
      toast({
        title: 'Không gửi được thư',
        description: 'Thiếu liên kết UV–YCTD (Lane A).',
        variant: 'destructive',
      });
      return;
    }
    if (!templateCode.trim() || activeTemplates.length === 0) {
      toast({
        title: 'Chưa có mẫu thư',
        description: 'Bật ít nhất một mẫu tại Cài đặt → Mẫu thư tuyển.',
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
    if (gate.ok !== true) {
      toast({
        title: 'Thiếu thông tin thư',
        description: 'message' in gate ? gate.message : 'Thiếu thông tin thư.',
        variant: 'destructive',
      });
      return;
    }
    if (!subject.trim() || !bodyText.trim()) {
      toast({
        title: 'Thiếu nội dung thư',
        description: 'Nhập tiêu đề và nội dung trước khi gửi.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendRecruitmentCandidateMail(laneAId, companyId, {
        template_code: templateCode,
        to,
        cc_interviewers: inviteNeedsCc ? cc : cc.length > 0 ? cc : undefined,
        subject: subject.trim(),
        body: bodyText.trim(),
        application_id: candidate.application_id ?? undefined,
      });
      const statusLabel = formatRecMailStatusVi(result.status);
      const providerRef =
        result.provider_ref ||
        result.log?.find((l) => l.provider_ref)?.provider_ref ||
        '';
      const isLocalStub =
        result.delivery_mode === 'local' ||
        String(providerRef).startsWith('local-');
      const toLabel = to.join(', ');
      if (isLocalStub) {
        toast({
          title: 'Chưa gửi Gmail thật',
          description: REC_MAIL_LOCAL_STUB_TOAST_VI,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Đã gửi thư (SMTP)',
          description: `Tới: ${toLabel} · ${REC_MAIL_SMTP_SENT_TOAST_VI} · ${statusLabel}${
            providerRef ? ` · ${providerRef}` : ''
          }`,
        });
      }
      await loadOutbox();
      await onSuccess?.();
    } catch (error) {
      const providerFail =
        error instanceof ApiClientError && error.code === 'HRM-REC-MAIL-PROVIDER-FAIL';
      toast({
        title: 'Gửi thư thất bại',
        description: providerFail
          ? toErrorMessage(error, REC_MAIL_PROVIDER_FAIL_TOAST_VI)
          : toErrorMessage(error, 'Không xếp hàng được thư. Kiểm tra mẫu / CC / phạm vi.'),
        variant: 'destructive',
      });
      await loadOutbox();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="rec-mail-dialog">
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
              {' · '}
              <Link
                to={settingsHref}
                className="underline underline-offset-2"
                data-testid="rec-mail-open-settings"
              >
                Cấu hình mẫu thư
              </Link>
            </p>
            {(() => {
              const latest = outbox[0];
              const latestLocal = latest?.log?.some((l) =>
                String(l.provider_ref ?? '').startsWith('local-'),
              );
              if (!latestLocal) return null;
              return (
                <p
                  className="text-xs rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-900 dark:text-amber-100"
                  data-testid="rec-mail-local-stub-banner"
                >
                  Lần gửi gần nhất là stub <code>local-…</code> (chưa SMTP). Cấu hình{' '}
                  <code>HRM_SMTP_*</code> + App Password rồi restart hrm-api.
                </p>
              );
            })()}

            <div className="space-y-2">
              <Label htmlFor="rec-mail-template">Mẫu thư đã cấu hình</Label>
              {loadingTemplates ? (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải mẫu…
                </p>
              ) : activeTemplates.length === 0 ? (
                <p className="text-sm text-destructive" data-testid="rec-mail-templates-empty">
                  Chưa có mẫu đang bật.{' '}
                  <Link to={settingsHref} className="underline underline-offset-2">
                    Mở Cài đặt → Mẫu thư tuyển
                  </Link>
                </p>
              ) : (
                <Select value={templateCode} onValueChange={handleTemplateChange}>
                  <SelectTrigger id="rec-mail-template" data-testid="rec-mail-template">
                    <SelectValue placeholder="Chọn mẫu" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map((tpl) => (
                      <SelectItem key={tpl.code} value={tpl.code}>
                        {tpl.label_vi || tpl.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-mail-to">Người nhận (to)</Label>
              <Input
                id="rec-mail-to"
                data-testid="rec-mail-to"
                value={toRaw}
                onChange={(e) => setToRaw(e.target.value)}
                placeholder="email@gmail.com"
                type="email"
              />
              {parseEmailList(toRaw).some((e) => e && !isDeliverableEmailAddress(e)) ? (
                <p
                  className="text-xs text-destructive"
                  data-testid="rec-mail-to-undeliverable"
                >
                  {REC_MAIL_TO_UNDELIVERABLE_VI}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Phải là Gmail/Outlook thật — không dùng email giả như @dev.local.
                </p>
              )}
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
                <p className="text-xs text-muted-foreground">{REC_MAIL_CC_HINT_VI}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-mail-subject">Tiêu đề</Label>
              <Input
                id="rec-mail-subject"
                data-testid="rec-mail-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tiêu đề thư"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rec-mail-body">Nội dung</Label>
              <Textarea
                id="rec-mail-body"
                data-testid="rec-mail-body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Nội dung thư (có thể sửa trước khi gửi)"
                rows={10}
                className="min-h-[12rem] font-sans text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Đổi mẫu sẽ nạp lại nội dung đã cấu hình (ghi đè chỉnh sửa hiện tại).
              </p>
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
                    const providerRef = row.log?.find((l) => l.provider_ref)?.provider_ref;
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
                        {providerRef ? (
                          <span
                            className="text-muted-foreground truncate max-w-[10rem]"
                            title={providerRef}
                          >
                            ref:{providerRef}
                          </span>
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
            disabled={!laneAId || submitting || activeTemplates.length === 0 || !templateCode}
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
