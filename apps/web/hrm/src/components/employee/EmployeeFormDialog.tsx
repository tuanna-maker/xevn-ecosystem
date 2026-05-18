import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Employee, EmployeeFormData } from '@/hooks/useEmployees';
import { EmployeeAvatarUpload } from './EmployeeAvatarUpload';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSettingsCatalogsOverview,
  type HrmSettingsCatalogOverviewRow,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';

const employeeFormSchema = z.object({
  employee_code: z.string().min(1),
  full_name: z.string().min(1),
  company_id: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  start_date: z.string().optional(),
  salary: z.coerce.number().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  id_number: z.string().optional(),
  id_issue_date: z.string().optional(),
  id_issue_place: z.string().optional(),
  permanent_address: z.string().optional(),
  temporary_address: z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  employment_type: z.string().optional(),
  work_location: z.string().optional(),
  bank_name: z.string().optional(),
  bank_account: z.string().optional(),
  tax_code: z.string().optional(),
  social_insurance_number: z.string().optional(),
  health_insurance_number: z.string().optional(),
});

type FormValues = z.infer<typeof employeeFormSchema>;
type DynamicCatalogField = {
  code: string;
  label: string;
  dataType: EmployeeMetadataDataType;
  options: string[];
};

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  departments: { id: string; name: string }[];
  companies?: { id: string; name: string }[];
  onSubmit: (data: EmployeeFormData & { company_id?: string }) => Promise<boolean>;
  isLoading?: boolean;
}

type EmployeeBasicFieldKey =
  | 'employee_code'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'department'
  | 'position'
  | 'start_date'
  | 'status';

type EmployeePersonalFieldKey =
  | 'gender'
  | 'birth_date'
  | 'id_number'
  | 'id_issue_place'
  | 'permanent_address'
  | 'temporary_address'
  | 'emergency_contact'
  | 'emergency_phone';

type EmployeeWorkFieldKey = 'employment_type' | 'work_location';

type EmployeeFinanceFieldKey =
  | 'salary'
  | 'tax_code'
  | 'bank_name'
  | 'bank_account'
  | 'social_insurance_number'
  | 'health_insurance_number';

const DEFAULT_BASIC_FIELDS: EmployeeBasicFieldKey[] = [
  'employee_code',
  'full_name',
  'email',
  'phone',
  'department',
  'position',
  'start_date',
  'status',
];

const DEFAULT_PERSONAL_FIELDS: EmployeePersonalFieldKey[] = [
  'gender',
  'birth_date',
  'id_number',
  'id_issue_place',
  'permanent_address',
  'temporary_address',
  'emergency_contact',
  'emergency_phone',
];

const DEFAULT_WORK_FIELDS: EmployeeWorkFieldKey[] = ['employment_type', 'work_location'];

const DEFAULT_FINANCE_FIELDS: EmployeeFinanceFieldKey[] = [
  'salary',
  'tax_code',
  'bank_name',
  'bank_account',
  'social_insurance_number',
  'health_insurance_number',
];

function resolveCatalogScope(currentCompanyId: string | null): HrmSpreadsheetScope | null {
  if (!currentCompanyId) return null;
  const tenantFromEnv = import.meta.env.VITE_HRM_SCOPE_TENANT_ID?.trim();
  return {
    tenantId: tenantFromEnv && tenantFromEnv.length > 0 ? tenantFromEnv : currentCompanyId,
    companyId: currentCompanyId,
  };
}

function findCatalog(catalogs: HrmSettingsCatalogOverviewRow[], keys: string[]) {
  return catalogs.find((c) => keys.includes(c.catalogKey.toLowerCase()));
}

const CATALOG_CODE_ALIASES: Record<string, string> = {
  national_id: 'id_number',
  phone_number: 'phone',
  birth_year: 'birth_date',
  emergency_contact_name: 'emergency_contact',
  emergency_contact_phone: 'emergency_phone',
  social_insurance_code: 'social_insurance_number',
  full_name: 'full_name',
};

