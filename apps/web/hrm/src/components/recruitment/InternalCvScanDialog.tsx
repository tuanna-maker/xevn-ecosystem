/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — YCTD detail → Quét kho CV nội bộ
 * UC:         UC-BP-REC-04
 * BR:         BR-BP-CV-01 · BR-REC-CV-CRITERIA · BR-REC-CV-ZERO · BR-REC-CV-SKIP · O1/O3/O4/O7
 * SRS:        FR-UC-BP-REC-04 Diễn biến #1–#2 · special 0-hits / skip
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md F-REC-CV-SCAN-01..03
 * Purpose:    Dialog Quét kho — GET candidates-pool (title+skill/exp) · attach UV-YCTD RETAIN ·
 *             POST internal-scan complete|skip · Network /recruitment/ only · DENY Campaign.
 * WorkItem:   PO-HRM-MVP-GD1-REC-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    JobRequisitionsTab
 * Callees:    listCandidatesPool · createCandidatePool · postJobRequisitionInternalScan · jobRequisitionCvScan
 * FEActions:  tiêu chí → Tìm → Gắn / Hoàn tất / Bỏ qua+lý do → toast · parent refetch F5 flags
 * must_keep:  physical /recruitment/* · UV-YCTD soft FK · REC-03 OUT · U65 · honesty false · C-SLICE
 * SOLID:      Dialog SRP — tab owns detail state / flags gate
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-04-cluster-fe-01.md
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createCandidatePool,
  listCandidatesPool,
  postJobRequisitionInternalScan,
  type HrmCandidatePoolRow,
  type HrmJobRequisition,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  cvScanAuditBadgeLabel,
  formatCvScanAtVi,
  resolveCvScanAuditState,
  resolveDefaultScanPosition,
  validateCvScanCriteria,
  YCTD_CV_SCAN_ATTACH_TOAST_VI,
  YCTD_CV_SCAN_COMPLETE_TOAST_VI,
  YCTD_CV_SCAN_EMPTY_CTA_VI,
  YCTD_CV_SCAN_HINT_VI,
  YCTD_CV_SCAN_SKIP_REASON_REQUIRED_VI,
  YCTD_CV_SCAN_SKIP_TOAST_VI,
  YCTD_CV_SCAN_TITLE_VI,
  YCTD_CV_SCAN_ZERO_HITS_VI,
} from '@/lib/jobRequisitionCvScan';
import { resolvePipelineFlags } from '@/lib/jobRequisitionYctdWave2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/auth/PermissionGate';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisition: HrmJobRequisition | null;
  companyId: string;
  onCompleted: (updated: HrmJobRequisition) => void;
};

export function InternalCvScanDialog({
  open,
  onOpenChange,
  requisition,
  companyId,
  onCompleted,
}: Props) {
  const defaults = useMemo(
    () => resolveDefaultScanPosition(requisition),
    [requisition],
  );
  const [positionCode, setPositionCode] = useState('');
  const [skill, setSkill] = useState('');
  const [experience, setExperience] = useState('');
  const [skipReason, setSkipReason] = useState('');
  const [showSkipForm, setShowSkipForm] = useState(false);
  const [rows, setRows] = useState<HrmCandidatePoolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);

  const flags = resolvePipelineFlags(requisition);
  const auditState = resolveCvScanAuditState(flags);

  useEffect(() => {
    if (!open || !requisition) return;
    const d = resolveDefaultScanPosition(requisition);
    setPositionCode(d.position_code);
    setSkill('');
    setExperience('');
    setSkipReason('');
    setShowSkipForm(false);
    setRows([]);
    setTotal(0);
    setSearched(false);
  }, [open, requisition?.id]);

  const runSearch = useCallback(async () => {
    if (!requisition || !companyId) return;
    const criteria = validateCvScanCriteria({
      position_code: positionCode,
      skill,
      experience,
    });
    if (!criteria.ok) {
      toast({
        title: 'Tiêu chí quét chưa đủ',
        description: criteria.message,
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await listCandidatesPool({
        company_id: companyId,
        requisition_id: requisition.id,
        for: 'internal_scan',
        position_code: positionCode.trim() || undefined,
        skill: skill.trim() || undefined,
        experience: experience.trim() || undefined,
      });
      setRows(res.data ?? []);
      setTotal(res.total ?? (res.data?.length ?? 0));
      setSearched(true);
    } catch (error: unknown) {
      toast({
        title: 'Không quét được kho',
        description: toErrorMessage(error, 'Kiểm tra YCTD open_for_hire và phạm vi đơn vị.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, experience, positionCode, requisition, skill]);

  const onAttach = async (row: HrmCandidatePoolRow) => {
    if (!requisition || !companyId) return;
    const email = String(row.email ?? '').trim();
    if (!email) {
      toast({
        title: 'Thiếu email UV',
        description: 'UV trong kho thiếu email — không gắn qua F-REC-UV-YCTD.',
        variant: 'destructive',
      });
      return;
    }
    setAttachingId(row.id);
    try {
      await createCandidatePool({
        company_id: companyId,
        full_name: row.full_name,
        email,
        phone: row.phone,
        source: row.source ?? 'internal_pool',
        notes: row.notes,
        requisition_id: requisition.id,
        position_key: requisition.position_key ?? row.position_key ?? undefined,
      });
      toast({
        title: YCTD_CV_SCAN_ATTACH_TOAST_VI,
        description: `${row.full_name} — F5 còn trên pipeline YCTD.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Không gắn UV vào YCTD',
        description: toErrorMessage(error, 'Kiểm tra YCTD receivable và trùng email.'),
        variant: 'destructive',
      });
    } finally {
      setAttachingId(null);
    }
  };

  const onCompleteScan = async () => {
    if (!requisition || !companyId) return;
    setMutating(true);
    try {
      const updated = await postJobRequisitionInternalScan(requisition.id, companyId, {
        action: 'complete',
        hit_count: searched ? total : undefined,
        criteria_snapshot: {
          position_code: positionCode.trim() || undefined,
          skill: skill.trim() || undefined,
          experience: experience.trim() || undefined,
        },
      });
      toast({
        title: YCTD_CV_SCAN_COMPLETE_TOAST_VI,
        description:
          searched && total === 0
            ? YCTD_CV_SCAN_ZERO_HITS_VI
            : 'F5 còn vết internal_scan_done trên YCTD.',
      });
      onCompleted(updated);
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: 'Không hoàn tất quét',
        description: toErrorMessage(error, 'Kiểm tra trạng thái YCTD và quyền.'),
        variant: 'destructive',
      });
    } finally {
      setMutating(false);
    }
  };

  const onSkipScan = async () => {
    if (!requisition || !companyId) return;
    const reason = skipReason.trim();
    if (!reason) {
      toast({
        title: 'Thiếu lý do bỏ qua',
        description: YCTD_CV_SCAN_SKIP_REASON_REQUIRED_VI,
        variant: 'destructive',
      });
      return;
    }
    setMutating(true);
    try {
      const updated = await postJobRequisitionInternalScan(requisition.id, companyId, {
        action: 'skip',
        skip_reason: reason,
      });
      toast({
        title: YCTD_CV_SCAN_SKIP_TOAST_VI,
        description: 'F5 còn lý do skip — khác toast «đã quét 0 hits».',
      });
      onCompleted(updated);
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: 'Không bỏ qua quét được',
        description: toErrorMessage(error, YCTD_CV_SCAN_SKIP_REASON_REQUIRED_VI),
        variant: 'destructive',
      });
    } finally {
      setMutating(false);
    }
  };

  if (!requisition) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto"
        data-testid="yctd-internal-cv-scan-dialog"
      >
        <DialogHeader>
          <DialogTitle>{YCTD_CV_SCAN_TITLE_VI}</DialogTitle>
          <DialogDescription>{YCTD_CV_SCAN_HINT_VI}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xevn-text-secondary">YCTD:</span>
            <span className="font-medium text-xevn-text">{requisition.title}</span>
            <Badge
              variant="outline"
              data-testid="yctd-cv-scan-audit-badge"
              className={
                auditState === 'done'
                  ? 'border-emerald-600 text-emerald-700'
                  : auditState === 'skipped'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-xevn-border text-xevn-text-secondary'
              }
            >
              {cvScanAuditBadgeLabel(auditState)}
            </Badge>
            {flags.internal_scan_at ? (
              <span className="text-xs text-xevn-text-secondary" data-testid="yctd-cv-scan-at">
                Lúc {formatCvScanAtVi(flags.internal_scan_at)}
              </span>
            ) : null}
          </div>
          {auditState === 'skipped' && flags.internal_scan_skip_reason ? (
            <p className="text-xs text-xevn-text-secondary" data-testid="yctd-cv-scan-skip-reason-view">
              Lý do bỏ qua: {flags.internal_scan_skip_reason}
            </p>
          ) : null}

          <div className="grid grid-cols-12 gap-3">
            <label className="col-span-12 space-y-1 sm:col-span-4">
              <span className="text-xs font-medium text-xevn-text">Chức danh *</span>
              <Input
                value={positionCode}
                onChange={(e) => setPositionCode(e.target.value)}
                placeholder={defaults.position_label || 'position_code / chức danh'}
                data-testid="yctd-cv-scan-position"
              />
            </label>
            <label className="col-span-12 space-y-1 sm:col-span-4">
              <span className="text-xs font-medium text-xevn-text">Kỹ năng *</span>
              <Input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="vd. logistics, lái xe…"
                data-testid="yctd-cv-scan-skill"
              />
            </label>
            <label className="col-span-12 space-y-1 sm:col-span-4">
              <span className="text-xs font-medium text-xevn-text">Kinh nghiệm</span>
              <Input
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="vd. 2 năm kho / vận hành"
                data-testid="yctd-cv-scan-experience"
              />
            </label>
          </div>
          <p className="text-xs text-xevn-text-secondary">
            Cần chức danh + ít nhất một trong kỹ năng hoặc kinh nghiệm (O4 — cấm exact-title-only).
          </p>

          <PermissionGate module="recruitment" action="read">
            <Button
              type="button"
              size="sm"
              disabled={loading || mutating}
              data-testid="yctd-cv-scan-search"
              onClick={() => void runSearch()}
            >
              {loading ? 'Đang quét…' : 'Tìm trong kho'}
            </Button>
          </PermissionGate>

          {searched ? (
            <div className="rounded-lg border border-xevn-border" data-testid="yctd-cv-scan-results">
              <div className="border-b border-xevn-border px-3 py-2 text-xs text-xevn-text-secondary">
                Kết quả: {total}
              </div>
              {rows.length === 0 ? (
                <p className="p-3 text-sm text-xevn-text-secondary" data-testid="yctd-cv-scan-empty">
                  {YCTD_CV_SCAN_EMPTY_CTA_VI}
                </p>
              ) : (
                <ul className="divide-y divide-xevn-border">
                  {rows.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                      data-testid={`yctd-cv-scan-row-${row.id}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-xevn-text">{row.full_name}</p>
                        <p className="truncate text-xs text-xevn-text-secondary">
                          {row.email ?? '—'} · {row.position_name || row.position || '—'}
                        </p>
                      </div>
                      <PermissionGate module="recruitment" action="create">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={mutating || attachingId === row.id}
                          data-testid={`yctd-cv-scan-attach-${row.id}`}
                          onClick={() => void onAttach(row)}
                        >
                          {attachingId === row.id ? 'Đang gắn…' : 'Gắn YCTD'}
                        </Button>
                      </PermissionGate>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {showSkipForm ? (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-xevn-text">Lý do bỏ qua quét *</span>
                <Textarea
                  rows={2}
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  placeholder="vd. Kho trống / đã quét tay ngoài hệ thống…"
                  data-testid="yctd-cv-scan-skip-reason"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <PermissionGate module="recruitment" action="update">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={mutating}
                    data-testid="yctd-cv-scan-skip-confirm"
                    onClick={() => void onSkipScan()}
                  >
                    Xác nhận bỏ qua
                  </Button>
                </PermissionGate>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={mutating}
                  onClick={() => setShowSkipForm(false)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {!showSkipForm ? (
              <PermissionGate module="recruitment" action="update">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={mutating}
                  data-testid="yctd-cv-scan-skip-open"
                  onClick={() => setShowSkipForm(true)}
                >
                  Bỏ qua quét…
                </Button>
              </PermissionGate>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <PermissionGate module="recruitment" action="update">
              <Button
                type="button"
                disabled={mutating}
                data-testid="yctd-cv-scan-complete"
                onClick={() => void onCompleteScan()}
              >
                Hoàn tất quét
              </Button>
            </PermissionGate>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
