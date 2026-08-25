/**
 * @CODE-MEMORY
 * Screen:     /recruitment — Tuyển dụng (HRBP / recruiter)
 * UC:         UC-HRM-REC (menu tabs · dashboard · jobs · candidates)
 * BR:         L-OPS · inventory HRM-REC
 * SRS:        docs/hrm/SRS.md §14 tuyển dụng
 * TechSpec:   docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md §4.4 L-OPS
 * Purpose:    Điều hướng module tuyển dụng và bề mặt dashboard/ops theo tab.
 * WorkItem:   XEVN-THM-FE-W1-DENSITY-01
 * Coded:      2026-07-22
 * Callers:    App route /recruitment · portal embed
 * Callees:    CandidatePipelineFunnel · recruitment tabs
 * FE-Actions: | Click tab top-nav | setActiveTab | render panel |
 * Impact:     Tab rainbow che CTA chính; sửa sai có thể mất deep-link tab id
 * must_keep:  Tab ids (dashboard/jobs/candidates/…); dropdown submenu; PermissionGate create
 * SOLID:      Page shell — tab chrome tách khỏi nghiệp vụ API
 * LastVerified: docs/qa/evidence/xevn-thm-fe-w1-density-01-20260722.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: XEVN-THM-FE-W1-DENSITY-01
 * change_mode: UPGRADE
 * What: Tab top-nav + KPI/cost chrome → neutral primary (bỏ rainbow bg-*-500)
 * Why: QC GWC C1 density · L-OPS ops-first
 * must_keep: Pale gate CLOSED; OU/CO-REC token remaster; không đổi API
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-CREATE-GAPS-01
 * change_mode: FIX
 * What: Jobs/Candidates/Interviews — trigger click setActiveTab ngay; menu portalScope=iframe + data-testid menuitem
 * Why: DEF-E1A-JP-NAV-01 — headless portal=1 không thấy menuitem → không mở JobPostingsTab create
 * must_keep: Tab ids; submenu filter; PermissionGate; WH/DEC/Leave/EmployeeForm/JobTemplates/E1-B Settings
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Wire proposals→YCTD out_of_plan redirect; createPreset for JobRequisitionsTab
 * Why: BA O5 HOLD · UC-BP-REC-02b
 * must_keep: REC-01 Định biên · JD soft bind · honesty false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-FE-REC-MOUNT
 * change_mode: FIX
 * What: Restore missing eager chain JobTemplatesTab + HireEmployeeLinkDialog + CandidatePipelineFunnel + recruitmentHireLink (stash 43c479a UTF-8)
 * Why: QA R-PO-SPINE01-REC-MOUNT — Vite Failed to resolve JobTemplatesTab → hire-to-pay HP-02/04 blocked
 * must_keep: Tab ids; shared recruitmentJobTemplatesState; leave/AUTH/EMP/CAT CLOSED; U65 no seed
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-fe-rec-mount.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A
 * change_mode: UPGRADE
 * What: Precision Motion MVP spine — tab primary lock; dashboard title ≥20; sharp KPI strip
 * Why: ADR §16 · inventory R01–R05/R08/R11–R12/R15 · B4 cấm purple AI · S3=A honesty on reports campaigns
 * must_keep: Tab ids + submenu deep-link; HireEmployeeLinkDialog wire; JobTemplates mount; U65; no remaster DONE; no Face/ATT invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-rec-a.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-REC-A-FIX-01
 * change_mode: UPGRADE
 * What: Remove Jobs shell text-xl h2; title now in JobPostingsTab inside rec-jobs-tab-precision (≥20 Montserrat)
 * Why: QA DEF R04 — computed 17.5px Source Sans (text-xl) vs AC ≥20 Montserrat; harness measures testid h2 first
 * must_keep: Tab ids · Hire bind · CatalogSearchPicker · ViMoneyInput · WF · R12/R15 dialog chrome PASS · Reports S3=A · U65
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-PLAN-CONSOLE-FE-01
 * change_mode: FIX
 * What: Plan create + plan detail dept maps — keyed Fragment (was <> without key → React unique-key console error)
 * Why: Sponsor «Kế hoạch tuyển dụng đầy lỗi» — plan open/detail console red on Recruitment
 * must_keep: plan mutate APIs · định biên SoT · compare/candidate BA wave · no remaster_done · no jd_dynamic_done
 * LastVerified: docs/qa/evidence/po-hrm-rec-plan-console-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-CMP-FE-01
 * change_mode: ADD
 * What: Compare open button HDSD testid (hdsd-rec-compare-open-btn) — So sánh theo YCTD
 * Why: J-HRM-REC-CMP-01 / UF-REC-CMP-01 harness entry
 * must_keep: Tab ids · CandidateComparisonDialog mount · FE-01 UV form ownership · U65 · recruitment_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Kanban board columns bind GET …/pipeline-stages/effective when EFF>0; soft-empty + CTA when EFF=0
 * Why: BA-01 VAL-REC-CNS-04 · AC-PLT-REC-STAGE-05k — cấm hardcode starter-six SoT
 * must_keep: hire hiredOutcomeKey · CandidatesTab EFF · Settings N+1 · IV one-active · recruitment_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Single «Cần tuyển» column (remove ns/dx dual editors); label Định biên synonym;
 *       CatalogSearchPicker dept/pos keys; wire PUT upsert + spawn-requests feedback; post-2xx refetch
 * Why: BA O1–O5 · API-01 F-REC-HC-01/05 · AC-REC-HC-01 ALT-03 · VAL-REC-HC-15
 * must_keep: XBOS WF · JD bind · REC-03 OUT · UF-HRM-12 · honesty false · U65 · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01 (re-dispatch)
 * change_mode: UPGRADE
 * What: O3 qty_drift AlertDialog + allow_override PUT; O4 vượt HC warn-on-approve; HT snapshot read-only
 * Why: BA O3/O4 AC · interrupt resume — complete residual FE wiring
 * must_keep: single need_hire editor · CatalogSearchPicker · spawn feedback · honesty false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Dashboard subtab → Nest GET /recruitment/dashboard* bind; remove cost/VND + FE aggregator KH;
 *       YCTD drill → JobRequisitionsTab detail (J-HRM-05); Reports O8 via same Nest subset
 * Why: UC-BP-REC-08 · BA O1–O10 · SOLID 25 §3.1 · U65
 * must_keep: chrome tabs · Board kanban · sealed REC-01/02 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02
 * change_mode: FIX
 * What: resolveRecruitmentTabFromSearch — merge parent portal ?tab= for CC embed deep-link
 * Why: DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES — iframe src omits tab; stayed on Dashboard
 * must_keep: Tab ids · G4 URL seal · U65
 */
