import { useMemo, useState, useEffect, type Dispatch, type SetStateAction, Fragment } from 'react';
import { ArrowLeft, Copy, Eye, Plus, Save, Trash2, CalendarIcon, ChevronUp, ChevronDown, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDepartments } from '@/hooks/useDepartments';
import { fetchEmployeePickerPage, useEmployeePickerSearch } from '@/hooks/useEmployeePicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { jobTitleOptionsFromCatalog } from '@/lib/catalogSearchPicker';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useQuery } from '@tanstack/react-query';
import {
  getSettingsCatalogsOverview,
  listJobDescriptionTemplates,
  listScopedCompanies,
  type HrmSettingsCatalogOverviewRow,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';
import { amountStringToNumber, ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { loadCompanyDepartments } from '@/lib/hrmDepartmentCatalog';
import { HRM_LIST_DEFAULT_COMPANY_ID } from '@/lib/hrmListScope';

function findCatalog(
  catalogs: HrmSettingsCatalogOverviewRow[] | null | undefined,
  keys: string[],
) {
  return (catalogs ?? []).find((c) => keys.includes(c.catalogKey.toLowerCase()));
}

type WorkflowType = {
  id: string;
  code: string;
  name: string;
  description: string;
};

type WorkflowPosition = {
  id: string;
  positionName: string;
  quantity: string;
  department: string;
  level: string;
  responsiblePersonId: string;
  approverRole: string;
  jdTemplateId?: string;
  employmentType?: string;
  deadlineDate?: string;
  /** Định biên (within_budget) hoặc Ngoại biên (out_of_budget) */
  staffingType?: string;
  /** Lương tối thiểu (VNĐ) */
  salaryMin?: string;
  /** Lương tối đa (VNĐ) */
  salaryMax?: string;
};

type WorkflowField = {
  id: string;
  label: string;
  value: string;
  required: boolean;
};

type WorkflowStep = {
  id: string;
  name: string;
  ownerPersonId: string;
  condition: string;
  requiredInfo: string;
  slaHours: string;
  actionType?: string;
  allowReject?: boolean;
};

type WorkflowConfig = {
  id: string;
  code: string;
  name: string;
  typeId: string;
  status: 'draft' | 'active';
  appliesTo: string[];
  positions: WorkflowPosition[];
  fields: WorkflowField[];
  steps: WorkflowStep[];
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type WorkflowDraft = Omit<WorkflowConfig, 'id'> & { id?: string };
type WorkflowEmployeeOption = {
  id: string;
  full_name: string;
  job_title?: string;
  job_title_key?: string;
  department_id?: string;
  department_code?: string;
  department_name?: string;
};

type WorkflowDepartmentOption = {
  id: string;
  name: string;
  code?: string | null;
};

type WorkflowCompanyOption = {
  id: string;
  name: string;
  tenantId?: string | null;
  companyId?: string | null;
};

const STORAGE_KEY = 'hrm.workflow-configs.v3';

const DEFAULT_TYPES: WorkflowType[] = [
  {
    id: 'type-recruitment',
    code: 'REC',
    name: 'Tuyển dụng',
    description: 'Dành cho yêu cầu tuyển dụng, vị trí, số lượng, ứng viên, phỏng vấn và nhận việc.',
  },
  {
    id: 'type-employee',
    code: 'EMP',
    name: 'Nhân sự',
    description: 'Dành cho hồ sơ nhân viên, điều chuyển, bổ nhiệm, quyết định và xác nhận thông tin.',
  },
  {
    id: 'type-contract',
    code: 'CTR',
    name: 'Hợp đồng',
    description: 'Dành cho tạo, rà soát, ký, gia hạn và chấm dứt hợp đồng lao động.',
  },
  {
    id: 'type-payroll',
    code: 'PAY',
    name: 'Lương & chính sách',
    description: 'Dành cho duyệt bảng lương, gói chính sách, thu nhập và phúc lợi.',
  },
];

const APPLY_TARGETS = [
  { id: 'recruitment', label: 'Tuyển dụng' },
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'employees', label: 'Hồ sơ nhân sự' },
  { id: 'contracts', label: 'Hợp đồng' },
  { id: 'decisions', label: 'Quyết định' },
  { id: 'payroll', label: 'Lương' },
  { id: 'insurance', label: 'Bảo hiểm' },
];

const DEPARTMENT_OPTIONS = ['Kinh doanh', 'Nhân sự', 'Tài chính', 'Vận hành', 'Công nghệ', 'Ban Tổng giám đốc'];
const POSITION_OPTIONS = [
  'Nhân viên kinh doanh',
  'Chuyên viên tuyển dụng',
  'Trưởng phòng kinh doanh',
  'Trưởng phòng nhân sự',
  'Giám đốc tài chính',
  'Tổng giám đốc',
];
const PEOPLE_OPTIONS = [
  { id: 'emp-hr-rec', name: 'Nguyễn Thu Hà', title: 'Chuyên viên tuyển dụng' },
  { id: 'emp-hrm', name: 'Trần Minh An', title: 'Trưởng phòng nhân sự' },
  { id: 'emp-sales-head', name: 'Lê Quốc Bình', title: 'Trưởng phòng kinh doanh' },
  { id: 'emp-cfo', name: 'Phạm Hoàng Nam', title: 'Giám đốc tài chính' },
  { id: 'emp-ceo', name: 'Đỗ Khánh Linh', title: 'Tổng giám đốc' },
];

const FIELD_TEMPLATES: Record<string, Array<Omit<WorkflowField, 'id' | 'value'>>> = {
  REC: [
    { label: 'Lý do tuyển dụng', required: true },
    { label: 'Ngân sách dự kiến', required: true },
    { label: 'Ngày cần nhận việc', required: true },
    { label: 'Nguồn ứng viên ưu tiên', required: false },
  ],
  EMP: [
    { label: 'Nhân viên áp dụng', required: true },
    { label: 'Loại thay đổi nhân sự', required: true },
    { label: 'Ngày hiệu lực', required: true },
  ],
  CTR: [
    { label: 'Loại hợp đồng', required: true },
    { label: 'Ngày bắt đầu', required: true },
    { label: 'Ngày kết thúc', required: false },
  ],
  PAY: [
    { label: 'Kỳ lương áp dụng', required: true },
    { label: 'Nhóm lương', required: true },
    { label: 'Điều kiện áp dụng chính sách', required: false },
  ],
};

const STEP_TEMPLATES: Record<string, WorkflowStep[]> = {
  REC: [
    {
      id: 'step-rec-1',
      name: 'Tạo yêu cầu tuyển dụng',
      ownerPersonId: 'emp-sales-head',
      condition: 'Có vị trí, số lượng và ngày cần nhận việc.',
      requiredInfo: 'Vị trí tuyển, số lượng, phòng ban, ngân sách.',
      slaHours: '24',
    },
    {
      id: 'step-rec-2',
      name: 'Duyệt nhu cầu tuyển',
      ownerPersonId: 'emp-hrm',
      condition: 'Thông tin tuyển dụng hợp lệ và còn ngân sách.',
      requiredInfo: 'Người duyệt, ghi chú duyệt, mức ưu tiên.',
      slaHours: '48',
    },
    {
      id: 'step-rec-3',
      name: 'Phỏng vấn và chốt offer',
      ownerPersonId: 'emp-hr-rec',
      condition: 'Ứng viên đạt yêu cầu phỏng vấn.',
      requiredInfo: 'Kết quả phỏng vấn, mức lương đề xuất, ngày onboard.',
      slaHours: '72',
    },
  ],
  EMP: [
    {
      id: 'step-emp-1',
      name: 'Gửi yêu cầu thay đổi',
      ownerPersonId: 'emp-hrm',
      condition: 'Có hồ sơ nhân viên và lý do thay đổi.',
      requiredInfo: 'Nhân viên, loại thay đổi, ngày hiệu lực.',
      slaHours: '24',
    },
  ],
  CTR: [
    {
      id: 'step-ctr-1',
      name: 'Soạn hợp đồng',
      ownerPersonId: 'emp-hrm',
      condition: 'Có nhân viên, loại hợp đồng và mẫu hợp đồng.',
      requiredInfo: 'Loại hợp đồng, ngày bắt đầu, lương, phụ lục nếu có.',
      slaHours: '24',
    },
  ],
  PAY: [
    {
      id: 'step-pay-1',
      name: 'Kiểm tra chính sách',
      ownerPersonId: 'emp-cfo',
      condition: 'Kỳ lương và nhóm lương đã được chọn.',
      requiredInfo: 'Kỳ lương, nhóm lương, điều kiện áp dụng.',
      slaHours: '24',
    },
  ],
};

const DEFAULT_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'workflow-recruitment-standard',
    code: 'REC_STD',
    name: 'Tuyển dụng tiêu chuẩn',
    typeId: 'type-recruitment',
    status: 'active',
    appliesTo: ['recruitment', 'onboarding'],
    positions: [
      {
        id: 'pos-1',
        positionName: 'Nhân viên kinh doanh',
        quantity: '3',
        department: 'Kinh doanh',
        level: 'Nhân viên',
        responsiblePersonId: 'emp-hr-rec',
        approverRole: 'Trưởng phòng phụ trách',
      },
    ],
    fields: buildFields('REC'),
    steps: STEP_TEMPLATES.REC,
  },
];

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 32);
}

