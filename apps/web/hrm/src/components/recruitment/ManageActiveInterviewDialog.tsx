/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Quản lý lịch PV đang hiệu lực (Candidates)
 * UC:         UC-BP-REC-06a · AC-REC-IV-03/04/05 · R01–R05
 * BR:         BR-BP-REC-IV-02/03/06 · BR-REC-IV-PATH Lane A only
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a Diễn biến #4–#7
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md F-REC-IV-02/03
 * Purpose:    Confirm / Hủy / Hoàn tất / Không đến / Đổi lịch R-A — Network /recruitment/interviews* only
 * WorkItem:   PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidatesTab
 * Callees:    updateRecruitmentInterviewStatus · rescheduleRecruitmentInterview · toErrorMessage
 * must_keep:  Lane A path · toast 409≠DISALLOW≠PAST≠CANCEL≠INVALID · no POST create on R-A · U65 · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01
 * change_mode: ADD
 * What: Manage ACTIVE interview UX — status PATCH + R-A PATCH scheduled_at; distinct error toasts
 * Why: BA residual browser unlock after API-01 CONFIRMED
 * must_keep: prior create/409/badge GWC · soft-gate copy distinct · C-SLICE · REC-03 OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md
 */
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CalendarIcon,
  CheckCheck,
  CheckCircle,
  Clock,
  Loader2,
  User,
  UserX,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  rescheduleRecruitmentInterview,
  updateRecruitmentInterviewStatus,
  type HrmRecruitmentInterviewStatus,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type { CandidateActiveInterviewBadge } from './candidateActiveInterview';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const EXPECTED_IV_CODES = new Set([
  'HRM-REC-IV-409-ACTIVE',
  'HRM-REC-IV-400-STAGE-DISALLOW',
  'HRM-REC-IV-STAGE-DENY',
  'HRM-REC-IV-400-PAST-DATETIME',
  'HRM-REC-IV-400-CANCEL-REASON',
  'HRM-REC-IV-400-INVALID-TRANSITION',
]);

function buildScheduledAtIso(interviewDate: Date, interviewTime: string): string {
  const [hours, minutes] = interviewTime.split(':').map((part) => Number.parseInt(part, 10));
  const scheduled = new Date(interviewDate);
  scheduled.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return scheduled.toISOString();
}

function isPastCalendarDay(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);
  return candidate < today;
}

function defaultRescheduleDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseInitialDateTime(isoOrDisplay: string | null | undefined): { date: Date; time: string } {
  if (isoOrDisplay) {
    const parsed = new Date(isoOrDisplay);
    if (!Number.isNaN(parsed.getTime())) {
      const hh = String(parsed.getHours()).padStart(2, '0');
      const mm = String(parsed.getMinutes()).padStart(2, '0');
      const day = new Date(parsed);
      day.setHours(0, 0, 0, 0);
      return { date: day, time: `${hh}:${mm}` };
    }
  }
  return { date: defaultRescheduleDate(), time: '09:00' };
}

export type ManageActiveInterviewCandidate = {
  id: string;
  fullName: string;
  email: string;
  position?: string | null;
};

type ManageMode = 'actions' | 'reschedule' | 'cancel';

interface ManageActiveInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: ManageActiveInterviewCandidate | null;
  interviewId: string | null;
  badge: CandidateActiveInterviewBadge | null;
  /** ISO scheduled_at from projection when available. */
  scheduledAtIso?: string | null;
  statusLabel?: string | null;
  onSuccess?: () => void;
}

