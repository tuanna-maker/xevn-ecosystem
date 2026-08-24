/**
 * @CODE-MEMORY
 * Screen:     /contracts — danh sách + tạo/sửa HĐ
 * UC:         UF-HRM-08 / AC-CD-F5
 * BR:         Contract form fields from settings-catalogs; no salary on body (F5)
 * SRS:        docs/hrm/SRS.md § contracts
 * TechSpec:   CUSTOMER_DEMO_HRM_DELTA F5; cd-fb-03 perf audit FE-03
 * Purpose:    Contracts list/CRUD; form catalogs via shared RQ settings-catalogs cache.
 * WorkItem:   CD-FB-04-PERF-FIX / P1-HRM-PERF-FE-03
 * Coded:      2026-07-19
 * must_keep:  F5 HĐ/Đãi ngộ tabs ACs; dialog-deferred catalog fetch; U65 no seed
 * LastVerified: apps/web/hrm/src/hooks/p1-hrm-perf-fe-03.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-04-PERF-FIX
 * what: Replace contracts-settings-catalogs key with useSettingsCatalogsOverview
 * why: Deduplicate GET /settings-catalogs vs Settings + EmployeeForm (FE-03)
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-UX03-DEBOUNCE-01
 * change_mode: FIX
 * What: List search đã có onChange — thêm debounce 300ms (useDebouncedValue) khi lọc bảng
 * Why: UX-03 — cùng pattern Shifts; giảm filter thrash khi gõ
 * Spec: docs/program/UX-UI-ERP-ANALYSIS.md UX-03
 * must_keep: F5 HĐ/Đãi ngộ; dialog-deferred catalog; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-EMPTY-STATE-FE-01
 * change_mode: ADD
 * What: Wire EmptyState mood none/error vào list empty + load-fail (CTA VI)
 * Why: UX-10 Wave B — cấm bland «Không có dữ liệu» không actionable
 * Spec: docs/program/UX-UI-ERP-ANALYSIS.md § Wave B EmptyState
 * must_keep: F5 HĐ; U65; không đụng Payroll/Attendance/Profile
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E2-01
 * change_mode: ADD
 * What: Loại HĐ picker = contract_types code (CatalogSearchPicker); cấm HARDCODE fallback khi items>0
 * Why: FR-HRM-CI-TYPE-E2-01 · AC-E2-CI-PARITY-01 — parity Profile EmployeeContracts
 * must_keep: F5 salary off body; EmptyState; position_key E1-A ngoài page này
 *
 * @CODE-MEMORY-CHANGE 2026-08-01
 * WorkItem: D-HDSD-MUTATE-FE-07
 * change_mode: FIX
 * What: ensureContractCreateDates on dialog open + resolved type for hidden date fields gate
 * Why: QA RET-03-HRM-R4 — hdsd-contracts-form-ready timeout when catalog omits date columns
 * must_keep: TC-HDSD-08-02-01 leave 🟢; regression TC 04/05/10; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-08
 * change_mode: FIX
 * What: POST payload includes contract_code + position_key (E1-A); position resolved at submit
 * Why: QA RET-03-HRM-R5 — hdsd-contracts-form-ready 🟢 but POST 400 missing position_key
 * must_keep: FE-07 date prefill; TC-HDSD-08-02-01 leave 🟢
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-09
 * change_mode: FIX
 * What: isCreateFormReady cấm gate position_key — chỉ dates/employee/type; position_key vẫn trên POST
 * Why: QA R6 regression — position catalog chưa load trong 22s chặn hdsd-contracts-form-ready
 * must_keep: resolveContractCreatePositionKey on submit; FE-07 date prefill
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-FE-10
 * change_mode: FIX
 * What: resolveContractCreatePositionKey at submit with department snapshot; pass-through empKey when catalog miss
 * Why: QA R7 — form-ready 🟢 but no POST (position resolver returned null before API)
 * must_keep: FE-09 form-ready gate; FE-07 date prefill; TC-HDSD-08-02-01 leave 🟢
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Unblock Vite mount — restore EmptyState + contractCreatePayload chain (stash 43c479a)
 * Why: QA W5 HP-05 HĐ — /hr/contracts whitescreen · Contracts.tsx Vite 500
 * must_keep: EmptyState list/empty; HP-05 emp soft-link; Leave/LV-03/04 · AUTH/EMP/CAT
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-UC-TC-W4-FE-CI01-IFRAME-01
 * change_mode: FIX
 * What: Create CTA — type=button + dismiss-guard onOpenChange; iframe open latch testid;
 *       keep Dialog parent-portal (TECHSPEC §4.1). HDSD dialog nodes live on parent document.
 * Why: QA R-W4E4-CI01-IFRAME-DIALOG — frame-scoped query missed parent-portaled dialog
 *      (screenshot 03a already showed «Thêm hợp đồng mới» open on CC)
 * must_keep: /hr create path; Leave L2; DEPT VAL; U65 no seed; parent portal Dialog
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-CTR-CREATE-REDESIGN-FE-03
 * What: Create DialogContent parent portal ~90vw×90vh — omit portalScope iframe (SA Option A)
 * Why: BA-02 Q1-A · AC-CTR-UX-06/07 DnD same-document on CC URL
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-CONTRACT-LEGAL-PRINT-FE-01
 * change_mode: ADD
 * What: ContractPrintSpinePanel in create/edit dialog — pack/template + clause DnD + preview/PDF honesty
 * Why: FR-UC-BP-CORE-09b/c · UNICOM DnD lock · must_keep UF-HRM-02 registry CRUD
 * Spec: PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01 §D · DATA-01 §5.8–5.12
 * must_keep: UF-HRM-02 list CRUD; F5 salary off body; contracts_printable_ready=false; U65 no seed
 * solid_convention_ack: FE binds BE display-ready preview/clauses — no FE invent body
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * change_mode: ADD
 * What: Form field «Nơi làm việc» (`work_location`) create/edit + POST/PATCH — Đ.21.c
 * Why: QA-01-R2 R-CTR-PRINT-CAN-ISSUE — can_issue=false missing work_location
 * must_keep: UF-HRM-02 CRUD; Settings CL/TPL; FE-02 preview body no company_id; honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-E2E-LINK-EMP-FE-J03-01
 * change_mode: FIX
 * What: Eye row control — sr-only «Chi tiết» + hdsd-contracts-view-btn; view DialogContent
 *       testid; iframe latch hdsd-contracts-view-dialog-open (parent portal parity with create)
 * Why: R-J03-DIALOG — harness dialog=false (icon-only Eye + portaled dialog invisible in iframe)
 * Spec: PROGRAM_JOURNEY_MAP J-HRM-03 · QC GWC CONDITION
 * must_keep: UF-HRM-02 CRUD create/edit; print-spine; D1/D5 EMP sealed; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * change_mode: EXPAND
 * What: Persist template_code from open-catalog picker on create/update HĐ
 * Why: DYNAMIC LOCK AC-11 — any active template_code from API (not hardcode 8)
 * must_keep: UF-HRM-02 · print-spine · Q-CTR · printable=false · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01
 * change_mode: FIX
 * What: handleOpenEdit khôi phục printTemplateId/Code + pack từ contract row (không hard-clear)
 * Why: QC GWC R-CTR-XEVN-TPL-FE-EDIT-RESTORE — create bind #9 → F5 → Sửa hiện «— Chưa chọn —»
 * Spec: AC-CTR-XEVN-11 · DYNAMIC LOCK · docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-qc-02.md
 * must_keep: UF-HRM-02 · print-spine · Q-CTR CLOSED · open catalog · printable=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01
 * change_mode: ADD · preserve_default
 * What: Honesty banner 09a–d≠DONE · printable false · CORE-07 GATE/ACT RETAIN ·
 *       registry without template note (AC-CTR-XEVN-08) · statusLabelVi badge bind
 * Why: UC-BP-CORE-09 parent residual · J-HRM-CORE-09-01..06 · Nest /core DENY
 * must_keep: UF-HRM-02 · peers 09a–d · CORE-07/06 seals · Word OUT · U65 zero-seed
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 D-PO-HRM-CTR-VIEW-SYNC-01
 * change_mode: FIX
 * What: View dialog GET-by-id + parent-portal shell ~90vw; candidate_label · signing_date · trích yếu
 * Why: Stale list row snapshot in view — display-ready parity with list API (OS 28)
 * must_keep: UF-HRM-02 create wizard shell; J-HRM-03 view testids; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-SETTINGS-FIDELITY-FE-03
 * change_mode: FIX
 * What: activeFormFields via buildActiveContractFormFields — department spine when partial hrm_contract_form_fields
 * Why: SETFID02 UF-CTR-DEPT-CATALOG-PICKER — hasContractField('department') false hid ctr-create-department-picker
 * must_keep: departmentOptionsFromCatalog; UF-HRM-10 consumer matrix; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-WAVE-G3
 * change_mode: FIX · ADD
 * What: ContractWorkspaceDialog (create|edit|view); deep-link parseContractWorkspaceSearch;
 *       NV-first subject_type employee; thay inline view dialog; edit/view deep-link contractId
 * Why: BA G1/G3 · ADR workspace unified · J-HRM-03 view clause+PDF · REC «Tạo HĐ» CTA
 * must_keep: UF-HRM-02 · HDSD testids · clause body Settings only · contracts_printable_ready=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-FE-01
 * change_mode: FIX
 * What: resolveContractWorkspaceSearch (parent portal merge) · edit deep-link opens shell immediately
 * Why: DEF-CTR-G4-EDIT-DEEPLINK-P1 — CC URL ?workspace=edit not on iframe src; Step1 not mounted
 * must_keep: G3 workspace shell · view/create deep-links unchanged
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useContracts, type Contract, mapApiContract } from '@/hooks/useContracts';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { hrmStorageUploadStub, hrmStorageRemoveStub } from '@/lib/hrmStorageUploadStub';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { HrmListLoadBanner } from '@/components/hrm/HrmListLoadBanner';
import { EmptyState } from '@/components/hrm/EmptyState';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { ContractWorkspaceDialog } from '@/components/contracts/ContractWorkspaceDialog';
import type { ContractWorkspaceMode, ContractWorkspacePrefill } from '@/lib/contractWorkspaceDeepLink';
import { resolveContractWorkspaceSearch } from '@/lib/contractWorkspaceDeepLink';
import { resolveContractStatusLabelVi } from '@/lib/contractCore09Ring';
import {
  contractTypeOptionsFromCatalog,
  departmentOptionsFromCatalog,
  jobTitleOptionsFromCatalog,
  resolveContractTypeCatalogLabel,
  resolveContractTypeEditValue,
} from '@/lib/catalogSearchPicker';
import { resolveEmpDeptEditValue } from '@/lib/empDeptCatalog';
import { resolveContractCreatePositionKey } from '@/lib/contractCreatePayload';
import { restorePrintSpineFromContract } from '@/lib/contractPrintEditRestore';
import {
  HRM_LIST_LOAD_FAILED_SHORT,
  isListFetchFailureEmpty,
} from '@/lib/hrmListLoadFailure';
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
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Clock,
  GraduationCap,
  UserCheck,
  FileSignature,
  Pencil,
  CalendarIcon,
  Eye,
  FileUp,
  File,
  X,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ensureContractCreateDates,
  resolveContractTypeForDatePolicy,
  validateContractDatesForSubmit,
} from '@/lib/contractEndDatePolicy';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { ContractImportDialog } from '@/components/contract/ContractImportDialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  listEmployees,
  getEmployeeContractById,
  type HrmSettingsCatalogOverviewRow,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { EM_DASH, resolveContractStatusDisplay, resolveContractTypeDisplayLabel } from '@/lib/labelMaps';

interface FormData {
  contract_code: string;
  employee_name: string;
  employee_avatar: string;
  department: string;
  contract_type: string;
  effective_date: Date | undefined;
  expiry_date: Date | undefined;
  status: string;
  notes: string;
  file_url: string;
  employee_id?: string;
  /** Đ.21.c — Nơi làm việc (LEGAL-PRINT can_issue). */
  work_location: string;
}

