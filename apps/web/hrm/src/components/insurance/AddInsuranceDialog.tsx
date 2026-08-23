/**
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E3-01
 * change_mode: ADD
 * What: Zod require employee_id; insurers + insurance_types CatalogSearchPicker; Network codes
 * Why: AC-INS-02/03/04 · AC-E3-ZOD-I-01 — cấm free-text insurer SoT khi catalog >0
 * must_keep: employee typeahead; participant PATCH path; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-BF-03-BH-FE-PICKER-01
 * change_mode: ADD
 * What: Active policy picker + CTA «Tạo chính sách BH»; payload policy_id; block Lưu khi 0 active
 * Why: QA TC-049 HRM-INS-POL-404 khi UAT 0 policy — soft-resolve must_keep; FE explicit policy_id
 * must_keep: BE soft-resolve · insurance GET · SoftDel · TC-041 · U65 no seed · cấm orphan NULL
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * change_mode: FIX
 * What: insurance_type picker binds Nest F-SI-CAT-EFF; empty CTA Settings Loại BH
 * Why: AC-PLT-SI-INS-01 · VAL-SI-CNS-04 — REJECT MD sole type SoT; insurers MD retain
 * must_keep: policy_id soft-resolve · SoftDel · U65 · printable/personnel false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * change_mode: FIX
 * What: insurer_key picker binds Nest F-SI-CAT-INS-EFF; empty CTA Settings Nhà BH
 * Why: AC-PLT-SI-INSURER-01 · VAL-SI-INR-CNS-01/02 — REJECT MD sole insurer SoT; SI type L1 RETAIN
 * must_keep: type EFF picker · policy_id soft-resolve · SoftDel · U65 · printable/personnel false
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  createInsurancePolicyParticipant,
  listInsurancePolicies,
  updateInsurancePolicyParticipant,
} from '@/integrations/hrmApi';
import {
  ACT_HRM_INS_LINK_CAPABILITY,
  buildInsuranceParticipantApiPayload,
  formatInsurancePolicyPickerLabel,
  INSURANCE_POLICY_MASTER_ANCHOR_ID,
  isInsuranceParticipantPolicyAmbig,
  isInsuranceParticipantPolicyBlocked,
  resolveInsuranceParticipantMutateTarget,
  resolveInsurancePolicyPickerOptions,
  type InsuranceParticipantFormPayload,
} from '@/lib/insuranceParticipantLink';
import {
  useDebouncedPickerKeyword,
  useEmployeePickerSearch,
} from '@/hooks/useEmployeePicker';
import { useSiInsuranceTypesEffective } from '@/hooks/useSiInsuranceTypesEffective';
import { useSiInsurersEffective } from '@/hooks/useSiInsurersEffective';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
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
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';

interface Insurance {
  id: string;
  participant_id?: string;
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
  unemployment_insurance_number: string | null;
  social_insurance_rate: number | null;
  health_insurance_rate: number | null;
  unemployment_insurance_rate: number | null;
  base_salary: number | null;
  effective_date: string | null;
  expiry_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  company_id: string;
}

interface AddInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInsurance?: Insurance | null;
}

export function AddInsuranceDialog({ open, onOpenChange, editingInsurance }: AddInsuranceDialogProps) {
  const { t, i18n } = useTranslation();
  const d = (key: string) => String(t(`insurance.dialog.${key}`));
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!editingInsurance;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [employeeKeyword, setEmployeeKeyword] = useState('');
  const debouncedEmployeeKeyword = useDebouncedPickerKeyword(employeeKeyword, 300);

  const getCalendarLocale = () => {
    switch (i18n.language) {
      case 'vi': return vi;
      case 'zh': return zhCN;
      default: return enUS;
    }
  };

  const {
    insurerOptions,
    isLoading: insurersLoading,
  } = useSiInsurersEffective({ enabled: open });
  const {
    insuranceTypeOptions: typeOptions,
    isLoading: typesLoading,
  } = useSiInsuranceTypesEffective({ enabled: open });
  const siInsurerSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurers');
  const siTypeSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurance-types');

  const policiesQuery = useQuery({
    queryKey: ['insurance-policies', currentCompanyId, 'picker'],
    queryFn: () => listInsurancePolicies({ company_id: currentCompanyId! }),
    enabled: Boolean(currentCompanyId) && open,
  });
  const policyRows = policiesQuery.data?.data ?? [];

  const formSchema = useMemo(
    () =>
      z
        .object({
          employee_id: z.string().optional(),
          employee_code: z.string().min(1, d('codeRequired')).max(50),
          employee_name: z.string().min(1, d('nameRequired')).max(100),
          department: z.string().max(100).optional(),
          policy_id: z.string().optional().or(z.literal('')),
          insurer_key: z.string().optional().or(z.literal('')),
          insurance_type: z.string().optional().or(z.literal('')),
          social_insurance_number: z.string().max(20).optional(),
          health_insurance_number: z.string().max(20).optional(),
          unemployment_insurance_number: z.string().max(20).optional(),
          social_insurance_rate: z.coerce.number().min(0).max(100).optional(),
          health_insurance_rate: z.coerce.number().min(0).max(100).optional(),
          unemployment_insurance_rate: z.coerce.number().min(0).max(100).optional(),
          base_salary: z.coerce.number().min(0).optional(),
          effective_date: z.date().optional(),
          expiry_date: z.date().optional(),
          status: z.string().default('active'),
          notes: z.string().max(500).optional(),
        })
        .superRefine((val, ctx) => {
          const insurers = insurerOptions.map((o) => o.value);
          const insurer = val.insurer_key?.trim() ?? '';
          if (insurers.length > 0 && !insurer) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Chọn nhà bảo hiểm từ danh mục',
              path: ['insurer_key'],
            });
          } else if (insurers.length > 0 && insurer && !insurers.includes(insurer)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Nhà BH không thuộc danh mục',
              path: ['insurer_key'],
            });
          }
          const types = typeOptions.map((o) => o.value);
          const type = val.insurance_type?.trim() ?? '';
          if (types.length > 0 && !type) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Chọn loại bảo hiểm từ danh mục',
              path: ['insurance_type'],
            });
          } else if (types.length > 0 && type && !types.includes(type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Loại BH không thuộc danh mục',
              path: ['insurance_type'],
            });
          }
          // Create: require explicit policy_id when active policies exist (AMBIG / single)
          if (!isEditing) {
            const options = resolveInsurancePolicyPickerOptions(policyRows, insurer);
            if (options.length > 0 && !val.policy_id?.trim()) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  options.length > 1
                    ? 'Chọn chính sách BH (nhiều chính sách đang hiệu lực)'
                    : 'Chọn chính sách BH',
                path: ['policy_id'],
              });
            }
          }
        }),
    // i18n `d` for field labels; catalog + policies for refine
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, insurerOptions, typeOptions, policyRows, isEditing],
  );

  type FormData = z.infer<typeof formSchema>;

  // P1-HRM-SCALE-FE-W2: keyword typeahead — never listAllEmployees dump
  const {
    employees,
    total: employeeTotal,
    isCapped: employeesCapped,
    isFetching: employeesFetching,
  } = useEmployeePickerSearch({
    companyId: currentCompanyId,
    keyword: debouncedEmployeeKeyword,
    enabled: Boolean(currentCompanyId) && open && !isEditing,
  });
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: '',
      employee_code: '',
      employee_name: '',
      department: '',
      policy_id: '',
      insurer_key: '',
      insurance_type: '',
      social_insurance_number: '',
      health_insurance_number: '',
      unemployment_insurance_number: '',
      social_insurance_rate: 8,
      health_insurance_rate: 1.5,
      unemployment_insurance_rate: 1,
      base_salary: 0,
      status: 'active',
      notes: '',
    },
  });

  const watchedInsurerKey = form.watch('insurer_key');
  const policyPickerOptions = useMemo(
    () => resolveInsurancePolicyPickerOptions(policyRows, watchedInsurerKey),
    [policyRows, watchedInsurerKey],
  );
  const policyBlocked = !isEditing && isInsuranceParticipantPolicyBlocked(policyPickerOptions);
  const policyAmbig = !isEditing && isInsuranceParticipantPolicyAmbig(policyPickerOptions);

  useEffect(() => {
    if (open) {
      setSelectedEmployeeId(editingInsurance?.employee_id);
      setEmployeeKeyword('');
      if (editingInsurance) {
        form.reset({
          employee_id: editingInsurance.employee_id || '',
          employee_code: editingInsurance.employee_code,
          employee_name: editingInsurance.employee_name,
          department: editingInsurance.department || '',
          policy_id: '',
          insurer_key: '',
          insurance_type: '',
          social_insurance_number: editingInsurance.social_insurance_number || '',
          health_insurance_number: editingInsurance.health_insurance_number || '',
          unemployment_insurance_number: editingInsurance.unemployment_insurance_number || '',
          social_insurance_rate: editingInsurance.social_insurance_rate || 8,
          health_insurance_rate: editingInsurance.health_insurance_rate || 1.5,
          unemployment_insurance_rate: editingInsurance.unemployment_insurance_rate || 1,
          base_salary: editingInsurance.base_salary || 0,
          effective_date: editingInsurance.effective_date ? new Date(editingInsurance.effective_date) : undefined,
          expiry_date: editingInsurance.expiry_date ? new Date(editingInsurance.expiry_date) : undefined,
          status: editingInsurance.status,
          notes: editingInsurance.notes || '',
        });
      } else {
        setSelectedEmployeeId(undefined);
        form.reset({
          employee_id: '',
          employee_code: '',
          employee_name: '',
          department: '',
          policy_id: '',
          insurer_key: '',
          insurance_type: '',
          social_insurance_number: '',
          health_insurance_number: '',
          unemployment_insurance_number: '',
          social_insurance_rate: 8,
          health_insurance_rate: 1.5,
          unemployment_insurance_rate: 1,
          base_salary: 0,
          status: 'active',
          notes: '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/id only; cấm deps `form` (notes Textarea 1 ký tự)
  }, [open, editingInsurance?.id]);

  // Auto-select when exactly 1 active policy in picker scope
  useEffect(() => {
    if (!open || isEditing) return;
    if (policyPickerOptions.length === 1) {
      const onlyId = policyPickerOptions[0]!.id;
      if (form.getValues('policy_id') !== onlyId) {
        form.setValue('policy_id', onlyId, { shouldValidate: true });
      }
      return;
    }
    const current = form.getValues('policy_id')?.trim() ?? '';
    if (current && !policyPickerOptions.some((p) => p.id === current)) {
      form.setValue('policy_id', '', { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- policy list only; cấm deps `form`
  }, [open, isEditing, policyPickerOptions]);

  const invalidateInsuranceQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['insurance'] });
    queryClient.invalidateQueries({ queryKey: ['insurance-policy-participants'] });
    queryClient.invalidateQueries({ queryKey: ['insurance-policies'] });
  };

  const goCreatePolicy = () => {
    onOpenChange(false);
    // Defer scroll until dialog unmounts
    window.setTimeout(() => {
      const el = document.getElementById(INSURANCE_POLICY_MASTER_ANCHOR_ID);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el?.querySelector<HTMLInputElement>('input')?.focus();
    }, 120);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!currentCompanyId) throw new Error('No company selected');

      const payload = buildInsuranceParticipantApiPayload(currentCompanyId, {
        employee_id: selectedEmployeeId ?? data.employee_id ?? editingInsurance?.employee_id,
        employee_code: data.employee_code,
        employee_name: data.employee_name,
        department: data.department,
        policy_id: data.policy_id,
        insurer_key: data.insurer_key,
        insurance_type: data.insurance_type,
        social_insurance_number: data.social_insurance_number,
        health_insurance_number: data.health_insurance_number,
        unemployment_insurance_number: data.unemployment_insurance_number,
        social_insurance_rate: data.social_insurance_rate,
        health_insurance_rate: data.health_insurance_rate,
        unemployment_insurance_rate: data.unemployment_insurance_rate,
        base_salary: data.base_salary ?? 0,
        effective_date: data.effective_date?.toISOString().slice(0, 10),
        expiry_date: data.expiry_date?.toISOString().slice(0, 10),
        status: data.status as InsuranceParticipantFormPayload['status'],
        notes: data.notes,
      });

      const target = resolveInsuranceParticipantMutateTarget(editingInsurance, new Map());
      if (target.mode === 'update' && target.participantId) {
        return updateInsurancePolicyParticipant(target.participantId, currentCompanyId, payload);
      }
      return createInsurancePolicyParticipant(payload);
    },
    onSuccess: () => {
      invalidateInsuranceQueries();
      toast.success(isEditing ? d('updateSuccess') : d('addSuccess'));
      form.reset();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error(
        `${isEditing ? d('updateError') : d('addError')}: ${toErrorMessage(error)}`,
      );
    },
  });

  const onSubmit = (data: FormData) => {
    const empId = selectedEmployeeId ?? data.employee_id ?? editingInsurance?.employee_id;
    if (!isEditing && !empId?.trim()) {
      form.setError('employee_id', { message: d('selectEmployee') });
      toast.error(d('selectEmployee'));
      return;
    }
    if (!isEditing && policyBlocked) {
      form.setError('policy_id', {
        message: 'Chưa có chính sách BH đang hiệu lực — tạo và kích hoạt trước khi ghi danh',
      });
      toast.error('Chưa có chính sách BH đang hiệu lực. Tạo chính sách BH trước.');
      return;
    }
    if (!isEditing && !data.policy_id?.trim() && policyPickerOptions.length > 0) {
      form.setError('policy_id', {
        message: policyAmbig
          ? 'Chọn chính sách BH (nhiều chính sách đang hiệu lực)'
          : 'Chọn chính sách BH',
      });
      toast.error('Chọn chính sách bảo hiểm trước khi Lưu');
      return;
    }
    saveMutation.mutate({ ...data, employee_id: empId });
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    form.setValue('employee_id', employeeId);
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      form.setValue('employee_code', employee.employee_code);
      form.setValue('employee_name', employee.full_name);
      form.setValue('department', String(employee.custom_fields?.department ?? employee.job_title_key ?? ''));
    }
  };

  const isPending = saveMutation.isPending;

  const baseSalary = form.watch('base_salary') || 0;
  const bhxhRate = form.watch('social_insurance_rate') || 0;
  const bhytRate = form.watch('health_insurance_rate') || 0;
  const bhtnRate = form.watch('unemployment_insurance_rate') || 0;

  const bhxhAmount = (baseSalary * bhxhRate) / 100;
  const bhytAmount = (baseSalary * bhytRate) / 100;
  const bhtnAmount = (baseSalary * bhtnRate) / 100;
  const totalAmount = bhxhAmount + bhytAmount + bhtnAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : i18n.language, {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calLocale = getCalendarLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? d('editTitle') : d('addTitle')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employee Selection — keyword typeahead (capped page; no listAllEmployees) */}
            {!isEditing && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{d('selectEmployee')}</label>
                <Input
                  value={employeeKeyword}
                  onChange={(e) => setEmployeeKeyword(e.target.value)}
                  placeholder={d('selectEmployeePlaceholder')}
                  aria-label={d('selectEmployee')}
                />
                {employeesCapped && (
                  <p className="text-xs text-muted-foreground">
                    Hiển thị {employees.length}/{employeeTotal} — gõ tên hoặc mã NV để tìm thêm
                  </p>
                )}
                <Select
                  value={selectedEmployeeId}
                  onValueChange={handleEmployeeSelect}
                  disabled={employeesFetching && employees.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        employeesFetching
                          ? 'Đang tải…'
                          : d('selectEmployeePlaceholder')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesFetching && employees.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải…
                      </div>
                    ) : employees.length === 0 ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        Không tìm thấy nhân viên
                      </div>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.employee_code}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employee_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('employeeCode')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={d('employeeCodePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('employeeName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={d('employeeNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d('department')}</FormLabel>
                  <FormControl>
                    <Input placeholder={d('departmentPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* E3 — insurer + type catalog codes */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurer_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà bảo hiểm</FormLabel>
                    <CatalogSearchPicker
                      options={insurerOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      loading={insurersLoading}
                      placeholder="Chọn nhà BH…"
                      emptyHint={
                        <a
                          href={siInsurerSettingsCta}
                          className="text-primary underline text-xs font-medium"
                          data-testid="hdsd-participant-open-si-insurers"
                        >
                          Mở Cài đặt → Nhà BH / Insurers (tạo mã mới)
                        </a>
                      }
                      aria-label="Nhà bảo hiểm"
                      data-testid="hdsd-participant-insurer-picker"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="insurance_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại bảo hiểm</FormLabel>
                    <CatalogSearchPicker
                      options={typeOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      loading={typesLoading}
                      placeholder="Chọn loại BH…"
                      emptyHint={
                        <a
                          href={siTypeSettingsCta}
                          className="text-primary underline text-xs font-medium"
                          data-testid="hdsd-participant-open-si-insurance-types"
                        >
                          Mở Cài đặt → Loại BH / SI type (tạo mã mới)
                        </a>
                      }
                      aria-label="Loại bảo hiểm"
                      data-testid="hdsd-participant-insurance-type-picker"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* D-HDSD-BF-03-BH-FE-PICKER-01 — policy_id picker / CTA when 0 active */}
            {!isEditing ? (
              <FormField
                control={form.control}
                name="policy_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chính sách bảo hiểm *</FormLabel>
                    {policiesQuery.isFetching && policyPickerOptions.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải chính sách…
                      </div>
                    ) : policyBlocked ? (
                      <div
                        className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 space-y-2"
                        data-testid="ins-participant-policy-empty"
                      >
                        <p className="text-sm text-amber-900 dark:text-amber-100">
                          Chưa có chính sách BH đang hiệu lực trong phạm vi. Tạo chính sách rồi
                          chuyển trạng thái sang Hiệu lực trước khi ghi danh nhân viên.
                        </p>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={goCreatePolicy}
                          data-testid="ins-create-policy-cta"
                        >
                          Tạo chính sách BH
                        </Button>
                      </div>
                    ) : (
                      <>
                        {policyAmbig ? (
                          <p className="text-xs text-muted-foreground">
                            Có nhiều chính sách đang hiệu lực — chọn rõ chính sách để ghi danh.
                          </p>
                        ) : null}
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                          disabled={policiesQuery.isFetching && policyPickerOptions.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="ins-participant-policy-picker">
                              <SelectValue placeholder="Chọn chính sách BH…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {policyPickerOptions.map((pol) => (
                              <SelectItem key={pol.id} value={pol.id}>
                                {formatInsurancePolicyPickerLabel(pol)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            {/* Insurance Numbers */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">{d('insuranceNumbers')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="social_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('socialNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={d('socialNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('healthNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={d('healthNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unemployment_insurance_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('unemploymentNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder={d('unemploymentNumberPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Insurance Rates */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">{d('contributionRates')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="social_insurance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('socialRate')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="health_insurance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('healthRate')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unemployment_insurance_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{d('unemploymentRate')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Salary and Dates */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="base_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{d('baseSalary')}</FormLabel>
                    <FormControl>
                      <ViMoneyInput
                        value={Number(field.value) || 0}
                        onValueChange={(n) => field.onChange(n === 0 ? undefined : n)}
                        onBlur={field.onBlur}
                        name={field.name}
                        placeholder="VNĐ"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="effective_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{d('effectiveDate')}</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : d('selectDate')}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={calLocale}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{d('expiryDate')}</FormLabel>
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
                            {field.value ? format(field.value, 'dd/MM/yyyy') : d('selectDate')}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={calLocale}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Insurance Amount Preview */}
            {baseSalary > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h4 className="font-medium mb-3">{d('estimatedAmount')}</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400">{d('socialInsurance')}</p>
                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">{formatCurrency(bhxhAmount)}</p>
                  </div>
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded text-center">
                    <p className="text-xs text-rose-600 dark:text-rose-400">{d('healthInsurance')}</p>
                    <p className="font-semibold text-rose-700 dark:text-rose-300 text-sm">{formatCurrency(bhytAmount)}</p>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-center">
                    <p className="text-xs text-amber-600 dark:text-amber-400">{d('unemploymentInsurance')}</p>
                    <p className="font-semibold  hidden  dark:text-amber-300 text-sm">{formatCurrency(bhtnAmount)}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-center">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{d('totalAmount')}</p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d('status')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={d('statusPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{d('statusActive')}</SelectItem>
                      <SelectItem value="pending">{d('statusPending')}</SelectItem>
                      <SelectItem value="expired">{d('statusExpired')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{d('notes')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={d('notesPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {d('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || policyBlocked}
                data-capability={ACT_HRM_INS_LINK_CAPABILITY}
                data-testid="ins-participant-save"
              >
                {isPending ? d('saving') : isEditing ? d('update') : d('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
