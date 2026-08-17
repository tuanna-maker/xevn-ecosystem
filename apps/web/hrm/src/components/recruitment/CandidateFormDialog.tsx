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
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-FE-01
 * change_mode: ADD
 * What: YCTD SELECT required on create; position read-only derived from YCTD; empty CTA;
 *       no free-text position SoT; context defaultRequisitionId; surface REQUIRED/STATUS/MISMATCH;
 *       flat POST requisition_id + optional position_key (OS 28 — no nested invent)
 * Why: SRS FR-UC-BP-REC-05a #1–#6 · AC-REC-UV-01..04 · F-REC-UV-YCTD-01..03
 * SRS: docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 FR-UC-BP-REC-05a
 * TechSpec: docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §2
 * API: docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md CONFIRMED
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * change_mode: ADD
 * What: Stage SELECT binds F-REC-CAT-EFF; hire gate via hiredOutcomeKey (AC-PLT-REC-05)
 * Why: Settings open catalog #7+ → picker; must_keep YCTD + hire soft-link
 * must_keep: YCTD SELECT · hire employee_id · SoftDel · U65 · no recruitment_uat_ready
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-CHANNELS-CONSUMER-FE-01
 * change_mode: ADD
 * What: source field binds recruitment_channels catalog when EFF>0; honest empty CTA when EFF=0
 * Why: AC-SET-CONSUMER-CH-REC-01 · BR-REC-CH-SOT-01..02
 * must_keep: YCTD SELECT · stage EFF · hire gate · U65
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
import {
  createCandidatePool,
  listJobRequisitions,
  updateCandidatePool,
  type HrmJobRequisition,
} from '@/integrations/hrmApi';
import { useEmployees } from '@/hooks/useEmployees';
import { toErrorMessage } from '@/lib/apiError';
import { HRM_REC_HIRE_400_VI, isHiredStage } from '@/lib/recruitmentHireLink';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { recruitmentChannelOptionsFromCatalog } from '@/lib/catalogSearchPicker';
import {
  candidateSourcePickerOptions,
  REC_CHANNEL_EMPTY_HINT_VI,
  REC_CHANNEL_OPEN_SETTINGS_CTA_VI,
} from '@/lib/candidateRecruitmentChannelUi';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import {
  buildCandidateCreateWithYctdPayload,
  deriveUvPositionFromYctd,
  filterReceivableRequisitions,
  formatYctdOptionLabel,
  isUvCreateSubmitBlocked,
  normalizeRequisitionId,
  UV_YCTD_EMPTY_HINT_VI,
  UV_YCTD_NONE_SENTINEL,
  UV_YCTD_OPEN_CTA_VI,
  UV_YCTD_REQUIRED_VI,
  type UvYctdPickerRow,
} from '@/lib/candidateUvYctdUi';

type CandidateFormValues = z.infer<ReturnType<typeof createCandidateSchema>>;

const createCandidateSchema = (
  r: (key: string) => string,
  isCreate: boolean,
  hiredOutcomeKey?: string | null,
) =>
  z
    .object({
      full_name: z.string().min(1, r('formValName')).max(100, r('formValNameMax')),
      email: z.string().email(r('formValEmail')),
      phone: z.string().optional(),
      /** Soft FK YCTD — required on create (BR-BP-CV-03). */
      requisition_id: z.string().optional(),
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
      if (isCreate && !normalizeRequisitionId(data.requisition_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: UV_YCTD_REQUIRED_VI,
          path: ['requisition_id'],
        });
      }
      if (isHiredStage(data.stage, hiredOutcomeKey) && !data.employee_id?.trim()) {
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
  position_key?: string | null;
  position_name?: string | null;
  requisition_id?: string | null;
  recruitment_request_id?: string | null;
  yctd_title?: string | null;
  yctd_code?: string | null;
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
  /** AC-REC-UV-04 — prefill from YCTD context / ?requisition_id= */
  defaultRequisitionId?: string | null;
  /** Empty CTA — navigate to YCTD tab (parent owns routing). */
  onOpenYctdTab?: () => void;
}

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

function toPickerRow(row: HrmJobRequisition): UvYctdPickerRow {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    jd_code: row.jd_code,
    jd_title: row.jd_title,
    code: row.code,
    position_key: row.position_key,
    position_name: row.position_name,
    recruitment_request_id: row.recruitment_request_id,
  };
}

