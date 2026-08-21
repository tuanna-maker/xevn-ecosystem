/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Lên lịch phỏng vấn (Candidates)
 * UC:         UF-HRM-REC interview schedule
 * BR:         FR-UC-BP-REC-06a one-active · scheduleRecruitmentInterview (Lane A)
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
 * TechSpec:   docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3.1
 * Purpose:    Dialog lên lịch PV — Lane A mutate + 409 HRM-REC-IV-409-ACTIVE via toErrorMessage
 * WorkItem:   PO-HRM-REC-IV-ONE-ACTIVE-FE-02
 * Coded:      2026-08-06
 * Callers:    CandidatesTab
 * Callees:    scheduleRecruitmentInterview · resolveSpineRecruitmentCandidateId · react-i18next
 * must_keep:  No mojibake hardcode; U65 no seed; Dialog center chrome; toErrorMessage 409 map
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-IV-ONE-ACTIVE-FE-02
 * What: Wire scheduleRecruitmentInterview (Lane A) + resolve spine candidate by email; drop catalog-only create
 * Why: QA FAIL — catalog path bypasses HRM-REC-IV-409-ACTIVE one-active gate
 * must_keep: i18n recruitment.sid.*; dd/MM/yyyy display; toErrorMessage 409 map
 * LastVerified: docs/qa/evidence/po-hrm-rec-iv-one-active-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-IV-BROWSER-SCHEDULE-POST-P1
 * What: Default interview_date (tomorrow) on open; sonner toast for 409; data-testid for QA harness
 * Why: Browser POST blocked by zod dateRequired; radix toast invisible to sonner Playwright locator
 * must_keep: Lane A scheduleRecruitmentInterview; toErrorMessage HRM-REC-IV-409-ACTIVE map
 * LastVerified: docs/qa/evidence/po-hrm-rec-iv-browser-schedule-post-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-REC-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: Expected HRM-REC-IV-409-ACTIVE → toast/inline only; no console.error storm (unexpected errors still log)
 * Why: QC soft OBS R-REC-IV-409-CONSOLE — handled one-active 409 must not look like Uncaught
 * must_keep: Lane A schedule; toErrorMessage 409 map; sonner toast testid; U65 zero-seed
 * LastVerified: docs/qa/evidence/po-uat-rec-soft-obs-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Soft-gate submit when current stage allowsInterviewSchedule=false (VAL-REC-CNS-05)
 * Why: BA-01 AC-PLT-REC-STAGE-06a — FE block + clear feedback; cấm reopen IV one-active seals
 * must_keep: Lane A schedule · HRM-REC-IV-409-ACTIVE · U65 · recruitment_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Distinct toast codes PAST/DISALLOW/CANCEL/INVALID; 409 → onActiveConflict handoff (manage id)
 * Why: BA O5/O7 · AC-REC-IV-06/07 · residual manage unlock — RETAIN create/409/badge
 * must_keep: Lane A POST create · soft-gate ≠ 409 · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md
 */
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, Clock, MapPin, Video, Phone, Building2, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { resolveSpineRecruitmentCandidateId, scheduleRecruitmentInterview } from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { useAuth } from '@/contexts/AuthContext';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import {
  isRecPipelineStageInterviewScheduleAllowed,
  REC_PIPELINE_STAGE_IV_SOFT_GATE_VI,
} from '@/lib/recPipelineStageCatalog';
import { pickActiveInterviewIdFrom409Details } from './candidateActiveInterview';
import { cn } from '@/lib/utils';

const EXPECTED_SCHEDULE_CODES = new Set([
  'HRM-REC-IV-409-ACTIVE',
  'HRM-REC-IV-400-STAGE-DISALLOW',
  'HRM-REC-IV-STAGE-DENY',
  'HRM-REC-IV-400-PAST-DATETIME',
]);

type InterviewFormData = {
  interview_date: Date;
  interview_time: string;
  duration_minutes: number;
  interview_type: 'onsite' | 'online' | 'phone';
  location?: string;
  meeting_link?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  notes?: string;
};

interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  position?: string;
}

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  /** Current pool/application stage — VAL-REC-CNS-05 soft-gate. */
  candidateStage?: string | null;
  onSuccess?: () => void;
  /** AC-REC-IV-06 — hand off ACTIVE id from 409 details to manage dialog. */
  onActiveConflict?: (payload: { interviewId: string; candidate: Candidate }) => void;
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

function buildScheduledAtIso(interviewDate: Date, interviewTime: string): string {
  const [hours, minutes] = interviewTime.split(':').map((part) => Number.parseInt(part, 10));
  const scheduled = new Date(interviewDate);
  scheduled.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return scheduled.toISOString();
}

/** Default schedule date: tomorrow at local midnight — unblocks submit when calendar popover fails in iframe QA. */
function defaultInterviewDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isPastCalendarDay(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);
  return candidate < today;
}