function resolveCatalogFormFieldCode<T extends string>(code: string, defaults: readonly T[]): T | null {
  const resolved = (CATALOG_CODE_ALIASES[code] ?? code) as T;
  return defaults.includes(resolved) ? resolved : null;
}

function buildActiveFieldSet<T extends string>(
  catalog: HrmSettingsCatalogOverviewRow | undefined,
  defaults: readonly T[],
  required?: readonly T[],
) {
  const configured = new Set<T>();
  for (const item of catalog?.effectiveItems ?? []) {
    if (item.status !== 'active') continue;
    const mapped = resolveCatalogFormFieldCode(item.code, defaults);
    if (mapped) configured.add(mapped);
  }
  for (const req of required ?? []) configured.add(req);
  return configured.size > 0 ? configured : new Set(defaults);
}

function buildLabelMap<T extends string>(catalog: HrmSettingsCatalogOverviewRow | undefined, defaults: readonly T[]) {
  const map = new Map<T, string>();
  for (const item of catalog?.effectiveItems ?? []) {
    const mapped = resolveCatalogFormFieldCode(item.code, defaults);
    if (mapped) map.set(mapped, item.label);
  }
  return map;
}

function parseDynamicFieldMeta(unit: string | null): { dataType: EmployeeMetadataDataType; options: string[] } {
  const raw = (unit ?? '').trim().toLowerCase();
  if (!raw) return { dataType: 'text', options: [] };
  if (raw.startsWith('select:')) {
    const options = raw
      .slice('select:'.length)
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean);
    return { dataType: 'select', options };
  }
  const allowed: EmployeeMetadataDataType[] = ['text', 'number', 'date', 'select', 'phone', 'email'];
  if (allowed.includes(raw as EmployeeMetadataDataType)) {
    return { dataType: raw as EmployeeMetadataDataType, options: [] };
  }
  return { dataType: 'text', options: [] };
}

