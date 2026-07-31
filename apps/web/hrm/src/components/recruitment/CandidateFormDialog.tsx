/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — form tạo/sửa ứng viên pool
 * UC:         UC-HRM-REC-* · UC-HRM-INT-01
 * BR:         G-DB-01 hire link
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33 FR-HRM-INT-01
 * TechSpec:   docs/hrm/TECHSPEC.md §17.3 G-DB-01
 * Purpose:    CRUD candidates-pool; ADD employee_id bắt buộc khi stage=hired.
 * WorkItem:   FE-HRM-G-DB-01-HIRE-BIND-01
 * Coded:      2026-07-21
 * must_keep:  G-RC-01 · leave CREATE · U65
 * change_mode: ADD
 * LastVerified: recruitmentHireLink.test.ts
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createCandidatePool, updateCandidatePool } from '@/integrations/hrmApi';
import { useEmployees } from '@/hooks/useEmployees';
import { toErrorMessage } from '@/lib/apiError';
import { HRM_REC_HIRE_400_VI, isHiredStage } from '@/lib/recruitmentHireLink';

type CandidateFormValues = z.infer<ReturnType<typeof createCandidateSchema>>;

const createCandidateSchema = (r: (key: string) => string) =>
  z
    .object({
      full_name: z.string().min(1, r('formValName')).max(100, r('formValNameMax')),
      email: z.string().email(r('formValEmail')),
      phone: z.string().optional(),
      position: z.string().optional(),
      source: z.string().optional(),
      stage: z.string().min(1, r('formValStage')),
      employee_id: z.string().optional(),
      rating: z.coerce.number().min(0).max(5).optional(),
      applied_date: z.date().optional().nullable(),
      expected_start_date: z.date().optional().nullable(),
      nationality: z.string().optional(),
      hometown: z.string().optional(),
      marital_status: z.string().optional(),
      notes: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // FR-HRM-INT-01 #5 — hired bắt buộc mã hồ sơ trước khi Lưu.
      if (isHiredStage(data.stage) && !data.employee_id?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: HRM_REC_HIRE_400_VI,
          path: ['employee_id'],
        });
      }
    });

interface Candidate {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  source?: string | null;
  stage?: string | null;
  employee_id?: string | null;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
}

interface CandidateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  companyId: string;
  onSuccess: () => void;
}

