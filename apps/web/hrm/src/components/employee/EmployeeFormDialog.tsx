/**
 * @CODE-MEMORY
 * Screen:     Employee create/edit dialog
 * UC:         UC-HRM-EMP-01
 * BR:         Dynamic fields from settings-catalogs
 * SRS:        docs/hrm/SRS.md §15.2 · FR-HRM-SC-MD-02 (phòng ban)
 * TechSpec:   cd-fb-03 perf audit FE-03 · Settings master-data AC-SET-FS-01..05
 * Purpose:    Employee form; catalogs via shared RQ settings-catalogs (enabled when open).
 * WorkItem:   CD-FB-04-PERF-FIX / P1-HRM-PERF-FE-03
 * Coded:      2026-07-19
 * must_keep:  Dialog-gated fetch; F3–F6 product ACs untouched; save khi chọn mã catalog hợp lệ
 * LastVerified: apps/web/hrm/src/lib/catalogSearchPicker.test.ts (departmentOptionsFromCatalog)
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-SETTINGS-MD-CRUD-FE-01
 * change_mode: ADD
 * What: CatalogSearchPicker dept/position (code SoT); cấm Input free-text position
 * Why: AC-HRM-PICKER-01 · BR-HRM-MD-01 · FR-HRM-SC-POS-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-SETTINGS-MD-DEPT-FE-01
 * change_mode: UPGRADE
 * What: Bỏ fallback departments prop name-as-code; chỉ effectiveItems departments|department_catalog|org_departments
 * Why: QA FAIL AC-SET-FS-01/03/05 · FR-HRM-SC-MD-02 — catalog trống = empty + CTA, không invent code từ nhãn
 * must_keep: Persist value=catalog code khi có item; position/các field NV khác không đổi
 * Impact: Prop departments gỡ khỏi dialog; list filter NV vẫn dùng departments state riêng
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01
 * change_mode: FIX
 * What: Guard mount — departmentOptionsFromCatalog(catalogs ?? []); findCatalog nullish-safe; cấm departments.map
 * Why: QA SoftDel SMOKE-03A-RET Dev8088 — TypeError departments.map khi prop thiếu → empty page chặn TC-025
 * must_keep: SoftDel ⋯→Xóa→AlertDialog→archive; row click→profile; open=false không throw
 * Impact: Employees list mounts với rows; SoftDel menu reachable
 * LastVerified: EmployeeFormDialog.mount-guard.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B
 * change_mode: FIX
 * What: Drop ViDateField import (file never shipped) — restore Input type=date for start/birth
 * Why: Vite Failed to resolve @/components/ui/ViDateField → Employees SoftDel still blocked on :8088
 * must_keep: SoftDel catalog guard; ViMoneyInput salary path (already on VPS 7c03091)
 */
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
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
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Employee, EmployeeFormData } from '@/hooks/useEmployees';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK,
  useEmpEmploymentStatusesEffective,
} from '@/hooks/useEmpEmploymentStatusesEffective';
import { resolveEmpEmploymentStatusEditValue } from '@/lib/empEmploymentStatusCatalog';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import {
  jobTitleOptionsFromCatalog,
} from '@/lib/catalogSearchPicker';
import {
  HRM_EMP_DEPT_EMPTY_CATALOG_CODE,
  isEmpDeptKeyInCatalog,
  resolveEmpDeptEditValue,
} from '@/lib/empDeptCatalog';
import {
  HRM_WH_PICK_EMPTY_CATALOG_CODE,
  isEmpPositionKeyInCatalog,
  resolveEmpPositionEditValue,
} from '@/lib/empPositionCatalog';
import {
  resolveEmployeeDepartmentKey,
} from '@/lib/employeePickerLabel';
import { HRM_LIST_DEFAULT_COMPANY_ID } from '@/lib/hrmListScope';
import { isGroupCeoDepartmentRollupContext } from '@/lib/hrmDepartmentCatalog';
import { listEffectivePayPositions } from '@/integrations/hrmApi';
import { resolveHrmSettingsCatalogScope } from '@/lib/hrmSpreadsheetScope';
import {
  CORE_CB_MAP_REDIRECT_BODY_VI,
  CORE_CB_MAP_REDIRECT_TITLE_VI,
} from '@/lib/empCorePublicRing';
import { EmployeeAvatarUpload } from './EmployeeAvatarUpload';
import { type HrmSettingsCatalogOverviewRow, type HrmSpreadsheetScope } from '@/integrations/hrmApi';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { toast } from 'sonner';

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
  companies?: { id: string; name: string }[];
  onSubmit: (data: EmployeeFormData & { company_id?: string }) => Promise<boolean>;
  isLoading?: boolean;
  /** Open HĐ tab → Đãi ngộ (compensation packages) — salary/bank/MST không lưu qua form công khai. */
  onOpenCompensationTab?: () => void;
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