export function ManageActiveInterviewDialog({
  open,
  onOpenChange,
  candidate,
  interviewId,
  badge,
  scheduledAtIso,
  statusLabel,
  onSuccess,
}: ManageActiveInterviewDialogProps) {
  const { currentCompanyId } = useAuth();
  const [mode, setMode] = useState<ManageMode>('actions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const initialDt = useMemo(() => parseInitialDateTime(scheduledAtIso), [scheduledAtIso]);
  const [rescheduleDate, setRescheduleDate] = useState<Date>(initialDt.date);
  const [rescheduleTime, setRescheduleTime] = useState(initialDt.time);

  useEffect(() => {
    if (!open) return;
    setMode('actions');
    setCancelReason('');
    setInterviewer('');
    const dt = parseInitialDateTime(scheduledAtIso);
    setRescheduleDate(dt.date);
    setRescheduleTime(dt.time);
  }, [open, scheduledAtIso, interviewId]);

  const toastIvError = (error: unknown, fallback: string) => {
    const code = error instanceof ApiClientError ? error.code : undefined;
    if (!code || !EXPECTED_IV_CODES.has(code)) {
      console.error('Interview manage error:', error);
    }
    toast.error(fallback, {
      description: toErrorMessage(error, fallback),
      'data-testid': 'manage-interview-error-toast',
    });
  };

  const requireInterviewId = (): string | null => {
    const id = interviewId?.trim() ?? '';
    if (id) return id;
    toast.error('Không thể thao tác lịch', {
      description:
        'Thiếu mã lịch đang hiệu lực từ hệ thống. Thử xếp lịch lại để nhận chi tiết xung đột, hoặc làm mới danh sách (F5).',
      'data-testid': 'manage-interview-missing-id-toast',
    });
    return null;
  };

  const runStatus = async (status: HrmRecruitmentInterviewStatus, reason?: string) => {
    const id = requireInterviewId();
    if (!id || !currentCompanyId) return;
    setIsSubmitting(true);
    try {
      await updateRecruitmentInterviewStatus(
        id,
        {
          status,
          ...(status === 'cancelled' && reason?.trim()
            ? { cancel_reason: reason.trim().slice(0, 500) }
            : {}),
        },
        currentCompanyId,
      );
      const labels: Record<string, string> = {
        confirmed: 'Đã xác nhận lịch phỏng vấn',
        cancelled: 'Đã hủy lịch phỏng vấn',
        completed: 'Đã hoàn tất phỏng vấn',
        no_show: 'Đã ghi nhận ứng viên không đến',
      };
      toast.success(labels[status] ?? 'Đã cập nhật lịch phỏng vấn', {
        description: candidate ? `Ứng viên: ${candidate.fullName}` : undefined,
        'data-testid': 'manage-interview-success-toast',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toastIvError(error, 'Không thể cập nhật trạng thái lịch phỏng vấn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    const id = requireInterviewId();
    if (!id || !currentCompanyId) return;
    setIsSubmitting(true);
    try {
      // R-A: PATCH same id — DENY POST create as reschedule.
      await rescheduleRecruitmentInterview(
        id,
        {
          scheduled_at: buildScheduledAtIso(rescheduleDate, rescheduleTime),
          ...(interviewer.trim() ? { interviewer: interviewer.trim().slice(0, 255) } : {}),
        },
        currentCompanyId,
      );
      toast.success('Đã đổi lịch phỏng vấn', {
        description: `Thời gian mới: ${format(rescheduleDate, 'dd/MM/yyyy', { locale: vi })} ${rescheduleTime}`,
        'data-testid': 'manage-interview-reschedule-success-toast',
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      toastIvError(error, 'Không thể đổi lịch phỏng vấn');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        data-testid="manage-active-interview-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Quản lý lịch phỏng vấn
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{candidate.fullName}</p>
              <p className="text-sm text-muted-foreground truncate">
                {candidate.position || 'Chưa có vị trí'}
              </p>
              {badge ? (
                <div className="mt-2 flex flex-wrap items-center gap-2" data-testid="manage-interview-badge">
                  <Badge variant="secondary" className="bg-warning/15 text-warning">
                    {badge.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{badge.time}</span>
                  {statusLabel ? (
                    <Badge variant="outline" className="text-xs">
                      {statusLabel}
                    </Badge>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {mode === 'actions' ? (
          <div className="space-y-3" data-testid="manage-interview-actions">
            <p className="text-sm text-muted-foreground">
              Thao tác trên lịch đang hiệu lực (không tạo lịch mới). Sau khi hủy / hoàn tất / không đến có thể xếp vòng sau.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !interviewId}
                data-testid="manage-interview-confirm"
                onClick={() => void runStatus('confirmed')}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCheck className="w-4 h-4 mr-2" />}
                Xác nhận
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !interviewId}
                data-testid="manage-interview-reschedule-open"
                onClick={() => setMode('reschedule')}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Đổi lịch
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !interviewId}
                data-testid="manage-interview-complete"
                onClick={() => void runStatus('completed')}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Hoàn tất
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !interviewId}
                data-testid="manage-interview-no-show"
                onClick={() => void runStatus('no_show')}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserX className="w-4 h-4 mr-2" />}
                Không đến
              </Button>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={isSubmitting || !interviewId}
              data-testid="manage-interview-cancel-open"
              onClick={() => setMode('cancel')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy lịch
            </Button>
            {!interviewId ? (
              <p className="text-xs text-destructive" role="alert" data-testid="manage-interview-id-missing">
                Chưa có mã lịch từ hệ thống — làm mới danh sách hoặc mở từ thông báo xung đột 409.
              </p>
            ) : null}
          </div>
        ) : null}

        {mode === 'cancel' ? (
          <div className="space-y-4" data-testid="manage-interview-cancel-form">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Lý do hủy (tùy chọn theo cấu hình đơn vị)</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Nhập lý do nếu đơn vị yêu cầu…"
                data-testid="manage-interview-cancel-reason"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setMode('actions')}>
                Quay lại
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isSubmitting}
                data-testid="manage-interview-cancel-submit"
                onClick={() => void runStatus('cancelled', cancelReason)}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Xác nhận hủy
              </Button>
            </div>
          </div>
        ) : null}

        {mode === 'reschedule' ? (
          <div className="space-y-4" data-testid="manage-interview-reschedule-form">
            <p className="text-sm text-muted-foreground">
              Đổi ngày giờ trên cùng lịch đang hiệu lực — không tạo bản ghi ACTIVE thứ hai.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày phỏng vấn *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      data-testid="manage-interview-reschedule-date"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !rescheduleDate && 'text-muted-foreground',
                      )}
                    >
                      {rescheduleDate ? (
                        format(rescheduleDate, 'dd/MM/yyyy', { locale: vi })
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={(d) => d && setRescheduleDate(d)}
                      disabled={isPastCalendarDay}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Giờ phỏng vấn *</Label>
                <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                  <SelectTrigger data-testid="manage-interview-reschedule-time">
                    <Clock className="w-4 h-4 mr-2 opacity-50" />
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reschedule-interviewer">Người phỏng vấn (tùy chọn)</Label>
              <Input
                id="reschedule-interviewer"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                maxLength={255}
                placeholder="Tên người phỏng vấn"
                data-testid="manage-interview-reschedule-interviewer"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setMode('actions')}>
                Quay lại
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                data-testid="manage-interview-reschedule-submit"
                onClick={() => void handleReschedule()}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu đổi lịch
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
