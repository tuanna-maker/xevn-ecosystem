import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { ArrowLeft, Copy, Eye, Plus, Save, Trash2, CalendarIcon } from 'lucide-react';
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
import { useEmployeePickerSearch } from '@/hooks/useEmployeePicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { toCatalogPickerOptions } from '@/lib/catalogSearchPicker';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useQuery } from '@tanstack/react-query';
import { listJobDescriptionTemplates, type HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';
import { amountStringToNumber, ViMoneyInput } from '@/components/ui/ViMoneyInput';

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
  createdAt?: string;
  updatedAt?: string;
};

type WorkflowDraft = Omit<WorkflowConfig, 'id'> & { id?: string };

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
const LEVEL_OPTIONS = ['Nhân viên', 'Chuyên viên', 'Trưởng nhóm', 'Trưởng phòng', 'Giám đốc', 'Tổng giám đốc'];

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
  const person = PEOPLE_OPTIONS.find((item) => item.id === personId);
  return person ? `${person.name} - ${person.title}` : 'Chưa chọn';
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
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [draft, setDraft] = useState<WorkflowDraft>(() => emptyDraft(initial.types));
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [newType, setNewType] = useState({ code: '', name: '', description: '' });

  const selectedType = workflowTypes.find((type) => type.id === draft.typeId);
  const selectedTypeCode = selectedType?.code ?? '';
  const isRecruitment = selectedTypeCode === 'REC';

  const { currentCompanyId } = useAuth();
  const { employees: rawEmployees = [] } = useEmployeePickerSearch({ companyId: currentCompanyId, pageSize: 100 });
  /** Chuẩn hoá: map job_title_label / job_title_key → job_title để hiển thị chức danh trong dropdown */
  const employees = useMemo(() => rawEmployees.map((e) => ({
    id: e.id,
    full_name: e.full_name,
    job_title: (e.job_title_label || e.job_title_key || '') as string,
  })), [rawEmployees]);

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
        ownerPersonId: step.ownerPersonId || PEOPLE_OPTIONS[0]?.id || '',
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

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
            <p className="mb-3 text-sm font-semibold text-slate-900">Thông tin chính</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="workflow-code">Mã quy trình *</Label>
                <Input
                  id="workflow-code"
                  className="font-mono"
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

        <div className="space-y-4">
          {isRecruitment ? (
            <RecruitmentPositionsCard
              positions={draft.positions}
              setDraft={setDraft}
              updatePosition={updatePosition}
              employees={employees}
            />
          ) : null}
          <WorkflowStepsCard draft={draft} setDraft={setDraft} updateStep={updateStep} employees={employees} />
        </div>
      </div>

      {/* Sticky footer for saving */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-slate-200 bg-white p-4 shadow-top">
        <div className="mx-auto flex max-w-7xl justify-end">
          <Button type="button" size="lg" onClick={saveWorkflow}>
            <Save className="mr-1.5 h-4 w-4" />
            Lưu quy trình
          </Button>
        </div>
      </div>

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
}: {
  positions: WorkflowPosition[];
  setDraft: DraftSetter;
  updatePosition: (id: string, patch: Partial<WorkflowPosition>) => void;
  employees: Array<{ id: string; full_name: string; job_title?: string }>;
}) {
  const { currentCompanyId } = useAuth();
  
  const { departments } = useDepartments();
  
  const { catalogs } = useSettingsCatalogsOverview({});
  const positionCatalog = findCatalog(catalogs, ['job_titles', 'positions', 'employee_positions']);
  const positionOptions = useMemo(
    () => toCatalogPickerOptions(positionCatalog?.effectiveItems ?? []),
    [positionCatalog]
  );
  
  const levelCatalog = findCatalog(catalogs, ['job_levels', 'levels']);
  const levelOptions = useMemo(
    () => toCatalogPickerOptions(levelCatalog?.effectiveItems ?? []),
    [levelCatalog]
  );

  const { data: jdTemplates = [] } = useQuery({
    queryKey: ['jd_templates_for_workflow', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const res = await listJobDescriptionTemplates({
        company_id: currentCompanyId,
        status: 'active',
      });
      return res.data || [];
    },
    enabled: !!currentCompanyId,
  });

  const jdOptions = useMemo(() => {
    return jdTemplates.map(tpl => ({
      value: tpl.id,
      label: tpl.title || tpl.code,
      code: tpl.code
    }));
  }, [jdTemplates]);

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
        {positions.map((position, index) => (
          <div key={position.id} className="rounded-input border border-slate-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Vị trí {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={positions.length === 1}
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    positions: current.positions.filter((item) => item.id !== position.id),
                  }))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <CatalogSearchPicker
                options={positionOptions}
                value={position.positionName}
                onValueChange={(val) => updatePosition(position.id, { positionName: val })}
                placeholder="Chọn hoặc nhập vị trí..."
                allowFreeText
              />
              <Input
                inputMode="numeric"
                value={position.quantity}
                placeholder="Số lượng"
                onChange={(event) => updatePosition(position.id, { quantity: event.target.value.replace(/\D/g, '') })}
              />
              <Select value={position.department} onValueChange={(value) => updatePosition(position.id, { department: value })}>
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
                  {departments.length === 0 && (
                    <SelectItem value="EMPTY_DEPT" disabled>
                      Không có dữ liệu
                    </SelectItem>
                  )}
                  {/* Fallback for existing data */}
                  {position.department && !departments.some(d => d.id === position.department) && position.department !== 'ALL_COMPANY' && (
                    <SelectItem value={position.department}>{DEPARTMENT_OPTIONS.includes(position.department) ? position.department : position.department}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <CatalogSearchPicker
                options={jdOptions}
                value={position.jdTemplateId || ''}
                onValueChange={(val) => updatePosition(position.id, { jdTemplateId: val })}
                placeholder="Chọn JD mô tả công việc..."
                hideEmptyStateBox
              />

              {/* Người chịu trách nhiệm — lọc theo chức danh đồng bộ với approverRole */}
              {(() => {
                const resolvedRole = position.approverRole || resolveApproverRole(position.level);
                const filteredEmployees = filterEmployeesByApproverRole(employees, resolvedRole);
                const isFiltered = filteredEmployees.length < employees.length;
                return (
                  <Select
                    value={position.responsiblePersonId}
                    onValueChange={(value) => updatePosition(position.id, { responsiblePersonId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isFiltered ? `Người chịu trách nhiệm (${resolvedRole})` : 'Người chịu trách nhiệm'} />
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
                      {/* Hiển thị người đã lưu nếu không còn trong danh sách lọc */}
                      {position.responsiblePersonId &&
                        !filteredEmployees.some(e => e.id === position.responsiblePersonId) && (
                        <SelectItem value={position.responsiblePersonId}>
                          {employees.find(e => e.id === position.responsiblePersonId)?.full_name ||
                            PEOPLE_OPTIONS.find(p => p.id === position.responsiblePersonId)?.name ||
                            position.responsiblePersonId}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                );
              })()}
              <Input value={position.approverRole || resolveApproverRole(position.level)} readOnly />
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
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
              {/* Lương tối thiểu và tối đa */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium select-none">VNĐ</span>
                <ViMoneyInput
                  className="pl-10"
                  value={Number(position.salaryMin) || 0}
                  placeholder="Lương tối thiểu"
                  onValueChange={(val) => {
                    updatePosition(position.id, { salaryMin: val ? val.toString() : '' });
                  }}
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium select-none">VNĐ</span>
                <ViMoneyInput
                  className="pl-10"
                  value={Number(position.salaryMax) || 0}
                  placeholder="Lương tối đa"
                  onValueChange={(val) => {
                    updatePosition(position.id, { salaryMax: val ? val.toString() : '' });
                  }}
                />
              </div>
            </div>
          </div>
        ))}
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
}: {
  draft: WorkflowDraft;
  setDraft: DraftSetter;
  updateStep: (id: string, patch: Partial<WorkflowStep>) => void;
  employees: Array<{ id: string; full_name: string; job_title?: string }>;
}) {
  const TGD_STEP_MARKER = '__TGD_APPROVAL__';
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">Các bước, điều kiện và thông tin</p>
          <p className="text-xs text-slate-500">Người phụ trách là nhân sự cụ thể, hiển thị kèm chức danh.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDraft((current) => ({ ...current, steps: [...current.steps, emptyStep()] }))}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm bước
        </Button>
      </div>
      <div className="space-y-3">
        {draft.steps.map((step, index) => (
          <div key={step.id} className="rounded-input border border-slate-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Bước {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={draft.steps.length === 1}
                onClick={() => setDraft((current) => ({ ...current, steps: draft.steps.filter((item) => item.id !== step.id) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={step.name} placeholder="Tên bước" onChange={(event) => updateStep(step.id, { name: event.target.value })} />
              <Select
                value={step.ownerPersonId}
                onValueChange={(value) => updateStep(step.id, { ownerPersonId: value })}
                disabled={step.condition === TGD_STEP_MARKER}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người phụ trách" />
                </SelectTrigger>
                <SelectContent portalScope="iframe">
                  {employees.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.full_name}{person.job_title ? ` (${person.job_title})` : ''}
                    </SelectItem>
                  ))}
                  {employees.length === 0 && (
                    <SelectItem value="EMPTY_EMP" disabled>Không có dữ liệu</SelectItem>
                  )}
                  {/* Fallback for existing saved person not in list */}
                  {step.ownerPersonId && !employees.some(e => e.id === step.ownerPersonId) && (
                    <SelectItem value={step.ownerPersonId}>
                      {PEOPLE_OPTIONS.find(p => p.id === step.ownerPersonId)?.name || step.ownerPersonId}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Textarea
                className="min-h-20"
                value={step.condition === TGD_STEP_MARKER ? '' : step.condition}
                placeholder="Điều kiện"
                readOnly={step.condition === TGD_STEP_MARKER}
                onChange={(event) => updateStep(step.id, { condition: event.target.value })}
              />
              <Textarea
                className="min-h-20"
                value={step.requiredInfo}
                placeholder="Thông tin cần có"
                onChange={(event) => updateStep(step.id, { requiredInfo: event.target.value })}
              />
              <Input
                inputMode="numeric"
                value={step.slaHours}
                placeholder="SLA giờ"
                onChange={(event) => updateStep(step.id, { slaHours: event.target.value.replace(/\D/g, '') })}
              />
              <Input
                value={(() => {
                  if (!step.ownerPersonId) {
                    return step.condition === TGD_STEP_MARKER ? 'Tổng giám đốc (tự động)' : 'Chưa chọn';
                  }
                  const emp = employees.find(e => e.id === step.ownerPersonId);
                  if (emp) return emp.job_title ? `${emp.full_name} (${emp.job_title})` : emp.full_name;
                  const legacy = PEOPLE_OPTIONS.find(p => p.id === step.ownerPersonId);
                  if (legacy) return `${legacy.name} (${legacy.title})`;
                  return step.ownerPersonId;
                })()}
                readOnly
              />
            </div>
          </div>
        ))}
      </div>
    </div>
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