function buildFields(typeCode: string): WorkflowField[] {
  return (FIELD_TEMPLATES[typeCode] ?? []).map((field) => ({
    id: createId('field'),
    label: field.label,
    value: '',
    required: field.required,
  }));
}

function cloneSteps(typeCode: string): WorkflowStep[] {
  return (STEP_TEMPLATES[typeCode] ?? [emptyStep()]).map((step) => ({ ...step, id: createId('step') }));
}

function emptyStep(): WorkflowStep {
  return {
    id: createId('step'),
    name: '',
    ownerPersonId: '',
    condition: '',
    requiredInfo: '',
    slaHours: '24',
  };
}

function resolveApproverRole(level: string) {
  if (level === 'Tổng giám đốc') return 'Chủ tịch / Hội đồng quản trị';
  if (level === 'Giám đốc') return 'Tổng giám đốc';
  if (level === 'Trưởng phòng') return 'Giám đốc khối / Tổng giám đốc';
  return 'Trưởng phòng phụ trách';
}

/**
 * Từ approverRole → từ khóa để lọc nhân viên phù hợp làm người chịu trách nhiệm.
 * VD: cấp "Trưởng phòng" → approverRole = "Giám đốc / TGĐ" → lọc theo giám đốc + tổng giám đốc.
 */
function approverTitleKeywords(approverRole: string): string[] {
  const r = approverRole.toLowerCase();
  if (r.includes('chủ tịch') || r.includes('hội đồng')) return ['chủ tịch', 'hdqt', 'hội đồng'];
  if (r.includes('tổng giám đốc')) return ['tổng giám đốc', 'ceo', 'tgđ'];
  if (r.includes('giám đốc khối') || (r.includes('giám đốc') && r.includes('tổng'))) return ['giám đốc', 'cfo', 'coo', 'cto', 'tổng giám đốc'];
  // Default: trưởng phòng phụ trách
  return ['trưởng phòng', 'trưởng nhóm', 'manager', 'lead'];
}

function filterEmployeesByApproverRole(
  employees: Array<{ id: string; full_name: string; job_title?: string }>,
  approverRole: string,
): Array<{ id: string; full_name: string; job_title?: string }> {
  if (!approverRole) return employees;
  const keywords = approverTitleKeywords(approverRole);
  const matched = employees.filter((e) =>
    e.job_title && keywords.some((kw) => e.job_title!.toLowerCase().includes(kw)),
  );
  // Fallback: nếu không khớp ai thì trả toàn bộ để admin vẫn chọn được
  return matched.length > 0 ? matched : employees;
}

function emptyPosition(): WorkflowPosition {
  return {
    id: createId('pos'),
    positionName: '',
    quantity: '1',
    department: 'ALL_COMPANY',
    level: 'ALL_LEVEL',
    responsiblePersonId: '',
    approverRole: '',
    jdTemplateId: '',
    employmentType: 'full-time',
    deadlineDate: '',
    staffingType: 'within_budget',
    salaryMin: '',
    salaryMax: '',
  };
}

function emptyCustomField(): WorkflowField {
  return {
    id: createId('field'),
    label: '',
    value: '',
    required: false,
  };
}

function typeCodeOf(types: WorkflowType[], typeId: string) {
  return types.find((type) => type.id === typeId)?.code ?? '';
}

function emptyDraft(types: WorkflowType[], typeId = types[0]?.id ?? ''): WorkflowDraft {
  const code = typeCodeOf(types, typeId);
  return {
    code: '',
    name: '',
    typeId,
    status: 'draft',
    companyId: 'ALL_COMPANY',
    appliesTo: code === 'REC' ? ['recruitment'] : [],
    positions: code === 'REC' ? [emptyPosition()] : [],
    fields: buildFields(code),
    steps: cloneSteps(code),
  };
}

function readStoredState(): { types: WorkflowType[]; workflows: WorkflowConfig[] } {
  if (typeof window === 'undefined') return { types: DEFAULT_TYPES, workflows: DEFAULT_WORKFLOWS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { types: DEFAULT_TYPES, workflows: DEFAULT_WORKFLOWS };
    const parsed = JSON.parse(raw) as Partial<{ types: WorkflowType[]; workflows: WorkflowConfig[] }>;
    return {
      types: parsed.types?.length ? parsed.types : DEFAULT_TYPES,
      workflows: parsed.workflows?.length ? parsed.workflows : DEFAULT_WORKFLOWS,
    };
  } catch {
    return { types: DEFAULT_TYPES, workflows: DEFAULT_WORKFLOWS };
  }
}

function persistState(types: WorkflowType[], workflows: WorkflowConfig[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ types, workflows }));
}

function personLabel(personId: string) {
  return personId || 'Chưa chọn';
}

