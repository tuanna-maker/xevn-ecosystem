/**
 * @CODE-MEMORY
 * Screen:     /employees/:id — Hồ sơ nhân viên
 * UC:         UC/FR-HRM-U72-LABEL-01 · AC-FD-01 · AC-FD-02 · AC-FD-U02
 * BR:         BR-CO-LABEL-01 · BR-U72-NULL-01
 * SRS:        docs/hrm/SRS_FIELD_DISPLAY.md §2 F-01/F-02 · §3 U-02 · docs/hrm/SRS.md §17
 * Purpose:    Profile view — gender / employment_type / Chức vụ qua labelMaps (không raw).
 * WorkItem:   D-HRM-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * must_keep:  list→detail deep link company_id; resolveIndustryDisplay ngoài file này
 * LastVerified: docs/qa/evidence/d-hrm-u72-label-fe-02-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: resolveGenderDisplay + resolveEmploymentTypeDisplay trên InfoItem
 * Why: BA FAIL-LABEL-LEAK F-01/F-02
 * SRS/BR: SRS_FIELD_DISPLAY.md AC-FD-01/02 · FR-HRM-U72-LABEL-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-02
 * change_mode: FIX
 * What: Header + «Chức vụ» → resolveJobTitleDisplayLabel (+ settings catalog); never raw job_title_key
 * Why: QA AC-FD-U02 FAIL — LEGAL_SPECIALIST on HLD-0996
 * SRS/BR: SRS_FIELD_DISPLAY.md §3 U-02 · AC-FD-U02 · display-label-no-raw-key.mdc
 * must_keep: F-01/F-02 binds; deep link company_id; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-PROFILE-TABS-01
 * change_mode: ADD
 * What: 15 tab → 4 nhóm Core/HR/Career/Personal; lazy non-Core; PermissionFallback salary (UX-07)
 * Why: UX-UI-ERP-ANALYSIS P0-3 / screen-matrix P2-f — giảm cognitive load; click depth ≤2
 * SRS/BR: docs/program/UX-UI-PROFILE-C2-SYNTHESIS.md · ux-ui-erp-screen-matrix-01.md P2-f/UX-07
 * must_keep: pin localStorage `employee-pinned-tabs`; tab id ổn định; Payroll/D5/C1 không đụng
 * LastVerified: docs/qa/evidence/d-ux-profile-tabs-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-PERMISSION-FALLBACK-FE-01
 * change_mode: UPGRADE
 * What: Đóng silent-null CMND/CCCD (view_salary) → PermissionFallback compact; salary/insurance giữ SoT VI+CTA
 * Why: Wave B UX-07 · residual R-C2-01 Consistency (portal bypass vẫn by design)
 * SRS/BR: UX-UI-ERP-ANALYSIS.md §9 PermissionFallback · UX-07
 * must_keep: Profile C2 groups · pin key · PermissionGate portal bypass · Payroll D5/P0-c · Clock-In
 * LastVerified: docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-MGR-HIER-01-FE
 * change_mode: ADD
 * What: workInfo «Quản lý trực tiếp» — bind manager_label / resolve via getEmployeeById (display-ready)
 * Why: Option B FE after PATCH+F5 must show manager name (FR-UC-H01 · FR-UC-H03); cấm raw UUID only
 * must_keep: LeaveOverviewRecentPanel / leave approve UX; SoftDel; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: Precision Motion shell + Thông tin chung (E10–E11) — sharp text; no purple legend
 * Why: ADR-20260805 §8–§10 pale ban + dual-surface light ops canvas
 * must_keep: tab groups/pin; list→detail company_id; SoftDel; no OCR invent; stub honesty
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-01
 * change_mode: ADD
 * What: HireReadinessBanner on contract tab (F-CORE-HTP-05 honesty)
 * Why: AC-HTP-05-01..03 — không giả ready khi BE chưa expose
 * must_keep: PermissionFallback salary; tab groups; deep link company_id; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-03
 * change_mode: FIX
 * What: ?tab= deep-link + CTA «Bảo hiểm & Phúc lợi» on general (open nested HR insurance)
 * Why: R-EMP-SI-FE-ACTION-UI — insurance tab in HR popover; text click missed → no employee-insurances GET
 * must_keep: tab groups/pin; D2 WH / D6 HTP / FE-02 QSĐ; U65; companyId query
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: General tab — hide salary/bank/tax/SI InfoItems from public GET; AC-CORE-CB-MAP-01 redirect
 *       CTA → tab salary / insurance (CORE-02 peer); F5 no C&B leak from employee.* public DTO
 * Why: UC-BP-CORE-01 O4 · AC-CORE-PUB-02 · DENY same-form / public DTO bind as C&B SoT
 * must_keep: PermissionGate view_salary; HTP; tab groups; Nest /employees; hire≠CORE DONE; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * change_mode: ADD
 * What: Lazy tab `documents` → EmployeeDocumentChecklist (F-CORE-CHK-01 physical document-checklist*)
 * Why: UC-BP-CORE-03 Diễn biến #1–#2 · J-HRM-CORE-03-04 · deep-link ?tab=documents
 * must_keep: DOC/ET Settings RETAIN · Nest /core DENY · no invent DOC SoT · CORE-07 OUT · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * change_mode: ADD
 * What: General sidebar → EmployeeActivatePanel (F-CORE-ACT-01 POST …/activate · GATE 409)
 * Why: UC-BP-CORE-07 Diễn biến #1–#2 · can_activate/blocking_items/effective_date · J-HRM-CORE-07-01..05
 * must_keep: Nest /core DENY · checklist≠DONE · soft≠CORE-06 DONE · CORE03QC1 · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * change_mode: ADD
 * What: General sidebar ATT-12 confirm strip via EmployeeActivatePanel (panel + ca)
 * Why: AC-ATT-12-FE-CONFIRM · J-HRM-ATT-12-05
 * must_keep: CORE-07 activate · tab groups · company_id deep link · U65
 */