function buildDynamicFields<T extends string>(
  catalog: HrmSettingsCatalogOverviewRow | undefined,
  defaults: readonly T[],
): DynamicCatalogField[] {
  const knownCodes = new Set(defaults as readonly string[]);
  return (catalog?.effectiveItems ?? [])
    .filter((item) => {
      if (item.status !== 'active') return false;
      if (resolveCatalogFormFieldCode(item.code, defaults)) return false;
      return !knownCodes.has(item.code);
    })
    .map((item) => {
      const meta = parseDynamicFieldMeta(item.unit);
      return {
        code: item.code,
        label: item.label,
        dataType: meta.dataType,
        options: meta.options,
      };
    });
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  departments,
  companies,
  onSubmit,
  isLoading,
}: EmployeeFormDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const isEditing = !!employee;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(employee?.avatar_url || null);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
  const scope = useMemo(() => resolveCatalogScope(currentCompanyId), [currentCompanyId]);
  const catalogsQuery = useQuery({
    queryKey: ['employee-form-catalogs', scope?.tenantId, scope?.companyId],
    queryFn: () => getSettingsCatalogsOverview(scope!),
    enabled: open && !!scope,
    staleTime: 60_000,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employee_code: '',
      full_name: '',
      company_id: companies?.[0]?.id || '',
      email: '',
      phone: '',
      department: '',
      position: '',
      start_date: '',
      salary: undefined,
      status: 'active',
      gender: '',
      birth_date: '',
      id_number: '',
      id_issue_date: '',
      id_issue_place: '',
      permanent_address: '',
      temporary_address: '',
      emergency_contact: '',
      emergency_phone: '',
      employment_type: 'full-time',
      work_location: '',
      bank_name: '',
      bank_account: '',
      tax_code: '',
      social_insurance_number: '',
      health_insurance_number: '',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        company_id: employee.company_id || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        start_date: employee.start_date || '',
        salary: employee.salary || undefined,
        status: employee.status,
        gender: employee.gender || '',
        birth_date: employee.birth_date || '',
        id_number: employee.id_number || '',
        id_issue_date: employee.id_issue_date || '',
        id_issue_place: employee.id_issue_place || '',
        permanent_address: employee.permanent_address || '',
        temporary_address: employee.temporary_address || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        employment_type: employee.employment_type || 'full-time',
        work_location: employee.work_location || '',
        bank_name: employee.bank_name || '',
        bank_account: employee.bank_account || '',
        tax_code: employee.tax_code || '',
        social_insurance_number: employee.social_insurance_number || '',
        health_insurance_number: employee.health_insurance_number || '',
      });
      setAvatarUrl(employee.avatar_url || null);
      setDynamicFieldValues(employee.custom_fields ?? {});
    } else {
      form.reset({
        employee_code: '',
        full_name: '',
        company_id: companies?.[0]?.id || '',
        email: '',
        phone: '',
        department: '',
        position: '',
        start_date: '',
        salary: undefined,
        status: 'active',
        gender: '',
        birth_date: '',
        id_number: '',
        id_issue_date: '',
        id_issue_place: '',
        permanent_address: '',
        temporary_address: '',
        emergency_contact: '',
        emergency_phone: '',
        employment_type: 'full-time',
        work_location: '',
        bank_name: '',
        bank_account: '',
        tax_code: '',
        social_insurance_number: '',
        health_insurance_number: '',
      });
      setAvatarUrl(null);
      setDynamicFieldValues({});
    }
  }, [employee, form, companies]);

  const catalogs = catalogsQuery.data?.catalogs ?? [];
  const basicFieldsCatalog = findCatalog(catalogs, ['hrm_employee_basic_fields', 'employee_basic_fields']);
  const activeBasicFields = useMemo(
    () => buildActiveFieldSet<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, ['employee_code', 'full_name']),
    [basicFieldsCatalog],
  );
  const basicFieldLabels = useMemo(
    () => buildLabelMap<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS),
    [basicFieldsCatalog],
  );
  const hasBasicField = (field: EmployeeBasicFieldKey) => activeBasicFields.has(field);
  const basicLabel = (field: EmployeeBasicFieldKey, fallback: string) => basicFieldLabels.get(field) ?? fallback;
  const dynamicBasicFields = useMemo(
    () => buildDynamicFields<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS),
    [basicFieldsCatalog],
  );

  const personalFieldsCatalog = findCatalog(catalogs, ['hrm_employee_personal_fields', 'employee_personal_fields']);
  const activePersonalFields = useMemo(
    () => buildActiveFieldSet<EmployeePersonalFieldKey>(personalFieldsCatalog, DEFAULT_PERSONAL_FIELDS),
    [personalFieldsCatalog],
  );
  const personalFieldLabels = useMemo(
    () => buildLabelMap<EmployeePersonalFieldKey>(personalFieldsCatalog, DEFAULT_PERSONAL_FIELDS),
    [personalFieldsCatalog],
  );
  const hasPersonalField = (field: EmployeePersonalFieldKey) => activePersonalFields.has(field);
  const personalLabel = (field: EmployeePersonalFieldKey, fallback: string) => personalFieldLabels.get(field) ?? fallback;
  const dynamicPersonalFields = useMemo(
    () => buildDynamicFields<EmployeePersonalFieldKey>(personalFieldsCatalog, DEFAULT_PERSONAL_FIELDS),
    [personalFieldsCatalog],
  );

  const workFieldsCatalog = findCatalog(catalogs, ['hrm_employee_work_fields', 'employee_work_fields']);
  const activeWorkFields = useMemo(
    () => buildActiveFieldSet<EmployeeWorkFieldKey>(workFieldsCatalog, DEFAULT_WORK_FIELDS),
    [workFieldsCatalog],
  );
  const workFieldLabels = useMemo(
    () => buildLabelMap<EmployeeWorkFieldKey>(workFieldsCatalog, DEFAULT_WORK_FIELDS),
    [workFieldsCatalog],
  );
  const hasWorkField = (field: EmployeeWorkFieldKey) => activeWorkFields.has(field);
  const workLabel = (field: EmployeeWorkFieldKey, fallback: string) => workFieldLabels.get(field) ?? fallback;
  const dynamicWorkFields = useMemo(
    () => buildDynamicFields<EmployeeWorkFieldKey>(workFieldsCatalog, DEFAULT_WORK_FIELDS),
    [workFieldsCatalog],
  );

  const financeFieldsCatalog = findCatalog(catalogs, ['hrm_employee_finance_fields', 'employee_finance_fields']);
  const activeFinanceFields = useMemo(
    () => buildActiveFieldSet<EmployeeFinanceFieldKey>(financeFieldsCatalog, DEFAULT_FINANCE_FIELDS),
    [financeFieldsCatalog],
  );
  const financeFieldLabels = useMemo(
    () => buildLabelMap<EmployeeFinanceFieldKey>(financeFieldsCatalog, DEFAULT_FINANCE_FIELDS),
    [financeFieldsCatalog],
  );
  const hasFinanceField = (field: EmployeeFinanceFieldKey) => activeFinanceFields.has(field);
  const financeLabel = (field: EmployeeFinanceFieldKey, fallback: string) => financeFieldLabels.get(field) ?? fallback;
  const dynamicFinanceFields = useMemo(
    () => buildDynamicFields<EmployeeFinanceFieldKey>(financeFieldsCatalog, DEFAULT_FINANCE_FIELDS),
    [financeFieldsCatalog],
  );

  const hasAnyPersonalFields = activePersonalFields.size > 0;
  const hasAnyWorkFields = activeWorkFields.size > 0;
  const hasAnyFinanceFields = activeFinanceFields.size > 0;

  const departmentCatalog = findCatalog(catalogs, ['departments', 'department_catalog', 'org_departments']);
  const departmentOptions = useMemo(() => {
    const fromCatalog = (departmentCatalog?.effectiveItems ?? [])
      .filter((item) => item.status === 'active')
      .map((item) => item.label.trim())
      .filter((v) => v.length > 0);
    const fromProps = departments.map((d) => d.name);
    return [...new Set([...fromCatalog, ...fromProps])];
  }, [departmentCatalog, departments]);

  const positionCatalog = findCatalog(catalogs, ['job_titles', 'positions', 'employee_positions']);
  const positionOptions = useMemo(() => {
    return (positionCatalog?.effectiveItems ?? [])
      .filter((item) => item.status === 'active')
      .map((item) => item.label.trim())
      .filter((v) => v.length > 0);
  }, [positionCatalog]);

  const statusCatalog = findCatalog(catalogs, ['employee_statuses', 'employment_statuses']);
  const statusOptions = useMemo(() => {
    const options = (statusCatalog?.effectiveItems ?? [])
      .filter((item) => item.status === 'active')
      .map((item) => ({ value: item.code, label: item.label }));
    if (options.length > 0) return options;
    return [
      { value: 'active', label: t('employees.active') },
      { value: 'probation', label: t('employees.probation') },
      { value: 'inactive', label: t('employees.inactive') },
    ];
  }, [statusCatalog, t]);

  const handleSubmit = async (values: FormValues) => {
    const customFields = Object.fromEntries(
      Object.entries(dynamicFieldValues).filter(([, value]) => value != null && String(value).trim().length > 0),
    );
    const success = await onSubmit({
      employee_code: values.employee_code,
      full_name: values.full_name,
      status: values.status,
      avatar_url: avatarUrl,
      company_id: values.company_id || undefined,
      email: values.email || null,
      phone: values.phone || null,
      department: values.department || null,
      position: values.position || null,
      start_date: values.start_date || null,
      salary: values.salary || null,
      gender: values.gender || null,
      birth_date: values.birth_date || null,
      id_number: values.id_number || null,
      id_issue_date: values.id_issue_date || null,
      id_issue_place: values.id_issue_place || null,
      permanent_address: values.permanent_address || null,
      temporary_address: values.temporary_address || null,
      emergency_contact: values.emergency_contact || null,
      emergency_phone: values.emergency_phone || null,
      employment_type: values.employment_type || null,
      work_location: values.work_location || null,
      bank_name: values.bank_name || null,
      bank_account: values.bank_account || null,
      tax_code: values.tax_code || null,
      social_insurance_number: values.social_insurance_number || null,
      health_insurance_number: values.health_insurance_number || null,
      custom_fields: customFields,
    });
    
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('employeeForm.editEmployee') : t('employees.addEmployee')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full">
                <TabsTrigger value="basic">{t('employeeForm.basicInfo')}</TabsTrigger>
                {hasAnyPersonalFields && <TabsTrigger value="personal">{t('employeeForm.personal')}</TabsTrigger>}
                {hasAnyWorkFields && <TabsTrigger value="work">{t('employeeForm.work')}</TabsTrigger>}
                {hasAnyFinanceFields && <TabsTrigger value="finance">{t('employeeForm.finance')}</TabsTrigger>}
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                {/* Avatar Upload */}
                <div className="flex justify-center pb-4 border-b">
                  <EmployeeAvatarUpload
                    currentAvatarUrl={avatarUrl}
                    employeeCode={form.watch('employee_code') || 'new'}
                    fullName={form.watch('full_name') || t('employeeForm.employee')}
                    onAvatarChange={setAvatarUrl}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {companies && companies.length > 1 && (
                    <FormField
                      control={form.control}
                      name="company_id"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>{t('company.title')} *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('employeeForm.selectCompany')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {hasBasicField('employee_code') && (
                  <FormField
                    control={form.control}
                    name="employee_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('employee_code', t('employees.employeeCode'))} *</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: NV001" {...field} disabled={isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('full_name') && (
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('full_name', t('employees.fullName'))} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('email') && (
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('email', t('employees.email'))}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@company.vn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('phone') && (
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('phone', t('employees.phone'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="0901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('department') && (
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('department', t('employees.department'))}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('employeeForm.selectDepartment')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departmentOptions.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('position') && (
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('position', t('employees.position'))}</FormLabel>
                        {positionOptions.length > 0 ? (
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('employeeForm.positionPlaceholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positionOptions.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input placeholder={t('employeeForm.positionPlaceholder')} {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('start_date') && (
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('start_date', t('employees.startDate'))}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasBasicField('status') && (
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{basicLabel('status', t('common.status.label'))}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'active'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((opt) => (
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
                  )}
                </div>
                {dynamicBasicFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    {dynamicBasicFields.map((field) => {
                      const value = dynamicFieldValues[field.code] ?? '';
                      const setValue = (next: string) =>
                        setDynamicFieldValues((prev) => ({ ...prev, [field.code]: next }));
                      return (
                        <FormItem key={field.code}>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                            {field.dataType === 'select' ? (
                              <Select onValueChange={setValue} value={value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giá trị" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => (
                                    <SelectItem key={`${field.code}-${option}`} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={
                                  field.dataType === 'number'
                                    ? 'number'
                                    : field.dataType === 'date'
                                      ? 'date'
                                      : field.dataType === 'email'
                                        ? 'email'
                                        : field.dataType === 'phone'
                                          ? 'tel'
                                          : 'text'
                                }
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                              />
                            )}
                          </FormControl>
                        </FormItem>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {hasAnyPersonalFields && (
              <TabsContent value="personal" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {hasPersonalField('gender') && (
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{personalLabel('gender', t('employeeForm.gender'))}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('employeeForm.selectGender')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('employeeForm.male')}</SelectItem>
                            <SelectItem value="female">{t('employeeForm.female')}</SelectItem>
                            <SelectItem value="other">{t('employeeForm.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('birth_date') && (
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{personalLabel('birth_date', t('employeeForm.birthDate'))}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('id_number') && (
                  <FormField
                    control={form.control}
                    name="id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{personalLabel('id_number', t('employeeForm.idNumber'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="012345678901" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('id_issue_place') && (
                  <FormField
                    control={form.control}
                    name="id_issue_place"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{personalLabel('id_issue_place', t('employeeForm.idIssuePlace'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="Công an TP.HCM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('permanent_address') && (
                  <FormField
                    control={form.control}
                    name="permanent_address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{personalLabel('permanent_address', t('employeeForm.permanentAddress'))}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.fullAddressPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('temporary_address') && (
                  <FormField
                    control={form.control}
                    name="temporary_address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{personalLabel('temporary_address', t('employeeForm.temporaryAddress'))}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.temporaryAddress')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('emergency_contact') && (
                  <FormField
                    control={form.control}
                    name="emergency_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{personalLabel('emergency_contact', t('employeeForm.emergencyContact'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="Họ tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasPersonalField('emergency_phone') && (
                  <FormField
                    control={form.control}
                    name="emergency_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{personalLabel('emergency_phone', t('employeeForm.emergencyPhone'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="0901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                </div>
                {dynamicPersonalFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    {dynamicPersonalFields.map((field) => {
                      const value = dynamicFieldValues[field.code] ?? '';
                      const setValue = (next: string) =>
                        setDynamicFieldValues((prev) => ({ ...prev, [field.code]: next }));
                      return (
                        <FormItem key={field.code}>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                            <Input value={value} onChange={(e) => setValue(e.target.value)} />
                          </FormControl>
                        </FormItem>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              )}

              {hasAnyWorkFields && (
              <TabsContent value="work" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {hasWorkField('employment_type') && (
                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{workLabel('employment_type', t('employeeForm.employmentType'))}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('employeeForm.selectType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">{t('employeeForm.fullTime')}</SelectItem>
                            <SelectItem value="part-time">{t('employeeForm.partTime')}</SelectItem>
                            <SelectItem value="contract">{t('employeeForm.contract')}</SelectItem>
                            <SelectItem value="intern">{t('employeeForm.intern')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasWorkField('work_location') && (
                  <FormField
                    control={form.control}
                    name="work_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{workLabel('work_location', t('employeeForm.workLocation'))}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('employeeForm.mainOfficePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                </div>
                {dynamicWorkFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    {dynamicWorkFields.map((field) => {
                      const value = dynamicFieldValues[field.code] ?? '';
                      const setValue = (next: string) =>
                        setDynamicFieldValues((prev) => ({ ...prev, [field.code]: next }));
                      return (
                        <FormItem key={field.code}>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                            <Input value={value} onChange={(e) => setValue(e.target.value)} />
                          </FormControl>
                        </FormItem>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              )}

              {hasAnyFinanceFields && (
              <TabsContent value="finance" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {hasFinanceField('salary') && (
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('salary', t('employees.salary'))}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="20000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasFinanceField('tax_code') && (
                  <FormField
                    control={form.control}
                    name="tax_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('tax_code', t('employeeForm.taxCode'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasFinanceField('bank_name') && (
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('bank_name', t('employeeForm.bankName'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="Vietcombank" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasFinanceField('bank_account') && (
                  <FormField
                    control={form.control}
                    name="bank_account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('bank_account', t('employeeForm.bankAccount'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasFinanceField('social_insurance_number') && (
                  <FormField
                    control={form.control}
                    name="social_insurance_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('social_insurance_number', t('employeeForm.socialInsurance'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="Số bảo hiểm xã hội" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasFinanceField('health_insurance_number') && (
                  <FormField
                    control={form.control}
                    name="health_insurance_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('health_insurance_number', t('employeeForm.healthInsurance'))}</FormLabel>
                        <FormControl>
                          <Input placeholder="Số bảo hiểm y tế" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                </div>
                {dynamicFinanceFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 border-t pt-4">
                    {dynamicFinanceFields.map((field) => {
                      const value = dynamicFieldValues[field.code] ?? '';
                      const setValue = (next: string) =>
                        setDynamicFieldValues((prev) => ({ ...prev, [field.code]: next }));
                      return (
                        <FormItem key={field.code}>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                            {field.dataType === 'select' ? (
                              <Select onValueChange={setValue} value={value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn giá trị" />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options.map((option) => (
                                    <SelectItem key={`${field.code}-${option}`} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input value={value} onChange={(e) => setValue(e.target.value)} />
                            )}
                          </FormControl>
                        </FormItem>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('employeeForm.saving') : isEditing ? t('employeeForm.update') : t('employees.addEmployee')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