function normalizeWorkflowLookup(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function isAllDepartmentScope(value: string | undefined): boolean {
  return !value || ['all', 'holding', 'all_company'].includes(normalizeWorkflowLookup(value));
}

function departmentLookupTokens(
  departmentValue: string | undefined,
  departments: readonly WorkflowDepartmentOption[],
): Set<string> | null {
  if (isAllDepartmentScope(departmentValue)) return null;
  const selected = normalizeWorkflowLookup(departmentValue);
  if (!selected) return null;
  const tokens = new Set<string>([selected]);
  const selectedDepartment = departments.find((department) =>
    [department.id, department.code, department.name].some(
      (value) => normalizeWorkflowLookup(value) === selected,
    ),
  );
  if (selectedDepartment) {
    [selectedDepartment.id, selectedDepartment.code, selectedDepartment.name].forEach((value) => {
      const token = normalizeWorkflowLookup(value);
      if (token) tokens.add(token);
    });
  }
  return tokens;
}

function employeeMatchesDepartment(
  employee: WorkflowEmployeeOption,
  departmentValue: string | undefined,
  departments: readonly WorkflowDepartmentOption[],
): boolean {
  const tokens = departmentLookupTokens(departmentValue, departments);
  if (!tokens) return true;
  return [employee.department_id, employee.department_code, employee.department_name].some((value) => {
    const token = normalizeWorkflowLookup(value);
    return Boolean(token && tokens.has(token));
  });
}

function mergeWorkflowPickerOptionsPreferDisplay(
  groups: ReadonlyArray<ReadonlyArray<{ value: string; label: string }>>,
): Array<{ value: string; label: string }> {
  const merged = new Map<string, { value: string; label: string }>();
  for (const group of groups) {
    for (const option of group) {
      const value = option.value.trim();
      const label = option.label.trim();
      if (!value || !label) continue;
      const existing = merged.get(value);
      if (!existing || normalizeWorkflowLookup(existing.label) === normalizeWorkflowLookup(existing.value)) {
        merged.set(value, { value, label });
      }
    }
  }
  return Array.from(merged.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'vi', { sensitivity: 'base' }),
  );
}

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Toàn thời gian' },
  { value: 'part-time', label: 'Bán thời gian' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'intern', label: 'Thực tập' },
  { value: 'freelance', label: 'Freelance' },
];

const STAFFING_TYPES = [
  { value: 'within_budget', label: 'Định biên' },
  { value: 'out_of_budget', label: 'Ngoại biên' },
];