const initialFormData: FormData = {
  contract_code: '',
  employee_name: '',
  employee_avatar: '',
  department: '',
  contract_type: '',
  effective_date: undefined,
  expiry_date: undefined,
  status: 'pending',
  notes: '',
  file_url: '',
  work_location: '',
};

const FILTER_TYPE_ICONS = [FileText, FileSignature, Clock, GraduationCap, UserCheck] as const;
const FILTER_TYPE_COLORS = [
  { color: 'bg-indigo-500', textColor: 'text-indigo-600' },
  { color: 'bg-emerald-500', textColor: 'text-emerald-600' },
  { color: 'bg-amber-500', textColor: 'text-amber-600' },
  { color: 'bg-cyan-500', textColor: 'text-cyan-600' },
  { color: 'bg-purple-500', textColor: 'text-purple-600' },
] as const;

import {
  buildActiveContractFormFields,
  type ContractFormFieldKey,
  isContractCreateWizardFormReady,
} from '@/components/contracts/contractFormFieldResolver';

function findCatalog(catalogs: HrmSettingsCatalogOverviewRow[], keys: string[]) {
  return catalogs.find((c) => keys.includes(c.catalogKey.toLowerCase()));
}

const getStatusOptions = (t: any) => [
  { value: 'pending', label: t('contracts.statuses.pending') },
  { value: 'active', label: t('contracts.statuses.active') },
  { value: 'expired', label: t('contracts.statuses.expired') },
  { value: 'terminated', label: t('contracts.statuses.terminated') },
];