import { lazy, Suspense, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Edit,
  User,
  Phone as PhoneIcon,
  Mail,
  MapPin,
  Calendar,
  Building2,
  ChevronDown,
  Briefcase,
  GraduationCap,
  FileCheck,
  ClipboardList,
  Zap,
  Users,
  FileText,
  DollarSign,
  Shield,
  X,
  GripVertical,
  FileSignature,
  Target,
  BookOpen,
  Package,
  Award,
  CreditCard,
  Home,
  AlertCircle,
  Loader2,
  Layers,
  FolderKanban,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  resolveEmploymentTypeDisplay,
  resolveGenderDisplay,
  resolveJobTitleDisplayLabel,
} from '@/lib/labelMaps';
import { jobTitleOptionsFromCatalog } from '@/lib/catalogSearchPicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEmployee } from '@/hooks/useEmployee';
import type { EmployeeFormData } from '@/hooks/useEmployees';
import { useEmployeeMutations } from '@/hooks/useEmployeeMutations';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeById } from '@/integrations/hrmApi';
import { formatEmployeePickerLabel } from '@/lib/employeePickerLabel';
import { EmployeeFormDialog } from '@/components/employee/EmployeeFormDialog';
import { EmployeeAvatarUpload } from '@/components/employee/EmployeeAvatarUpload';
import { EmployeeSkillsRadarChart } from '@/components/employee/EmployeeSkillsRadarChart';
import { EmployeeWorkTimeline } from '@/components/employee/EmployeeWorkTimeline';
import { EmployeeStatsCards } from '@/components/employee/EmployeeStatsCards';
import { EmployeeJobList } from '@/components/employee/EmployeeJobList';
import { EmployeeContracts } from '@/components/employee/EmployeeContracts';
import { EmployeeSalary } from '@/components/employee/EmployeeSalary';
import { HireReadinessBanner } from '@/components/employee/HireReadinessBanner';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { PermissionFallback } from '@/components/auth/PermissionFallback';
import {
  PROFILE_CORE_TAB_IDS,
  PROFILE_GROUP_TAB_IDS,
  PROFILE_NON_CORE_GROUP_IDS,
  type ProfileTabGroupId,
  type ProfileTabId,
  isPinnableProfileTab,
  parseProfileTabParam,
  resolveProfileTabGroup,
} from '@/lib/employeeProfileTabGroups';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';