export function WorkflowConfigSettingsPanel() {
  const initial = useMemo(() => readStoredState(), []);
  const [workflowTypes, setWorkflowTypes] = useState<WorkflowType[]>(initial.types);
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>(initial.workflows);
  
  const [customActions, setCustomActions] = useState<{ id: string; name: string }[]>(() => {
    const saved = localStorage.getItem('hrm_workflow_custom_actions');
    return saved ? JSON.parse(saved) : [
      { id: 'phe_duyet', name: 'Phê duyệt' },
      { id: 'ky_duyet', name: 'Ký duyệt' },
      { id: 'nhap_lieu', name: 'Nhập liệu' }
    ];
  });
  
  const saveCustomActions = (newActions: { id: string; name: string }[]) => {
    setCustomActions(newActions);
    localStorage.setItem('hrm_workflow_custom_actions', JSON.stringify(newActions));
  };

  const [newActionId, setNewActionId] = useState('');
  const [newActionName, setNewActionName] = useState('');
  const addAction = () => {
    if (!newActionId || !newActionName) return;
    saveCustomActions([...customActions, { id: newActionId, name: newActionName }]);
    setNewActionId('');
    setNewActionName('');
  };

  const handleDeleteAction = (actionId: string, actionName: string) => {
    const usingWorkflow = workflows.find(
      (w) => w.status === 'active' && w.steps.some((step) => step.actionType === actionId)
    );

    if (usingWorkflow) {
      toast({
        title: 'Không thể xóa hành động',
        description: `Hành động "${actionName}" đang được sử dụng trong quy trình đang áp dụng: "${usingWorkflow.name}". Vui lòng ngừng quy trình này trước khi xóa.`,
        variant: 'destructive',
      });
      return;
    }

    saveCustomActions(customActions.filter(a => a.id !== actionId));
    toast({ title: 'Đã xóa', description: `Xóa hành động "${actionName}" thành công.` });
  };

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [draft, setDraft] = useState<WorkflowDraft>(() => emptyDraft(initial.types));
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [newType, setNewType] = useState({ code: '', name: '', description: '' });

  const selectedType = workflowTypes.find((type) => type.id === draft.typeId);
  const selectedTypeCode = selectedType?.code ?? '';
  const isRecruitment = selectedTypeCode === 'REC';

  const { currentCompanyId, memberships } = useAuth();

  const { data: companiesData } = useQuery({
    queryKey: ['scoped-companies'],
    queryFn: () => listScopedCompanies(),
  });

  const selectableCompanies = useMemo(() => {
    if (companiesData?.data) {
      return companiesData.data
        .map((company) => {
          const tenantId = company.tenant_id || company.code || company.id;
          return {
            id: tenantId,
            name: company.name,
            tenantId,
            companyId: company.company_id || HRM_LIST_DEFAULT_COMPANY_ID,
          };
        })
        .filter((company, index, list) =>
          company.id && list.findIndex((item) => item.id === company.id) === index,
        );
    }
    return memberships.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      tenantId: (m as any).tenant_id ?? (m.company as any).tenant_id ?? null,
      companyId: (m.company as any).company_id ?? m.company.id,
    }));
  }, [companiesData, memberships]);

  const scopedCompanyIds = useMemo(() => {
    const ids = selectableCompanies.map((company) => company.companyId || company.id).filter(Boolean);
    return Array.from(new Set(ids.length ? ids : currentCompanyId ? [currentCompanyId] : []));
  }, [currentCompanyId, selectableCompanies]);

  const selectedCompanyId = draft.companyId || 'ALL_COMPANY';
  const selectedCompany = selectableCompanies.find((company) => company.id === selectedCompanyId);
  const isAllCompanyScope = selectedCompanyId === 'ALL_COMPANY';
  const effectiveCompanyId = isAllCompanyScope ? currentCompanyId : selectedCompanyId;
  const { departments: singleCompanyDepartments } = useDepartments({
    companyId: effectiveCompanyId,
    enabled: !isAllCompanyScope,
  });
  const { data: allCompanyDepartments = [] } = useQuery({
    queryKey: ['workflow-config-all-company-departments', scopedCompanyIds],
    queryFn: async () => {
      const results = await Promise.all(scopedCompanyIds.map((companyId) => loadCompanyDepartments(companyId)));
      return results.flatMap((result) => result.rows);
    },
    enabled: isAllCompanyScope && scopedCompanyIds.length > 0,
  });
  const departments = isAllCompanyScope ? allCompanyDepartments : singleCompanyDepartments;
  const { employees: singleCompanyEmployees = [] } = useEmployeePickerSearch({
    companyId: effectiveCompanyId,
    pageSize: 100,
    enabled: !isAllCompanyScope && Boolean(effectiveCompanyId),
  });
  const { data: allCompanyEmployees = [] } = useQuery({
    queryKey: ['workflow-config-all-company-employees', scopedCompanyIds],
    queryFn: async () => {
      const results = await Promise.all(scopedCompanyIds.map((companyId) => fetchEmployeePickerPage({
        company_id: companyId,
        page_size: 100,
      })));
      return results.flatMap((result) => result.data);
    },
    enabled: isAllCompanyScope && scopedCompanyIds.length > 0,
  });
  const rawEmployees = isAllCompanyScope ? allCompanyEmployees : singleCompanyEmployees;
  /** Chuẩn hoá: map job_title_label / job_title_key → job_title để hiển thị chức danh trong dropdown */
  const employees = useMemo(() => rawEmployees.map((e) => {
    const customFields = e.custom_fields ?? {};
    const departmentCode =
      customFields.department ||
      customFields.department_key ||
      customFields.department_id ||
      (e as any).department_id ||
      (e as any).departmentId ||
      undefined;
    const departmentName = e.department || customFields.department_label || undefined;
    const matchedDepartment = departments.find((department) =>
      [department.id, department.code, department.name].some((value) =>
        [departmentCode, departmentName].some(
          (candidate) => normalizeWorkflowLookup(candidate) === normalizeWorkflowLookup(value),
        ),
      ),
    );
    return {
      id: e.id,
      full_name: e.full_name,
      job_title: (e.job_title_label || customFields.job_title_label || customFields.position || undefined) as string | undefined,
      job_title_key: e.job_title_key ?? undefined,
      department_id: matchedDepartment?.id ?? (departmentCode ? String(departmentCode) : undefined),
      department_code: matchedDepartment?.code ?? (departmentCode ? String(departmentCode) : undefined),
      department_name: matchedDepartment?.name ?? (departmentName ? String(departmentName) : undefined),
    };
  }), [rawEmployees, departments]);

  const saveAll = (nextTypes = workflowTypes, nextWorkflows = workflows) => {
    setWorkflowTypes(nextTypes);
    setWorkflows(nextWorkflows);
    persistState(nextTypes, nextWorkflows);
  };

  const openCreateWorkflow = () => {
    setDraft(emptyDraft(workflowTypes));
    setView('detail');
  };

  const openWorkflow = (workflow: WorkflowConfig) => {
    setDraft({
      ...workflow,
      positions: (workflow.positions ?? []).map((item) => ({
        ...item,
        responsiblePersonId: item.responsiblePersonId || 'emp-hr-rec',
        approverRole: item.approverRole || resolveApproverRole(item.level),
      })),
      fields: (workflow.fields ?? []).map((item) => ({ ...item })),
      steps: workflow.steps.map((step) => ({ ...step, ownerPersonId: step.ownerPersonId || '' })),
    });
    setView('detail');
  };

  const changeWorkflowType = (typeId: string) => {
    const typeCode = typeCodeOf(workflowTypes, typeId);
    setDraft((current) => ({
      ...current,
      typeId,
      appliesTo: typeCode === 'REC' ? Array.from(new Set([...current.appliesTo, 'recruitment'])) : current.appliesTo,
      positions: typeCode === 'REC' ? (current.positions.length ? current.positions : [emptyPosition()]) : [],
      fields: buildFields(typeCode),
      steps: cloneSteps(typeCode),
    }));
  };

  const addWorkflowType = () => {
    const code = normalizeCode(newType.code);
    const name = newType.name.trim();
    if (!code || !name) {
      toast({ title: 'Nhập mã và tên loại quy trình', variant: 'destructive' });
      return;
    }
    if (workflowTypes.some((type) => type.code === code)) {
      toast({ title: 'Mã loại quy trình đã tồn tại', variant: 'destructive' });
      return;
    }
    const created = { id: createId('type'), code, name, description: newType.description.trim() };
    const nextTypes = [...workflowTypes, created];
    saveAll(nextTypes, workflows);
    setDraft((current) => ({ ...current, typeId: created.id, positions: [], fields: [], steps: [emptyStep()] }));
    setNewType({ code: '', name: '', description: '' });
    setTypeDialogOpen(false);
    toast({ title: 'Đã thêm loại quy trình', description: created.name });
  };

  const updatePosition = (id: string, patch: Partial<WorkflowPosition>) => {
    setDraft((current) => {
      const updatedPositions = current.positions.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if (patch.level !== undefined) next.approverRole = resolveApproverRole(patch.level);
        return next;
      });

      // Auto-add/remove TGĐ approval step based on staffingType
      const TGD_STEP_MARKER = '__TGD_APPROVAL__';
      const allOutOfBudget =
        updatedPositions.length > 0 &&
        updatedPositions.every((p) => (p.staffingType || 'within_budget') === 'out_of_budget');

      let nextSteps = current.steps.filter((s) => s.condition !== TGD_STEP_MARKER);
      if (allOutOfBudget) {
        nextSteps = [
          ...nextSteps,
          {
            id: createId('step'),
            name: 'Phê duyệt Tổng giám đốc (Ngoại biên)',
            ownerPersonId: '',
            condition: TGD_STEP_MARKER,
            requiredInfo: 'Phê duyệt bổ sung biên chế + ngân sách lương ngoại biên.',
            slaHours: '72',
          },
        ];
      }

      return { ...current, positions: updatedPositions, steps: nextSteps };
    });
  };

  const updateField = (id: string, patch: Partial<WorkflowField>) => {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const updateStep = (id: string, patch: Partial<WorkflowStep>) => {
    setDraft((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.id === id ? { ...step, ...patch } : step)),
    }));
  };

  const saveWorkflow = () => {
    const code = normalizeCode(draft.code);
    const name = draft.name.trim();
    if (!code || !name || !draft.typeId) {
      toast({ title: 'Nhập tên, mã và loại quy trình', variant: 'destructive' });
      return;
    }
    if (draft.appliesTo.length === 0) {
      toast({ title: 'Chọn ít nhất một phần áp dụng', variant: 'destructive' });
      return;
    }
    const positions = draft.positions
      .map((item) => ({
        ...item,
        positionName: item.positionName.trim(),
        quantity: item.quantity.replace(/\D/g, '') || '1',
        department: item.department.trim(),
        level: item.level.trim(),
        approverRole: item.approverRole || resolveApproverRole(item.level),
      }))
      .filter((item) => item.positionName || !isRecruitment);
    if (isRecruitment && positions.length === 0) {
      toast({ title: 'Tuyển dụng cần ít nhất một vị trí', variant: 'destructive' });
      return;
    }
    const fields = draft.fields
      .map((field) => ({ ...field, label: field.label.trim(), value: field.value.trim() }))
      .filter((field) => field.label);
    const steps = draft.steps
      .map((step, index) => ({
        ...step,
        name: step.name.trim() || `Bước ${index + 1}`,
        ownerPersonId: step.ownerPersonId || '',
        condition: step.condition.trim(),
        requiredInfo: step.requiredInfo.trim(),
        slaHours: step.slaHours.replace(/\D/g, '') || '24',
      }))
      .filter((step) => step.name);
    if (steps.length === 0) {
      toast({ title: 'Quy trình cần ít nhất một bước', variant: 'destructive' });
      return;
    }
    if (workflows.some((workflow) => workflow.code === code && workflow.id !== draft.id)) {
      toast({ title: 'Mã quy trình đã tồn tại', variant: 'destructive' });
      return;
    }

    const saved: WorkflowConfig = {
      id: draft.id ?? createId('workflow'),
      code,
      name,
      typeId: draft.typeId,
      status: draft.status,
      appliesTo: draft.appliesTo,
      positions,
      fields,
      steps,
    };
    const now = new Date().toISOString();
    const existing = workflows.find((workflow) => workflow.id === saved.id);
    const workflowToSave = {
      ...saved,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    
    const nextWorkflows = existing
      ? workflows.map((workflow) => (workflow.id === saved.id ? workflowToSave : workflow))
      : [workflowToSave, ...workflows];
    saveAll(workflowTypes, nextWorkflows);
    setDraft(workflowToSave);
    setView('list');
    toast({ title: draft.id ? 'Đã cập nhật quy trình' : 'Đã tạo quy trình', description: saved.name });
  };

  const duplicateWorkflow = () => {
    setDraft((current) => ({
      ...current,
      id: undefined,
      code: `${normalizeCode(current.code) || 'WF'}_COPY`,
      name: `${current.name.trim()} - bản sao`,
      status: 'draft',
      positions: current.positions.map((item) => ({ ...item, id: createId('pos') })),
      fields: current.fields.map((item) => ({ ...item, id: createId('field') })),
      steps: current.steps.map((step) => ({ ...step, id: createId('step') })),
    }));
  };

  if (view === 'list') {
    return (
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Danh sách quy trình</TabsTrigger>
          <TabsTrigger value="action-types">Danh mục Hành động bước</TabsTrigger>
        </TabsList>
        <TabsContent value="workflows" className="space-y-4">
          <div className="space-y-4" data-testid="settings-workflow-config">
            <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cấu hình quy trình</h2>
              <p className="mt-1 text-sm text-slate-600">
                Quản lý các quy trình để những phần khác áp dụng và đi theo đúng cấu hình đã đặt.
              </p>
            </div>
            <Button type="button" size="sm" onClick={openCreateWorkflow}>
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo quy trình
            </Button>
          </div>
        </div>

        <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Danh sách quy trình</p>
            <Badge variant="outline">{workflows.length} quy trình</Badge>
          </div>
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Mã quy trình</TableHead>
                <TableHead>Tên quy trình</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Áp dụng cho</TableHead>
                <TableHead>Vị trí / bước</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => {
                const type = workflowTypes.find((item) => item.id === workflow.typeId);
                return (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-mono text-xs">{workflow.code}</TableCell>
                    <TableCell className="font-medium">{workflow.name}</TableCell>
                    <TableCell>{type?.name ?? 'Chưa phân loại'}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {workflow.appliesTo.map((id) => APPLY_TARGETS.find((target) => target.id === id)?.label ?? id).join(', ')}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {workflow.positions.length ? `${workflow.positions.length} vị trí · ` : ''}
                      {workflow.steps.length} bước
                    </TableCell>
                    <TableCell>
                      <Badge variant={workflow.status === 'active' ? 'default' : 'outline'}>
                        {workflow.status === 'active' ? 'Đang áp dụng' : 'Bản nháp'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => openWorkflow(workflow)}>
                        <Eye className="mr-1.5 h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
        </TabsContent>
        <TabsContent value="action-types" className="space-y-4">
          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Danh mục Hành động bước</h2>
            
            <div className="flex items-end gap-4 mb-6">
              <div className="space-y-1.5 flex-1">
                <Label>Mã hành động (ID)</Label>
                <Input value={newActionId} onChange={e => setNewActionId(e.target.value)} placeholder="VD: tham_dinh" />
              </div>
              <div className="space-y-1.5 flex-1">
                <Label>Tên hiển thị</Label>
                <Input value={newActionName} onChange={e => setNewActionName(e.target.value)} placeholder="VD: Thẩm định" />
              </div>
              <Button onClick={addAction}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm hành động
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hành động (ID)</TableHead>
                  <TableHead>Tên hiển thị</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customActions.map(action => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium text-slate-500">{action.id}</TableCell>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteAction(action.id, action.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {customActions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                      Chưa có hành động nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div className="space-y-4" data-testid="settings-workflow-config-detail">
      <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Button type="button" variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => setView('list')}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Danh sách quy trình
            </Button>
            <h2 className="text-lg font-semibold text-slate-900">
              {draft.id ? 'Chi tiết quy trình' : 'Tạo quy trình mới'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Chọn loại quy trình trước, hệ thống sẽ đổi bộ trường cần cấu hình theo loại đã chọn.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={duplicateWorkflow} disabled={!draft.name.trim()}>
              <Copy className="mr-1.5 h-4 w-4" />
              Nhân bản
            </Button>
            <Button type="button" size="sm" onClick={saveWorkflow}>
              <Save className="mr-1.5 h-4 w-4" />
              Lưu quy trình
            </Button>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-5">
          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
            <p className="mb-3 text-sm font-semibold text-slate-900">Thông tin chính</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="workflow-code">Mã quy trình *</Label>
                <Input
                  id="workflow-code"
                  className="font-mono"
                  readOnly={!!draft.id}
                  placeholder="REC_STD"
                  value={draft.code}
                  onChange={(event) => setDraft((current) => ({ ...current, code: normalizeCode(event.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="workflow-name">Tên quy trình *</Label>
                <Input
                  id="workflow-name"
                  placeholder="Tuyển dụng tiêu chuẩn"
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Loại quy trình *</Label>
                <div className="flex gap-2">
                  <Select value={draft.typeId} onValueChange={changeWorkflowType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại quy trình" />
                    </SelectTrigger>
                    <SelectContent portalScope="iframe">
                      {workflowTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" className="shrink-0" onClick={() => setTypeDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedType?.description ? <p className="text-xs text-slate-500">{selectedType.description}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label>Công ty áp dụng *</Label>
                <Select
                  value={draft.companyId || 'ALL_COMPANY'}
                  onValueChange={(v) => setDraft((current) => ({
                    ...current,
                    companyId: v,
                    positions: current.positions.map((position) => ({
                      ...position,
                      department: 'ALL_COMPANY',
                      responsiblePersonId: '',
                    })),
                    steps: current.steps.map((step) => ({ ...step, ownerPersonId: '' })),
                  }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Chọn công ty" />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    <SelectItem value="ALL_COMPANY" className="font-semibold text-blue-600">
                      Tất cả công ty (Tập đoàn)
                    </SelectItem>
                    {selectableCompanies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Trạng thái</Label>
                <label className="flex h-10 items-center gap-2 rounded-input border border-slate-200 px-3 text-sm">
                  <Switch
                    checked={draft.status === 'active'}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({ ...current, status: checked ? 'active' : 'draft' }))
                    }
                  />
                  {draft.status === 'active' ? 'Đang áp dụng' : 'Bản nháp'}
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">Phạm vi áp dụng</p>
              <p className="text-xs text-slate-500">Các phần được chọn sẽ follow theo quy trình này.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {APPLY_TARGETS.map((target) => (
                <label key={target.id} className="flex items-center gap-2 rounded-input border border-slate-200 px-3 py-2 text-sm">
                  <Checkbox
                    checked={draft.appliesTo.includes(target.id)}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({
                        ...current,
                        appliesTo: checked === true
                          ? Array.from(new Set([...current.appliesTo, target.id]))
                          : current.appliesTo.filter((id) => id !== target.id),
                      }))
                    }
                  />
                  {target.label}
                </label>
              ))}
            </div>
          </div>

          <WorkflowFieldsCard draft={draft} setDraft={setDraft} updateField={updateField} />
        </div>

        <div className="space-y-4 xl:col-span-7">
          {isRecruitment ? (
            <RecruitmentPositionsCard
              positions={draft.positions}
              setDraft={setDraft}
              updatePosition={updatePosition}
              employees={employees}
              companyId={selectedCompanyId}
              scopedCompanyIds={scopedCompanyIds}
              scopedCompanies={selectableCompanies}
              selectedCompany={selectedCompany}
              departments={departments}
            />
          ) : null}
          <WorkflowStepsCard draft={draft} setDraft={setDraft} updateStep={updateStep} employees={employees} customActions={customActions} departments={departments} />
        </div>
      </div>

      {/* Sticky footer for saving */}


      <TypeDialog
        open={typeDialogOpen}
        setOpen={setTypeDialogOpen}
        newType={newType}
        setNewType={setNewType}
        onSave={addWorkflowType}
      />
    </div>
  );
}

type DraftSetter = Dispatch<SetStateAction<WorkflowDraft>>;

function RecruitmentPositionsCard({
  positions,
  setDraft,
  updatePosition,
  employees,
  companyId,
  scopedCompanyIds,
  scopedCompanies,
  selectedCompany,
  departments,
}: {
  positions: WorkflowPosition[];
  setDraft: DraftSetter;
  updatePosition: (id: string, patch: Partial<WorkflowPosition>) => void;
  employees: WorkflowEmployeeOption[];
  companyId?: string;
  scopedCompanyIds: string[];
  scopedCompanies: WorkflowCompanyOption[];
  selectedCompany?: WorkflowCompanyOption;
  departments: WorkflowDepartmentOption[];
}) {
  const isAllCompanyCatalogScope = companyId === 'ALL_COMPANY';
  const { catalogs, scope } = useSettingsCatalogsOverview();
  
  const catalogPositionOptions = useMemo(() => {
    return jobTitleOptionsFromCatalog(catalogs ?? []);
  }, [catalogs]);


  const catalogPositionLabelByValue = useMemo(() => {
    return new Map(catalogPositionOptions.map((option) => [option.value, option.label]));
  }, [catalogPositionOptions]);
  
  const positionOptions = useMemo(() => {
    if (!isAllCompanyCatalogScope && employees.length > 0) {
      const options = new Map<string, { value: string; label: string }>();
      employees.forEach((employee) => {
        const value = employee.job_title_key || employee.job_title;
        const label = catalogPositionLabelByValue.get(value ?? '') || employee.job_title || employee.job_title_key;
        if (value && label && !options.has(value)) options.set(value, { value, label });
      });
      return Array.from(options.values());
    }
    return catalogPositionOptions;
  }, [catalogPositionLabelByValue, catalogPositionOptions, employees, isAllCompanyCatalogScope]);

  const { data: jdTemplates = [] } = useQuery({
    queryKey: ['jd_templates_for_workflow', companyId, scopedCompanyIds],
    queryFn: async () => {
      const companyIds = companyId === 'ALL_COMPANY' ? scopedCompanyIds : companyId ? [companyId] : [];
      const results = await Promise.all(companyIds.map((id) => listJobDescriptionTemplates({ company_id: id, status: 'active' } as any)));
      return results.flatMap((res) => res.data ?? []);
    },
    enabled: Boolean(companyId === 'ALL_COMPANY' ? scopedCompanyIds.length > 0 : companyId),
  });

  const jdOptions = useMemo(() => jdTemplates.map(jd => ({
    value: jd.id,
    label: jd.title,
    description: jd.department?.name
  })), [jdTemplates]);

  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Vị trí tuyển dụng</p>
          <p className="text-xs text-slate-500">Chọn từ danh mục có sẵn; cấp bậc sẽ tự gợi ý cấp duyệt phù hợp.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDraft((current) => ({ ...current, positions: [...current.positions, emptyPosition()] }))}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm vị trí
        </Button>
      </div>
      <div className="space-y-3">
        {positions.map((position, index) => {
          const selectedPositionLabel =
            catalogPositionLabelByValue.get(position.positionName) ||
            positionOptions.find((option) => option.value === position.positionName)?.label ||
            position.positionName;

          return (
          <div key={position.id} className="rounded-input border border-slate-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Vị trí {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={positions.length === 1}
                onClick={() => setDraft((current) => ({ ...current, positions: current.positions.filter((item) => item.id !== position.id) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tên vị trí</Label>
                <Select value={position.positionName} onValueChange={(value) => updatePosition(position.id, { positionName: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    {positionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    {position.positionName && !positionOptions.some(o => o.value === position.positionName) && (
                      <SelectItem value={position.positionName}>{selectedPositionLabel}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Số lượng</Label>
                <Input
                  inputMode="numeric"
                  value={position.quantity}
                  placeholder="Số lượng"
                  onChange={(event) => updatePosition(position.id, { quantity: event.target.value.replace(/\D/g, '') })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phòng ban</Label>
                <Select
                  value={position.department}
                  onValueChange={(value) => updatePosition(position.id, {
                    department: value,
                    positionName: '',
                    responsiblePersonId: '',
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    <SelectItem value="ALL_COMPANY" className="font-semibold text-blue-600">Toàn công ty</SelectItem>
                    {departments.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                    {position.department && !departments.some(d => d.id === position.department) && position.department !== 'ALL_COMPANY' && (
                      <SelectItem value={position.department}>{position.department}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>JD tiêu chuẩn</Label>
                <CatalogSearchPicker
                  options={jdOptions}
                  value={position.jdTemplateId || ''}
                  onValueChange={(val) => updatePosition(position.id, { jdTemplateId: val })}
                  placeholder="Chọn JD mô tả công việc..."
                  hideEmptyStateBox
                />
              </div>

              <AssigneePicker
                position={position}
                updatePosition={updatePosition}
                employees={employees}
                departments={departments}
                positionOptions={positionOptions}
              />

              
              <div className="space-y-1.5">
                <Label>Loại hình</Label>
                <Select value={position.employmentType || 'full-time'} onValueChange={(val) => updatePosition(position.id, { employmentType: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    {EMPLOYMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Định biên / Ngoại biên</Label>
                <Select value={position.staffingType || 'within_budget'} onValueChange={(val) => updatePosition(position.id, { staffingType: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Định biên / Ngoại biên" />
                  </SelectTrigger>
                  <SelectContent portalScope="iframe">
                    {STAFFING_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Hạn nộp hồ sơ</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !position.deadlineDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {position.deadlineDate ? format(new Date(position.deadlineDate), "dd/MM/yyyy") : "Hạn nộp hồ sơ"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={position.deadlineDate ? new Date(position.deadlineDate) : undefined}
                      onSelect={(date) => updatePosition(position.id, { deadlineDate: date ? date.toISOString() : '' })}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5 col-span-full md:col-span-1">
                <Label>Lương tối thiểu / Tối đa (VNĐ)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium select-none">VNĐ</span>
                    <ViMoneyInput
                      className="pl-10"
                      value={Number(position.salaryMin) || 0}
                      placeholder="Lương tối thiểu"
                      onValueChange={(val) => updatePosition(position.id, { salaryMin: val ? val.toString() : '' })}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium select-none">VNĐ</span>
                    <ViMoneyInput
                      className="pl-10"
                      value={Number(position.salaryMax) || 0}
                      placeholder="Lương tối đa"
                      onValueChange={(val) => updatePosition(position.id, { salaryMax: val ? val.toString() : '' })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkflowFieldsCard({
  draft,
  setDraft,
  updateField,
}: {
  draft: WorkflowDraft;
  setDraft: DraftSetter;
  updateField: (id: string, patch: Partial<WorkflowField>) => void;
}) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Trường thông tin theo loại quy trình</p>
          <p className="text-xs text-slate-500">Đổi loại quy trình sẽ đổi bộ trường gợi ý, vẫn thêm trường tùy chỉnh được.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDraft((current) => ({ ...current, fields: [...current.fields, emptyCustomField()] }))}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm trường
        </Button>
      </div>
      <div className="space-y-3">
        {draft.fields.map((field) => (
          <div key={field.id} className="rounded-input border border-slate-200 p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input value={field.label} placeholder="Tên trường" onChange={(event) => updateField(field.id, { label: event.target.value })} />
              <Input value={field.value} placeholder="Giá trị / mô tả" onChange={(event) => updateField(field.id, { value: event.target.value })} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDraft((current) => ({ ...current, fields: current.fields.filter((item) => item.id !== field.id) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <Checkbox checked={field.required} onCheckedChange={(checked) => updateField(field.id, { required: checked === true })} />
              Bắt buộc
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowStepsCard({
  draft,
  setDraft,
  updateStep,
  employees,
  customActions,
  departments,
}: {
  draft: WorkflowDraft;
  setDraft: DraftSetter;
  updateStep: (id: string, patch: Partial<WorkflowStep>) => void;
  employees: WorkflowEmployeeOption[];
  customActions: { id: string; name: string }[];
  departments: WorkflowDepartmentOption[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);

  const handleEdit = (step: WorkflowStep) => {
    setEditingStep(step);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingStep(null);
    setIsModalOpen(true);
  };

  const handleSaveModal = (stepData: WorkflowStep) => {
    if (editingStep) {
      // Update existing
      updateStep(stepData.id, stepData);
    } else {
      // Add new
      setDraft(current => ({
        ...current,
        steps: [...current.steps, stepData]
      }));
    }
    setIsModalOpen(false);
  };

  const deleteStep = (id: string) => {
    setDraft(current => ({
      ...current,
      steps: current.steps.filter(s => s.id !== id)
    }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    setDraft(current => {
      const steps = [...current.steps];
      if (direction === 'up' && index > 0) {
        [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
      } else if (direction === 'down' && index < steps.length - 1) {
        [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
      }
      return { ...current, steps };
    });
  };

  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Các bước, điều kiện và thông tin</p>
          <p className="text-xs text-slate-500">Sơ đồ luồng xử lý của quy trình này.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm bước
        </Button>
      </div>

      <div className="space-y-3">
        {draft.steps.map((step, index) => {
          const actionName = customActions?.find(a => a.id === step.actionType)?.name || step.actionType || 'Chưa chọn';
          const assignee = employees.find(e => e.id === step.ownerPersonId);
          const assigneeName = assignee ? assignee.full_name : 'Chưa chọn';
          const assigneeInitial = assigneeName !== 'Chưa chọn' ? assigneeName.split(' ').pop()?.substring(0, 2).toUpperCase() : '--';
          
          return (
            <Fragment key={step.id}>
              {index > 0 && (
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="bg-white px-2">
                    <ArrowDown className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              )}
              <div className="relative flex items-center gap-4 rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {index + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_1.5fr_2fr_1fr] gap-4 items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{step.name || `Bước ${index + 1}`}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-600 text-center">
                        {assigneeInitial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-slate-700 truncate" title={assigneeName}>{assigneeName}</span>
                        <span className="text-[10px] text-slate-500 truncate" title={actionName}>{actionName}</span>
                      </div>
                    </div>
                  </div>
                <div>
                  <p className="text-xs text-slate-500 line-clamp-2">{step.condition || 'Không có điều kiện'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">{step.slaHours} giờ (SLA)</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1 items-center">
                <Button type="button" variant="ghost" size="icon" onClick={() => moveStep(index, 'up')} disabled={index === 0} className="h-8 w-8 text-slate-400 hover:text-blue-600">
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => moveStep(index, 'down')} disabled={index === draft.steps.length - 1} className="h-8 w-8 text-slate-400 hover:text-blue-600">
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-slate-200 self-center mx-1"></div>
                <Button type="button" variant="ghost" size="icon" onClick={() => handleEdit(step)} className="h-8 w-8 text-slate-500 hover:text-blue-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => deleteStep(step.id)} disabled={draft.steps.length === 1} className="h-8 w-8 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            </Fragment>
          );
        })}
      </div>

      <WorkflowStepModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingStep}
        stepIndex={editingStep ? draft.steps.findIndex(s => s.id === editingStep.id) : -1}
        onSave={handleSaveModal}
        employees={employees}
        stepCount={draft.steps.length}
        customActions={customActions}
        departments={departments}
      />
    </div>
  );
}

function WorkflowStepModal({
  isOpen,
  onClose,
  initialData,
  stepIndex,
  onSave,
  employees,
  stepCount,
  customActions,
  departments,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: WorkflowStep | null;
  stepIndex: number;
  onSave: (data: WorkflowStep) => void;
  employees: WorkflowEmployeeOption[];
  stepCount: number;
  customActions: { id: string; name: string }[];
  departments: WorkflowDepartmentOption[];
}) {
  const [formData, setFormData] = useState<WorkflowStep>(() => ({
    id: `step-${Date.now()}`,
    name: '',
    ownerPersonId: '',
    condition: '',
    requiredInfo: '',
    slaHours: '24',
    actionType: customActions?.[0]?.id || 'phe_duyet',
    allowReject: false,
    minContractValue: '',
  }));

  const [filterDept, setFilterDept] = useState('ALL');
  const [filterTitle, setFilterTitle] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        id: `step-${Date.now()}`,
        name: '',
        ownerPersonId: '',
        condition: '',
        requiredInfo: '',
        slaHours: '24',
        actionType: customActions?.[0]?.id || 'phe_duyet',
        allowReject: false,
        minContractValue: '',
      });
      setFilterDept('ALL');
      setFilterTitle('ALL');
    }
  }, [isOpen, initialData, customActions]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (filterDept !== 'ALL' && !employeeMatchesDepartment(e, filterDept, departments)) return false;
      if (filterTitle !== 'ALL' && e.job_title !== filterTitle && e.job_title_key !== filterTitle) return false;
      return true;
    });
  }, [departments, employees, filterDept, filterTitle]);

  const stepTitleOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string }>();
    employees
      .filter((employee) => filterDept === 'ALL' || employeeMatchesDepartment(employee, filterDept, departments))
      .forEach((employee) => {
        const value = employee.job_title_key || employee.job_title;
        const label = employee.job_title || employee.job_title_key;
        if (value && label && !options.has(value)) options.set(value, { value, label });
      });
    return Array.from(options.values());
  }, [departments, employees, filterDept]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" data-testid="settings-workflow-step-modal">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 pr-8">
            <div className="h-5 w-1.5 bg-blue-600 rounded"></div>
            <DialogTitle className="text-lg text-slate-800">{initialData ? 'Chỉnh sửa bước' : 'Thêm bước mới'}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 bg-slate-50/30 -mx-6 -mb-6 rounded-b-lg space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-[3fr_1fr] gap-4">
                <div className="space-y-1.5">
                  <Label className="text-red-500 font-medium">Tên bước *</Label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Xét duyệt, Ký số..." className="bg-white" />
                </div>
                <div className="space-y-1.5">
                  <Label>Thứ tự</Label>
                  <Input value={initialData && stepIndex >= 0 ? stepIndex + 1 : stepCount + 1} readOnly className="bg-slate-100 text-center text-slate-500 font-medium cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-red-500 font-medium">Hành động *</Label>
                  <Select value={formData.actionType} onValueChange={v => setFormData({...formData, actionType: v})}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Chọn hành động" /></SelectTrigger>
                    <SelectContent>
                      {customActions.map(action => (
                        <SelectItem key={action.id} value={action.id}>{action.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Thời hạn (giờ)</Label>
                  <Input value={formData.slaHours} onChange={e => setFormData({...formData, slaHours: e.target.value.replace(/\D/g, '')})} className="bg-white" />
                </div>
              </div>
            </div>

            <div>
              <div className="border border-red-100 bg-red-50/50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2">
                    <div className="mt-0.5 text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Từ chối</p>
                      <p className="text-xs text-red-600/80 mt-0.5 leading-snug">Cho phép người xử lý từ chối và trả về bước trước</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.allowReject}
                    onCheckedChange={checked => setFormData({...formData, allowReject: checked})}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-red-500 font-medium">Người thực hiện chính *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={filterDept} onValueChange={v => { setFilterDept(v); setFilterTitle('ALL'); }}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Phòng ban" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                    {Array.from(new Set(employees.map(e => e.department_id).filter(Boolean))).map((departmentValue) => {
                      if (!departmentValue || departments.some((department) =>
                        [department.id, department.code, department.name].some(
                          (value) => normalizeWorkflowLookup(value) === normalizeWorkflowLookup(departmentValue),
                        ),
                      )) {
                        return null;
                      }
                      return (
                        <SelectItem key={departmentValue} value={departmentValue}>
                          {departmentValue}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select value={filterTitle} onValueChange={setFilterTitle}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Chức danh" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả chức danh</SelectItem>
                    {stepTitleOptions.map((title) => (
                      <SelectItem key={title.value} value={title.value}>{title.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formData.ownerPersonId} onValueChange={v => setFormData({...formData, ownerPersonId: v})}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Người thực hiện" /></SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}{person.job_title ? ` (${person.job_title})` : ''}
                      </SelectItem>
                    ))}
                    {filteredEmployees.length === 0 && <SelectItem value="EMPTY_EMP" disabled>Không có dữ liệu</SelectItem>}
                    {formData.ownerPersonId && !filteredEmployees.some(e => e.id === formData.ownerPersonId) && (
                      <SelectItem value={formData.ownerPersonId}>
                        {employees.find(e => e.id === formData.ownerPersonId)?.full_name || formData.ownerPersonId}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Điều kiện kích hoạt (mô tả)</Label>
              <Textarea 
                value={formData.condition} 
                onChange={e => setFormData({...formData, condition: e.target.value})}
                placeholder="VD: Áp dụng khi giá trị hợp đồng > 1 tỷ đồng"
                className="bg-white min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <Button variant="outline" onClick={onClose} className="border-slate-200">Hủy</Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => onSave(formData)}>
            {initialData ? 'Cập nhật' : 'Lưu bước'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


type TypeDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  newType: { code: string; name: string; description: string };
  setNewType: Dispatch<SetStateAction<{ code: string; name: string; description: string }>>;
  onSave: () => void;
};

function TypeDialog({ open, setOpen, newType, setNewType, onSave }: TypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg" data-testid="settings-workflow-type-dialog">
        <DialogHeader>
          <DialogTitle>Thêm loại quy trình</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="workflow-type-code">Mã loại *</Label>
              <Input
                id="workflow-type-code"
                className="font-mono"
                placeholder="APPROVAL"
                value={newType.code}
                onChange={(event) => setNewType((current) => ({ ...current, code: normalizeCode(event.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workflow-type-name">Tên loại *</Label>
              <Input
                id="workflow-type-name"
                placeholder="Phê duyệt nội bộ"
                value={newType.name}
                onChange={(event) => setNewType((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="workflow-type-desc">Mô tả</Label>
            <Textarea
              id="workflow-type-desc"
              value={newType.description}
              onChange={(event) => setNewType((current) => ({ ...current, description: event.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button type="button" onClick={onSave}>
            <Save className="mr-1.5 h-4 w-4" />
            Lưu loại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssigneePicker({
  position,
  updatePosition,
  employees,
  departments,
  positionOptions,
}: {
  position: WorkflowPosition;
  updatePosition: (id: string, patch: Partial<WorkflowPosition>) => void;
  employees: WorkflowEmployeeOption[];
  departments: WorkflowDepartmentOption[];
  positionOptions: Array<{ value: string; label: string }>;
}) {
  const [filterTitle, setFilterTitle] = useState<string>('all');
  const positionLabelByValue = useMemo(
    () => new Map(positionOptions.map((option) => [option.value, option.label])),
    [positionOptions],
  );

  const departmentEmployees = useMemo(() => {
    return employees.filter((employee) => employeeMatchesDepartment(employee, position.department, departments));
  }, [departments, employees, position.department]);

  const titleOptions = useMemo(() => {
    const options = new Map<string, { value: string; label: string }>();
    departmentEmployees.forEach((employee) => {
      const value = employee.job_title_key || employee.job_title;
      const label = positionLabelByValue.get(value ?? '') || employee.job_title || employee.job_title_key;
      if (value && label && !options.has(value)) options.set(value, { value, label });
    });
    return Array.from(options.values());
  }, [departmentEmployees, positionLabelByValue]);

  useEffect(() => {
    setFilterTitle('all');
  }, [position.department]);

  const filteredEmployees = useMemo(() => {
    return departmentEmployees.filter((employee) =>
      filterTitle === 'all' ||
      employee.job_title === filterTitle ||
      employee.job_title_key === filterTitle,
    );
  }, [departmentEmployees, filterTitle]);

  return (
    <div className="col-span-full rounded border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-xs font-semibold text-slate-500 mb-2">Người phụ trách</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select value={filterTitle} onValueChange={setFilterTitle}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Chọn chức danh để lọc..." />
          </SelectTrigger>
          <SelectContent portalScope="iframe">
            <SelectItem value="all">Tất cả chức danh</SelectItem>
            {(titleOptions.length > 0 ? titleOptions : positionOptions).map(p => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={position.responsiblePersonId}
          onValueChange={(value) => updatePosition(position.id, { responsiblePersonId: value })}
        >
          <SelectTrigger className={!position.responsiblePersonId ? "bg-white border-red-300" : "bg-white"}>
            <SelectValue placeholder="Người chịu trách nhiệm" />
          </SelectTrigger>
          <SelectContent portalScope="iframe">
            {filteredEmployees.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.full_name}{person.job_title ? ` (${person.job_title})` : ''}
              </SelectItem>
            ))}
            {filteredEmployees.length === 0 && (
              <SelectItem value="EMPTY_EMP" disabled>Không có dữ liệu</SelectItem>
            )}
            {position.responsiblePersonId &&
              !filteredEmployees.some(e => e.id === position.responsiblePersonId) && (
              <SelectItem value={position.responsiblePersonId}>
                {employees.find(e => e.id === position.responsiblePersonId)?.full_name ||
                  position.responsiblePersonId}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