function buildDefaultFormValues(): InterviewFormData {
  return {
    interview_date: defaultInterviewDate(),
    interview_time: '09:00',
    duration_minutes: 60,
    interview_type: 'onsite',
    location: '',
    meeting_link: '',
    interviewer_name: '',
    interviewer_email: '',
    notes: '',
  };
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  candidate,
  candidateStage,
  onSuccess,
  onActiveConflict,
}: ScheduleInterviewDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items: pipelineStageItems, catalogCount } = useRecPipelineStagesEffective({
    enabled: open,
  });
  const interviewScheduleAllowed = useMemo(
    () =>
      isRecPipelineStageInterviewScheduleAllowed(
        pipelineStageItems,
        candidateStage,
        catalogCount,
      ),
    [pipelineStageItems, candidateStage, catalogCount],
  );

  const interviewSchema = useMemo(
    () =>
      z.object({
        interview_date: z.date({
          required_error: t('recruitment.sid.validation.dateRequired'),
        }),
        interview_time: z.string().min(1, t('recruitment.sid.validation.timeRequired')),
        duration_minutes: z
          .number()
          .min(15, t('recruitment.sid.validation.durationMin'))
          .max(480, t('recruitment.sid.validation.durationMax')),
        interview_type: z.enum(['onsite', 'online', 'phone']),
        location: z.string().max(255, t('recruitment.sid.validation.locationMax')).optional(),
        meeting_link: z
          .string()
          .url(t('recruitment.sid.validation.linkInvalid'))
          .max(500, t('recruitment.sid.validation.linkMax'))
          .optional()
          .or(z.literal('')),
        interviewer_name: z.string().max(100, t('recruitment.sid.validation.nameMax')).optional(),
        interviewer_email: z
          .string()
          .email(t('recruitment.sid.validation.emailInvalid'))
          .max(255, t('recruitment.sid.validation.emailMax'))
          .optional()
          .or(z.literal('')),
        notes: z.string().max(1000, t('recruitment.sid.validation.notesMax')).optional(),
      }),
    [t],
  );

  const durationOptions = useMemo(
    () => [
      { value: 30, label: t('recruitment.sid.minutes30') },
      { value: 45, label: t('recruitment.sid.minutes45') },
      { value: 60, label: t('recruitment.sid.hour1') },
      { value: 90, label: t('recruitment.sid.hour1half') },
      { value: 120, label: t('recruitment.sid.hour2') },
    ],
    [t],
  );

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: buildDefaultFormValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultFormValues());
    }
  }, [open, form]);

  const interviewType = form.watch('interview_type');

  const handleSubmit = async (data: InterviewFormData) => {
    if (!candidate || !currentCompanyId) {
      toast.error(t('recruitment.sid.error'), {
        description: t('recruitment.sid.errorMissing'),
      });
      return;
    }

    if (!interviewScheduleAllowed) {
      toast.error(t('recruitment.sid.error'), {
        description: REC_PIPELINE_STAGE_IV_SOFT_GATE_VI,
        'data-testid': 'schedule-interview-stage-deny-toast',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const spineCandidateId = await resolveSpineRecruitmentCandidateId(currentCompanyId, candidate.email);
      if (!spineCandidateId) {
        toast.error(t('recruitment.sid.error'), {
          description:
            'Không tìm thấy ứng viên trên luồng lịch phỏng vấn chính. Vui lòng đồng bộ hồ sơ ứng viên trước khi lên lịch.',
        });
        return;
      }

      await scheduleRecruitmentInterview({
        company_id: currentCompanyId,
        candidate_id: spineCandidateId,
        scheduled_at: buildScheduledAtIso(data.interview_date, data.interview_time),
        interviewer: (data.interviewer_name?.trim() || candidate.fullName).slice(0, 255),
      });
      toast.success(t('recruitment.sid.success'), {
        description: t('recruitment.sid.successMsg', { name: candidate.fullName }),
      });

      form.reset(buildDefaultFormValues());
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      // Expected one-active / stage-deny / past: toast only — no console.error storm.
      const code = error instanceof ApiClientError ? error.code : undefined;
      if (!code || !EXPECTED_SCHEDULE_CODES.has(code)) {
        console.error('Error scheduling interview:', error);
      }
      const friendly = toErrorMessage(error, t('recruitment.sid.error'));
      toast.error(t('recruitment.sid.error'), {
        description: friendly,
        'data-testid': 'schedule-interview-error-toast',
      });
      if (code === 'HRM-REC-IV-409-ACTIVE' && candidate && onActiveConflict) {
        const conflictId =
          error instanceof ApiClientError
            ? pickActiveInterviewIdFrom409Details(error.details)
            : null;
        if (conflictId) {
          onOpenChange(false);
          onActiveConflict({ interviewId: conflictId, candidate });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="schedule-interview-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {t('recruitment.sid.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{candidate.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {candidate.position || t('recruitment.sid.noPosition')}
              </p>
            </div>
          </div>
        </div>

        {!interviewScheduleAllowed ? (
          <div
            className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-xevn-textPrimary"
            data-testid="schedule-interview-stage-deny-banner"
            role="alert"
          >
            {REC_PIPELINE_STAGE_IV_SOFT_GATE_VI}
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interview_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.dateLabel')} *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            data-testid="schedule-interview-date-trigger"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: vi })
                            ) : (
                              <span>{t('recruitment.sid.selectDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isPastCalendarDay}
                          initialFocus
                          data-testid="schedule-interview-calendar"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interview_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.timeLabel')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="w-4 h-4 mr-2 opacity-50" />
                          <SelectValue placeholder={t('recruitment.sid.selectTime')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.durationLabel')}</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val, 10))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('recruitment.sid.selectDuration')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interview_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.formatLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="onsite">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {t('recruitment.sid.onsite')}
                          </div>
                        </SelectItem>
                        <SelectItem value="online">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            {t('recruitment.sid.online')}
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {t('recruitment.sid.phone')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {interviewType === 'onsite' && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.locationLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder={t('recruitment.sid.locationPlaceholder')}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {interviewType === 'online' && (
              <FormField
                control={form.control}
                name="meeting_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.meetingLinkLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder={t('recruitment.sid.meetingLinkPlaceholder')}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interviewer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.interviewerLabel')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('recruitment.sid.interviewerPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interviewer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('recruitment.sid.interviewerEmailLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t('recruitment.sid.interviewerEmailPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('recruitment.sid.notesLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('recruitment.sid.notesPlaceholder')}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('recruitment.sid.cancelBtn')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !interviewScheduleAllowed}
                data-testid="schedule-interview-submit"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('recruitment.sid.submitBtn')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