/** Lazy non-Core panels — Core (job/contract/salary) stays eager for 1-click happy path. */
const EmployeeDegrees = lazy(() =>
  import('@/components/employee/EmployeeDegrees').then((m) => ({ default: m.EmployeeDegrees })),
);
const EmployeeCertificates = lazy(() =>
  import('@/components/employee/EmployeeCertificates').then((m) => ({
    default: m.EmployeeCertificates,
  })),
);
const EmployeeSkills = lazy(() =>
  import('@/components/employee/EmployeeSkills').then((m) => ({ default: m.EmployeeSkills })),
);
const EmployeeFamilyInfo = lazy(() =>
  import('@/components/employee/EmployeeFamilyInfo').then((m) => ({
    default: m.EmployeeFamilyInfo,
  })),
);
const EmployeeResume = lazy(() =>
  import('@/components/employee/EmployeeResume').then((m) => ({ default: m.EmployeeResume })),
);
const EmployeeKPI = lazy(() =>
  import('@/components/employee/EmployeeKPI').then((m) => ({ default: m.EmployeeKPI })),
);
const EmployeeInsurance = lazy(() =>
  import('@/components/employee/EmployeeInsurance').then((m) => ({
    default: m.EmployeeInsurance,
  })),
);
const EmployeeTraining = lazy(() =>
  import('@/components/employee/EmployeeTraining').then((m) => ({
    default: m.EmployeeTraining,
  })),
);
const EmployeeAssets = lazy(() =>
  import('@/components/employee/EmployeeAssets').then((m) => ({ default: m.EmployeeAssets })),
);
const EmployeeRewardsDiscipline = lazy(() =>
  import('@/components/employee/EmployeeRewardsDiscipline').then((m) => ({
    default: m.EmployeeRewardsDiscipline,
  })),
);
const EmployeeDocumentChecklist = lazy(() =>
  import('@/components/employee/EmployeeDocumentChecklist').then((m) => ({
    default: m.EmployeeDocumentChecklist,
  })),
);
const EmployeeActivatePanel = lazy(() =>
  import('@/components/employee/EmployeeActivatePanel').then((m) => ({
    default: m.EmployeeActivatePanel,
  })),
);
const LazyEmployeeWorkTimeline = lazy(() =>
  import('@/components/employee/EmployeeWorkTimeline').then((m) => ({
    default: m.EmployeeWorkTimeline,
  })),
);

type TabMeta = {
  id: ProfileTabId;
  label: string;
  icon: typeof User;
  color: string;
  description?: string;
};

/** Tab chrome — ADR §8/A1: no purple/indigo AI palette; primary + DNA status hues only. */
const TAB_ICON_COLOR: Record<ProfileTabId, { icon: typeof User; color: string }> = {
  general: { icon: User, color: 'bg-primary' },
  work: { icon: Briefcase, color: 'bg-amber-600' },
  contract: { icon: FileSignature, color: 'bg-emerald-600' },
  salary: { icon: DollarSign, color: 'bg-rose-600' },
  cv: { icon: FileText, color: 'bg-cyan-600' },
  kpi: { icon: Target, color: 'bg-amber-600' },
  insurance: { icon: Shield, color: 'bg-emerald-600' },
  training: { icon: BookOpen, color: 'bg-cyan-600' },
  assets: { icon: Package, color: 'bg-primary' },
  rewards: { icon: Award, color: 'bg-rose-600' },
  workHistory: { icon: Briefcase, color: 'bg-orange-600' },
  degrees: { icon: GraduationCap, color: 'bg-primary' },
  certificates: { icon: FileCheck, color: 'bg-teal-600' },
  documents: { icon: ClipboardList, color: 'bg-primary' },
  skills: { icon: Zap, color: 'bg-amber-500' },
  family: { icon: Users, color: 'bg-rose-500' },
};

const GROUP_CHROME: Record<
  Exclude<ProfileTabGroupId, 'core'>,
  { icon: typeof Layers; color: string }
> = {
  hr: { icon: FolderKanban, color: 'bg-emerald-600' },
  career: { icon: Sparkles, color: 'bg-cyan-700' },
  personal: { icon: Users, color: 'bg-rose-600' },
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '--';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch {
    return '--';
  }
};