import { Fragment, lazy, Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Plus,
  Search,
  LayoutDashboard,
  Users,
  FileText,
  Megaphone,
  Video,
  ClipboardCheck,
  CalendarClock,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Briefcase,
  Star,
  Mail,
  Phone,
  UserCheck,
  Edit,
  Eye,
  CalendarIcon,
  MapPin,
  Building2,
  Trash2,
  GripVertical,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Job postings are managed by JobPostingsTab component with real DB data
import { KanbanCandidate } from '@/hooks/useKanbanCandidates';
import { useRecruitmentDashboard } from '@/hooks/useRecruitmentDashboard';
import { useRecruitmentPlans, RecruitmentPlan } from '@/hooks/useRecruitmentPlans';
import { useCandidateEvaluations, CandidateEvaluation } from '@/hooks/useCandidateEvaluations';
import { useJobRequisitions } from '@/hooks/useJobRequisitions';
import { normalizeRequisitionId } from '@/lib/candidateUvYctdUi';
import type { CompareEvaluateTarget } from '@/components/recruitment/CandidateComparisonDialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  jobTitleOptionsFromCatalog,
} from '@/lib/catalogSearchPicker';
import {
  countOverHeadcountCells,
  detectQtyDriftInDepartments,
  emptyHeadcountYear,
  HRM_HC_KEY_UNKNOWN_TOAST_VI,
  HRM_HC_OVER_HC_WARN_VI,
  HRM_HC_QTY_DRIFT_CONFIRM_VI,
  HRM_HC_QTY_DRIFT_TITLE_VI,
  withNeedHireAt,
  type HeadcountMonthCell,
} from '@/lib/recruitmentPlanHeadcount';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useJobTemplates } from '@/hooks/useJobTemplates';
// Lazy-loaded recruitment components (code-split for performance — REC-PERF-FE-01)
const CampaignsTab = lazy(() => import('@/components/recruitment/CampaignsTab').then(m => ({ default: m.CampaignsTab })));
const CandidateEvaluationDialog = lazy(() => import('@/components/recruitment/CandidateEvaluationDialog').then(m => ({ default: m.CandidateEvaluationDialog })));
const CandidateComparisonDialog = lazy(() => import('@/components/recruitment/CandidateComparisonDialog').then(m => ({ default: m.CandidateComparisonDialog })));
const CandidateStageTransitionDialog = lazy(() =>
  import('@/components/recruitment/CandidateStageTransitionDialog').then((m) => ({
    default: m.CandidateStageTransitionDialog,
  })),
);
const CandidateDetailView = lazy(() => import('@/components/recruitment/CandidateDetailView').then(m => ({ default: m.CandidateDetailView })));
const HeadcountProposalTab = lazy(() => import('@/components/recruitment/HeadcountProposalTab').then(m => ({ default: m.HeadcountProposalTab })));
const JobPostingsTab = lazy(() => import('@/components/recruitment/JobPostingsTab').then(m => ({ default: m.JobPostingsTab })));
const JobRequisitionsTab = lazy(() => import('@/components/recruitment/JobRequisitionsTab').then(m => ({ default: m.JobRequisitionsTab })));
const JobTemplatesTab = lazy(() => import('@/components/recruitment/JobTemplatesTab').then(m => ({ default: m.JobTemplatesTab })));
const RecruitmentNestDashboardPanel = lazy(() => import('@/components/recruitment/RecruitmentNestDashboardPanel').then(m => ({ default: m.RecruitmentNestDashboardPanel })));
const RecruitmentWfSpawnBanner = lazy(() => import('@/components/recruitment/RecruitmentWfSpawnBanner').then(m => ({ default: m.RecruitmentWfSpawnBanner })));
const CandidateSourceStats = lazy(() => import('@/components/recruitment/CandidateSourceStats').then(m => ({ default: m.CandidateSourceStats })));
const CandidatesTab = lazy(() => import('@/components/recruitment/CandidatesTab').then(m => ({ default: m.CandidatesTab })));
const InterviewsTab = lazy(() => import('@/components/recruitment/InterviewsTab').then(m => ({ default: m.InterviewsTab })));
const RecruitmentReportsTab = lazy(() => import('@/components/recruitment/RecruitmentReportsTab').then(m => ({ default: m.RecruitmentReportsTab })));
const HireEmployeeLinkDialog = lazy(() => import('@/components/recruitment/HireEmployeeLinkDialog').then(m => ({ default: m.HireEmployeeLinkDialog })));
import { PermissionGate } from '@/components/auth/PermissionGate';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { resolveRecruitmentTabFromSearch } from '@/lib/recruitmentEmbedDeepLink';
import { isRecruitmentWorkflowLocked, RECRUITMENT_WF_LOCKED_HINT_VI } from '@/lib/recruitmentWorkflowUi';
import {
  needsHireEmployeePicker,
  resolveHireTargetStage,
} from '@/lib/recruitmentHireLink';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import {
  buildRecPipelineKanbanColumns,
  REC_PIPELINE_STAGE_EMPTY_CTA_VI,
} from '@/lib/recPipelineStageCatalog';

// Recruitment plan form schema
const recruitmentPlanSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200, 'Tiêu đề không quá 200 ký tự'),
  startMonth: z.string().min(1, 'Vui lòng chọn tháng bắt đầu'),
  endMonth: z.string().min(1, 'Vui lòng chọn tháng kết thúc'),
  year: z.string().min(1, 'Vui lòng chọn năm'),
  note: z.string().optional(),
});

type RecruitmentPlanFormValues = z.infer<typeof recruitmentPlanSchema>;

interface PlanPosition {
  id: string;
  name: string;
  position_key: string;
  months: HeadcountMonthCell[];
}

interface PlanDepartment {
  id: string;
  name: string;
  department_key: string;
  positions: PlanPosition[];
}

function createEmptyPlanDepartment(id = '1'): PlanDepartment {
  return {
    id,
    name: '',
    department_key: '',
    positions: [
      {
        id: `${id}-1`,
        name: '',
        position_key: '',
        months: emptyHeadcountYear(),
      },
    ],
  };
}

// Job posting form schema
const jobPostingSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(200, 'Tiêu đề không quá 200 ký tự'),
  department: z.string().min(1, 'Vui lòng chọn phòng ban'),
  location: z.string().min(1, 'Vui lòng nhập địa điểm').max(100, 'Địa điểm không quá 100 ký tự'),
  type: z.string().min(1, 'Vui lòng chọn loại hình'),
  openings: z.string().min(1, 'Vui lòng nhập số lượng'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  deadline: z.date({ required_error: 'Vui lòng chọn hạn nộp hồ sơ' }),
  description: z.string().min(1, 'Vui lòng nhập mô tả công việc').max(5000, 'Mô tả không quá 5000 ký tự'),
  requirements: z.string().min(1, 'Vui lòng nhập yêu cầu').max(3000, 'Yêu cầu không quá 3000 ký tự'),
  benefits: z.string().optional(),
});

type JobPostingFormValues = z.infer<typeof jobPostingSchema>;

// Top navigation — L-OPS neutral chrome (no rainbow icon pills)
const getTopNavTabs = (t: any) => [
  { id: 'dashboard', label: t('recruitment.tabs.dashboard'), icon: LayoutDashboard },
  { id: 'requisitions', label: 'Yêu cầu tuyển dụng', icon: Briefcase },
  { id: 'jd-library', label: 'Thư viện JD', icon: FileText },
  // { id: 'jobs', label: t('recruitment.tabs.jobs'), icon: Briefcase, hasDropdown: true }, // OUT_MVP (leftover)
  { id: 'candidates', label: t('recruitment.tabs.candidates'), icon: Users, hasDropdown: true },
  { id: 'proposals', label: t('recruitment.tabs.proposals'), icon: FileText },
  { id: 'campaigns', label: t('recruitment.tabs.campaigns'), icon: Megaphone },
  { id: 'interviews', label: t('recruitment.tabs.interviews'), icon: Video, hasDropdown: true },
  { id: 'evaluations', label: t('recruitment.tabs.evaluations'), icon: ClipboardCheck },
  { id: 'plans', label: t('recruitment.tabs.plansDinhBien'), icon: CalendarClock },
  { id: 'reports', label: t('recruitment.tabs.reports'), icon: BarChart3 },
];

const recTabButtonClass = (isActive: boolean) =>
  cn(
    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-semibold transition-all group md:gap-2 md:px-4',
    isActive
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-xevn-textSecondary hover:bg-muted hover:text-xevn-text',
  );

const recTabIconWrapClass = (isActive: boolean) =>
  cn(
    'w-5 h-5 rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
    isActive ? 'bg-white/20' : 'bg-xevn-neutral/15',
  );

const recTabIconClass = (isActive: boolean) =>
  cn('w-3 h-3', isActive ? 'text-white' : 'text-xevn-textSecondary');

// Jobs submenu items
const getJobsMenuItems = (t: any) => [
  { id: 'all', label: t('recruitment.jobsMenu.all') },
  { id: 'active', label: t('recruitment.jobsMenu.active') },
  { id: 'expired', label: t('recruitment.jobsMenu.expired') },
  { id: 'draft', label: t('recruitment.jobsMenu.draft') },
];

// Candidates submenu items
const getCandidatesMenuItems = (t: any) => [
  { id: 'all', label: t('recruitment.candidatesMenu.all') },
  { id: 'new', label: t('recruitment.candidatesMenu.new') },
  { id: 'screening', label: t('recruitment.candidatesMenu.screening') },
  { id: 'interview', label: t('recruitment.candidatesMenu.interview') },
  { id: 'hired', label: t('recruitment.candidatesMenu.hired') },
];

// Interviews submenu items
const getInterviewsMenuItems = (t: any) => [
  { id: 'scheduled', label: t('recruitment.interviewsMenu.scheduled') },
  { id: 'completed', label: t('recruitment.interviewsMenu.completed') },
  { id: 'cancelled', label: t('recruitment.interviewsMenu.cancelled') },
];

