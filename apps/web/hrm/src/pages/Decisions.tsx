/**
 * @CODE-MEMORY
 * Screen:     /decisions — Quản lý quyết định nhân sự (embed HRM)
 * UC:          UC-HRM-27 / FR-HRM-27
 * BR:          BR-DEC-03 · BR-DEC-06 · AC-DEC-02 · AC-DEC-04 · AC-DEC-DENSITY
 * SRS:         docs/hrm/SRS.md § UC-HRM-27 · docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.50
 * TechSpec:    docs/hrm/TECHSPEC.md §16.5 #50 · §16.9 G-DEC-01
 * Purpose:     List/create/edit/delete QSĐ qua REST; empty live «Không có quyết định nào»;
 *              sau tạo reset filter để dòng hiện (create→list→F5 U65).
 * WorkItem:    FE-HRM-G-DEC-01-DENSITY-01
 * Coded:       2026-07-22
 *
 * Callers:
 *   - apps/web/hrm/src/App.tsx → Route /decisions
 *
 * Callees:
 *   - useDecisions → list/create/update/deleteHrDecision → /api/hrm/decisions
 *   - decisionListUi → resolveListVisibilityAfterCreate / resolveCreateDialogDecisionType
 *
 * FE-Actions:
 *   | Thao tác người dùng | Handler              | Lib / API                |
 *   |---------------------|----------------------|--------------------------|
 *   | Mở list             | useDecisions query   | GET /api/hrm/decisions   |
 *   | Thêm / empty CTA    | handleOpenCreate     | dialog + prefill type    |
 *   | Lưu tạo             | handleSubmit         | POST + list visibility   |
 *   | F5                  | browser reload       | GET lại row đã persist   |
 *
 * BE-Chain: GET/POST/PATCH/DELETE /api/hrm/decisions → hr_decisions
 * Impact:      Copy stub hoặc filter type sau create → list trống dù API 201 (G-DEC-01).
 * must_keep:   decisions.noData «Không có quyết định nào» · cấm «chưa triển khai» · AC-ATT-SHEET · U65
 * SOLID:       Page UI; server state ở hook; pure visibility ở decisionListUi.
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-SETTINGS-MD-CRUD-FE-01
 * change_mode: ADD
 * What: decision_type CatalogSearchPicker từ decision_types catalog
 * Why: FR-HRM-SC-DEC-01 · AC-HRM-PICKER-01
 * LastVerified: catalogSearchPicker.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-PICKER-01
 * change_mode: ADD
 * What: position / signer_position / department → CatalogSearchPicker; Network *_key + snapshot
 * Why: AC-E1A-DEC-POS-01 · FR-HRM-MD-BIND-E1A-01 · U72 labels
 * must_keep: decision_type picker; EmployeeForm JT/dept; LeaveTab; JobTemplates; U65; defer A9
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1B-MD-PANEL-01
 * change_mode: ADD
 * What: decision_type options merge hr_decision_types ∪ decision_types (alias — không MISS live)
 * Why: AC-SC-DEC-ALIAS-02 · AC-SET-UI-05
 * must_keep: hardcode DECISION_TYPES chỉ khi catalog empty
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-01
 * change_mode: ADD
 * What: Person-bound bắt employee_id; toast/hint QSĐ effective → WH F5; HDSD testids
 * Why: AC-DEC-WH-01/02 · BR-DEC-05 · F-CORE-DEC-01/02 · EMP-SPEC-01 §D.2/D.7
 * must_keep: CatalogSearchPicker position/dept; density empty; U65 no seed; J-HRM-01..04
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-02
 * change_mode: FIX
 * What: HDSD labels F-FRM-POS/STATUS + testids code/title/position/status; validateDecisionCreateForm
 * Why: R-EMP-DEC-WH-BROWSER-01 — harness miss «Chức vụ»/«Tình trạng»/code → toast bắt buộc, no POST
 * must_keep: CatalogSearchPicker position required; person-bound employee_id; D2/D6 PASS; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-EMP-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: WH hint gate uses isWorkHistoryNeoDecisionType (HRD_01/02) not only legacy appointment
 * Why: OBS-D1-HINT — hintVisible=false when catalog type HRD_01 + effective
 * must_keep: D1 WH neo sealed; HRD_03 no WH hint; D5 company_id; R-J03-DIALOG; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
 * change_mode: ADD
 * What: decision_type picker binds GET /decisions/decision-types/effective (open catalog dual SoT)
 * Why: R-PLT-DEC-FE-01 · AC-PLT-DEC · L1 SEAL DECPLATQA-MSJ1FB3D · CNS HRM-DEC-TYPE-UNKNOWN toast
 * must_keep: F-CORE-DEC create/approve/WH · person-bound + WH neo defaults · density empty · U65 · decisions UAT=false
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDecisions } from '@/hooks/useDecisions';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { useDecDecisionTypesEffective } from '@/hooks/useDecDecisionTypesEffective';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import {
  buildDepartmentKeyFields,
  buildPositionKeyFields,
  departmentOptionsFromCatalog,
  HRM_MASTER_DATA_CATALOG_KEYS,
  jobTitleOptionsFromCatalog,
  mergeEffectiveItemsByKeys,
  resolveDepartmentLabel,
  resolvePositionDisplayLabel,
  toCatalogPickerOptions,
  type CatalogPickerOption,
} from '@/lib/catalogSearchPicker';
import { withDecDecisionTypeHistoryOption } from '@/lib/decDecisionTypeCatalog';
import { hrmStorageUploadStub } from '@/lib/hrmStorageUploadStub';
import {
  resolveCreateDialogDecisionType,
  resolveListVisibilityAfterCreate,
} from '@/lib/decisionListUi';
import {
  isDecisionEffectiveStatus,
  isPersonBoundDecisionType,
  isWorkHistoryNeoDecisionType,
  validateDecisionCreateForm,
} from '@/lib/decisionPersonBound';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  CalendarIcon,
  Eye,
  Award,
  UserPlus,
  UserMinus,
  ArrowUpCircle,
  ArrowRightCircle,
  Banknote,
  AlertTriangle,
  FileSignature,
  Upload,
  X,
  File,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, vi, zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Decision {
  id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content: string | null;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  department_key?: string | null;
  position: string | null;
  position_key?: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signer_position_key?: string | null;
  signing_date: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  company_id: string;
}

interface FormData {
  decision_code: string;
  decision_type: string;
  title: string;
  content: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department_key: string;
  position_key: string;
  effective_date: Date | undefined;
  expiry_date: Date | undefined;
  signer_name: string;
  signer_position_key: string;
  signing_date: Date | undefined;
  file_url: string;
  status: string;
  notes: string;
}

const initialFormData: FormData = {
  decision_code: '',
  decision_type: 'appointment',
  title: '',
  content: '',
  employee_id: '',
  employee_name: '',
  employee_code: '',
  department_key: '',
  position_key: '',
  effective_date: undefined,
  expiry_date: undefined,
  signer_name: '',
  signer_position_key: '',
  signing_date: undefined,
  file_url: '',
  status: 'draft',
  notes: '',
};

const getDecisionTypes = (t: any) => [
  { key: 'all', labelKey: 'decisions.types.all', icon: FileText, color: 'bg-slate-500' },
  { key: 'appointment', labelKey: 'decisions.types.appointment', icon: UserPlus, color: 'bg-blue-500' },
  { key: 'promotion', labelKey: 'decisions.types.promotion', icon: ArrowUpCircle, color: 'bg-green-500' },
  { key: 'transfer', labelKey: 'decisions.types.transfer', icon: ArrowRightCircle, color: 'bg-purple-500' },
  { key: 'salary_adjustment', labelKey: 'decisions.types.salary_adjustment', icon: Banknote, color: 'bg-amber-500' },
  { key: 'reward', labelKey: 'decisions.types.reward', icon: Award, color: 'bg-emerald-500' },
  { key: 'discipline', labelKey: 'decisions.types.discipline', icon: AlertTriangle, color: 'bg-red-500' },
  { key: 'termination', labelKey: 'decisions.types.termination', icon: UserMinus, color: 'bg-gray-500' },
  { key: 'contract_renewal', labelKey: 'decisions.types.contract_renewal', icon: FileSignature, color: 'bg-cyan-500' },
];

const getStatusOptions = (t: any) => [
  { value: 'draft', label: t('decisions.statuses.draft') },
  { value: 'pending', label: t('decisions.statuses.pending') },
  { value: 'signed', label: t('decisions.statuses.signed') },
  { value: 'effective', label: t('decisions.statuses.effective') },
  { value: 'expired', label: t('decisions.statuses.expired') },
  { value: 'cancelled', label: t('decisions.statuses.cancelled') },
];

const settingsCatalogCta = (
  <a href="/settings" className="text-primary underline text-xs font-medium">
    Mở Cài đặt → Danh mục nghiệp vụ
  </a>
);

export default function Decisions() {
  const { t, i18n } = useTranslation();
  const DECISION_TYPES = getDecisionTypes(t);
  const STATUS_OPTIONS = getStatusOptions(t);
  const calendarLocale = i18n.language === 'vi' ? vi : i18n.language === 'zh' ? zhCN : enUS;
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview();

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const {
    decisionTypeOptions: effectiveDecisionTypeOptions,
    personBoundKeys: catalogPersonBoundKeys,
    workHistoryKeys: catalogWorkHistoryKeys,
    decisionTypeDisplayLabel,
    hasEffectiveCatalog,
    isLoading: decisionTypesLoading,
    isError: decisionTypesError,
  } = useDecDecisionTypesEffective({
    historyKey: formData.decision_type,
  });

  const positionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const departmentOptions = useMemo(
    () => departmentOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const decisionTypeOptions = useMemo((): CatalogPickerOption[] => {
    // F-DEC-CAT-EFF — prefer open catalog effective (DEC native ∪ group_ref) when non-empty.
    if (hasEffectiveCatalog) {
      return effectiveDecisionTypeOptions;
    }
    // Fallback E1-B: dual-read settings catalogs — không MISS khi effective empty (U65 soft).
    const fromCatalog = toCatalogPickerOptions(
      mergeEffectiveItemsByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes),
    );
    if (fromCatalog.length > 0) {
      return withDecDecisionTypeHistoryOption(fromCatalog, formData.decision_type);
    }
    return DECISION_TYPES.filter((dt) => dt.key !== 'all').map((dt) => ({
      value: dt.key,
      label: t(dt.labelKey),
      code: dt.key,
    }));
  }, [
    hasEffectiveCatalog,
    effectiveDecisionTypeOptions,
    formData.decision_type,
    catalogs,
    DECISION_TYPES,
    t,
  ]);

  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDecisions, setSelectedDecisions] = useState<string[]>([]);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null);
  const [deletingDecision, setDeletingDecision] = useState<Decision | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    decisions: decisionsFromApi,
    employees,
    isLoading,
    createDecision,
    updateDecision,
    removeDecision,
    removeDecisions: removeDecisionsBulk,
  } = useDecisions(selectedType, { loadEmployees: dialogOpen });

  const decisions = decisionsFromApi as Decision[];

  const toDecisionPayload = (data: FormData) => {
    const pos = buildPositionKeyFields(data.position_key, positionOptions);
    const dept = data.department_key.trim()
      ? buildDepartmentKeyFields(data.department_key, departmentOptions)
      : null;
    const signerPos = data.signer_position_key.trim()
      ? buildPositionKeyFields(data.signer_position_key, positionOptions)
      : null;
    return {
      decision_code: data.decision_code,
      decision_type: data.decision_type,
      title: data.title,
      content: data.content,
      employee_id: data.employee_id,
      employee_name: data.employee_name,
      employee_code: data.employee_code,
      department: dept?.department ?? '',
      department_key: dept?.department_key ?? '',
      position: pos?.position ?? '',
      position_key: pos?.position_key ?? '',
      effective_date: data.effective_date,
      expiry_date: data.expiry_date,
      signer_name: data.signer_name,
      signer_position: signerPos?.position ?? '',
      signer_position_key: signerPos?.position_key ?? '',
      signing_date: data.signing_date,
      file_url: data.file_url,
      status: data.status,
      notes: data.notes,
    };
  };

  const createMutation = {
    mutateAsync: async (data: FormData) => {
      const ok = await createDecision(toDecisionPayload(data));
      if (!ok) throw new Error('create failed');
    },
  };

  const updateMutation = {
    mutateAsync: async ({ id, data }: { id: string; data: FormData }) => {
      const ok = await updateDecision(id, toDecisionPayload(data));
      if (!ok) throw new Error('update failed');
    },
  };

  const deleteMutation = {
    mutate: async (id: string) => {
      const ok = await removeDecision(id);
      if (ok) {
        setDeleteDialogOpen(false);
        setDeletingDecision(null);
      }
    },
  };

  const bulkDeleteMutation = {
    mutate: async (ids: string[]) => {
      const ok = await removeDecisionsBulk(ids);
      if (ok) {
        setBulkDeleteDialogOpen(false);
        setSelectedDecisions([]);
      }
    },
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDecision(null);
    setFormData(initialFormData);
    setUploadedFileName('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('decisions.fileTooLarge'));
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('decisions.fileTypeError'));
      return;
    }

    setIsUploading(true);
    try {
      const url = await hrmStorageUploadStub(file, 'decision-file-upload');
      if (!url) throw new Error('upload failed');
      setFormData({ ...formData, file_url: url });
      setUploadedFileName(file.name);
      toast.success(t('decisions.uploadSuccess'));
    } catch (error: any) {
      toast.error(t('decisions.uploadError') + ': ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (!formData.file_url) return;

    try {
      // Extract file path from URL
      const urlParts = formData.file_url.split('/decision-files/');
      if (urlParts.length > 1) {
        const filePath = decodeURIComponent(urlParts[1]);
      }
      
      setFormData({ ...formData, file_url: '' });
      setUploadedFileName('');
      toast.success(t('decisions.removeFileSuccess'));
    } catch (error: any) {
      toast.error(t('decisions.removeFileError') + ': ' + error.message);
    }
  };

  const handleOpenCreate = () => {
    // Prefill loại theo tab đang chọn để create→list khớp filter type (AC-DEC-DENSITY).
    setFormData({
      ...initialFormData,
      decision_type: resolveCreateDialogDecisionType(selectedType),
    });
    setEditingDecision(null);
    setDialogOpen(true);
  };

  const applyListVisibilityAfterCreate = (createdDecisionType: string) => {
    const next = resolveListVisibilityAfterCreate(createdDecisionType);
    setSelectedType(next.selectedType);
    setSearchQuery(next.searchQuery);
    setFilterStatus(next.filterStatus);
    setCurrentPage(next.currentPage);
    setSelectedDecisions([]);
  };

  const handleOpenEdit = (decision: Decision) => {
    setEditingDecision(decision);
    setFormData({
      decision_code: decision.decision_code,
      decision_type: decision.decision_type,
      title: decision.title,
      content: decision.content || '',
      employee_id: decision.employee_id || '',
      employee_name: decision.employee_name,
      employee_code: decision.employee_code || '',
      department_key: decision.department_key?.trim() || '',
      position_key: decision.position_key?.trim() || '',
      effective_date: decision.effective_date ? new Date(decision.effective_date) : undefined,
      expiry_date: decision.expiry_date ? new Date(decision.expiry_date) : undefined,
      signer_name: decision.signer_name || '',
      signer_position_key: decision.signer_position_key?.trim() || '',
      signing_date: decision.signing_date ? new Date(decision.signing_date) : undefined,
      file_url: decision.file_url || '',
      status: decision.status,
      notes: decision.notes || '',
    });
    // Extract filename from URL if exists
    if (decision.file_url) {
      const urlParts = decision.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      setUploadedFileName(decodeURIComponent(fileName.split('_').slice(1).join('_') || fileName));
    } else {
      setUploadedFileName('');
    }
    setDialogOpen(true);
  };

  const handleOpenView = (decision: Decision) => {
    setViewingDecision(decision);
    setViewDialogOpen(true);
  };

  const handleOpenDelete = (decision: Decision) => {
    setDeletingDecision(decision);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    const gate = validateDecisionCreateForm({
      decision_code: formData.decision_code,
      title: formData.title,
      employee_name: formData.employee_name,
      decision_type: formData.decision_type,
      employee_id: formData.employee_id,
      positionCatalogOk: Boolean(
        buildPositionKeyFields(formData.position_key, positionOptions),
      ),
      extraPersonBoundTypes: catalogPersonBoundKeys,
    });
    if (!gate.ok) {
      toast.error(gate.message);
      return;
    }
    if (
      formData.department_key.trim() &&
      !buildDepartmentKeyFields(formData.department_key, departmentOptions)
    ) {
      toast.error('Chọn phòng ban từ danh mục.');
      return;
    }
    if (
      formData.signer_position_key.trim() &&
      !buildPositionKeyFields(formData.signer_position_key, positionOptions)
    ) {
      toast.error('Chọn chức danh người ký từ danh mục.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDecision) {
        // Toast success/error do useDecisions (tránh double toast).
        await updateMutation.mutateAsync({ id: editingDecision.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
        // Sau POST 2xx: về tab Tất cả + clear filter để dòng mới hiện (AC-DEC-04).
        applyListVisibilityAfterCreate(formData.decision_type);
      }
      if (
        isDecisionEffectiveStatus(formData.status) &&
        isPersonBoundDecisionType(formData.decision_type, catalogPersonBoundKeys) &&
        formData.employee_id.trim()
      ) {
        toast.success(
          'QSĐ hiệu lực — lịch sử công tác sẽ phản ánh theo decision_id. Mở hồ sơ NV → Quá trình công tác rồi F5.',
          { duration: 6000 },
        );
      }
      handleCloseDialog();
    } catch {
      // Hook đã toast lỗi API; không toast thêm.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      // employee.position may already be job_title_key from useDecisions map
      const posKey =
        positionOptions.find((o) => o.value === employee.position)?.value ||
        positionOptions.find((o) => o.label === employee.position)?.value ||
        '';
      const deptKey =
        departmentOptions.find((o) => o.value === employee.department)?.value ||
        departmentOptions.find((o) => o.label === employee.department)?.value ||
        '';
      setFormData({
        ...formData,
        employee_id: employee.id,
        employee_name: employee.full_name,
        employee_code: employee.employee_code || '',
        department_key: deptKey,
        position_key: posKey,
      });
    }
  };

  const hasActiveFilters = filterStatus.length > 0;

  const clearAllFilters = () => {
    setFilterStatus([]);
    setCurrentPage(1);
  };

  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const filteredDecisions = decisions.filter((decision) => {
    const matchesSearch = 
      decision.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.decision_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      decision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (decision.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    if (!matchesSearch) return false;
    if (filterStatus.length > 0 && !filterStatus.includes(decision.status)) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDecisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDecisions = filteredDecisions.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedDecisions([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedDecisions([]);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const typeCounts = DECISION_TYPES.map((type) => ({
    ...type,
    count: type.key === 'all' 
      ? decisions.length 
      : decisions.filter((d) => d.decision_type === type.key).length,
  }));

  const toggleSelectAll = () => {
    if (selectedDecisions.length === paginatedDecisions.length) {
      setSelectedDecisions([]);
    } else {
      setSelectedDecisions(paginatedDecisions.map((d) => d.id));
    }
  };

  const toggleSelectDecision = (id: string) => {
    setSelectedDecisions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { labelKey: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { labelKey: 'decisions.statuses.draft', variant: 'secondary' },
      pending: { labelKey: 'decisions.statuses.pending', variant: 'outline' },
      signed: { labelKey: 'decisions.statuses.signed', variant: 'default' },
      effective: { labelKey: 'decisions.statuses.effective', variant: 'default' },
      expired: { labelKey: 'decisions.statuses.expired', variant: 'secondary' },
      cancelled: { labelKey: 'decisions.statuses.cancelled', variant: 'destructive' },
    };
    const { labelKey, variant } = config[status] || { labelKey: '', variant: 'secondary' as const };
    return <Badge variant={variant}>{labelKey ? t(labelKey) : status}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    if (hasEffectiveCatalog) {
      const fromEff = decisionTypeDisplayLabel(type);
      if (fromEff && fromEff !== '—') return fromEff;
    }
    const hit = decisionTypeOptions.find((o) => o.value === type || o.code === type);
    if (hit?.label?.trim()) return hit.label.trim();
    const legacy = DECISION_TYPES.find((t2) => t2.key === type);
    return legacy?.labelKey ? t(legacy.labelKey) : type;
  };

  const handleExport = () => {
    const exportData = filteredDecisions.map((d) => ({
      [t('decisions.export.decisionCode')]: d.decision_code,
      [t('decisions.export.type')]: getTypeLabel(d.decision_type),
      [t('decisions.export.title')]: d.title,
      [t('decisions.export.employee')]: d.employee_name,
      [t('decisions.export.employeeCode')]: d.employee_code || '',
      [t('decisions.export.department')]: d.department || '',
      [t('decisions.export.position')]: d.position || '',
      [t('decisions.export.effectiveDate')]: d.effective_date ? format(new Date(d.effective_date), 'dd/MM/yyyy') : '',
      [t('decisions.export.expiryDate')]: d.expiry_date ? format(new Date(d.expiry_date), 'dd/MM/yyyy') : '',
      [t('decisions.export.signer')]: d.signer_name || '',
      [t('decisions.export.signerPosition')]: d.signer_position || '',
      [t('decisions.export.signingDate')]: d.signing_date ? format(new Date(d.signing_date), 'dd/MM/yyyy') : '',
      [t('decisions.export.status')]: STATUS_OPTIONS.find(s => s.value === d.status)?.label || d.status,
      [t('decisions.export.notes')]: d.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('decisions.export.sheetName'));
    XLSX.writeFile(wb, `decisions-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success(t('decisions.exportSuccess'));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('decisions.addNew')}</span>
            <span className="sm:hidden">+</span>
          </Button>
          {selectedDecisions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('decisions.deleteSelected', { count: selectedDecisions.length })}</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('decisions.search')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={cn(hasActiveFilters && 'border-primary text-primary')}>
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('decisions.filter')}</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      {t('decisions.clearAll')}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('decisions.statusFilter')}</Label>
                  <div className="space-y-1">
                    {STATUS_OPTIONS.map((status) => (
                      <div key={status.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`status-${status.value}`}
                          checked={filterStatus.includes(status.value)}
                          onCheckedChange={() => toggleStatusFilter(status.value)}
                        />
                        <label htmlFor={`status-${status.value}`} className="text-sm cursor-pointer">
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="px-6 py-3 border-b bg-card overflow-x-auto">
        <div className="flex items-center gap-2">
          {typeCounts.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.key;
            return (
              <button
                key={type.key}
                onClick={() => {
                  setSelectedType(type.key);
                  setCurrentPage(1);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  isSelected
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className={cn('w-6 h-6 rounded flex items-center justify-center', type.color)}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{t(type.labelKey)}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{type.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={paginatedDecisions.length > 0 && selectedDecisions.length === paginatedDecisions.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>{t('decisions.tableHeaders.decisionCode')}</TableHead>
              <TableHead>{t('decisions.tableHeaders.type')}</TableHead>
              <TableHead>{t('decisions.tableHeaders.title')}</TableHead>
              <TableHead>{t('decisions.tableHeaders.employee')}</TableHead>
              <TableHead>{t('decisions.tableHeaders.department')}</TableHead>
              <TableHead>{t('decisions.tableHeaders.effectiveDate')}</TableHead>
              <TableHead>{t('decisions.tableHeaders.status')}</TableHead>
              <TableHead className="w-28">{t('decisions.tableHeaders.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  {t('decisions.loading')}
                </TableCell>
              </TableRow>
            ) : paginatedDecisions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  <div className="flex flex-col items-center gap-3">
                    {/* Live-empty honesty — AC-DEC-02: cấm «chưa triển khai». */}
                    <p className="text-muted-foreground">{t('decisions.noData')}</p>
                    {!searchQuery && filterStatus.length === 0 ? (
                      <>
                        <p className="text-sm text-muted-foreground">{t('decisions.emptyHint')}</p>
                        <Button size="sm" className="gap-2" onClick={handleOpenCreate}>
                          <Plus className="w-4 h-4" />
                          {t('decisions.addNew')}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedDecisions.map((decision) => (
                <TableRow 
                  key={decision.id}
                  className={cn(selectedDecisions.includes(decision.id) && 'bg-primary/5')}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedDecisions.includes(decision.id)}
                      onCheckedChange={() => toggleSelectDecision(decision.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    {decision.decision_code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(decision.decision_type)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={decision.title}>
                    {decision.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                          {getInitials(decision.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      {decision.employee_id ? (
                        <Link 
                          to={`/employees/${decision.employee_id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {decision.employee_name}
                        </Link>
                      ) : (
                        <span className="font-medium">{decision.employee_name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {decision.department || '-'}
                  </TableCell>
                  <TableCell>
                    {decision.effective_date
                      ? format(new Date(decision.effective_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(decision.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenView(decision)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(decision)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleOpenDelete(decision)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-card">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t('decisions.showingRecords', { start: filteredDecisions.length > 0 ? startIndex + 1 : 0, end: Math.min(endIndex, filteredDecisions.length), total: filteredDecisions.length })}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('decisions.rowsPerPage')}:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {getPageNumbers().map((page, index) => 
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDecision ? t('decisions.editTitle') : t('decisions.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {editingDecision ? t('decisions.editDesc') : t('decisions.addDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hdsd-decisions-form-code">
                  {t('decisions.decisionCodeLabel')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hdsd-decisions-form-code"
                  data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormCode}
                  placeholder={t('decisions.decisionCodePlaceholder')}
                  value={formData.decision_code}
                  onChange={(e) => setFormData({ ...formData, decision_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('decisions.decisionTypeLabel')} <span className="text-destructive">*</span></Label>
                <CatalogSearchPicker
                  options={decisionTypeOptions}
                  value={formData.decision_type}
                  onValueChange={(value) => setFormData({ ...formData, decision_type: value })}
                  placeholder={t('decisions.selectType')}
                  loading={decisionTypesLoading || catalogsLoading}
                  errorText={
                    decisionTypesError || catalogsError
                      ? t('settings.catalogs.loadError')
                      : undefined
                  }
                  emptyHint={
                    <Link to="/settings" className="text-primary underline text-xs font-medium">
                      Mở Cài đặt → Loại quyết định DEC
                    </Link>
                  }
                  data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormType}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hdsd-decisions-form-title">
                {t('decisions.titleLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="hdsd-decisions-form-title"
                data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormTitle}
                placeholder={t('decisions.titlePlaceholder')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('decisions.selectEmployeeLabel')}
                {isPersonBoundDecisionType(formData.decision_type, catalogPersonBoundKeys) && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              <Select
                value={formData.employee_id || undefined}
                onValueChange={handleEmployeeSelect}
              >
                <SelectTrigger data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormEmployee}>
                  <SelectValue placeholder={t('decisions.selectEmployeeLabel')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.employee_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isPersonBoundDecisionType(formData.decision_type, catalogPersonBoundKeys) &&
                !formData.employee_id.trim() && (
                <p className="text-xs text-destructive">
                  Loại QSĐ gắn người bắt buộc chọn nhân viên (không chỉ nhập tên).
                </p>
              )}
              {isDecisionEffectiveStatus(formData.status) &&
                isWorkHistoryNeoDecisionType(formData.decision_type, catalogWorkHistoryKeys) &&
                formData.employee_id.trim() && (
                  <p
                    className="text-xs text-xevn-textSecondary"
                    data-testid={HDSD_MUTATE_TEST_IDS.decisionsEffectiveWhHint}
                  >
                    Khi lưu trạng thái Hiệu lực, dòng lịch sử công tác gắn decision_id sẽ cập nhật —
                    F5 tab Quá trình công tác trên{' '}
                    <Link
                      to={`/employees/${formData.employee_id}`}
                      className="text-primary underline"
                    >
                      hồ sơ NV
                    </Link>
                    .
                  </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('decisions.employeeNameLabel')} <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('decisions.employeeCodeLabel')}</Label>
                <Input
                  value={formData.employee_code}
                  onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('decisions.departmentLabel')}</Label>
                <CatalogSearchPicker
                  options={departmentOptions}
                  value={formData.department_key}
                  onValueChange={(value) => setFormData({ ...formData, department_key: value })}
                  placeholder={t('decisions.departmentLabel')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={settingsCatalogCta}
                  aria-label={t('decisions.departmentLabel')}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {t('decisions.positionLabel')} <span className="text-destructive">*</span>
                </Label>
                <CatalogSearchPicker
                  options={positionOptions}
                  value={formData.position_key}
                  onValueChange={(value) => setFormData({ ...formData, position_key: value })}
                  placeholder={t('decisions.positionLabel')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={settingsCatalogCta}
                  aria-label={t('decisions.positionLabel')}
                  data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormPosition}
                />
                {!formData.position_key.trim() && (
                  <p className="text-xs text-destructive">
                    Bắt buộc chọn vị trí từ danh mục (không nhập tự do).
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('decisions.effectiveDateLabel')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.effective_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.effective_date ? format(formData.effective_date, 'dd/MM/yyyy') : t('decisions.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.effective_date}
                      onSelect={(date) => setFormData({ ...formData, effective_date: date })}
                      locale={calendarLocale}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('decisions.expiryDateLabel')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.expiry_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiry_date ? format(formData.expiry_date, 'dd/MM/yyyy') : t('decisions.selectDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expiry_date}
                      onSelect={(date) => setFormData({ ...formData, expiry_date: date })}
                      locale={calendarLocale}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('decisions.signerNameLabel')}</Label>
                <Input
                  value={formData.signer_name}
                  onChange={(e) => setFormData({ ...formData, signer_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('decisions.signerPositionLabel')}</Label>
                <CatalogSearchPicker
                  options={positionOptions}
                  value={formData.signer_position_key}
                  onValueChange={(value) => setFormData({ ...formData, signer_position_key: value })}
                  placeholder={t('decisions.signerPositionLabel')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={settingsCatalogCta}
                  aria-label={t('decisions.signerPositionLabel')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('decisions.signingDateLabel')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.signing_date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.signing_date ? format(formData.signing_date, 'dd/MM/yyyy') : t('decisions.select')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.signing_date}
                      onSelect={(date) => setFormData({ ...formData, signing_date: date })}
                      locale={calendarLocale}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('decisions.statusLabel')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormStatus}>
                  <SelectValue placeholder={t('decisions.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('decisions.contentLabel')}</Label>
              <Textarea
                placeholder={t('decisions.contentPlaceholder')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('decisions.notesLabel')}</Label>
              <Textarea
                placeholder={t('decisions.notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('decisions.fileAttachment')}</Label>
              {formData.file_url ? (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                  <File className="w-5 h-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFileName || t('decisions.attachedFile')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(formData.file_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploading}
                  />
                  <div className={cn(
                    "flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}>
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{t('decisions.uploading')}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>{t('decisions.dragOrClick')}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('decisions.supportedFormats')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('decisions.cancelBtn')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              data-testid={HDSD_MUTATE_TEST_IDS.decisionsFormSubmit}
            >
              {isSubmitting ? t('decisions.saving') : editingDecision ? t('decisions.update') : t('decisions.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('decisions.viewDetail')}</DialogTitle>
          </DialogHeader>
          {viewingDecision && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('decisions.decisionCodeLabel')}</Label>
                  <p className="font-medium">{viewingDecision.decision_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('decisions.decisionTypeLabel')}</Label>
                  <p className="font-medium">{getTypeLabel(viewingDecision.decision_type)}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('decisions.titleLabel')}</Label>
                <p className="font-medium">{viewingDecision.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('decisions.employeeNameLabel')}</Label>
                  <p className="font-medium">{viewingDecision.employee_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('decisions.employeeCodeLabel')}</Label>
                  <p className="font-medium">{viewingDecision.employee_code || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('decisions.departmentLabel')}</Label>
                  <p className="font-medium">
                    {viewingDecision.department_key
                      ? resolveDepartmentLabel(departmentOptions, viewingDecision.department_key)
                      : viewingDecision.department || '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('decisions.positionLabel')}</Label>
                  <p className="font-medium">
                    {resolvePositionDisplayLabel(
                      positionOptions,
                      viewingDecision.position_key,
                      viewingDecision.position,
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('decisions.effectiveDateLabel')}</Label>
                  <p className="font-medium">
                    {viewingDecision.effective_date
                      ? format(new Date(viewingDecision.effective_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('decisions.expiryDateLabel')}</Label>
                  <p className="font-medium">
                    {viewingDecision.expiry_date
                      ? format(new Date(viewingDecision.expiry_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('decisions.signerNameLabel')}</Label>
                  <p className="font-medium">{viewingDecision.signer_name || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('decisions.signerPositionLabel')}</Label>
                  <p className="font-medium">
                    {resolvePositionDisplayLabel(
                      positionOptions,
                      viewingDecision.signer_position_key,
                      viewingDecision.signer_position,
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('decisions.signingDateLabel')}</Label>
                  <p className="font-medium">
                    {viewingDecision.signing_date
                      ? format(new Date(viewingDecision.signing_date), 'dd/MM/yyyy')
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('decisions.statusLabel')}</Label>
                <div className="mt-1">{getStatusBadge(viewingDecision.status)}</div>
              </div>
              {viewingDecision.content && (
                <div>
                  <Label className="text-muted-foreground">{t('decisions.contentLabel')}</Label>
                  <p className="font-medium whitespace-pre-wrap">{viewingDecision.content}</p>
                </div>
              )}
              {viewingDecision.notes && (
                <div>
                  <Label className="text-muted-foreground">{t('decisions.notesLabel')}</Label>
                  <p className="font-medium">{viewingDecision.notes}</p>
                </div>
              )}
              {viewingDecision.file_url && (
                <div>
                  <Label className="text-muted-foreground">{t('decisions.fileAttachment')}</Label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(viewingDecision.file_url!, '_blank')}
                    >
                      <File className="w-4 h-4" />
                      {t('decisions.viewDownloadFile')}
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
           <AlertDialogHeader>
            <AlertDialogTitle>{t('decisions.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('decisions.deleteConfirmDesc')} "{deletingDecision?.decision_code}" 
              {t('decisions.cannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('decisions.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDecision && deleteMutation.mutate(deletingDecision.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('decisions.bulkDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('decisions.bulkDeleteConfirmDesc', { count: selectedDecisions.length })} 
              {t('decisions.cannotUndo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('decisions.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkDeleteMutation.mutate(selectedDecisions)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('decisions.deleteCount', { count: selectedDecisions.length })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