const getStatusBadge = (
  status: string,
  t: any,
  statusLabelVi?: string | null,
) => {
  const config: Record<string, { labelKey: string; className: string }> = {
    active: { labelKey: 'contracts.statuses.active', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0' },
    pending: { labelKey: 'contracts.statuses.pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0' },
    expired: { labelKey: 'contracts.statuses.expired', className: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0' },
    terminated: { labelKey: 'contracts.statuses.terminated', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-0' },
  };
  const hit = config[status];
  // R-CORE-09-DISP-01 — prefer BE/FE-derive statusLabelVi; U72 fail-closed → «—»
  const derived = resolveContractStatusLabelVi(status, statusLabelVi);
  const i18nLabel = hit ? t(hit.labelKey) : null;
  const label =
    (statusLabelVi && String(statusLabelVi).trim()) ||
    (derived && derived !== '—' ? derived : null) ||
    i18nLabel ||
    resolveContractStatusDisplay(status) ||
    EM_DASH;
  const className = hit?.className ?? 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-0';
  return <Badge className={className}>{label || EM_DASH}</Badge>;
};

export default function Contracts() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const STATUS_OPTIONS = getStatusOptions(t);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterEffectiveDateFrom, setFilterEffectiveDateFrom] = useState<Date | undefined>();
  const [filterEffectiveDateTo, setFilterEffectiveDateTo] = useState<Date | undefined>();
  const [filterExpiryDateFrom, setFilterExpiryDateFrom] = useState<Date | undefined>();
  const [filterExpiryDateTo, setFilterExpiryDateTo] = useState<Date | undefined>();
  
  // Dialog states — unified workspace (create|edit|view)
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<ContractWorkspaceMode>('create');
  const [workspacePrefill, setWorkspacePrefill] = useState<ContractWorkspacePrefill | undefined>();
  const [viewingContractId, setViewingContractId] = useState<string | null>(null);
  /** Ignore Radix outside-dismiss for a short window after CTA open (CC iframe → parent portal). */
  const dialogOpenGuardUntilRef = useRef(0);
  /** Pending edit deep-link fetch when shell opened before companyId or list row ready. */
  const editDeepLinkContractIdRef = useRef<string | null>(null);
  const editDeepLinkFetchStartedRef = useRef<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  /** LEGAL-PRINT — pack/template overlay (registry CRUD must_keep). */
  const [printPackCode, setPrintPackCode] = useState('GENERAL');
  const [printTemplateId, setPrintTemplateId] = useState('');
  const [printTemplateCode, setPrintTemplateCode] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // P1-HRM-CON-PERF-01: defer catalogs/employee picker until create/edit dialog
  const needsFormLookups = workspaceOpen && workspaceMode !== 'view';
  const needsEmployeePicker = needsFormLookups && !editingContract;

  const { data: employeesList = [] } = useQuery({
    queryKey: ['contracts-employees-picker', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      // Single page for picker — avoid listAllEmployees full fan-out on mount
      const res = await listEmployees({
        company_id: currentCompanyId,
        page: 1,
        page_size: 100,
      });
      return res.data ?? [];
    },
    enabled: !!currentCompanyId && needsEmployeePicker,
    staleTime: 60_000,
  });

  const location = useLocation();

  const handleWorkspaceOpenChange = (open: boolean) => {
    if (!open && Date.now() < dialogOpenGuardUntilRef.current) {
      return;
    }
    setWorkspaceOpen(open);
    if (!open) {
      setViewingContractId(null);
      setWorkspacePrefill(undefined);
      setEditingContract(null);
      editDeepLinkContractIdRef.current = null;
      editDeepLinkFetchStartedRef.current = null;
      setFormData(initialFormData);
      setSelectedFile(null);
      setPrintPackCode('GENERAL');
      setPrintTemplateId('');
      setPrintTemplateCode('');
    }
  };

  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview({
    enabled: true, // filter chips + form need contract_types (E2 parity)
  });
  const formFieldsCatalog = findCatalog(catalogs, ['hrm_contract_form_fields', 'contract_form_fields']);
  const contractStatusesCatalog = findCatalog(catalogs, ['contract_statuses', 'hrm_contract_statuses']);

  const activeFormFields = useMemo(
    () => buildActiveContractFormFields(formFieldsCatalog),
    [formFieldsCatalog],
  );
  const hasContractField = (field: ContractFormFieldKey) => activeFormFields.has(field);

  /** Persist code — AC-E2-CI-PARITY-01; empty catalog → [] (no HARDCODE SoT). */
  const contractTypePickerOptions = useMemo(
    () => contractTypeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const positionPickerOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const contractTypes = useMemo(() => {
    const all = {
      key: 'all',
      label: t('contracts.types.all'),
      icon: LayoutDashboard,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    };
    const fromCatalog = contractTypePickerOptions.map((opt, idx) => {
      const style = FILTER_TYPE_COLORS[idx % FILTER_TYPE_COLORS.length];
      const Icon = FILTER_TYPE_ICONS[idx % FILTER_TYPE_ICONS.length];
      return {
        key: opt.value,
        label: opt.label,
        icon: Icon,
        color: style.color,
        textColor: style.textColor,
      };
    });
    return [all, ...fromCatalog];
  }, [contractTypePickerOptions, t]);

  const displayContractType = (code: string | null | undefined) => {
    const fromCatalog = resolveContractTypeCatalogLabel(contractTypePickerOptions, code);
    if (fromCatalog !== '—') return fromCatalog;
    return resolveContractTypeDisplayLabel(code);
  };
  const statusOptions = useMemo(() => {
    const fromCatalog = (contractStatusesCatalog?.effectiveItems ?? [])
      .filter((item) => item.status === 'active')
      .map((item) => ({ value: item.code, label: item.label }));
    if (fromCatalog.length > 0) return fromCatalog;
    return STATUS_OPTIONS;
  }, [contractStatusesCatalog, STATUS_OPTIONS]);

  const departmentPickerOptions = useMemo(
    () => departmentOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employeesList.find((e) => e.id === employeeId);
    if (emp) {
      setFormData((prev) => ({
        ...prev,
        employee_id: employeeId,
        employee_name: emp.full_name,
        employee_avatar: (emp as { avatar_url?: string }).avatar_url || '',
        department:
          (emp.custom_fields as { department?: string } | undefined)?.department ||
          emp.job_title_key ||
          '',
      }));
    }
  };

  /** BA-02 Q6 — mặc định ứng viên; không auto-prefill NV đầu danh sách khi mở tạo mới. */

  /** D-HDSD-MUTATE-FE-04 — contract_types catalog may load after dialog open; prefill first type. */
  useEffect(() => {
    if (!workspaceOpen || editingContract || !activeFormFields.has('contract_type')) return;
    if (formData.contract_type.trim()) return;
    const firstType = contractTypePickerOptions[0]?.value;
    if (!firstType) return;
    setFormData((prev) => ({ ...prev, contract_type: firstType }));
  }, [
    workspaceOpen,
    editingContract,
    contractTypePickerOptions,
    formData.contract_type,
    activeFormFields,
  ]);

  /** PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03 — Sửa: label → catalog code when EFF loads. */
  useEffect(() => {
    if (!workspaceOpen || !editingContract || !activeFormFields.has('contract_type')) return;
    const catalogBound = contractTypePickerOptions.length > 0;
    const resolved = resolveContractTypeEditValue(
      contractTypePickerOptions,
      formData.contract_type || editingContract.contract_type,
      catalogBound,
    );
    if (!resolved || resolved === formData.contract_type) return;
    setFormData((prev) =>
      prev.contract_type === resolved ? prev : { ...prev, contract_type: resolved },
    );
  }, [
    workspaceOpen,
    editingContract,
    contractTypePickerOptions,
    formData.contract_type,
    activeFormFields,
  ]);

  /** D-HDSD-MUTATE-FE-07 — always prefill dates on open; do not wait for contract_type catalog. */
  useEffect(() => {
    if (!workspaceOpen || editingContract) return;

    setFormData((prev) => {
      const pickerValues = contractTypePickerOptions.map((o) => o.value);
      const { effective_date, expiry_date } = ensureContractCreateDates({
        effectiveDate: prev.effective_date,
        expiryDate: prev.expiry_date,
        contractType: prev.contract_type,
        pickerOptionValues: pickerValues,
      });
      if (
        prev.effective_date === effective_date &&
        prev.expiry_date === expiry_date
      ) {
        return prev;
      }
      return {
        ...prev,
        effective_date,
        expiry_date,
      };
    });
  }, [workspaceOpen, editingContract, formData.contract_type, contractTypePickerOptions]);

  const isCreateFormReady = useMemo(
    () =>
      isContractCreateWizardFormReady({
        editing: Boolean(editingContract),
        catalogsLoading,
      }),
    [editingContract, catalogsLoading],
  );

  const {
    contracts,
    totalCount,
    isLoading,
    isLoadingMore,
    fetchError,
    refetch,
    createContract,
    updateContract,
    deleteContract,
    bulkDeleteContracts,
  } = useContracts(selectedType);

  const loadFailedEmpty = isListFetchFailureEmpty(fetchError, contracts.length);

  const handleOpenCreate = (prefill?: ContractWorkspacePrefill) => {
    setWorkspaceMode('create');
    setWorkspacePrefill(prefill);
    setEditingContract(null);
    setViewingContractId(null);
    setSelectedFile(null);
    setPrintPackCode('GENERAL');
    setPrintTemplateId('');
    setPrintTemplateCode(prefill?.template_code?.trim() ?? '');
    const stamp = `HD-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const defaultContractType = contractTypePickerOptions[0]?.value ?? '';
    const pickerValues = contractTypePickerOptions.map((o) => o.value);
    const { effective_date: effectiveDate, expiry_date: expiryDate } = ensureContractCreateDates({
      effectiveDate: new Date(),
      expiryDate: undefined,
      contractType: defaultContractType,
      pickerOptionValues: pickerValues,
    });
    const baseForm = {
      ...initialFormData,
      contract_code: stamp,
      contract_type: defaultContractType,
      effective_date: effectiveDate,
      expiry_date: expiryDate,
    };
    const empId = prefill?.employee_id?.trim();
    if (empId) {
      const emp = employeesList.find((e) => e.id === empId);
      setFormData({
        ...baseForm,
        employee_id: empId,
        employee_name: emp?.full_name ?? '',
        employee_avatar: (emp as { avatar_url?: string } | undefined)?.avatar_url || '',
        department:
          (emp?.custom_fields as { department?: string } | undefined)?.department ||
          emp?.job_title_key ||
          '',
      });
    } else {
      setFormData(baseForm);
    }
    dialogOpenGuardUntilRef.current = Date.now() + 400;
    setWorkspaceOpen(true);
  };

  const handleOpenEdit = (contract: Contract) => {
    setWorkspaceMode('edit');
    setWorkspacePrefill(undefined);
    setEditingContract(contract);
    setViewingContractId(null);
    // AC-CTR-XEVN-11 / R-CTR-XEVN-TPL-FE-EDIT-RESTORE — restore bind after F5 (cấm hard-clear)
    const printRestore = restorePrintSpineFromContract(contract);
    setPrintPackCode(printRestore.packCode);
    setPrintTemplateId(printRestore.templateId);
    setPrintTemplateCode(printRestore.templateCode);
    setFormData({
      contract_code: contract.contract_code,
      employee_name: contract.employee_name,
      employee_avatar: contract.employee_avatar || '',
      department: resolveEmpDeptEditValue(
        departmentPickerOptions,
        contract.department_key ?? contract.department,
        departmentPickerOptions.length > 0,
      ),
      contract_type: resolveContractTypeEditValue(
        contractTypePickerOptions,
        contract.contract_type,
        contractTypePickerOptions.length > 0,
      ),
      effective_date: contract.effective_date ? new Date(contract.effective_date) : undefined,
      expiry_date: contract.expiry_date ? new Date(contract.expiry_date) : undefined,
      status: contract.status,
      notes: contract.notes || '',
      file_url: contract.file_url || '',
      employee_id: contract.employee_id,
      work_location: contract.work_location || '',
      pack_code: printRestore.packCode,
      template_id: printRestore.templateId || undefined,
      template_code: printRestore.templateCode || undefined,
    });
    setSelectedFile(null);
    dialogOpenGuardUntilRef.current = Date.now() + 400;
    setWorkspaceOpen(true);
  };

  const handleOpenView = (contract: Contract) => {
    setWorkspaceMode('view');
    setWorkspacePrefill(undefined);
    setEditingContract(null);
    setViewingContractId(contract.id);
    dialogOpenGuardUntilRef.current = Date.now() + 400;
    setWorkspaceOpen(true);
  };

  const handleOpenDelete = (contract: Contract) => {
    setDeletingContract(contract);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setWorkspaceOpen(false);
    setEditingContract(null);
    setViewingContractId(null);
    setWorkspacePrefill(undefined);
    setFormData(initialFormData);
    setSelectedFile(null);
    setPrintPackCode('');
    setPrintTemplateId('');
    setPrintTemplateCode('');
  };

  useEffect(() => {
    const parsed = resolveContractWorkspaceSearch(location.search);
    if (!parsed.mode) return;

    if (parsed.mode === 'view' && parsed.contractId) {
      if (workspaceOpen && workspaceMode === 'view' && viewingContractId === parsed.contractId) {
        return;
      }
      setWorkspaceMode('view');
      setViewingContractId(parsed.contractId);
      setWorkspacePrefill(parsed.prefill);
      setEditingContract(null);
      editDeepLinkContractIdRef.current = null;
      dialogOpenGuardUntilRef.current = Date.now() + 400;
      setWorkspaceOpen(true);
      return;
    }

    if (parsed.mode === 'edit' && parsed.contractId) {
      const contractId = parsed.contractId;
      const fromList = contracts.find((c) => c.id === contractId);
      if (fromList) {
        editDeepLinkContractIdRef.current = null;
        handleOpenEdit(fromList);
        return;
      }
      if (!workspaceOpen || workspaceMode !== 'edit') {
        setWorkspaceMode('edit');
        setWorkspacePrefill(parsed.prefill);
        setViewingContractId(null);
        setEditingContract(null);
        dialogOpenGuardUntilRef.current = Date.now() + 400;
        setWorkspaceOpen(true);
      }
      if (editingContract?.id === contractId) {
        editDeepLinkContractIdRef.current = null;
        return;
      }
      if (!currentCompanyId) {
        editDeepLinkContractIdRef.current = contractId;
        return;
      }
      if (editDeepLinkFetchStartedRef.current === contractId) {
        return;
      }
      editDeepLinkContractIdRef.current = contractId;
      editDeepLinkFetchStartedRef.current = contractId;
      void (async () => {
        try {
          const row = await getEmployeeContractById(contractId, currentCompanyId);
          handleOpenEdit(mapApiContract(row));
          editDeepLinkContractIdRef.current = null;
          editDeepLinkFetchStartedRef.current = null;
        } catch {
          editDeepLinkContractIdRef.current = null;
          editDeepLinkFetchStartedRef.current = null;
          toast.error('Không mở được workspace sửa hợp đồng.');
          setWorkspaceOpen(false);
        }
      })();
      return;
    }

    if (parsed.mode === 'create' && !workspaceOpen) {
      editDeepLinkContractIdRef.current = null;
      handleOpenCreate(parsed.prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep-link on search + contracts list hydrate
  }, [location.search, currentCompanyId, contracts, workspaceOpen, workspaceMode, viewingContractId, editingContract]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('contracts.fileMaxSize'));
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('contracts.fileTypeError'));
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      return await hrmStorageUploadStub(file, 'contracts-file');
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const removeExistingFile = async (_fileUrl: string) => {
    hrmStorageRemoveStub('contracts-file');
  };

  const handleSubmit = async () => {
    if (!formData.contract_code || !formData.employee_name) {
      toast.error(t('contracts.requiredFields'));
      return;
    }
    if (hasContractField('contract_type')) {
      if (!formData.contract_type.trim()) {
        toast.error(t('contracts.selectType'));
        return;
      }
      if (
        contractTypePickerOptions.length > 0 &&
        !contractTypePickerOptions.some((o) => o.value === formData.contract_type)
      ) {
        toast.error('Chọn loại hợp đồng từ danh mục (Cài đặt → Loại HĐ).');
        return;
      }
      if (contractTypePickerOptions.length === 0) {
        toast.error('Danh mục loại hợp đồng trống — mở Cài đặt → Danh mục nghiệp vụ.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let fileUrl = formData.file_url;
      
      // Upload new file if selected
      if (selectedFile) {
        setIsUploading(true);
        const uploadedUrl = await uploadFile(selectedFile);
        if (uploadedUrl) {
          // Remove old file if editing and had a previous file
          if (editingContract?.file_url) {
            await removeExistingFile(editingContract.file_url);
          }
          fileUrl = uploadedUrl;
        } else {
          toast.error(t('contracts.uploadError'));
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        }
        setIsUploading(false);
      }

      const pickerValues = contractTypePickerOptions.map((o) => o.value);
      const contractTypeCode = resolveContractTypeEditValue(
        contractTypePickerOptions,
        formData.contract_type,
        contractTypePickerOptions.length > 0,
      );
      const resolvedType = resolveContractTypeForDatePolicy(
        contractTypeCode || formData.contract_type,
        pickerValues,
      );
      const { effective_date, expiry_date } = ensureContractCreateDates({
        effectiveDate: formData.effective_date,
        expiryDate: formData.expiry_date,
        contractType: resolvedType,
        pickerOptionValues: pickerValues,
      });
      const selectedEmp = employeesList.find((e) => e.id === formData.employee_id);
      const posResolved = resolveContractCreatePositionKey({
        employeeJobTitleKey: selectedEmp?.job_title_key,
        positionOptions: positionPickerOptions,
        departmentSnapshot: formData.department || selectedEmp?.job_title_key,
        employeeCodeSnapshot: selectedEmp?.employee_code,
      });
      if (!posResolved) {
        toast.error('Chọn vị trí từ danh mục chức danh (Cài đặt → Danh mục nghiệp vụ).');
        setIsSubmitting(false);
        return;
      }
      const dataWithFile = {
        ...formData,
        file_url: fileUrl,
        contract_type: contractTypeCode.trim() || resolvedType,
        effective_date,
        expiry_date,
        position_key: posResolved.position_key,
        position: posResolved.position,
        pack_code: printPackCode,
        template_id: printTemplateId || undefined,
        template_code: printTemplateCode || undefined,
      };

      if (editingContract) {
        const ok = await updateContract(editingContract, dataWithFile);
        if (ok) handleCloseDialog();
      } else {
        const ok = await createContract(dataWithFile);
        if (ok) handleCloseDialog();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = filterStatus.length > 0 || 
    filterEffectiveDateFrom || filterEffectiveDateTo || 
    filterExpiryDateFrom || filterExpiryDateTo;

  const clearAllFilters = () => {
    setFilterStatus([]);
    setFilterEffectiveDateFrom(undefined);
    setFilterEffectiveDateTo(undefined);
    setFilterExpiryDateFrom(undefined);
    setFilterExpiryDateTo(undefined);
    setCurrentPage(1);
  };

  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
    setCurrentPage(1);
  };

  const filteredContracts = contracts.filter((contract) => {
    // Search filter (debounced — Input value vẫn tức thì)
    const q = debouncedSearchQuery.toLowerCase();
    const matchesSearch = contract.employee_name.toLowerCase().includes(q) ||
      contract.contract_code.toLowerCase().includes(q) ||
      (contract.department?.toLowerCase().includes(q) ?? false);
    
    if (!matchesSearch) return false;

    // Status filter
    if (filterStatus.length > 0 && !filterStatus.includes(contract.status)) {
      return false;
    }

    // Effective date filter
    if (filterEffectiveDateFrom && contract.effective_date) {
      const effectiveDate = new Date(contract.effective_date);
      if (effectiveDate < filterEffectiveDateFrom) return false;
    }
    if (filterEffectiveDateTo && contract.effective_date) {
      const effectiveDate = new Date(contract.effective_date);
      if (effectiveDate > filterEffectiveDateTo) return false;
    }

    // Expiry date filter
    if (filterExpiryDateFrom && contract.expiry_date) {
      const expiryDate = new Date(contract.expiry_date);
      if (expiryDate < filterExpiryDateFrom) return false;
    }
    if (filterExpiryDateTo && contract.expiry_date) {
      const expiryDate = new Date(contract.expiry_date);
      if (expiryDate > filterExpiryDateTo) return false;
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedContracts([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedContracts([]);
  };

  // Generate page numbers for pagination
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

  const typeCounts = contractTypes.map((type) => ({
    ...type,
    count: loadFailedEmpty
      ? 0
      : type.key === 'all'
        ? totalCount || contracts.length
        : contracts.filter((c) => c.contract_type === type.key).length,
  }));

  const toggleSelectAll = () => {
    if (selectedContracts.length === filteredContracts.length) {
      setSelectedContracts([]);
    } else {
      setSelectedContracts(filteredContracts.map((c) => c.id));
    }
  };

  const toggleSelectContract = (id: string) => {
    setSelectedContracts((prev) =>
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

  const getStatusLabel = (status: string) => {
    const mapped = resolveContractStatusDisplay(status);
    if (mapped !== EM_DASH) return mapped;
    const i18n = t(`contracts.statuses.${status}`);
    // i18n miss often echoes key path — fail-closed to «—»
    if (!i18n || i18n === `contracts.statuses.${status}`) return EM_DASH;
    return i18n;
  };

  const handleExportExcel = () => {
    if (filteredContracts.length === 0) {
      toast.error(t('contracts.noExportData'));
      return;
    }

    const exportData = filteredContracts.map((contract, index) => ({
      [t('contracts.exNo')]: index + 1,
      [t('contracts.exCode')]: contract.contract_code,
      [t('contracts.exEmployee')]: contract.employee_name,
      [t('contracts.exDepartment')]: contract.department || '',
      [t('contracts.exType')]: displayContractType(contract.contract_type),
      [t('contracts.exEffective')]: contract.effective_date 
        ? format(new Date(contract.effective_date), 'dd/MM/yyyy') 
        : '',
      [t('contracts.exExpiry')]: contract.expiry_date 
        ? format(new Date(contract.expiry_date), 'dd/MM/yyyy') 
        : '',
      [t('contracts.exStatus')]: getStatusLabel(contract.status),
      [t('contracts.exCreatedBy')]: contract.created_by || '',
      [t('contracts.exCreatedAt')]: format(new Date(contract.created_at), 'dd/MM/yyyy HH:mm'),
      [t('contracts.exNotes')]: contract.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('contracts.exSheetName'));
    
    const fileName = `contracts_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success(t('contracts.exportedCount', { count: filteredContracts.length }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b bg-card">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-xevn-text truncate">Hợp đồng (Contracts)</h1>
          <div className="flex items-center gap-2 mt-1">
          <PermissionGate module="contracts" action="create">
            <Button
              type="button"
              size="sm"
              className="gap-2"
              data-testid={HDSD_MUTATE_TEST_IDS.contractsCreateBtn}
              aria-label="Thêm hợp đồng"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenCreate();
              }}
            >
              <Plus className="w-4 h-4" />
              <span>{t('contracts.addContract', 'Thêm hợp đồng')}</span>
            </Button>
          </PermissionGate>
          </div>
          <p className="text-[11px] text-muted-foreground max-w-xl" data-testid="ctr-create-list-hint">
            AC-CTR-XEVN-08: có thể lưu sổ đăng ký không bắt buộc chọn mẫu in.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('contracts.search')}
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
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('contracts.advancedFilter')}</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
                      {t('contracts.clearAll')}
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('contracts.statusLabel')}</Label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        variant={filterStatus.includes(status.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatusFilter(status.value)}
                        className="h-7 text-xs"
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Effective Date Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('contracts.effectiveDate')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterEffectiveDateFrom && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterEffectiveDateFrom ? format(filterEffectiveDateFrom, 'dd/MM/yyyy') : t('contracts.fromDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterEffectiveDateFrom}
                          onSelect={setFilterEffectiveDateFrom}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterEffectiveDateTo && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterEffectiveDateTo ? format(filterEffectiveDateTo, 'dd/MM/yyyy') : t('contracts.toDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterEffectiveDateTo}
                          onSelect={setFilterEffectiveDateTo}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Expiry Date Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('contracts.expiryDate')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterExpiryDateFrom && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterExpiryDateFrom ? format(filterExpiryDateFrom, 'dd/MM/yyyy') : t('contracts.fromDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterExpiryDateFrom}
                          onSelect={setFilterExpiryDateFrom}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'justify-start text-left font-normal h-8 text-xs',
                            !filterExpiryDateTo && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {filterExpiryDateTo ? format(filterExpiryDateTo, 'dd/MM/yyyy') : t('contracts.toDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filterExpiryDateTo}
                          onSelect={setFilterExpiryDateTo}
                          locale={vi}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => setFilterPopoverOpen(false)}
                >
                  {t('contracts.applyFilter')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <PermissionGate module="contracts" action="export">
            <Button variant="outline" size="icon" onClick={handleExportExcel} title="Xuất Excel">
              <Download className="w-4 h-4" />
            </Button>
          </PermissionGate>
          <PermissionGate module="contracts" action="create">
            <Button variant="outline" size="icon" onClick={() => setImportDialogOpen(true)}>
              <Upload className="w-4 h-4" />
            </Button>
          </PermissionGate>
          <PermissionGate module="contracts" action="delete">
            <Button 
              variant="outline" 
              size="icon" 
              className="text-destructive"
              disabled={selectedContracts.length === 0}
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* P1-HRM-CON-PERF-01: error / retry — never silent empty on RATE-429 / non-2xx */}
      {(fetchError || isLoading || isLoadingMore) && (
        <div className="px-4 md:px-6 pt-4 space-y-2">
          <HrmListLoadBanner
            isLoading={isLoading || isLoadingMore}
            loadFailed={Boolean(fetchError)}
            errorMessage={fetchError}
            loadingMessage={
              isLoadingMore && !isLoading
                ? t('contracts.loadingMore', 'Đang tải thêm hợp đồng…')
                : t('contracts.loadingApi', 'Đang tải danh sách hợp đồng…')
            }
          />
          {fetchError ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              {t('common.retry', 'Thử lại')}
            </Button>
          ) : null}
        </div>
      )}

      {/* Horizontal Menu with Colored Icons */}
      <div className="px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-2 overflow-x-auto">
          {typeCounts.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.key;
            return (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  isSelected
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded flex items-center justify-center',
                  type.color
                )}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{type.label}</span>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {loadFailedEmpty
                    ? t('contracts.loadFailedShort', HRM_LIST_LOAD_FAILED_SHORT)
                    : type.count}
                </span>
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
                  checked={
                    filteredContracts.length > 0 &&
                    selectedContracts.length === filteredContracts.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>{t('contracts.tableCode')}</TableHead>
              <TableHead>{t('contracts.tableEmployee')}</TableHead>
              <TableHead>{t('contracts.tableDepartment')}</TableHead>
              <TableHead>{t('contracts.tableType')}</TableHead>
              <TableHead>{t('contracts.tableEffective')}</TableHead>
              <TableHead>{t('contracts.tableExpiry')}</TableHead>
              <TableHead>{t('contracts.tableStatus')}</TableHead>
              <TableHead className="w-28">{t('contracts.tableActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10">
                  {t('contracts.loading')}
                </TableCell>
              </TableRow>
            ) : loadFailedEmpty ? (
              <TableRow>
                <TableCell colSpan={9} className="py-6">
                  <EmptyState
                    mood="error"
                    data-testid="contracts-list-empty-error"
                    title={t(
                      'contracts.loadFailed',
                      'Không tải được danh sách hợp đồng',
                    )}
                    description={
                      fetchError ||
                      t(
                        'contracts.loadFailedHint',
                        'Kiểm tra kết nối hoặc thử lại. Nếu vẫn lỗi, liên hệ hỗ trợ.',
                      )
                    }
                    actionLabel={t('common.retry', 'Thử lại')}
                    onAction={() => void refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : paginatedContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-6">
                  <EmptyState
                    mood="none"
                    data-testid="contracts-list-empty"
                    title={t('contracts.noData', 'Chưa có hợp đồng')}
                    description={
                      hasActiveFilters || debouncedSearchQuery
                        ? t(
                            'contracts.emptyFilteredHint',
                            'Không có hợp đồng khớp bộ lọc. Xóa bộ lọc hoặc đổi từ khóa tìm kiếm.',
                          )
                        : t(
                            'contracts.emptyHint',
                            'Thêm hợp đồng đầu tiên để bắt đầu quản lý lao động.',
                          )
                    }
                    actionLabel={
                      hasActiveFilters || debouncedSearchQuery
                        ? t('contracts.clearFilters', 'Xóa bộ lọc')
                        : t('contracts.addContract', 'Thêm hợp đồng')
                    }
                    onAction={
                      hasActiveFilters || debouncedSearchQuery
                        ? () => {
                            setSearchQuery('');
                            clearAllFilters();
                          }
                        : handleOpenCreate
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedContracts.map((contract) => (
                <TableRow 
                  key={contract.id}
                  className={cn(
                    selectedContracts.includes(contract.id) && 'bg-primary/5',
                    'cursor-pointer',
                  )}
                  onClick={() => handleOpenView(contract)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedContracts.includes(contract.id)}
                      onCheckedChange={() => toggleSelectContract(contract.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-primary">
                    <button
                      type="button"
                      className="hover:underline text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenView(contract);
                      }}
                    >
                      {contract.contract_code}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={contract.employee_avatar || undefined} />
                        <AvatarFallback className="bg-amber-100  hidden  text-xs">
                          {getInitials(contract.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      {contract.employee_id ? (
                        <Link 
                          to={hrmPathWithEmbedSearch(`/employees/${contract.employee_id}`)}
                          className="font-medium text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contract.employee_name}
                        </Link>
                      ) : (
                        <span className="font-medium">
                          {contract.employee_name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contract.department || '-'}
                  </TableCell>
                  <TableCell>{displayContractType(contract.contract_type)}</TableCell>
                  <TableCell>
                    {contract.effective_date
                      ? format(new Date(contract.effective_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {contract.expiry_date
                      ? format(new Date(contract.expiry_date), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contract.status, t, contract.statusLabelVi)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        data-testid={HDSD_MUTATE_TEST_IDS.contractsViewBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenView(contract);
                        }}
                        aria-label={t('contracts.viewTitle')}
                        title={t('contracts.viewTitle')}
                      >
                        <Eye className="w-4 h-4" aria-hidden />
                        {/* Accessible text for U65 harness hasText /Chi tiết|Xem/ (icon-only missed). */}
                        <span className="sr-only">{t('contracts.viewTitle')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(contract)}
                        aria-label={t('contracts.editTitle')}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleOpenDelete(contract)}
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
            {t('contracts.showing', {
              from: loadFailedEmpty
                ? 0
                : filteredContracts.length > 0
                  ? startIndex + 1
                  : 0,
              to: loadFailedEmpty
                ? 0
                : Math.min(endIndex, filteredContracts.length),
              total: loadFailedEmpty
                ? t('contracts.loadFailedShort', HRM_LIST_LOAD_FAILED_SHORT)
                : filteredContracts.length,
            })}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('contracts.rowsPerPage')}</span>
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

      {currentCompanyId ? (
        <ContractWorkspaceDialog
          open={workspaceOpen}
          onOpenChange={handleWorkspaceOpenChange}
          mode={workspaceMode}
          companyId={currentCompanyId}
          companyIdsForScope={[currentCompanyId, 'main']}
          editingContract={editingContract}
          prefill={workspacePrefill}
          form={{
            contract_code: formData.contract_code,
            employee_name: formData.employee_name,
            employee_id: formData.employee_id,
            department: formData.department,
            contract_type: formData.contract_type,
            effective_date: formData.effective_date,
            expiry_date: formData.expiry_date,
            status: formData.status,
            notes: formData.notes,
            work_location: formData.work_location,
          }}
          onFormChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          contractTypeOptions={contractTypePickerOptions}
          positionOptions={positionPickerOptions}
          departmentOptions={departmentPickerOptions}
          statusOptions={statusOptions}
          employeesList={employeesList}
          onEmployeeSelect={handleEmployeeSelect}
          hasContractField={hasContractField}
          catalogsLoading={catalogsLoading}
          catalogsError={catalogsError}
          isCreateFormReady={isCreateFormReady}
          packCode={printPackCode}
          templateId={printTemplateId}
          templateCode={printTemplateCode}
          onPackCodeChange={setPrintPackCode}
          onTemplateIdChange={setPrintTemplateId}
          onTemplateCodeChange={setPrintTemplateCode}
          onClose={handleCloseDialog}
          onSaved={() => {
            void refetch();
            handleCloseDialog();
          }}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          viewContractId={viewingContractId}
          displayContractType={displayContractType}
          renderStatusBadge={(contract) =>
            getStatusBadge(contract.status, t, contract.statusLabelVi)
          }
          onEditFromView={(contract) => handleOpenEdit(contract)}
          dialogOpenGuardUntilRef={dialogOpenGuardUntilRef}
        />
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.confirmDeleteDesc', { code: deletingContract?.contract_code, name: deletingContract?.employee_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('contracts.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deletingContract) return;
                const ok = await deleteContract(deletingContract);
                if (ok) {
                  setDeleteDialogOpen(false);
                  setDeletingContract(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('contracts.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('contracts.confirmBulkDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('contracts.confirmBulkDeleteDesc', { count: selectedContracts.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('contracts.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const contractsToDelete = contracts.filter((c) =>
                  selectedContracts.includes(c.id),
                );
                const ok = await bulkDeleteContracts(contractsToDelete);
                if (ok) {
                  setBulkDeleteDialogOpen(false);
                  setSelectedContracts([]);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('contracts.deleteCount', { count: selectedContracts.length })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <ContractImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}