const getSourceOptions = (r: (key: string) => string) => [
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Website', label: r('sources.website') },
  { value: 'TopCV', label: 'TopCV' },
  { value: 'VietnamWorks', label: 'VietnamWorks' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Giới thiệu', label: r('sources.referral') },
  { value: 'Hội chợ việc làm', label: r('sources.jobFair') },
  { value: 'Email', label: r('sources.directEmail') },
  { value: 'Khác', label: r('sources.other') },
];

const getStageOptions = (r: (key: string) => string) => [
  { value: 'applied', label: r('stages.applied') },
  { value: 'screening', label: r('stages.screening') },
  { value: 'interview', label: r('stages.interview') },
  { value: 'offer', label: r('stages.offer') },
  { value: 'hired', label: r('stages.hired') },
  { value: 'rejected', label: r('stages.rejected') },
];

const getMaritalStatusOptions = (r: (key: string) => string) => [
  { value: 'single', label: r('marital.single') },
  { value: 'married', label: r('marital.married') },
  { value: 'divorced', label: r('marital.divorced') },
  { value: 'other', label: r('marital.other') },
];

export function CandidateFormDialog({
  open,
  onOpenChange,
  candidate,
  companyId,
  onSuccess,
}: CandidateFormDialogProps) {
  const { t } = useTranslation();
  const r = (key: string) => t(`rc.${key}`);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { employees, isLoading: employeesLoading } = useEmployees(false, undefined, { enabled: open });

  const candidateSchema = createCandidateSchema(r);
  const sourceOptions = getSourceOptions(r);
  const stageOptions = getStageOptions(r);
  const maritalStatusOptions = getMaritalStatusOptions(r);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      position: '',
      source: '',
      stage: 'applied',
      employee_id: '',
      rating: 0,
      applied_date: new Date(),
      expected_start_date: null,
      nationality: r('formNationalityPlaceholder'),
      hometown: '',
      marital_status: '',
      notes: '',
    },
  });

  const watchedStage = form.watch('stage');

  useEffect(() => {
    if (candidate) {
      form.reset({
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone || '',
        position: candidate.position || '',
        source: candidate.source || '',
        stage: candidate.stage || 'applied',
        employee_id: candidate.employee_id || '',
        rating: candidate.rating || 0,
        applied_date: candidate.applied_date ? new Date(candidate.applied_date) : null,
        expected_start_date: candidate.expected_start_date ? new Date(candidate.expected_start_date) : null,
        nationality: candidate.nationality || r('formNationalityPlaceholder'),
        hometown: candidate.hometown || '',
        marital_status: candidate.marital_status || '',
        notes: candidate.notes || '',
      });
    } else {
      form.reset({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        source: '',
        stage: 'applied',
        employee_id: '',
        rating: 0,
        applied_date: new Date(),
        expected_start_date: null,
        nationality: r('formNationalityPlaceholder'),
        hometown: '',
        marital_status: '',
        notes: '',
      });
    }
  }, [candidate, form, open]);

  const onSubmit = async (data: CandidateFormValues) => {
    setIsSubmitting(true);
    try {
      const candidatePayload = {
        company_id: companyId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
        position: data.position || null,
        source: data.source || null,
        stage: data.stage,
        rating: data.rating || 0,
        applied_date: data.applied_date ? format(data.applied_date, 'yyyy-MM-dd') : null,
        expected_start_date: data.expected_start_date
          ? format(data.expected_start_date, 'yyyy-MM-dd')
          : null,
        nationality: data.nationality || null,
        hometown: data.hometown || null,
        marital_status: data.marital_status || null,
        notes: data.notes || null,
        ...(isHiredStage(data.stage) && data.employee_id?.trim()
          ? { employee_id: data.employee_id.trim() }
          : {}),
      };

      if (candidate) {
        await updateCandidatePool(candidate.id, companyId, candidatePayload);
        toast({
          title: t('common.success'),
          description: r('formUpdateSuccess'),
        });
      } else {
        await createCandidatePool(candidatePayload);
        toast({
          title: t('common.success'),
          description: r('formCreateSuccess'),
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error saving candidate:', error);
      toast({
        title: t('common.error'),
        description: toErrorMessage(error, r('formSaveError')),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {candidate ? r('formEditTitle') : r('formTitle')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">{r('formBasicInfo')}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formFullName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={r('formFullNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formEmail')} *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formPhone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={r('formPhonePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formPosition')}</FormLabel>
                        <FormControl>
                          <Input placeholder={r('formPositionPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Recruitment Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground">{r('formRecruitmentInfo')}</h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formSource')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={r('formSourcePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sourceOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
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
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formStage')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={r('formStagePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stageOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
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
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formRating')}</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isHiredStage(watchedStage) ? (
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hồ sơ nhân viên *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          disabled={employeesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  employeesLoading
                                    ? 'Đang tải hồ sơ…'
                                    : '— Chọn hồ sơ nhân viên cùng đơn vị —'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.employee_code} — {emp.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{HRM_REC_HIRE_400_VI}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="applied_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formAppliedDate')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: vi })
                                ) : (
                                  <span>{r('formSelectDate')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expected_start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formExpectedStart')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd/MM/yyyy', { locale: vi })
                                ) : (
                                  <span>{r('formSelectDate')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-sm text-muted-foreground">{r('formPersonalInfo')}</h3>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formNationality')}</FormLabel>
                        <FormControl>
                          <Input placeholder={r('formNationalityPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hometown"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formHometown')}</FormLabel>
                        <FormControl>
                          <Input placeholder={r('formHometownPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marital_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{r('formMaritalStatus')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={r('formMaritalPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {maritalStatusOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{r('formNotes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={r('formNotesPlaceholder')}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  {r('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {candidate ? r('formEditTitle') : r('formTitle')}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