/** Always mount spine fields even when hrm_employee_basic_fields catalog omits them. */
const REQUIRED_BASIC_FIELDS: EmployeeBasicFieldKey[] = [
  'employee_code',
  'full_name',
  'department',
  'position',
  'status',
];

function findCatalog(
  catalogs: HrmSettingsCatalogOverviewRow[] | null | undefined,
  keys: string[],
) {
  // Mount-safe: dialog stays mounted with open=false; never throw on undefined catalogs.
  return (catalogs ?? []).find((c) => keys.includes(c.catalogKey.toLowerCase()));
}

const CATALOG_CODE_ALIASES: Record<string, string> = {
  national_id: 'id_number',
  phone_number: 'phone',
  birth_year: 'birth_date',
  date_of_birth: 'birth_date',
  emergency_contact_name: 'emergency_contact',
  emergency_contact_phone: 'emergency_phone',
  social_insurance_code: 'social_insurance_number',
  full_name: 'full_name',
  employee_id: 'employee_code',
  basic_01: 'employee_code',
  basic_02: 'full_name',
  basic_03: 'department',
  basic_04: 'position',
  bo_phan: 'department',
  bo_phan_lam_viec: 'department',
  chuc_vu: 'position',
  employment_status: 'status',
  work_email: 'email',
  work_phone: 'phone',
  cccd: 'id_number',
  cmnd: 'id_number',
  soc_cccd: 'id_number',
  so_cccd: 'id_number',
  pers_01: 'birth_date',
  pers_02: 'gender',
  pers_03: 'id_number',
};

/** Nhãn đồng nghĩa spine field — lọc catalog XBOS trùng ý nghĩa khác chữ. */
const SPINE_FIELD_LABEL_SYNONYMS: Partial<Record<string, readonly string[]>> = {
  birth_date: ['Ngày sinh', 'Năm sinh'],
  id_number: [
    'CCCD',
    'CMND',
    'CCCD/CMND',
    'CMND/CCCD',
    'Số CCCD',
    'Số CMND',
    'Số CMND/CCCD',
    'Số CCCD/CMND',
    'Số CMND/TCC',
  ],
  gender: ['Giới tính'],
  emergency_contact: ['Người liên hệ', 'Liên hệ khẩn cấp'],
  emergency_phone: ['SĐT người liên hệ', 'Số điện thoại người liên hệ'],
  permanent_address: ['Địa chỉ thường trú'],
  temporary_address: ['Địa chỉ tạm trú', 'Địa chỉ hiện tại'],
};

function normalizeCatalogFieldCode(code: string): string {
  return code.trim().toLowerCase();
}

function resolveCatalogFormFieldCode<T extends string>(code: string, defaults: readonly T[]): T | null {
  const key = normalizeCatalogFieldCode(code);
  const resolved = (CATALOG_CODE_ALIASES[key] ?? key) as T;
  return defaults.includes(resolved) ? resolved : null;
}

/** Chuẩn hóa nhãn catalog để so khớp trùng field gốc (XBOS BASIC_01…). */
export function normalizeFieldLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();
}

function isSpineCatalogFieldCode(code: string): boolean {
  const key = normalizeCatalogFieldCode(code);
  return (
    resolveCatalogFormFieldCode(key, DEFAULT_BASIC_FIELDS) != null ||
    resolveCatalogFormFieldCode(key, DEFAULT_PERSONAL_FIELDS) != null ||
    resolveCatalogFormFieldCode(key, DEFAULT_WORK_FIELDS) != null ||
    resolveCatalogFormFieldCode(key, DEFAULT_FINANCE_FIELDS) != null
  );
}

/** Loại custom_fields trùng spine (department free-text từ catalog XBOS). */
export function filterSpineCustomFieldEntries(
  fields: Record<string, string> | null | undefined,
): Record<string, string> {
  if (!fields) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (isSpineCatalogFieldCode(key)) continue;
    out[key] = value;
  }
  return out;
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