const getStatusInfo = (status: string, t: (key: string) => string) => {
  const statusConfig: Record<string, { className: string }> = {
    active: { className: 'bg-green-100 text-green-700 hover:bg-green-100' },
    pending_docs: { className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
    inactive: { className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' },
    probation: { className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
    suspended: { className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  };
  return {
    label: t(`employeeProfile.status.${status}`) || t('employeeProfile.status.active'),
    className: statusConfig[status]?.className || statusConfig.active.className,
  };
};

function buildTabMeta(id: ProfileTabId, t: (key: string, opts?: { defaultValue?: string }) => string): TabMeta {
  const chrome = TAB_ICON_COLOR[id];
  return {
    id,
    label: t(`employeeProfile.tabs.${id}`),
    icon: chrome.icon,
    color: chrome.color,
    description: t(`employeeProfile.tabDescriptions.${id}`, { defaultValue: '' }),
  };
}

const getInitialPinnedTabs = (): string[] => {
  try {
    const saved = localStorage.getItem('employee-pinned-tabs');
    if (!saved) return [];
    const parsed = JSON.parse(saved) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && isPinnableProfileTab(id));
  } catch {
    return [];
  }
};

function LazyTabPanel({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center gap-2 py-12 text-sm text-xevn-textSecondary"
          data-testid="profile-tab-lazy-fallback"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>…</span>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function EmployeeProfile() {
  const [openGroup, setOpenGroup] = useState<Exclude<ProfileTabGroupId, 'core'> | null>(null);
  const [pinnedTabs, setPinnedTabs] = useState<string[]>(getInitialPinnedTabs);
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const initialTab = parseProfileTabParam(searchParams.get('tab')) ?? 'general';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const { memberships, currentCompanyId } = useAuth();
  const { hasPermission } = usePermissions();
  const { employee, isLoading, error, refetch } = useEmployee(id);
  const { updateEmployee } = useEmployeeMutations({ onMutated: refetch });
  const { catalogs } = useSettingsCatalogsOverview({ enabled: !!employee });
  const jobTitleOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const positionDisplayLabel = useMemo(() => {
    if (!employee) return '—';
    return resolveJobTitleDisplayLabel(
      {
        position: employee.position,
        job_title_key: employee.job_title_key,
        job_title_label: employee.custom_fields?.job_title_label,
        custom_fields: employee.custom_fields,
      },
      jobTitleOptions,
    );
  }, [employee, jobTitleOptions]);

  const managerId = employee?.manager_id?.trim() || null;
  const { data: managerRow } = useQuery({
    queryKey: ['profile-direct-manager', managerId, employee?.company_id ?? null],
    queryFn: async () => {
      if (!managerId || !employee) return null;
      const scopes = [
        employee.company_id,
        currentCompanyId,
        ...memberships.map((m) => m.company_id),
      ].filter(Boolean) as string[];
      return getEmployeeById(managerId, scopes);
    },
    enabled: Boolean(managerId && employee && !employee.manager_label),
    staleTime: 60_000,
  });
  const directManagerDisplay = useMemo(() => {
    if (!managerId) return '—';
    if (employee?.manager_label?.trim()) return employee.manager_label.trim();
    if (managerRow) return formatEmployeePickerLabel(managerRow);
    return '—';
  }, [employee?.manager_label, managerId, managerRow]);

  const handleAvatarChange = useCallback(async (url: string | null) => {
    if (!employee) return;
    setIsAvatarSaving(true);
    try {
      const success = await updateEmployee(employee.id, {
        avatar_url: url,
        custom_fields: employee.custom_fields ?? {},
      });
      if (success) {
        await refetch();
      }
    } finally {
      setIsAvatarSaving(false);
    }
  }, [employee, updateEmployee, refetch]);

  const handleEditSubmit = useCallback(async (data: EmployeeFormData & { company_id?: string }) => {
    if (!employee) return false;
    setIsEditLoading(true);
    try {
      const success = await updateEmployee(employee.id, data);
      if (success) {
        await refetch();
        setIsEditDialogOpen(false);
      }
      return success;
    } finally {
      setIsEditLoading(false);
    }
  }, [employee, updateEmployee, refetch]);

  const updatePinnedTabs = (newPinned: string[]) => {
    const sanitized = newPinned.filter(isPinnableProfileTab);
    setPinnedTabs(sanitized);
    localStorage.setItem('employee-pinned-tabs', JSON.stringify(sanitized));
  };

  const togglePin = (tabId: string) => {
    if (!isPinnableProfileTab(tabId)) return;
    if (pinnedTabs.includes(tabId)) {
      updatePinnedTabs(pinnedTabs.filter((id) => id !== tabId));
    } else {
      updatePinnedTabs([...pinnedTabs, tabId]);
    }
  };

  const coreTabs = useMemo(
    () => PROFILE_CORE_TAB_IDS.map((tabId) => buildTabMeta(tabId, t)),
    [t],
  );

  const tabById = useMemo(() => {
    const map = new Map<string, TabMeta>();
    for (const tabId of [
      ...PROFILE_CORE_TAB_IDS,
      ...PROFILE_GROUP_TAB_IDS.hr,
      ...PROFILE_GROUP_TAB_IDS.career,
      ...PROFILE_GROUP_TAB_IDS.personal,
    ]) {
      map.set(tabId, buildTabMeta(tabId, t));
    }
    return map;
  }, [t]);

  const pinnedTabObjects = pinnedTabs
    .map((tabId) => tabById.get(tabId))
    .filter(Boolean) as TabMeta[];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pinnedTabs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updatePinnedTabs(items);
  };

  const selectGroupedTab = (tabId: ProfileTabId) => {
    if (isPinnableProfileTab(tabId) && !pinnedTabs.includes(tabId)) {
      updatePinnedTabs([...pinnedTabs, tabId]);
    }
    setActiveTab(tabId);
    setOpenGroup(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tabId);
        return next;
      },
      { replace: true },
    );
  };

  const selectCoreTab = (tabId: ProfileTabId) => {
    setActiveTab(tabId);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tabId);
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    const fromUrl = parseProfileTabParam(searchParams.get('tab'));
    if (!fromUrl) return;
    setActiveTab((prev) => (prev === fromUrl ? prev : fromUrl));
    if (isPinnableProfileTab(fromUrl)) {
      setPinnedTabs((prev) => {
        if (prev.includes(fromUrl)) return prev;
        const next = [...prev, fromUrl];
        localStorage.setItem('employee-pinned-tabs', JSON.stringify(next));
        return next;
      });
    }
  }, [searchParams, id]);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/employees')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-28 h-28 rounded-full" />
                  <Skeleton className="h-5 w-32 mt-4" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-9">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-xevn-textMuted" />
        <p className="text-lg font-medium text-xevn-text">{error || t('employeeProfile.notFound')}</p>
        <Button onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('employeeProfile.backToList')}
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(employee.status, t);
  const isOwnProfile = memberships.some(
    (membership) =>
      membership.employee_id &&
      membership.employee_id.toLowerCase() === employee.id.toLowerCase(),
  );
  const canEditAvatar = isOwnProfile || hasPermission('employees', 'edit');
  const activeGroup = resolveProfileTabGroup(activeTab);

  return (
    <div className="animate-fade-in space-y-4" data-testid="employee-profile-page">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="truncate text-base font-bold text-xevn-text sm:text-xl">{employee.full_name}</h1>
        <Badge variant="outline" className="shrink-0">
          {employee.employee_code}
        </Badge>
        <div className="ml-auto shrink-0">
          <PermissionGate module="employees" action="edit">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('common.edit')}</span>
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs — Core strip + pinned + group popovers (HR / Career / Personal) */}
      <div className="border-b overflow-hidden" data-testid="profile-tab-groups">
        <div className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          {/* Core always-visible tabs */}
          {coreTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              data-testid={`profile-tab-${tab.id}`}
              onClick={() => selectCoreTab(tab.id)}
              className={cn(
                'shrink-0 gap-2',
                activeTab === tab.id && 'bg-primary text-primary-foreground',
              )}
            >
              <div className={cn('w-5 h-5 rounded flex items-center justify-center text-white shrink-0', tab.color)}>
                <tab.icon className="w-3 h-3" />
              </div>
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}

          {/* Pinned tabs with drag and drop */}
          {pinnedTabObjects.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pinned-tabs" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex items-center gap-1"
                  >
                    {pinnedTabObjects.map((tab, index) => (
                      <Draggable key={tab.id} draggableId={tab.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              'flex items-center',
                              snapshot.isDragging && 'opacity-80',
                            )}
                          >
                            {/*
                              D-HRM-EMP-PROFILE-BTN-NEST-01: outer tab is shadcn Button;
                              drag handle + unpin MUST be div/span+role — never nest a
                              native button element inside Button (validateDOMNesting).
                            */}
                            <Button
                              variant={activeTab === tab.id ? 'default' : 'ghost'}
                              size="sm"
                              data-testid={`profile-pinned-tab-${tab.id}`}
                              onClick={() => selectCoreTab(tab.id)}
                              className={cn(
                                'shrink-0 gap-1 pr-1',
                                activeTab === tab.id && 'bg-primary text-primary-foreground',
                              )}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 hover:bg-muted-foreground/20 rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <GripVertical className="w-3 h-3" />
                              </div>
                              <div className={cn('w-4 h-4 rounded flex items-center justify-center text-white', tab.color)}>
                                <tab.icon className="w-3 h-3" />
                              </div>
                              <span className="hidden sm:inline">{tab.label}</span>
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={t('employeeProfile.unpinTab', { defaultValue: 'Bỏ ghim tab' })}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(tab.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    togglePin(tab.id);
                                  }
                                }}
                                className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20"
                              >
                                <X className="w-3 h-3" />
                              </span>
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Group dropdowns: HR / Career / Personal */}
          {PROFILE_NON_CORE_GROUP_IDS.map((groupId) => {
            const groupTabs = PROFILE_GROUP_TAB_IDS[groupId]
              .map((tabId) => tabById.get(tabId))
              .filter(Boolean) as TabMeta[];
            const unpinnedInGroup = groupTabs.filter((tab) => !pinnedTabs.includes(tab.id));
            if (unpinnedInGroup.length === 0) return null;

            const chrome = GROUP_CHROME[groupId];
            const GroupIcon = chrome.icon;
            const groupActive = activeGroup === groupId && !PROFILE_CORE_TAB_IDS.includes(activeTab as ProfileTabId) && !pinnedTabs.includes(activeTab);
            const activeInGroupLabel = unpinnedInGroup.find((tab) => tab.id === activeTab)?.label;

            return (
              <Popover
                key={groupId}
                open={openGroup === groupId}
                onOpenChange={(open) => setOpenGroup(open ? groupId : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant={groupActive ? 'default' : 'ghost'}
                    size="sm"
                    data-testid={`profile-group-${groupId}`}
                    className={cn(
                      'shrink-0 gap-1',
                      groupActive && 'bg-primary text-primary-foreground',
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded flex items-center justify-center text-white shrink-0', chrome.color)}>
                      <GroupIcon className="w-3 h-3" />
                    </div>
                    <span className="hidden sm:inline">
                      {activeInGroupLabel ||
                        t(`employeeProfile.groups.${groupId}`, {
                          defaultValue:
                            groupId === 'hr' ? 'Nhân sự' : groupId === 'career' ? 'Sự nghiệp' : 'Cá nhân',
                        })}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-2rem)] sm:w-[420px] p-3 bg-background border shadow-lg z-50"
                  align="start"
                  data-testid={`profile-group-panel-${groupId}`}
                >
                  <p className="mb-2 px-1 text-xs font-medium text-xevn-textSecondary">
                    {t(`employeeProfile.groups.${groupId}`, {
                      defaultValue:
                        groupId === 'hr' ? 'Nhân sự' : groupId === 'career' ? 'Sự nghiệp' : 'Cá nhân',
                    })}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
                    {unpinnedInGroup.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        data-testid={`profile-group-tab-${tab.id}`}
                        onClick={() => selectGroupedTab(tab.id)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg text-left hover:bg-muted transition-colors cursor-pointer',
                          activeTab === tab.id && 'bg-primary/10 border border-primary/20',
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white',
                            tab.color,
                          )}
                        >
                          <tab.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-xevn-text">{tab.label}</p>
                          {tab.description ? (
                            <p className="text-xs text-xevn-textSecondary">{tab.description}</p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>

      {/* Main Content — Core */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {canEditAvatar ? (
                    <div className="mb-4">
                      <EmployeeAvatarUpload
                        currentAvatarUrl={employee.avatar_url}
                        employeeCode={employee.employee_code}
                        fullName={employee.full_name}
                        onAvatarChange={handleAvatarChange}
                        disabled={isAvatarSaving}
                      />
                    </div>
                  ) : (
                    <div className="relative mb-4">
                      <Avatar className="w-28 h-28 border-4 border-background shadow-lg">
                        <AvatarImage src={employee.avatar_url || ''} />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                          {employee.full_name.split(' ').pop()?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-xevn-text">{employee.full_name}</h3>
                  <p className="mb-1 text-sm text-xevn-textSecondary">
                    {positionDisplayLabel}
                  </p>
                  <p className="mb-2 text-xs text-xevn-textSecondary">
                    {employee.department || t('employeeProfile.noDepartment')}
                  </p>
                  <Badge className={statusInfo.className}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Suspense fallback={null}>
              <EmployeeActivatePanel
                employeeId={employee.id}
                status={employee.status}
                onActivated={() => void refetch()}
              />
            </Suspense>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                  <User className="w-4 h-4" />
                  {t('employeeProfile.sections.personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Mail} label={t('employeeProfile.fields.email')} value={employee.email || '--'} />
                <InfoItem icon={PhoneIcon} label={t('employeeProfile.fields.phone')} value={employee.phone || '--'} />
                <InfoItem icon={Calendar} label={t('employeeProfile.fields.birthDate')} value={formatDate(employee.birth_date)} />
                <InfoItem icon={User} label={t('employeeProfile.fields.gender')} value={resolveGenderDisplay(employee.gender)} />
                <PermissionGate
                  module="employees"
                  action="view_salary"
                  fallback={<PermissionFallback variant="compact" className="py-4" />}
                >
                  <InfoItem icon={CreditCard} label={t('employeeProfile.fields.idNumber')} value={employee.id_number || '--'} />
                  <InfoItem icon={Calendar} label={t('employeeProfile.fields.idIssueDate')} value={formatDate(employee.id_issue_date)} />
                  <InfoItem icon={MapPin} label={t('employeeProfile.fields.idIssuePlace')} value={employee.id_issue_place || '--'} />
                </PermissionGate>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                  <Home className="w-4 h-4" />
                  {t('employeeProfile.sections.address')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={MapPin} label={t('employeeProfile.fields.permanentAddress')} value={employee.permanent_address || '--'} />
                <InfoItem icon={MapPin} label={t('employeeProfile.fields.temporaryAddress')} value={employee.temporary_address || '--'} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                  <AlertCircle className="w-4 h-4" />
                  {t('employeeProfile.sections.emergencyContact')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={User} label={t('employeeProfile.fields.contactPerson')} value={employee.emergency_contact || '--'} />
                <InfoItem icon={PhoneIcon} label={t('employeeProfile.fields.contactPhone')} value={employee.emergency_phone || '--'} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                  <Briefcase className="w-4 h-4" />
                  {t('employeeProfile.sections.workInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Building2} label={t('employeeProfile.fields.department')} value={employee.department || '--'} />
                <InfoItem icon={Briefcase} label={t('employeeProfile.fields.position')} value={positionDisplayLabel} />
                <InfoItem
                  icon={Users}
                  label={t('employeeProfile.workInfo.directManager')}
                  value={directManagerDisplay}
                />
                <InfoItem icon={MapPin} label={t('employeeProfile.fields.workLocation')} value={employee.work_location || '--'} />
                <InfoItem icon={Calendar} label={t('employeeProfile.fields.startDate')} value={formatDate(employee.start_date)} />
                <InfoItem icon={Calendar} label={t('employeeProfile.fields.endDate')} value={formatDate(employee.end_date)} />
                <InfoItem
                  icon={Briefcase}
                  label={t('employeeProfile.fields.contractType')}
                  value={resolveEmploymentTypeDisplay(employee.employment_type)}
                />
              </CardContent>
            </Card>

            <PermissionGate
              module="employees"
              action="view_salary"
              fallback={
                <Card data-testid="emp-core-cb-map-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                      <DollarSign className="w-4 h-4" />
                      {t('employeeProfile.sections.financialInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PermissionFallback className="py-4" />
                  </CardContent>
                </Card>
              }
            >
              <Card data-testid="emp-core-cb-map-redirect">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                    <DollarSign className="w-4 h-4" />
                    {t('employeeProfile.sections.financialInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-xevn-textSecondary">
                    Lương / tài khoản / MST không hiển thị trên hồ sơ công khai. Mở tab Lương & thu nhập
                    (vòng C&B / HĐ–BH) — không lấy từ GET hồ sơ hành chính.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => selectGroupedTab('salary')}
                    data-testid="emp-core-cb-map-open-salary"
                  >
                    {t('employeeProfile.tabs.salary', { defaultValue: 'Lương & thu nhập' })}
                  </Button>
                </CardContent>
              </Card>
            </PermissionGate>

            <PermissionGate
              module="employees"
              action="view_salary"
              fallback={<PermissionFallback className="py-8" />}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-xevn-text">
                    <Shield className="w-4 h-4" />
                    {t('employeeProfile.sections.insuranceInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-xevn-textSecondary">
                    Số BHXH / BHYT chi tiết thuộc vòng C&B — mở tab Bảo hiểm & Phúc lợi.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    data-testid={HDSD_MUTATE_TEST_IDS.profileOpenInsuranceTab}
                    onClick={() => selectGroupedTab('insurance')}
                  >
                    {t('employeeProfile.tabs.insurance')}
                  </Button>
                </CardContent>
              </Card>
            </PermissionGate>
            {/* Always visible — opens nested HR «Bảo hiểm & Phúc lợi» (CORE-10 / D5). */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              data-testid={`${HDSD_MUTATE_TEST_IDS.profileOpenInsuranceTab}-footer`}
              onClick={() => selectGroupedTab('insurance')}
            >
              {t('employeeProfile.tabs.insurance')}
            </Button>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-xevn-text">{t('employeeProfile.sections.workSkills')}</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeSkillsRadarChart />
                <div className="mt-2 flex flex-wrap justify-center gap-6 text-xs text-xevn-textSecondary">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full border border-xevn-primary bg-xevn-primary/30" />
                    <span>{t('employeeProfile.skillsLegend.benchmark')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-xevn-success" />
                    <span>{t('employeeProfile.skillsLegend.manager')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-xevn-accent" />
                    <span>{t('employeeProfile.skillsLegend.director')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <EmployeeWorkTimeline employeeId={id!} />
            <EmployeeStatsCards />
          </div>
        </div>
      )}

      {activeTab === 'work' && <EmployeeJobList employeeId={employee.id} />}

      {activeTab === 'contract' && (
        <div className="space-y-4">
          <HireReadinessBanner employeeId={employee.id} />
          <EmployeeContracts
            employeeId={employee.id}
            employeeName={employee.full_name}
            department={employee.department || undefined}
          />
        </div>
      )}

      {activeTab === 'salary' && (
        <PermissionGate module="employees" action="view_salary" fallback={<PermissionFallback />}>
          <EmployeeSalary
            employeeId={employee.id}
            employeeName={employee.full_name}
          />
        </PermissionGate>
      )}

      {/* Non-Core — lazy */}
      {activeTab === 'workHistory' && (
        <LazyTabPanel>
          <LazyEmployeeWorkTimeline employeeId={id!} />
        </LazyTabPanel>
      )}

      {activeTab === 'degrees' && (
        <LazyTabPanel>
          <EmployeeDegrees employeeId={id!} />
        </LazyTabPanel>
      )}

      {activeTab === 'certificates' && (
        <LazyTabPanel>
          <EmployeeCertificates employeeId={id!} />
        </LazyTabPanel>
      )}

      {activeTab === 'documents' && (
        <LazyTabPanel>
          <EmployeeDocumentChecklist employeeId={employee.id} />
        </LazyTabPanel>
      )}

      {activeTab === 'skills' && (
        <LazyTabPanel>
          <EmployeeSkills employeeId={id!} />
        </LazyTabPanel>
      )}

      {activeTab === 'family' && (
        <LazyTabPanel>
          <EmployeeFamilyInfo employeeId={id!} />
        </LazyTabPanel>
      )}

      {activeTab === 'cv' && (
        <LazyTabPanel>
          <EmployeeResume
            employeeId={employee.id}
            employeeName={employee.full_name}
          />
        </LazyTabPanel>
      )}

      {activeTab === 'kpi' && (
        <LazyTabPanel>
          <EmployeeKPI employeeId={employee.id} />
        </LazyTabPanel>
      )}

      {activeTab === 'insurance' && (
        <LazyTabPanel>
          <PermissionGate module="employees" action="view_salary" fallback={<PermissionFallback />}>
            <EmployeeInsurance employeeId={employee.id} />
          </PermissionGate>
        </LazyTabPanel>
      )}

      {activeTab === 'training' && (
        <LazyTabPanel>
          <EmployeeTraining employeeId={employee.id} />
        </LazyTabPanel>
      )}

      {activeTab === 'assets' && (
        <LazyTabPanel>
          <EmployeeAssets employeeId={employee.id} />
        </LazyTabPanel>
      )}

      {activeTab === 'rewards' && (
        <LazyTabPanel>
          <EmployeeRewardsDiscipline employeeId={employee.id} />
        </LazyTabPanel>
      )}

      <EmployeeFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employee={employee}
        onSubmit={handleEditSubmit}
        isLoading={isEditLoading}
      />
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-xevn-textSecondary">{label}</p>
        <p className="truncate text-sm font-medium text-xevn-text">{value || '--'}</p>
      </div>
    </div>
  );
}