// Mock data for staffing proposals
const staffingProposals = [
  {
    id: '1',
    title: 'Đề xuất định biên phòng kinh doanh 1 - HCM',
    period: '01/2023 - 12/2023',
    creator: 'Admin',
    createdDate: '11/09/2023',
    status: 'approved',
    departments: [
      {
        name: 'Phòng kinh doanh 1 - HCM',
        positions: [
          { name: 'Cố vấn cao cấp', data: [0, 1, 0, 2, 1, 0, 3, 0, 1, 0, 1, 0, 1] },
          { name: 'Bán hàng', data: [0, 1, 0, 2, 4, 0, 4, 0, 5, 0, 1, 0, 1] },
          { name: 'Nhân viên kinh doanh', data: [1, 4, 1, 1, 1, 1, 1, 1, 3, 1, 1, 2, 1] },
          { name: 'Chuyên viên Kinh doanh', data: [0, 15, 0, 21, 13, 0, 10, 0, 7, 0, 5, 0, 11] },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Đề xuất định biên phòng kỹ thuật - HN',
    period: '01/2024 - 06/2024',
    creator: 'HR Manager',
    createdDate: '15/01/2024',
    status: 'pending',
    departments: [],
  },
];

// Mock interview data
const interviewSchedules = [
  { id: '1', candidate: 'Nguyễn Văn A', position: 'Frontend Developer', date: '2024-01-15', time: '09:00', interviewer: 'Trần Thị B', status: 'scheduled' },
  { id: '2', candidate: 'Lê Văn C', position: 'Backend Developer', date: '2024-01-15', time: '14:00', interviewer: 'Phạm Văn D', status: 'completed' },
  { id: '3', candidate: 'Hoàng Thị E', position: 'UI/UX Designer', date: '2024-01-16', time: '10:00', interviewer: 'Nguyễn Văn F', status: 'scheduled' },
];

// Mock campaigns data
const recruitmentCampaigns = [
  { 
    id: '1', 
    name: 'Chiến dịch tuyển dụng 9/2023', 
    positions: 5, 
    applicants: 200, 
    status: 'active', 
    startDate: '01/09/2023', 
    endDate: '13/10/2023',
    owner: 'Lê Hoàng Nam',
    follower: 'Nguyễn Thị Diệp',
    description: 'Tìm nhân sự cho các phòng ban đang cần thêm người, để làm các dự án một cách kịp tiến độ. Đảm bảo các dự án đầu việc cần thực hiện trong các dự án này không bị chậm tiến độ.',
    position: 'Trưởng nhóm',
    title: 'Chuyên viên',
    department: 'HR',
    workType: 'Phỏng vấn Online',
    location: 'TP Hà Nội',
    evaluationCriteria: 'Chuyên viên',
    salaryLevel: 'Thỏa thuận',
    quantity: 'Không giới hạn',
    requirements: 'Tốt nghiệp đại học chuyên ngành liên quan',
    degree: 'Đại học',
    major: 'Chuyên ngành',
    funnelData: {
      total: 200,
      cvPass: 120,
      test: 20,
      cvFail: 80,
      interview: 40,
      hired: 15,
      hcns: 10
    },
    interviews: [
      { id: '1', date: '12/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn trưởng phòng', status: 'Lên kế hoạch', candidate: 'Nguyễn Văn A' },
      { id: '2', date: '11/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn nhân viên kinh doanh', status: 'Đã phỏng vấn', candidate: 'Trần Thị B' },
      { id: '3', date: '10/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn trưởng phòng thiết kế', status: 'Đã phỏng vấn', candidate: 'Lê Văn C' },
      { id: '4', date: '10/02/2023', time: '09:00 - 11:00', type: 'Phỏng vấn trưởng phòng', status: 'Hủy', candidate: 'Phạm Văn D' },
    ]
  },
  { 
    id: '2', 
    name: 'Chương trình Fresh Graduate', 
    positions: 10, 
    applicants: 120, 
    status: 'active', 
    startDate: '01/02/2024', 
    endDate: '30/04/2024',
    owner: 'Nguyễn Văn A',
    follower: 'Trần Thị B',
    description: 'Chương trình tuyển dụng sinh viên mới ra trường.',
    position: 'Nhân viên',
    title: 'Thực tập sinh',
    department: 'Kỹ thuật',
    workType: 'Phỏng vấn trực tiếp',
    location: 'TP HCM',
    evaluationCriteria: 'Nhân viên',
    salaryLevel: '8-12 triệu',
    quantity: '10',
    requirements: 'Sinh viên năm cuối hoặc mới tốt nghiệp',
    degree: 'Đại học',
    major: 'CNTT',
    funnelData: {
      total: 120,
      cvPass: 80,
      test: 15,
      cvFail: 40,
      interview: 30,
      hired: 10,
      hcns: 5
    },
    interviews: []
  },
  { 
    id: '3', 
    name: 'Tuyển dụng IT Senior', 
    positions: 3, 
    applicants: 15, 
    status: 'completed', 
    startDate: '01/11/2023', 
    endDate: '31/12/2023',
    owner: 'Phạm Văn C',
    follower: 'Hoàng Thị D',
    description: 'Tuyển dụng các vị trí IT Senior cho dự án mới.',
    position: 'Senior',
    title: 'Lập trình viên',
    department: 'Kỹ thuật',
    workType: 'Phỏng vấn Online',
    location: 'Remote',
    evaluationCriteria: 'Senior',
    salaryLevel: '30-50 triệu',
    quantity: '3',
    requirements: '5 năm kinh nghiệm trở lên',
    degree: 'Đại học',
    major: 'CNTT',
    funnelData: {
      total: 15,
      cvPass: 10,
      test: 5,
      cvFail: 5,
      interview: 8,
      hired: 3,
      hcns: 3
    },
    interviews: []
  },
];

// Mock recruitment plans data removed - now using useRecruitmentPlans hook



// Skeleton for tab content during initial load
const RecTabSkeleton = () => (
  <div className="space-y-3 p-4 animate-pulse">
    {/* Header bar */}
    <div className="h-8 w-48 rounded bg-muted" />
    {/* Table rows mock */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 rounded bg-muted/60" />
    ))}
  </div>
);

export default function Recruitment() {
  const location = useLocation();
  const portalEmbed = getHrmPortalMode(location.search);
  const { t } = useTranslation();
  const topNavTabs = getTopNavTabs(t);
  const jobsMenuItems = getJobsMenuItems(t);
  const candidatesMenuItems = getCandidatesMenuItems(t);
  const interviewsMenuItems = getInterviewsMenuItems(t);
  const { toast } = useToast();
  const [autoOpenCreate, setAutoOpenCreate] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    return resolveRecruitmentTabFromSearch(window.location.search) ?? 'dashboard';
  });
  /** O5 / REC-02 — open YCTD create with out_of_plan (or in_plan cell) preset. */
  const [yctdCreatePreset, setYctdCreatePreset] = useState<{
    headcount_mode?: 'in_plan' | 'out_of_plan';
    headcount_cell_id?: string;
    headcount?: number;
    open?: boolean;
  } | null>(null);
  /** UC-BP-REC-08 drill → J-HRM-05 YCTD detail */
  const [focusRequisitionId, setFocusRequisitionId] = useState<string | null>(null);
  const [activeJobsType, setActiveJobsType] = useState('all');
  const [activeCandidatesType, setActiveCandidatesType] = useState('all');
  const [activeInterviewsType, setActiveInterviewsType] = useState('scheduled');
  const recruitmentJobTemplatesState = useJobTemplates(true);

  /** D-HDSD-MUTATE-FE-13/FE-14 — sync page-level templates when entering jd-library or requisitions. */
  useEffect(() => {
    if (activeTab === 'requisitions' || activeTab === 'jd-library') {
      void recruitmentJobTemplatesState.refetch();
    }
  }, [activeTab, recruitmentJobTemplatesState.refetch]);

  useEffect(() => {
    const tab = resolveRecruitmentTabFromSearch(location.search);
    if (tab) setActiveTab(tab);
  }, [location.search]);
  const [selectedCandidate, setSelectedCandidate] = useState<KanbanCandidate | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<typeof staffingProposals[0] | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RecruitmentPlan | null>(null);
  const [planSpawnMissing, setPlanSpawnMissing] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  /** Baseline months when opening edit — O3 qty_drift compare. */
  const [planEditBaseline, setPlanEditBaseline] = useState<PlanDepartment[]>([]);
  const [qtyDriftConfirmOpen, setQtyDriftConfirmOpen] = useState(false);
  const [pendingPlanSave, setPendingPlanSave] = useState<{
    data: RecruitmentPlanFormValues;
    status: string;
  } | null>(null);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
  const [compareInitialRequisitionId, setCompareInitialRequisitionId] = useState<string | null>(null);
  const [compareInitialCandidateId, setCompareInitialCandidateId] = useState<string | null>(null);
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<{
    id: string;
    fullName: string;
    email: string;
    position?: string | null;
    requisition_id?: string | null;
    recruitment_candidate_id?: string | null;
    list_lane?: string | null;
  } | null>(null);
  const [stageFromCompare, setStageFromCompare] = useState<CompareEvaluateTarget | null>(null);
  const [stageTransitionOpen, setStageTransitionOpen] = useState(false);
  const [hirePendingKanban, setHirePendingKanban] = useState<KanbanCandidate | null>(null);
  const [hirePendingKanbanStage, setHirePendingKanbanStage] = useState<string | null>(null);
  const [hireSubmitting, setHireSubmitting] = useState(false);
  const {
    items: pipelineStageItems,
    hiredOutcomeKey,
    catalogCount: pipelineCatalogCount,
    isLoading: pipelineStagesLoading,
  } = useRecPipelineStagesEffective();
  const [planDepartments, setPlanDepartments] = useState<PlanDepartment[]>([
    createEmptyPlanDepartment('1'),
  ]);

  const {
    catalogs: planCatalogs,
    departmentPickerOptions: planDepartmentOptions,
    isLoading: planCatalogsLoading,
    isError: planCatalogsError,
  } = useSettingsCatalogsOverview({ enabled: activeTab === 'plans' || isPlanDialogOpen });
  const planPositionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(planCatalogs ?? []),
    [planCatalogs],
  );
  const planCatalogEff =
    planPositionOptions.length > 0 || planDepartmentOptions.length > 0;

  const dashboardEnabled = activeTab === 'dashboard';
  const { candidates, updateCandidateStage } = useRecruitmentDashboard(dashboardEnabled);

  // Fetch recruitment plans (Nest physical /recruitment-plans*)
  const {
    plans: recruitmentPlans,
    loading: plansLoading,
    stats: planStats,
    createPlan,
    upsertPlan,
    updatePlanStatus,
    submitPlanWorkflow,
    spawnPlanRequests,
  } = useRecruitmentPlans();

  useEffect(() => {
    if (!selectedPlan) return;
    const refreshed = recruitmentPlans.find((p) => p.id === selectedPlan.id);
    if (refreshed) setSelectedPlan(refreshed);
  }, [recruitmentPlans, selectedPlan?.id]);

  const evaluationsTabEnabled = activeTab === 'evaluations';
  const {
    evaluations,
    loading: evaluationsLoading,
    stats: evaluationStats,
    refetch: refetchEvaluations,
  } = useCandidateEvaluations(evaluationsTabEnabled || isComparisonDialogOpen);

  const { requisitions: compareSeedRequisitions, refetch: refreshCompareRequisitions } =
    useJobRequisitions();

  const openCompareForYctd = useCallback(
    (requisitionId: string | null | undefined, candidateId?: string | null) => {
      setCompareInitialRequisitionId(normalizeRequisitionId(requisitionId) || null);
      setCompareInitialCandidateId((candidateId ?? '').trim() || null);
      setIsComparisonDialogOpen(true);
    },
    [],
  );

  const openEvaluationFromCompare = useCallback((target: CompareEvaluateTarget) => {
    setEvaluatingCandidate({
      id: target.id,
      fullName: target.full_name,
      email: target.email,
      position: target.position ?? null,
      requisition_id: target.requisition_id,
      recruitment_candidate_id: target.recruitment_candidate_id ?? null,
      list_lane: target.recruitment_candidate_id ? 'spine' : 'pool',
    });
    setIsEvaluationDialogOpen(true);
  }, []);

  const openEvaluationFromRow = useCallback((evaluation: CandidateEvaluation) => {
    setEvaluatingCandidate({
      id: evaluation.candidate_id,
      fullName: evaluation.candidate_name,
      email: evaluation.candidate_email,
      position: evaluation.candidate_position,
      requisition_id: evaluation.requisition_id ?? null,
      recruitment_candidate_id: evaluation.recruitment_candidate_id ?? null,
      list_lane: evaluation.recruitment_candidate_id ? 'spine' : 'pool',
    });
    setIsEvaluationDialogOpen(true);
  }, []);

  // Handle drag and drop — FR-HRM-INT-01: hired requires employee link picker
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const candidateId = draggableId;
    const newStage = destination.droppableId as KanbanCandidate['stage'];
    const row = candidates.find((c) => c.id === candidateId);

    if (needsHireEmployeePicker(newStage, row?.employeeId, hiredOutcomeKey)) {
      if (row) {
        setHirePendingKanban(row);
        setHirePendingKanbanStage(newStage);
      }
      return;
    }

    void updateCandidateStage(candidateId, newStage, {
      employeeId: row?.employeeId,
    });
  };

  const handleConfirmKanbanHire = async (employeeId: string) => {
    if (!hirePendingKanban) return;
    setHireSubmitting(true);
    try {
      const targetStage = resolveHireTargetStage(hirePendingKanbanStage, hiredOutcomeKey);
      await updateCandidateStage(hirePendingKanban.id, targetStage, { employeeId });
      setHirePendingKanban(null);
      setHirePendingKanbanStage(null);
    } finally {
      setHireSubmitting(false);
    }
  };

  const form = useForm<JobPostingFormValues>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      department: '',
      location: '',
      type: '',
      openings: '1',
      salaryMin: '',
      salaryMax: '',
      description: '',
      requirements: '',
      benefits: '',
    },
  });

  const planForm = useForm<RecruitmentPlanFormValues>({
    resolver: zodResolver(recruitmentPlanSchema),
    defaultValues: {
      title: '',
      startMonth: '1',
      endMonth: '12',
      year: new Date().getFullYear().toString(),
      note: '',
    },
  });

  const onSubmitJob = (data: JobPostingFormValues) => {
    console.log('Job posting data:', data);
    toast({
      title: t('common.success'),
      description: t('recruitment.createJobSuccess'),
    });
    setIsJobDialogOpen(false);
    form.reset();
  };

  const resetPlanEditor = () => {
    setEditingPlanId(null);
    setPlanEditBaseline([]);
    setPendingPlanSave(null);
    setQtyDriftConfirmOpen(false);
    planForm.reset();
    setPlanDepartments([createEmptyPlanDepartment('1')]);
  };

  const assertPlanCatalogKeys = (): boolean => {
    if (!planCatalogEff) return true;
    for (const dept of planDepartments) {
      if (!dept.department_key.trim()) {
        toast({
          title: t('messages.error'),
          description: HRM_HC_KEY_UNKNOWN_TOAST_VI,
          variant: 'destructive',
        });
        return false;
      }
      for (const pos of dept.positions) {
        if (!pos.position_key.trim()) {
          toast({
            title: t('messages.error'),
            description: HRM_HC_KEY_UNKNOWN_TOAST_VI,
            variant: 'destructive',
          });
          return false;
        }
      }
    }
    return true;
  };

  const buildPlanPayload = (
    data: RecruitmentPlanFormValues,
    status: string,
    allowOverride = false,
  ) => ({
    title: data.title,
    startMonth: parseInt(data.startMonth, 10),
    endMonth: parseInt(data.endMonth, 10),
    year: parseInt(data.year, 10),
    note: data.note,
    status,
    allow_override: allowOverride || undefined,
    departments: planDepartments.map((dept) => ({
      name:
        planDepartmentOptions.find((o) => o.value === dept.department_key)?.label ??
        dept.name,
      department_key: dept.department_key,
      positions: dept.positions.map((pos) => ({
        name:
          planPositionOptions.find((o) => o.value === pos.position_key)?.label ?? pos.name,
        position_key: pos.position_key,
        months: pos.months,
      })),
    })),
  });

  const persistPlan = async (
    data: RecruitmentPlanFormValues,
    status: string,
    allowOverride: boolean,
  ): Promise<boolean> => {
    const payload = buildPlanPayload(data, status, allowOverride);
    const success = editingPlanId
      ? await upsertPlan(editingPlanId, payload)
      : await createPlan(payload);
    if (success) {
      setIsPlanDialogOpen(false);
      resetPlanEditor();
    }
    return success;
  };

  const trySavePlan = async (data: RecruitmentPlanFormValues, status: string) => {
    if (!assertPlanCatalogKeys()) return;
    if (editingPlanId) {
      const driftHits = detectQtyDriftInDepartments(planEditBaseline, planDepartments);
      if (driftHits.length > 0) {
        setPendingPlanSave({ data, status });
        setQtyDriftConfirmOpen(true);
        return;
      }
    }
    await persistPlan(data, status, false);
  };

  const onSubmitPlan = async (data: RecruitmentPlanFormValues) => {
    await trySavePlan(data, 'draft');
  };

  const onSavePlanDraft = async () => {
    const valid = await planForm.trigger();
    if (!valid) return;
    const data = planForm.getValues();
    await trySavePlan(data, 'draft');
  };

  const confirmQtyDriftSave = async () => {
    if (!pendingPlanSave) return;
    const { data, status } = pendingPlanSave;
    setQtyDriftConfirmOpen(false);
    setPendingPlanSave(null);
    await persistPlan(data, status, true);
  };

  const openEditPlan = (plan: RecruitmentPlan) => {
    setEditingPlanId(plan.id);
    planForm.reset({
      title: plan.title,
      startMonth: String(plan.startMonth),
      endMonth: String(plan.endMonth),
      year: String(plan.year),
      note: plan.note ?? '',
    });
    const nextDepts =
      plan.departments.length > 0
        ? plan.departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            department_key: dept.department_key ?? '',
            positions:
              dept.positions.length > 0
                ? dept.positions.map((pos) => ({
                    id: pos.id,
                    name: pos.name,
                    position_key: pos.position_key ?? '',
                    months: pos.months?.length === 12 ? pos.months : emptyHeadcountYear(),
                  }))
                : [
                    {
                      id: `${dept.id}-1`,
                      name: '',
                      position_key: '',
                      months: emptyHeadcountYear(),
                    },
                  ],
          }))
        : [createEmptyPlanDepartment('1')];
    setPlanDepartments(nextDepts);
    setPlanEditBaseline(
      nextDepts.map((d) => ({
        ...d,
        positions: d.positions.map((p) => ({
          ...p,
          months: p.months.map((m) => ({ ...m })),
        })),
      })),
    );
    setIsPlanDialogOpen(true);
  };

  const addDepartment = () => {
    const newId = (planDepartments.length + 1).toString();
    setPlanDepartments([...planDepartments, createEmptyPlanDepartment(newId)]);
  };

  const addPosition = (deptId: string) => {
    setPlanDepartments(
      planDepartments.map((dept) => {
        if (dept.id !== deptId) return dept;
        const newPosId = `${deptId}-${dept.positions.length + 1}`;
        return {
          ...dept,
          positions: [
            ...dept.positions,
            {
              id: newPosId,
              name: '',
              position_key: '',
              months: emptyHeadcountYear(),
            },
          ],
        };
      }),
    );
  };

  const updateDepartmentKey = (deptId: string, departmentKey: string) => {
    const label =
      planDepartmentOptions.find((o) => o.value === departmentKey)?.label ?? '';
    setPlanDepartments(
      planDepartments.map((dept) =>
        dept.id === deptId
          ? { ...dept, department_key: departmentKey, name: label || dept.name }
          : dept,
      ),
    );
  };

  const updatePositionKey = (deptId: string, posId: string, positionKey: string) => {
    const label = planPositionOptions.find((o) => o.value === positionKey)?.label ?? '';
    setPlanDepartments(
      planDepartments.map((dept) => {
        if (dept.id !== deptId) return dept;
        return {
          ...dept,
          positions: dept.positions.map((pos) =>
            pos.id === posId
              ? { ...pos, position_key: positionKey, name: label || pos.name }
              : pos,
          ),
        };
      }),
    );
  };

  const updateMonthNeedHire = (deptId: string, posId: string, monthIdx: number, value: number) => {
    setPlanDepartments(
      planDepartments.map((dept) => {
        if (dept.id !== deptId) return dept;
        return {
          ...dept,
          positions: dept.positions.map((pos) =>
            pos.id === posId
              ? { ...pos, months: withNeedHireAt(pos.months, monthIdx, value) }
              : pos,
          ),
        };
      }),
    );
  };

  const removeDepartment = (deptId: string) => {
    if (planDepartments.length > 1) {
      setPlanDepartments(planDepartments.filter(dept => dept.id !== deptId));
    }
  };

  const removePosition = (deptId: string, posId: string) => {
    setPlanDepartments(planDepartments.map(dept => {
      if (dept.id === deptId && dept.positions.length > 1) {
        return {
          ...dept,
          positions: dept.positions.filter(pos => pos.id !== posId),
        };
      }
      return dept;
    }));
  };

  const getSelectedMonths = () => {
    const start = parseInt(planForm.watch('startMonth') || '1');
    const end = parseInt(planForm.watch('endMonth') || '12');
    const months = [];
    for (let i = start; i <= end; i++) {
      months.push(i);
    }
    return months;
  };

  /** VAL-REC-CNS-04 — EFF>0 = Nest columns (incl. N+1); EFF=0 = soft-empty (no invent starter-six SoT). */
  const stages = useMemo(
    () => buildRecPipelineKanbanColumns(pipelineStageItems),
    [pipelineStageItems],
  );
  const kanbanSoftEmpty =
    !pipelineStagesLoading && pipelineCatalogCount === 0 && stages.length === 0;

  const getCandidatesByStage = (stage: string) =>
    candidates.filter((c) => c.stage === stage);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'w-3 h-3',
          i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
        )}
      />
    ));
  };

  const months = Array.from({ length: 7 }, (_, i) => t('recruitment.month', { num: i + 1 }));

  return (
    <div
      className={cn(
        'flex w-full max-w-full flex-col animate-fade-in',
        portalEmbed
          ? 'min-h-0 min-w-0 flex-1'
          : 'h-[calc(100vh-120px)]',
      )}
    >
      <h1 className="text-xl md:text-2xl font-bold text-xevn-text px-4 md:px-6 pt-4 pb-2">Tuyển dụng (Recruitment)</h1>
      {/* Top Navigation — L-OPS neutral (no rainbow pills) */}
      <div className="flex-shrink-0 border-b bg-background px-3 py-2 md:px-6 md:py-3">
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-1">
          {topNavTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Jobs dropdown — trigger activates tab even if menu dismisses (DEF-E1A-JP-NAV-01)
            if (tab.id === 'jobs') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      data-testid="recruitment-nav-jobs"
                      className={recTabButtonClass(isActive)}
                      onClick={() => setActiveTab('jobs')}
                    >
                      <div className={recTabIconWrapClass(isActive)}>
                        <TabIcon className={recTabIconClass(isActive)} />
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-popover"
                    portalScope="iframe"
                    data-testid="recruitment-jobs-menu"
                  >
                    {jobsMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        data-testid={`recruitment-jobs-menu-${item.id}`}
                        onClick={() => {
                          setActiveTab('jobs');
                          setActiveJobsType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeJobsType === item.id && activeTab === 'jobs' && "text-primary font-medium"
                        )}
                      >
                        {item.label}
                        {activeJobsType === item.id && activeTab === 'jobs' && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Candidates dropdown
            if (tab.id === 'candidates') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      data-testid="recruitment-nav-candidates"
                      className={recTabButtonClass(isActive)}
                      onClick={() => setActiveTab('candidates')}
                    >
                      <div className={recTabIconWrapClass(isActive)}>
                        <TabIcon className={recTabIconClass(isActive)} />
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-popover"
                    portalScope="iframe"
                  >
                    {candidatesMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('candidates');
                          setActiveCandidatesType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeCandidatesType === item.id && activeTab === 'candidates' && "text-primary font-medium"
                        )}
                      >
                        {item.label}
                        {activeCandidatesType === item.id && activeTab === 'candidates' && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Interviews dropdown
            if (tab.id === 'interviews') {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      data-testid="recruitment-nav-interviews"
                      className={recTabButtonClass(isActive)}
                      onClick={() => setActiveTab('interviews')}
                    >
                      <div className={recTabIconWrapClass(isActive)}>
                        <TabIcon className={recTabIconClass(isActive)} />
                      </div>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-popover"
                    portalScope="iframe"
                  >
                    {interviewsMenuItems.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => {
                          setActiveTab('interviews');
                          setActiveInterviewsType(item.id);
                        }}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeInterviewsType === item.id && activeTab === 'interviews' && "text-primary font-medium"
                        )}
                      >
                        {item.label}
                        {activeInterviewsType === item.id && activeTab === 'interviews' && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
            // Regular tabs without dropdown
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={recTabButtonClass(isActive)}
              >
                <div className={recTabIconWrapClass(isActive)}>
                  <TabIcon className={recTabIconClass(isActive)} />
                </div>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

        {/* Main Content — portal: chỉ cuộn dọc trong khung; tránh overflow-auto gây thanh ngang giữa trang */}
        <div
          className={cn(
            'min-w-0 flex-1 p-3 md:p-6',
            portalEmbed
              ? 'min-h-0 overflow-x-hidden overflow-y-auto'
              : 'overflow-auto',
          )}
        >
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4" data-testid="rec-dashboard-tab-precision">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[20px] font-bold tracking-tight text-xevn-text">
                {t('recruitment.dashboardTitle')}
              </h2>
              <PermissionGate module="recruitment" action="create">
                <Button size="sm" className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setActiveTab('jobs'); setAutoOpenCreate(true); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('recruitment.createJobPosting')}
                </Button>
              </PermissionGate>
            </div>

            {/* Sub Tabs */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList>
                <TabsTrigger value="dashboard">{t('recruitment.dashboardTab')}</TabsTrigger>
                <TabsTrigger value="board">{t('recruitment.boardTab')}</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-3 space-y-3">
                <Suspense fallback={<RecTabSkeleton />}>
                  <RecruitmentNestDashboardPanel
                    onOpenYctd={(requisitionId) => {
                      setFocusRequisitionId(requisitionId);
                      setActiveTab('requisitions');
                    }}
                    onOpenPlans={() => setActiveTab('plans')}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="board" className="mt-4">
                {/* Kanban Board — VAL-REC-CNS-04 Nest EFF columns when catalog >0 */}
                {pipelineStagesLoading ? (
                  <p
                    className="text-sm text-xevn-textSecondary py-8 text-center"
                    data-testid="rec-kanban-stages-loading"
                  >
                    Đang tải danh mục giai đoạn pipeline…
                  </p>
                ) : kanbanSoftEmpty ? (
                  <div
                    className="rounded-card border border-dashed border-xevn-border bg-muted/30 px-4 py-8 text-center space-y-3"
                    data-testid="rec-kanban-stages-empty"
                  >
                    <p className="text-sm text-xevn-textSecondary">{REC_PIPELINE_STAGE_EMPTY_CTA_VI}</p>
                    <Link
                      to="/settings"
                      className="inline-block text-sm font-medium text-primary underline"
                      data-testid="rec-kanban-stages-empty-cta"
                    >
                      Mở Cài đặt → Giai đoạn REC
                    </Link>
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div
                      className="flex gap-6 overflow-x-auto pb-4 h-full"
                      data-testid="rec-kanban-board"
                    >
                      {stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="kanban-column min-w-[260px] w-[280px] flex-shrink-0 flex flex-col"
                        >
                          <div className="flex items-center justify-between mb-3 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={cn('inline-block h-2.5 w-2.5 rounded-sm shrink-0', stage.color)}
                                aria-hidden
                              />
                              <h3 className="font-semibold text-sm truncate" title={stage.label}>
                                {stage.label}
                              </h3>
                            </div>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {getCandidatesByStage(stage.id).length}
                            </Badge>
                          </div>
                          <Droppable droppableId={stage.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                  "space-y-2 min-h-[300px] flex-1 p-3 rounded-lg transition-colors border border-dashed border-transparent",
                                  snapshot.isDraggingOver ? "bg-primary/10 border-primary/30" : "bg-muted/50"
                                )}
                              >
                                {getCandidatesByStage(stage.id).map((candidate, index) => (
                                  <Draggable
                                    key={candidate.id}
                                    draggableId={candidate.id}
                                    index={index}
                                    isDragDisabled={isRecruitmentWorkflowLocked(
                                      candidate.workflowInstanceId,
                                      candidate.stage,
                                      'candidate',
                                    )}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={cn(
                                          "kanban-card group",
                                          snapshot.isDragging && "shadow-lg ring-2 ring-primary"
                                        )}
                                        onClick={() => setSelectedCandidate(candidate)}
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <div
                                              {...provided.dragHandleProps}
                                              className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                              {candidate.fullName.split(' ').pop()?.charAt(0)}
                                            </div>
                                          </div>
                                          <div className="flex">{renderStars(candidate.rating)}</div>
                                        </div>
                                        <p className="font-medium text-sm mb-1">{candidate.fullName}</p>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {candidate.position}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                          <span>{candidate.source}</span>
                                          <span>{new Date(candidate.appliedDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      ))}
                    </div>
                  </DragDropContext>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'requisitions' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <JobRequisitionsTab
              onOpenJdLibrary={() => setActiveTab('jd-library')}
              jobTemplates={recruitmentJobTemplatesState.templates}
              jobTemplatesLoading={recruitmentJobTemplatesState.loading}
              refetchJobTemplates={recruitmentJobTemplatesState.refetch}
              hydrateJobTemplates={recruitmentJobTemplatesState.hydrateTemplates}
              createPreset={yctdCreatePreset ?? undefined}
              onCreatePresetConsumed={() => setYctdCreatePreset(null)}
              focusRequisitionId={focusRequisitionId}
              onFocusRequisitionConsumed={() => setFocusRequisitionId(null)}
            />
          </Suspense>
        )}

        {activeTab === 'jd-library' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <JobTemplatesTab sharedTemplates={recruitmentJobTemplatesState} />
          </Suspense>
        )}

        {/* Jobs Tab — page title lives in JobPostingsTab (rec-jobs-tab-precision) for QA measure parity */}
        {activeTab === 'jobs' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <JobPostingsTab autoOpenCreate={autoOpenCreate} />
          </Suspense>
        )}


        {activeTab === 'candidates' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <CandidatesTab />
          </Suspense>
        )}

        {/* Proposals Tab — O5 HOLD ≠ YCTD SoT; CTA redirect only */}
        {activeTab === 'proposals' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <HeadcountProposalTab
              onCreateOutOfPlanYctd={() => {
                setYctdCreatePreset({ headcount_mode: 'out_of_plan', open: true });
                setActiveTab('requisitions');
              }}
            />
          </Suspense>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <CampaignsTab />
          </Suspense>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <InterviewsTab />
          </Suspense>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <RecruitmentApprovalsTab />
          </Suspense>
        )}

        {/* Evaluations Tab */}
        {activeTab === 'evaluations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('recruitment.evaluateCandidate')}</h2>
              <Button
                onClick={() => {
                  setCompareInitialRequisitionId(null);
                  setCompareInitialCandidateId(null);
                  setIsComparisonDialogOpen(true);
                }}
                data-testid="hdsd-rec-compare-open-btn"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                {t('recruitment.compareCandidates')}
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.totalEvaluations')}</p>
                  <p className="text-3xl font-bold text-primary">{evaluationStats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.pass')}</p>
                  <p className="text-3xl font-bold text-green-600">{evaluationStats.pass}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.fail')}</p>
                  <p className="text-3xl font-bold text-red-600">{evaluationStats.fail}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{t('recruitment.pendingReview')}</p>
                  <p className="text-3xl font-bold text-warning">{evaluationStats.pending + evaluationStats.hold}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              {evaluationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : evaluations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ClipboardCheck className="w-12 h-12 mb-4 opacity-50" />
                  <p>{t('recruitment.noEvaluations')}</p>
                  <p className="text-sm">{t('recruitment.evaluationsAfterInterview')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('recruitment.candidate')}</TableHead>
                      <TableHead>{t('recruitment.position')}</TableHead>
                      <TableHead>{t('recruitment.evaluator')}</TableHead>
                      <TableHead>{t('recruitment.score')}</TableHead>
                      <TableHead>{t('recruitment.result')}</TableHead>
                      <TableHead>{t('recruitment.evaluationDate')}</TableHead>
                      <TableHead className="text-right">{t('recruitment.detail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                              {evaluation.candidate_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium">{evaluation.candidate_name}</p>
                              <p className="text-xs text-muted-foreground">{evaluation.candidate_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{evaluation.candidate_position || '-'}</TableCell>
                        <TableCell>{evaluation.evaluator_name || evaluation.evaluator_email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{evaluation.weighted_score?.toFixed(1) || '-'}</span>
                            <span className="text-xs text-muted-foreground">/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            evaluation.result === 'pass' ? 'default' : 
                            evaluation.result === 'fail' ? 'destructive' : 
                            'secondary'
                          }>
                            {evaluation.result === 'pass' ? t('recruitment.resultPass') : 
                             evaluation.result === 'fail' ? t('recruitment.resultFail') : 
                             evaluation.result === 'hold' ? t('recruitment.resultHold') : t('recruitment.resultPending')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(evaluation.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid="rec-eval-row-compare"
                              title={t('recruitment.compareCandidates')}
                              onClick={() =>
                                openCompareForYctd(
                                  evaluation.requisition_id,
                                  evaluation.recruitment_candidate_id || evaluation.candidate_id,
                                )
                              }
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEvaluationFromRow(evaluation)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            {!selectedPlan ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold" data-testid="rec-hc-plan-title">
                    {t('recruitment.recruitmentPlansDinhBien')}
                  </h2>
                  <PermissionGate module="recruitment" action="create">
                    <Dialog
                      open={isPlanDialogOpen}
                      onOpenChange={(open) => {
                        setIsPlanDialogOpen(open);
                        if (!open) resetPlanEditor();
                        if (open && !editingPlanId) {
                          resetPlanEditor();
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          data-testid="rec-hc-create-plan-btn"
                          onClick={() => {
                            setEditingPlanId(null);
                            resetPlanEditor();
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                           {t('recruitment.createPlan')}
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CalendarClock className="w-5 h-5 text-primary" />
                          {editingPlanId
                            ? t('recruitment.editPlanDinhBien')
                            : t('recruitment.createNewPlanDinhBien')}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...planForm}>
                        <form onSubmit={planForm.handleSubmit(onSubmitPlan)} className="flex-1 flex flex-col overflow-hidden">
                          {/* Basic Info */}
                          <div className="space-y-4 pb-4 border-b">
                            <FormField
                              control={planForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                   <FormLabel>{t('recruitment.planTitle')} <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input placeholder={t('recruitment.planTitlePlaceholder')} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-4 gap-4">
                              <FormField
                                control={planForm.control}
                                name="year"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.year')} <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('recruitment.selectYear')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={planForm.control}
                                name="startMonth"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.fromMonth')} <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('recruitment.selectMonth')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                          <SelectItem key={i + 1} value={(i + 1).toString()}>{t('recruitment.month', { num: i + 1 })}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={planForm.control}
                                name="endMonth"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.toMonth')} <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={t('recruitment.selectMonth')} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (
                                          <SelectItem key={i + 1} value={(i + 1).toString()}>{t('recruitment.month', { num: i + 1 })}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={planForm.control}
                                name="note"
                                render={({ field }) => (
                                  <FormItem>
                                     <FormLabel>{t('recruitment.note')}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t('recruitment.notePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          {/* Headcount Table — single Cần tuyển (O1 · ALT-03) */}
                          <div className="flex-1 overflow-hidden py-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                                {t('recruitment.headcountTableTitleNeedHire')}
                              </h3>
                              <Button type="button" variant="outline" size="sm" onClick={addDepartment}>
                                <Plus className="w-4 h-4 mr-1" />
                                {t('recruitment.addDepartment')}
                              </Button>
                            </div>
                            {planCatalogEff ? null : (
                              <p className="mb-2 text-xs text-muted-foreground">
                                Danh mục phòng ban / chức danh trống —{' '}
                                <Link to="/settings" className="text-primary underline font-medium">
                                  mở Cài đặt → Danh mục nghiệp vụ
                                </Link>
                                . Khi EFF&gt;0 bắt buộc chọn mã catalog (không free-text SoT).
                              </p>
                            )}

                            <ScrollArea className="h-[350px] border rounded-lg">
                              <Table data-testid="rec-hc-plan-grid">
                                <TableHeader className="sticky top-0 bg-background z-10">
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="min-w-[220px] sticky left-0 bg-muted/50">
                                       <div>{t('recruitment.department')} / {t('recruitment.position')}</div>
                                      <div className="text-xs font-normal text-warning mt-1">
                                        {t('recruitment.needHireLabel')}
                                      </div>
                                    </TableHead>
                                    {getSelectedMonths().map((month) => (
                                      <TableHead key={month} className="text-center min-w-[72px]">
                                        <div>{t('recruitment.month', { num: month })}</div>
                                        <div className="text-xs font-normal text-warning mt-1">
                                          {t('recruitment.needHireShort')}
                                        </div>
                                      </TableHead>
                                    ))}
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {planDepartments.map((dept) => (
                                    <Fragment key={dept.id}>
                                      <TableRow className="bg-muted/30">
                                        <TableCell className="sticky left-0 bg-muted/30">
                                          <div className="flex items-center gap-2 min-w-[200px]">
                                            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <CatalogSearchPicker
                                              options={planDepartmentOptions}
                                              value={dept.department_key}
                                              onValueChange={(v) => updateDepartmentKey(dept.id, v)}
                                              placeholder={t('recruitment.departmentName')}
                                              loading={planCatalogsLoading}
                                              errorText={
                                                planCatalogsError
                                                  ? t('settings.catalogs.loadError')
                                                  : undefined
                                              }
                                              emptyHint={
                                                <Link
                                                  to="/settings"
                                                  className="text-primary underline text-xs font-medium"
                                                >
                                                  Mở Cài đặt → Danh mục
                                                </Link>
                                              }
                                            />
                                          </div>
                                        </TableCell>
                                        {getSelectedMonths().map((month) => (
                                          <TableCell key={month} className="text-center text-muted-foreground">
                                            —
                                          </TableCell>
                                        ))}
                                        <TableCell>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeDepartment(dept.id)}
                                            className="text-destructive hover:text-destructive"
                                            disabled={planDepartments.length <= 1}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                      {dept.positions.map((pos) => (
                                        <TableRow key={pos.id}>
                                          <TableCell className="pl-8 sticky left-0 bg-background">
                                            <CatalogSearchPicker
                                              options={planPositionOptions}
                                              value={pos.position_key}
                                              onValueChange={(v) =>
                                                updatePositionKey(dept.id, pos.id, v)
                                              }
                                              placeholder={t('recruitment.positionName')}
                                              loading={planCatalogsLoading}
                                              errorText={
                                                planCatalogsError
                                                  ? t('settings.catalogs.loadError')
                                                  : undefined
                                              }
                                              emptyHint={
                                                <Link
                                                  to="/settings"
                                                  className="text-primary underline text-xs font-medium"
                                                >
                                                  Mở Cài đặt → Danh mục
                                                </Link>
                                              }
                                            />
                                          </TableCell>
                                          {getSelectedMonths().map((month) => {
                                            const monthIdx = month - 1;
                                            const cell = pos.months[monthIdx];
                                            const needHire = cell?.need_hire ?? 0;
                                            const currentHc = cell?.headcount_current ?? 0;
                                            const overHc = needHire >= 1 && needHire > currentHc;
                                            return (
                                              <TableCell key={month} className="text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                  <Input
                                                    type="number"
                                                    min={0}
                                                    data-testid={`rec-hc-need-hire-${dept.id}-${pos.id}-m${month}`}
                                                    value={needHire}
                                                    onChange={(e) =>
                                                      updateMonthNeedHire(
                                                        dept.id,
                                                        pos.id,
                                                        monthIdx,
                                                        parseInt(e.target.value, 10) || 0,
                                                      )
                                                    }
                                                    className={cn(
                                                      'h-7 w-14 text-center px-1 mx-auto border-orange-300 focus:ring-orange-500',
                                                      overHc && 'border-warning',
                                                    )}
                                                    aria-label={`Cần tuyển tháng ${month}`}
                                                  />
                                                  {currentHc > 0 ? (
                                                    <span
                                                      className="text-[10px] text-muted-foreground"
                                                      title="Hiện tại (snapshot — chỉ đọc)"
                                                      data-testid={`rec-hc-current-ro-${dept.id}-${pos.id}-m${month}`}
                                                    >
                                                      HT {currentHc}
                                                    </span>
                                                  ) : null}
                                                </div>
                                              </TableCell>
                                            );
                                          })}
                                          <TableCell>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removePosition(dept.id, pos.id)}
                                              className="text-destructive hover:text-destructive"
                                              disabled={dept.positions.length <= 1}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow key={`add-pos-${dept.id}`}>
                                        <TableCell className="pl-8 sticky left-0 bg-background" colSpan={getSelectedMonths().length + 2}>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => addPosition(dept.id)}
                                            className="text-muted-foreground hover:text-foreground"
                                          >
                                            <Plus className="w-4 h-4 mr-1" />
                                            {t('recruitment.addPosition')}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    </Fragment>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 pt-4 border-t">
                             <Button type="button" variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                              {t('recruitment.cancel')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              data-testid="rec-hc-save-draft-btn"
                              onClick={() => {
                                void onSavePlanDraft();
                              }}
                            >
                              {t('recruitment.saveDraft')}
                            </Button>
                            <Button type="submit" data-testid="rec-hc-save-plan-btn">
                              {editingPlanId ? t('recruitment.savePlan') : t('recruitment.createPlan')}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  </PermissionGate>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                       <p className="text-sm text-muted-foreground">{t('recruitment.totalPlans')}</p>
                      <p className="text-3xl font-bold text-primary">{planStats.total}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t('recruitment.approved')}</p>
                      <p className="text-3xl font-bold text-green-600">
                        {planStats.approved}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">{t('recruitment.pending')}</p>
                      <p className="text-3xl font-bold text-warning">
                        {planStats.pending}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  {plansLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recruitmentPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <CalendarClock className="w-12 h-12 mb-4 opacity-50" />
                       <p>{t('recruitment.noPlans')}</p>
                      <p className="text-sm">{t('recruitment.clickCreatePlan')}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('recruitment.planTitleCol')}</TableHead>
                          <TableHead>{t('recruitment.period')}</TableHead>
                          <TableHead>{t('recruitment.creator')}</TableHead>
                          <TableHead>{t('recruitment.createdDate')}</TableHead>
                          <TableHead>{t('recruitment.status')}</TableHead>
                          <TableHead className="text-right">{t('recruitment.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recruitmentPlans.map((plan) => (
                          <TableRow key={plan.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedPlan(plan)}>
                            <TableCell className="font-medium">{plan.title}</TableCell>
                            <TableCell>{plan.period}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                                  {(plan.creator || '?').charAt(0)}
                                </div>
                                {plan.creator || '—'}
                              </div>
                            </TableCell>
                            <TableCell>{plan.createdDate}</TableCell>
                            <TableCell>
                              <Badge variant={plan.status === 'approved' ? 'default' : 'secondary'}>
                                {plan.status === 'approved'
                                  ? t('recruitment.statusApproved')
                                  : plan.status === 'draft'
                                    ? t('recruitment.statusDraft')
                                    : plan.status === 'pending_approval'
                                      ? 'Chờ duyệt QT'
                                      : t('recruitment.statusPending')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </>
            ) : (
              <>
                {/* Plan Detail View - matching the reference image */}
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPlan(null)}>
                    ← {t('recruitment.back')}
                  </Button>
                  <h2 className="text-xl font-bold">{selectedPlan.title}</h2>
                </div>

                <Card>
                  <div className="border-b">
                    <div className="px-4 py-2">
                      <span className="text-sm font-medium text-primary border-b-2 border-primary pb-2">{t('recruitment.detailTab')}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-6">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('recruitment.planTitleCol')}</p>
                          <p className="font-medium">{selectedPlan.title}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.period')}</p>
                        <p className="font-medium">{selectedPlan.period}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">{t('recruitment.creator')}</p>
                          <Badge variant="secondary" className="bg-primary/10 text-primary mt-1">
                            👤 {selectedPlan.creator}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.createdDate')}</p>
                        <p className="font-medium">{selectedPlan.createdDate}</p>
                      </div>
                    </div>

                    {/* Content Table */}
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                         {t('recruitment.dinhBienContent')}
                      </h3>

                      {selectedPlan.departments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <FileText className="w-8 h-8 mb-2 opacity-50" />
                          <p>{t('recruitment.noDepartmentData')}</p>
                        </div>
                      ) : (
                        <ScrollArea className="w-full">
                          <Table data-testid="rec-hc-plan-detail-grid">
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead className="min-w-[200px]">
                                   <div>{t('recruitment.department')}</div>
                                  <div className="text-xs font-normal text-warning mt-1">
                                    {t('recruitment.needHireLabel')}
                                  </div>
                                </TableHead>
                                {(selectedPlan.departments[0]?.positions[0]?.months || []).map((m, i) => (
                                  <TableHead key={m.month || i} className="text-center min-w-[72px]">
                                    <div>{t('recruitment.month', { num: m.month || selectedPlan.startMonth + i })}</div>
                                    <div className="text-xs font-normal text-warning mt-1">
                                      {t('recruitment.needHireShort')}
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedPlan.departments.map((dept, deptIdx) => (
                                <Fragment key={dept.id || `dept-${deptIdx}`}>
                                  <TableRow className="bg-muted/30">
                                    <TableCell colSpan={(selectedPlan.departments[0]?.positions[0]?.months.length || 0) + 1} className="font-semibold">
                                      {dept.name}
                                      {dept.department_key ? (
                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                          ({dept.department_key})
                                        </span>
                                      ) : null}
                                    </TableCell>
                                  </TableRow>
                                  {dept.positions.map((pos, posIdx) => (
                                    <TableRow key={pos.id || `pos-${deptIdx}-${posIdx}`}>
                                      <TableCell className="pl-8">
                                        {pos.name}
                                        {pos.position_key ? (
                                          <span className="ml-2 text-xs text-muted-foreground">
                                            ({pos.position_key})
                                          </span>
                                        ) : null}
                                      </TableCell>
                                      {pos.months.map((month, monthIdx) => {
                                        const locked =
                                          selectedPlan.status === 'approved' &&
                                          month.lifecycle_status === 'need_hire_approved';
                                        const needHire = month.need_hire ?? 0;
                                        return (
                                          <TableCell key={month.month || monthIdx} className="text-center">
                                            <span
                                              className={
                                                needHire > 0
                                                  ? locked
                                                    ? 'text-success font-semibold'
                                                    : 'text-warning font-medium'
                                                  : 'text-muted-foreground'
                                              }
                                              title={locked ? 'Ô Cần tuyển đã khóa sau duyệt' : undefined}
                                            >
                                              {needHire}
                                            </span>
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4 border-t">
                      <Suspense fallback={null}>
                        <RecruitmentWfSpawnBanner visible={planSpawnMissing} />
                      </Suspense>
                      {selectedPlan.workflowInstanceId &&
                      isRecruitmentWorkflowLocked(
                        selectedPlan.workflowInstanceId,
                        selectedPlan.status,
                        'plan',
                      ) ? (
                        <p className="text-xs font-medium text-warning">{RECRUITMENT_WF_LOCKED_HINT_VI}</p>
                      ) : null}
                      <div className="flex justify-end gap-3 flex-wrap">
                        {(selectedPlan.status === 'draft' ||
                          selectedPlan.status === 'pending' ||
                          selectedPlan.status === 'rejected') &&
                        !isRecruitmentWorkflowLocked(
                          selectedPlan.workflowInstanceId,
                          selectedPlan.status,
                          'plan',
                        ) ? (
                          <Button
                            variant="outline"
                            data-testid="rec-hc-edit-plan-btn"
                            onClick={() => openEditPlan(selectedPlan)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </Button>
                        ) : null}
                        {!selectedPlan.workflowInstanceId &&
                        (selectedPlan.status === 'pending' ||
                          selectedPlan.status === 'draft' ||
                          selectedPlan.status === 'pending_approval' ||
                          selectedPlan.status === 'rejected') ? (
                          <Button
                            variant="secondary"
                            data-testid="rec-hc-submit-wf-btn"
                            onClick={() => {
                              void (async () => {
                                const res = await submitPlanWorkflow(selectedPlan.id);
                                setPlanSpawnMissing(res.spawnMissing);
                                if (res.ok) {
                                  const refreshed = recruitmentPlans.find((p) => p.id === selectedPlan.id);
                                  if (refreshed) setSelectedPlan(refreshed);
                                }
                              })();
                            }}
                          >
                            Gửi duyệt QT
                          </Button>
                        ) : null}
                        {selectedPlan.status === 'approved' ? (
                          <Button
                            data-testid="rec-hc-spawn-yctd-btn"
                            onClick={() => {
                              void (async () => {
                                await spawnPlanRequests(selectedPlan.id);
                              })();
                            }}
                          >
                            Sinh YCTD từ Cần tuyển
                          </Button>
                        ) : null}
                        {(selectedPlan.status === 'pending' || selectedPlan.status === 'draft') &&
                        !isRecruitmentWorkflowLocked(
                          selectedPlan.workflowInstanceId,
                          selectedPlan.status,
                          'plan',
                        ) ? (
                          <>
                            <Button
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => void updatePlanStatus(selectedPlan.id, 'rejected')}
                            >
                              {t('recruitment.reject')}
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              data-testid="rec-hc-approve-plan-btn"
                              onClick={() => {
                                void (async () => {
                                  const overCount = countOverHeadcountCells(
                                    selectedPlan.departments,
                                  );
                                  if (overCount > 0) {
                                    toast({
                                      title: 'Cảnh báo vượt Hiện tại',
                                      description: `${HRM_HC_OVER_HC_WARN_VI} (${overCount} ô).`,
                                    });
                                  }
                                  await updatePlanStatus(selectedPlan.id, 'approved', undefined, {
                                    overHcWarned: overCount > 0,
                                  });
                                })();
                              }}
                            >
                              {t('recruitment.approvePlan')}
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Suspense fallback={<RecTabSkeleton />}>
            <RecruitmentReportsTab />
          </Suspense>
        )}
      </div>

      {/* Removed - CandidateDetailView is now handled in CandidatesTab */}

      {/* Candidate Evaluation Dialog */}
      <Suspense fallback={null}>
        <CandidateEvaluationDialog
          candidate={evaluatingCandidate ? {
            id: evaluatingCandidate.id,
            full_name: evaluatingCandidate.fullName,
            email: evaluatingCandidate.email,
            position: evaluatingCandidate.position || null,
            recruitment_candidate_id: evaluatingCandidate.recruitment_candidate_id,
            list_lane: evaluatingCandidate.list_lane,
            requisition_id: evaluatingCandidate.requisition_id,
          } : null}
          open={isEvaluationDialogOpen}
          onOpenChange={setIsEvaluationDialogOpen}
          onSaved={() => void refetchEvaluations()}
          onCompareByYctd={(requisitionId, candidateId) => {
            openCompareForYctd(requisitionId, candidateId);
          }}
        />
      </Suspense>

      {/* Candidate Comparison Dialog */}
      <Suspense fallback={null}>
        <CandidateComparisonDialog
          open={isComparisonDialogOpen}
          onOpenChange={(open) => {
            setIsComparisonDialogOpen(open);
            if (!open) {
              setCompareInitialRequisitionId(null);
              setCompareInitialCandidateId(null);
            }
          }}
          initialRequisitionId={compareInitialRequisitionId}
          initialCandidateId={compareInitialCandidateId}
          seedEvaluations={evaluations}
          seedRequisitions={compareSeedRequisitions}
          refreshRequisitions={refreshCompareRequisitions}
          onEvaluateCandidate={openEvaluationFromCompare}
          onChangeStage={(target) => {
            setStageFromCompare(target);
            setStageTransitionOpen(true);
          }}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CandidateStageTransitionDialog
          open={stageTransitionOpen}
          onOpenChange={(open) => {
            setStageTransitionOpen(open);
            if (!open) setStageFromCompare(null);
          }}
          candidate={
            stageFromCompare
              ? {
                  id: stageFromCompare.id,
                  full_name: stageFromCompare.full_name,
                  email: stageFromCompare.email,
                  requisition_id: stageFromCompare.requisition_id,
                  recruitment_candidate_id: stageFromCompare.recruitment_candidate_id,
                  list_lane: stageFromCompare.recruitment_candidate_id ? 'spine' : 'pool',
                }
              : null
          }
          onSuccess={() => void refetchEvaluations()}
        />
      </Suspense>

      {/* O3 qty_drift — confirm version / controlled update (no silent YCTD overwrite) */}
      <AlertDialog
        open={qtyDriftConfirmOpen}
        onOpenChange={(open) => {
          setQtyDriftConfirmOpen(open);
          if (!open) setPendingPlanSave(null);
        }}
      >
        <AlertDialogContent data-testid="rec-hc-qty-drift-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>{HRM_HC_QTY_DRIFT_TITLE_VI}</AlertDialogTitle>
            <AlertDialogDescription>{HRM_HC_QTY_DRIFT_CONFIRM_VI}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="rec-hc-qty-drift-cancel">Hủy</AlertDialogCancel>
            <AlertDialogAction
              data-testid="rec-hc-qty-drift-confirm-btn"
              onClick={() => {
                void confirmQtyDriftSave();
              }}
            >
              Xác nhận cập nhật có kiểm soát
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Suspense fallback={null}>
        <HireEmployeeLinkDialog
          open={!!hirePendingKanban}
          onOpenChange={(open) => {
            if (!open && !hireSubmitting) {
              setHirePendingKanban(null);
              setHirePendingKanbanStage(null);
            }
          }}
          candidateName={hirePendingKanban?.fullName || 'ứng viên'}
          initialEmployeeId={hirePendingKanban?.employeeId}
          submitting={hireSubmitting}
          onConfirm={handleConfirmKanbanHire}
        />
      </Suspense>
    </div>
  );
}