export function buildDynamicFields<T extends string>(
  catalog: HrmSettingsCatalogOverviewRow | undefined,
  defaults: readonly T[],
  knownLabels?: readonly string[],
): DynamicCatalogField[] {
  const knownCodes = new Set(defaults.map((d) => normalizeCatalogFieldCode(d)));
  const knownLabelSet = new Set(
    (knownLabels ?? []).map((label) => normalizeFieldLabel(label)).filter(Boolean),
  );
  const seenDynamicLabels = new Set<string>();
  const out: DynamicCatalogField[] = [];

  for (const item of catalog?.effectiveItems ?? []) {
    if (item.status !== 'active') continue;
    if (resolveCatalogFormFieldCode(item.code, defaults)) continue;
    if (knownCodes.has(normalizeCatalogFieldCode(item.code))) continue;
    if (knownLabelSet.size > 0 && knownLabelSet.has(normalizeFieldLabel(item.label))) continue;

    const normLabel = normalizeFieldLabel(item.label);
    if (normLabel && seenDynamicLabels.has(normLabel)) continue;
    if (normLabel) seenDynamicLabels.add(normLabel);

    const meta = parseDynamicFieldMeta(item.unit);
    out.push({
      code: item.code,
      label: item.label,
      dataType: meta.dataType,
      options: meta.options,
    });
  }
  return out;
}