export function CandidateFormDialog({
  open,
  onOpenChange,
  candidate,
  companyId,
  onSuccess,
  defaultRequisitionId = null,
  onOpenYctdTab,
}: CandidateFormDialogProps) {
  const { t } = useTranslation();
  const r = (key: string) => t(`rc.${key}`);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivableYctds, setReceivableYctds] = useState<UvYctdPickerRow[]>([]);
  const [yctdLoading, setYctdLoading] = useState(false);
  const [yctdFetchError, setYctdFetchError] = useState<string | null>(null);
  const { employees, isLoading: employeesLoading } = useEmployees(false, undefined, { enabled: open });
  const { catalogs } = useSettingsCatalogsOverview({ enabled: open });

  const isCreate = !candidate;
  const channelCatalogOptions = useMemo(
    () => recruitmentChannelOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const channelCatalogCount = channelCatalogOptions.length;
  const sourceOptions = useMemo(
    () => candidateSourcePickerOptions(channelCatalogOptions, channelCatalogCount, r),
    [channelCatalogOptions, channelCatalogCount, r],
  );
  const showEmptyChannelCatalog = channelCatalogCount === 0;
  const starterStageOptions = getStageOptions(r);
  const {
    stageOptions: catalogStageOptions,
    hiredOutcomeKey,
    catalogCount,
  } = useRecPipelineStagesEffective({ enabled: open });
  const stageOptions = useMemo(() => {
    if (catalogCount > 0) {
      return catalogStageOptions.map((o) => ({ value: o.value, label: o.label }));
    }
    return starterStageOptions;
  }, [catalogCount, catalogStageOptions, starterStageOptions]);
  const candidateSchema = useMemo(
    () => createCandidateSchema(r, isCreate, hiredOutcomeKey),
    [r, isCreate, hiredOutcomeKey],
  );
  const maritalStatusOptions = getMaritalStatusOptions(r);

  const contextRequisitionId = normalizeRequisitionId(defaultRequisitionId);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      requisition_id: contextRequisitionId || UV_YCTD_NONE_SENTINEL,
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
  const watchedRequisitionId = form.watch('requisition_id');

  const loadReceivableYctds = useCallback(async () => {
    if (!companyId) {
      setReceivableYctds([]);
      return;
    }
    setYctdLoading(true);
    setYctdFetchError(null);
    try {
      const response = await listJobRequisitions({
        company_id: companyId,
        page: 1,
        page_size: HRM_API_MAX_PAGE_SIZE,
        receivable: true,
      });
      const rows = filterReceivableRequisitions(response.data ?? []).map(toPickerRow);
      setReceivableYctds(rows);
    } catch (error: unknown) {
      console.error('Error loading receivable YCTD:', error);
      setReceivableYctds([]);
      setYctdFetchError(toErrorMessage(error, 'Không thể tải danh sách YCTD nhận hồ sơ'));
    } finally {
      setYctdLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (open) {
      void loadReceivableYctds();
    }
  }, [open, loadReceivableYctds]);

  useEffect(() => {
    if (candidate) {
      const existingYctd =
        normalizeRequisitionId(candidate.requisition_id) ||
        normalizeRequisitionId(candidate.recruitment_request_id);
      form.reset({
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone || '',
        requisition_id: existingYctd || UV_YCTD_NONE_SENTINEL,
        source: candidate.source || '',
        stage: candidate.stage || 'applied',
        employee_id: candidate.employee_id || '',
        rating: candidate.rating || 0,
        applied_date: candidate.applied_date ? new Date(candidate.applied_date) : null,
        expected_start_date: candidate.expected_start_date
          ? new Date(candidate.expected_start_date)
          : null,
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
        requisition_id: contextRequisitionId || UV_YCTD_NONE_SENTINEL,
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
  }, [candidate, form, open, contextRequisitionId]);

  const selectedYctd = useMemo(() => {
    const id = normalizeRequisitionId(watchedRequisitionId);
    if (!id) return null;
    return receivableYctds.find((row) => row.id === id) ?? null;
  }, [receivableYctds, watchedRequisitionId]);

  const derivedPosition = useMemo(() => {
    if (selectedYctd) return deriveUvPositionFromYctd(selectedYctd);
    if (candidate && !isCreate) {
      const key = (candidate.position_key ?? '').trim();
      const name =
        (candidate.position_name ?? '').trim() ||
        (candidate.position ?? '').trim() ||
        '—';
      const reqId =
        normalizeRequisitionId(candidate.requisition_id) ||
        normalizeRequisitionId(candidate.recruitment_request_id);
      if (reqId) {
        return {
          recruitment_request_id: reqId,
          position_key: key,
          position_name: name,
          source: 'yctd' as const,
        };
      }
    }
    return null;
  }, [selectedYctd, candidate, isCreate]);

  const submitBlocked = isUvCreateSubmitBlocked({
    isCreate,
    requisitionId: watchedRequisitionId,
    receivableCount: receivableYctds.length,
  });

  const onSubmit = async (data: CandidateFormValues) => {
    setIsSubmitting(true);
    try {
      if (candidate) {
        const updatePayload = {
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
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
          ...(isHiredStage(data.stage, hiredOutcomeKey) && data.employee_id?.trim()
            ? { employee_id: data.employee_id.trim() }
            : {}),
        };
        await updateCandidatePool(candidate.id, companyId, updatePayload);
        toast({
          title: t('common.success'),
          description: r('formUpdateSuccess'),
        });
      } else {
        const createBody = buildCandidateCreateWithYctdPayload({
          company_id: companyId,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
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
          requisition_id: data.requisition_id || '',
          position_key: derivedPosition?.position_key || null,
          ...(isHiredStage(data.stage, hiredOutcomeKey) && data.employee_id?.trim()
            ? { employee_id: data.employee_id.trim() }
            : {}),
        });
        await createCandidatePool(createBody);
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

  const showEmptyYctd = isCreate && !yctdLoading && receivableYctds.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh]"
        data-testid={HDSD_MUTATE_TEST_IDS.candidateFormDialog}
      >
        <DialogHeader>
          <DialogTitle>
            {candidate ? r('formEditTitle') : r('formTitle')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* YCTD + derived position — FR-UC-BP-REC-05a #1–#4 */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Yêu cầu tuyển dụng (YCTD)
                </h3>

                {yctdFetchError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {yctdFetchError}
                  </p>
                ) : null}

                {showEmptyYctd ? (
                  <div
                    className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3"
                    data-testid={HDSD_MUTATE_TEST_IDS.candidateFormEmptyYctd}
                  >
                    <p className="text-sm text-muted-foreground">{UV_YCTD_EMPTY_HINT_VI}</p>
                    {onOpenYctdTab ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-testid={HDSD_MUTATE_TEST_IDS.candidateFormOpenYctdCta}
                        onClick={() => {
                          onOpenChange(false);
                          onOpenYctdTab();
                        }}
                      >
                        {UV_YCTD_OPEN_CTA_VI}
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="requisition_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            YCTD {isCreate ? '*' : ''}
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={
                              normalizeRequisitionId(field.value)
                                ? field.value
                                : UV_YCTD_NONE_SENTINEL
                            }
                            disabled={yctdLoading || (!isCreate && hasLinkedYctd(candidate))}
                          >
                            <FormControl>
                              <SelectTrigger data-testid={HDSD_MUTATE_TEST_IDS.candidateFormYctd}>
                                <SelectValue
                                  placeholder={
                                    yctdLoading
                                      ? 'Đang tải YCTD…'
                                      : '— Chọn yêu cầu tuyển dụng —'
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={UV_YCTD_NONE_SENTINEL}>
                                — Chọn yêu cầu tuyển dụng —
                              </SelectItem>
                              {receivableYctds.map((row) => (
                                <SelectItem key={row.id} value={row.id}>
                                  {formatYctdOptionLabel(row)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Vị trí (từ YCTD)</FormLabel>
                      <Input
                        readOnly
                        tabIndex={-1}
                        value={derivedPosition?.position_name ?? ''}
                        placeholder="Chọn YCTD để hiện vị trí"
                        data-testid={HDSD_MUTATE_TEST_IDS.candidateFormPosition}
                        data-position-key={derivedPosition?.position_key ?? ''}
                        data-position-source={derivedPosition?.source ?? ''}
                        className="bg-muted/40"
                      />
                      <p className="text-xs text-muted-foreground">
                        Vị trí lấy từ YCTD — không nhập chữ tự do làm nguồn sự thật.
                      </p>
                    </FormItem>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="space-y-4 pt-4 border-t">
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
                        {showEmptyChannelCatalog ? (
                          <div
                            className="rounded-md border border-dashed border-border bg-muted/30 p-3 space-y-2 mb-2"
                            data-testid="hdsd-candidate-form-empty-channel-catalog"
                          >
                            <p className="text-xs text-muted-foreground">{REC_CHANNEL_EMPTY_HINT_VI}</p>
                            <Button type="button" variant="outline" size="sm" asChild>
                              <Link to="/settings">{REC_CHANNEL_OPEN_SETTINGS_CTA_VI}</Link>
                            </Button>
                          </div>
                        ) : null}
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="hdsd-candidate-form-source">
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

                {isHiredStage(watchedStage, hiredOutcomeKey) ? (
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
                <Button
                  type="submit"
                  disabled={isSubmitting || submitBlocked}
                  data-testid={HDSD_MUTATE_TEST_IDS.candidateFormSubmit}
                >
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

function hasLinkedYctd(candidate: Candidate | null | undefined): boolean {
  if (!candidate) return false;
  return Boolean(
    normalizeRequisitionId(candidate.requisition_id) ||
      normalizeRequisitionId(candidate.recruitment_request_id),
  );
}