function collectSectionKnownLabelsForDedup<T extends string>(
  catalog: HrmSettingsCatalogOverviewRow | undefined,
  defaults: readonly T[],
  activeFields: ReadonlySet<T>,
  labelMap: ReadonlyMap<string, string>,
  fallbacks: Record<string, string>,
): string[] {
  const labels = new Set<string>();
  for (const field of activeFields) {
    const fromMap = labelMap.get(field);
    if (fromMap) labels.add(fromMap);
    const fb = fallbacks[field];
    if (fb) labels.add(fb);
    for (const syn of SPINE_FIELD_LABEL_SYNONYMS[field] ?? []) {
      labels.add(syn);
    }
  }
  for (const item of catalog?.effectiveItems ?? []) {
    if (item.status !== 'active') continue;
    const mapped = resolveCatalogFormFieldCode(item.code, defaults);
    if (mapped && activeFields.has(mapped)) {
      labels.add(item.label);
    }
  }
  return [...labels];
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  companies,
  onSubmit,
  isLoading,
  onOpenCompensationTab,
}: EmployeeFormDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const isEditing = !!employee;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(employee?.avatar_url || null);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});

  const catalogScope = useMemo((): HrmSpreadsheetScope | null => {
    const tenantFromEmployee =
      typeof employee?.custom_fields?.tenant_id === 'string'
        ? employee.custom_fields.tenant_id.trim()
        : '';
    if (tenantFromEmployee) {
      return {
        tenantId: tenantFromEmployee,
        companyId: HRM_LIST_DEFAULT_COMPANY_ID,
      };
    }
    return resolveHrmSettingsCatalogScope(currentCompanyId);
  }, [employee, currentCompanyId]);

  const {
    catalogs,
    departmentPickerOptions: departmentOptions,
    isLoading: catalogsLoading,
    isDepartmentLoading,
    isError: catalogsError,
    departmentFetchError,
  } = useSettingsCatalogsOverview({
    enabled: open,
    scope: catalogScope,
    departmentCompanyId: currentCompanyId,
  });
  const departmentCatalogBound = departmentOptions.length > 0;
  const positionRollupTenants = isGroupCeoDepartmentRollupContext();
  const {
    nestOptions: nestStatusOptions,
    effectiveCount: empStatusEffectiveCount,
    isLoading: statusCatalogLoading,
  } = useEmpEmploymentStatusesEffective({ enabled: open });
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
      status: '',
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

  const watchedDepartment = form.watch('department');

  const { data: effectivePositionsRes } = useQuery({
    queryKey: [
      'effective-pay-positions',
      currentCompanyId,
      watchedDepartment,
      positionRollupTenants,
    ],
    queryFn: () =>
      listEffectivePayPositions({
        company_id: currentCompanyId!,
        department_code: watchedDepartment?.trim() || undefined,
        rollup_tenants: positionRollupTenants,
      }),
    enabled: Boolean(open && currentCompanyId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!open) return;
    if (employee) {
      const deptKey = resolveEmployeeDepartmentKey({
        department: employee.department,
        custom_fields: employee.custom_fields,
      });
      form.reset({
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        company_id: employee.company_id || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: deptKey || '',
        position: employee.job_title_key?.trim() || '',
        start_date: employee.start_date || '',
        salary: employee.salary || undefined,
        status: employee.status || '',
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
      setDynamicFieldValues(filterSpineCustomFieldEntries(employee.custom_fields));
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
        status: '',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/id only; cấm deps `form` / object employee (input 1 ký tự)
  }, [open, employee?.id, companies?.[0]?.id]);

  useEffect(() => {
    if (!open || employee) return;
    if (!form.getValues('start_date')?.trim()) {
      form.setValue('start_date', new Date().toISOString().slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/create only; cấm deps `form`
  }, [open, employee?.id]);

  const basicFieldsCatalog = findCatalog(catalogs, ['hrm_employee_basic_fields', 'employee_basic_fields']);
  const activeBasicFields = useMemo(
    () =>
      buildActiveFieldSet<EmployeeBasicFieldKey>(
        basicFieldsCatalog,
        DEFAULT_BASIC_FIELDS,
        REQUIRED_BASIC_FIELDS,
      ),
    [basicFieldsCatalog],
  );
  const basicFieldLabels = useMemo(
    () => buildLabelMap<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS),
    [basicFieldsCatalog],
  );
  const hasBasicField = (field: EmployeeBasicFieldKey) => activeBasicFields.has(field);
  const basicLabel = (field: EmployeeBasicFieldKey, fallback: string) => basicFieldLabels.get(field) ?? fallback;
  const basicKnownLabels = useMemo(
    () =>
      collectSectionKnownLabelsForDedup(
        basicFieldsCatalog,
        DEFAULT_BASIC_FIELDS,
        activeBasicFields,
        basicFieldLabels,
        {
        employee_code: t('employees.employeeCode'),
        full_name: t('employees.fullName'),
        email: t('employees.email'),
        phone: t('employees.phone'),
        department: t('employees.department'),
        position: t('employees.position'),
        start_date: t('employees.startDate'),
        status: t('employees.status'),
      },
      ),
    [basicFieldsCatalog, activeBasicFields, basicFieldLabels, t],
  );
  const dynamicBasicFields = useMemo(
    () => buildDynamicFields<EmployeeBasicFieldKey>(basicFieldsCatalog, DEFAULT_BASIC_FIELDS, basicKnownLabels),
    [basicFieldsCatalog, basicKnownLabels],
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
  const personalKnownLabels = useMemo(
    () =>
      collectSectionKnownLabelsForDedup(
        personalFieldsCatalog,
        DEFAULT_PERSONAL_FIELDS,
        activePersonalFields,
        personalFieldLabels,
        {
        gender: t('employeeForm.gender'),
        birth_date: t('employeeForm.birthDate'),
        id_number: t('employeeForm.idNumber'),
        id_issue_place: t('employeeForm.idIssuePlace'),
        permanent_address: t('employeeForm.permanentAddress'),
        temporary_address: t('employeeForm.temporaryAddress'),
        emergency_contact: t('employeeForm.emergencyContact'),
        emergency_phone: t('employeeForm.emergencyPhone'),
      },
      ),
    [personalFieldsCatalog, activePersonalFields, personalFieldLabels, t],
  );
  const dynamicPersonalFields = useMemo(
    () =>
      buildDynamicFields<EmployeePersonalFieldKey>(
        personalFieldsCatalog,
        DEFAULT_PERSONAL_FIELDS,
        personalKnownLabels,
      ),
    [personalFieldsCatalog, personalKnownLabels],
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
  const workKnownLabels = useMemo(
    () =>
      collectSectionKnownLabelsForDedup(
        workFieldsCatalog,
        DEFAULT_WORK_FIELDS,
        activeWorkFields,
        workFieldLabels,
        {
        employment_type: t('employeeForm.employmentType'),
        work_location: t('employeeForm.workLocation'),
      },
      ),
    [workFieldsCatalog, activeWorkFields, workFieldLabels, t],
  );
  const dynamicWorkFields = useMemo(
    () => buildDynamicFields<EmployeeWorkFieldKey>(workFieldsCatalog, DEFAULT_WORK_FIELDS, workKnownLabels),
    [workFieldsCatalog, workKnownLabels],
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
  const hasFinanceCbFields = DEFAULT_FINANCE_FIELDS.some((field) => hasFinanceField(field));
  const hasEditableFinanceCbFields = false;
  const financeLabel = (field: EmployeeFinanceFieldKey, fallback: string) => financeFieldLabels.get(field) ?? fallback;
  const financeKnownLabels = useMemo(
    () =>
      collectSectionKnownLabelsForDedup(
        financeFieldsCatalog,
        DEFAULT_FINANCE_FIELDS,
        activeFinanceFields,
        financeFieldLabels,
        {
        salary: t('employeeForm.salary'),
        tax_code: t('employeeForm.taxCode'),
        bank_name: t('employeeForm.bankName'),
        bank_account: t('employeeForm.bankAccount'),
        social_insurance_number: t('employeeForm.socialInsurance'),
        health_insurance_number: t('employeeForm.healthInsurance'),
      },
      ),
    [financeFieldsCatalog, activeFinanceFields, financeFieldLabels, t],
  );
  const dynamicFinanceFields = useMemo(
    () =>
      buildDynamicFields<EmployeeFinanceFieldKey>(
        financeFieldsCatalog,
        DEFAULT_FINANCE_FIELDS,
        financeKnownLabels,
      ),
    [financeFieldsCatalog, financeKnownLabels],
  );

  const hasAnyPersonalFields = activePersonalFields.size > 0;
  const hasAnyWorkFields = activeWorkFields.size > 0;
  const hasAnyFinanceFields = activeFinanceFields.size > 0;

  useEffect(() => {
    if (!open || !employee) return;
    const stored = resolveEmployeeDepartmentKey({
      department: employee.department,
      custom_fields: employee.custom_fields,
    });
    if (!stored) return;
    const resolved = resolveEmpDeptEditValue(
      departmentOptions,
      stored,
      departmentCatalogBound,
    );
    if (resolved && form.getValues('department') !== resolved) {
      form.setValue('department', resolved);
    }
  }, [open, employee, departmentOptions, departmentCatalogBound, form]);

  const empStatusCatalogBound = empStatusEffectiveCount > 0;
  const statusOptions = useMemo(() => {
    if (empStatusCatalogBound) return nestStatusOptions;
    return EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK.map((o) => ({
      value: o.statusKey,
      label: t(o.i18nKey, { defaultValue: o.defaultNameVi }),
    }));
  }, [empStatusCatalogBound, nestStatusOptions, t]);

  useEffect(() => {
    if (!open || statusOptions.length === 0) return;
    const resolved = resolveEmpEmploymentStatusEditValue(
      statusOptions,
      employee?.status ?? form.getValues('status'),
      empStatusCatalogBound,
    );
    if (resolved && form.getValues('status') !== resolved) {
      form.setValue('status', resolved);
    }
  }, [open, employee, statusOptions, empStatusCatalogBound, form]);

  const catalogPositionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const positionOptions = useMemo(() => {
    const effective = effectivePositionsRes?.data ?? [];
    if (effective.length > 0) {
      return effective.map((p) => ({
        value: p.code,
        label: p.label,
        code: p.code,
      }));
    }
    return catalogPositionOptions;
  }, [effectivePositionsRes, catalogPositionOptions]);

  const positionCatalogBound = positionOptions.length > 0;

  useEffect(() => {
    if (!open) return;
    const storedKey = employee?.job_title_key?.trim() || '';
    const resolved = resolveEmpPositionEditValue(
      positionOptions,
      storedKey,
      positionCatalogBound,
    );
    if (form.getValues('position') !== resolved) {
      form.setValue('position', resolved);
    }
  }, [open, employee?.job_title_key, positionOptions, positionCatalogBound, form]);

  useEffect(() => {
    if (!open) return;
    const current = form.getValues('position')?.trim();
    if (
      current &&
      positionCatalogBound &&
      !positionOptions.some((p) => p.value === current)
    ) {
      form.setValue('position', '');
    }
  }, [watchedDepartment, positionOptions, positionCatalogBound, open, form]);

  const handleSubmit = async (values: FormValues) => {
    if (values.department?.trim() && departmentCatalogBound) {
      if (!isEmpDeptKeyInCatalog(departmentOptions, values.department)) {
        toast.error(
          'Phòng ban phải chọn mã từ danh mục phòng ban — không nhập tên hiển thị tự do.',
        );
        return;
      }
    }
    if (values.position?.trim() && positionCatalogBound) {
      if (!isEmpPositionKeyInCatalog(positionOptions, values.position)) {
        toast.error(
          'Chức danh phải chọn từ danh mục — không dùng tên hiển thị tự do.',
        );
        return;
      }
    }
    const customFields = Object.fromEntries(
      Object.entries(filterSpineCustomFieldEntries(dynamicFieldValues)).filter(
        ([, value]) => value != null && String(value).trim().length > 0,
      ),
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
      custom_fields: customFields,
    });
    
    if (success) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        data-testid={HDSD_MUTATE_TEST_IDS.employeeFormDialog}
      >
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
                          <Input
                            id="employee_code"
                            name={field.name}
                            placeholder="VD: NV001"
                            {...field}
                            disabled={isEditing}
                          />
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
                          <Input
                            id="full_name"
                            name={field.name}
                            placeholder="Nguyễn Văn A"
                            {...field}
                          />
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
                        <FormControl>
                          <CatalogSearchPicker
                            options={departmentOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={t('employeeForm.selectDepartment')}
                            loading={catalogsLoading || isDepartmentLoading}
                            errorText={
                              catalogsError || departmentFetchError
                                ? t('settings.catalogs.loadError')
                                : undefined
                            }
                            emptyHint={
                              departmentOptions.length === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  {HRM_EMP_DEPT_EMPTY_CATALOG_CODE} —{' '}
                                  <a
                                    href="/settings"
                                    className="text-primary underline font-medium"
                                  >
                                    Mở Cài đặt → Danh mục nghiệp vụ
                                  </a>
                                </span>
                              ) : (
                                <a
                                  href="/settings"
                                  className="text-primary underline text-xs font-medium"
                                >
                                  Mở Cài đặt → Danh mục nghiệp vụ
                                </a>
                              )
                            }
                          />
                        </FormControl>
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
                        <FormControl>
                          <CatalogSearchPicker
                            options={positionOptions}
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder={t('employeeForm.positionPlaceholder')}
                            loading={catalogsLoading}
                            errorText={
                              catalogsError ? t('settings.catalogs.loadError') : undefined
                            }
                            emptyHint={
                              positionOptions.length === 0 ? (
                                <span className="text-xs text-muted-foreground">
                                  {HRM_WH_PICK_EMPTY_CATALOG_CODE} —{' '}
                                  <a
                                    href="/settings"
                                    className="text-primary underline font-medium"
                                  >
                                    Mở Cài đặt → Danh mục nghiệp vụ
                                  </a>
                                </span>
                              ) : (
                                <a
                                  href="/settings"
                                  className="text-primary underline text-xs font-medium"
                                >
                                  Mở Cài đặt → Danh mục nghiệp vụ
                                </a>
                              )
                            }
                          />
                        </FormControl>
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || statusOptions[0]?.value || ''}
                          disabled={statusCatalogLoading && statusOptions.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="emp-employment-status-select">
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
                {hasFinanceCbFields && (
                  <div
                    className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950"
                    data-testid="emp-form-cb-map-redirect"
                  >
                    <p className="font-medium">{CORE_CB_MAP_REDIRECT_TITLE_VI}</p>
                    <p className="mt-1 text-amber-900/90">{CORE_CB_MAP_REDIRECT_BODY_VI}</p>
                    {onOpenCompensationTab ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          onOpenChange(false);
                          onOpenCompensationTab();
                        }}
                        data-testid="emp-form-cb-map-open-compensation"
                      >
                        Mở Hợp đồng → Đãi ngộ
                      </Button>
                    ) : null}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {hasEditableFinanceCbFields && hasFinanceField('salary') && (
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{financeLabel('salary', t('employees.salary'))}</FormLabel>
                        <FormControl>
                          <ViMoneyInput
                            value={Number(field.value) || 0}
                            onValueChange={(n) =>
                              field.onChange(n === 0 ? undefined : n)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            placeholder="20.000.000"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  {hasEditableFinanceCbFields && hasFinanceField('tax_code') && (
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
                  {hasEditableFinanceCbFields && hasFinanceField('bank_name') && (
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
                  {hasEditableFinanceCbFields && hasFinanceField('bank_account') && (
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
                  {hasEditableFinanceCbFields && hasFinanceField('social_insurance_number') && (
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
                  {hasEditableFinanceCbFields && hasFinanceField('health_insurance_number') && (
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
              <Button
                type="submit"
                disabled={isLoading}
                data-testid={HDSD_MUTATE_TEST_IDS.employeeFormSubmit}
                aria-label={isEditing ? t('employeeForm.update') : 'Lưu'}
              >
                {isLoading ? t('employeeForm.saving') : isEditing ? t('employeeForm.update') : t('employees.addEmployee')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
