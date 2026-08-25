/**
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-IV-ONE-ACTIVE-FE-02
 * change_mode: FIX narrow
 * What: Merge Lane A listCandidates active_interview onto pool list (email key); keep badge testids
 * Why: QA FAIL FE-WIRE-POOL-ACTIVE-PROJECTION — pool API lacks projection; spine list has it
 * must_keep: pool mutate paths (stage/delete/import); U65 · badge testids
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-FE-01
 * change_mode: ADD
 * What: Merge spine YCTD+position display-ready; context ?requisition_id= prefill; list YCTD/position cols;
 *       create testids; open YCTD tab CTA — no free-text SoT
 * Why: AC-REC-UV-02/04 · F-REC-UV-YCTD-05 · UF-REC-UV-05-F5 / UF-REC-UV-07
 * must_keep: pool mutate · active_interview merge · U65 · no job_postings · no recruitment_uat_ready
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-FE-02
 * change_mode: FIX
 * What: Union spine-only Lane A rows into list SoT after pool+YCTD merge; spine stage display-only
 * Why: QA FAIL R-UV-YCTD-LANE-A-LIST-GAP — Lane A POST not in candidates-pool → list/F5 empty YCTD cells
 * must_keep: FE-01 YCTD SELECT + derived position + context prefill · pool mutate paths · no dual-write
 *            · no job_postings · U65 · no recruitment_uat_ready
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * change_mode: ADD
 * What: Stage Select binds F-REC-CAT-EFF; hire uses hiredOutcomeKey; UNKNOWN toast via toErrorMessage
 * Why: AC-PLT-REC-02..05 · QC CONDITION browser residual
 * must_keep: YCTD · IV badge · pool mutate · hire soft-link · U65 · recruitment_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Badge/calendar → ManageActiveInterviewDialog (cancel/complete/no_show/R-A); schedule only when 0 ACTIVE
 * Why: AC-REC-IV-03..06 residual · Lane A path lock · RETAIN create/409/badge GWC
 * must_keep: mergeActiveInterview · badge testids · U65 · honesty false · C-SLICE · REC-03 OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: YCTD-bound UV → CandidateStageTransitionDialog POST …/candidates/:id/transitions + Timeline in detail;
 *       EFF empty CTA; reject note; RETAIN pool stage only when không gắn YCTD (≠ FR-05 SoT)
 * Why: AC-REC-05-01..04 · O1/O3/O5 · BR-BP-CV-02 · DENY Nest /rec · pool-as-SoT · honesty flip
 * must_keep: IV manage · UV-YCTD union · hire soft-link pool path · U65 · C-SLICE · REC-03 OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01
 * change_mode: ADD / UPGRADE
 * What: YCTD → Gửi thư (CandidateMailDialog POST …/mail) + Đánh giá Pass/Fail neo Lane A;
 *       optional APP-02 after eval; Network /recruitment/ only; toast MAIL / EVAL family
 * Why: UC-BP-REC-06 Diễn biến #1–#2 · O1/O2/O5/O7/O8 · DENY Nest /rec · Campaign · stage từ mail
 * must_keep: REC-05 transitions · 06a manage · UV-YCTD · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01
 * change_mode: ADD / UPGRADE
 * What: YCTD offer-ready → Chấp nhận offer (CandidateAcceptOfferDialog POST …/applications/:id/accept-offer)
 *       + APP-02 hired-outcome + HTP surface; toast HIRE family; DENY Nest /rec · mail=hire · picker-as-DONE
 * Why: UC-BP-REC-07 Diễn biến #1–#2 · O1/O3/O4/O6 · BR-BP-LC-01 · U65
 * must_keep: REC-06 mail ≠ hire · REC-05 transitions · hire soft-link residual · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-CHANNELS-CONSUMER-FE-01
 * change_mode: ADD
 * What: source filter + list badge bind recruitment_channels catalog (AC-REC-02/03)
 * Why: BA-HRM-REC-CHANNELS-CONSUMER-01 · BR-REC-CH-SOT-01
 * must_keep: pool mutate · YCTD · stage EFF · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-CHANNELS-CONSUMER-AC-REC-02-FILTER-01
 * change_mode: ADD
 * What: HDSD testid on source filter trigger + options (AC-REC-02 harness)
 * Why: QA retest #4 — combobox locator không có text «Nguồn» trên trigger
 * must_keep: channel consumer wiring FE-01 · pool mutate · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-01
 * change_mode: FIX
 * What: ?candidateId= deep-link opens detail; spine stage/status merge drives accept-offer CTA
 * Why: QA BLOCKED DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE · J-HRM-CTR-HIRE-01
 * must_keep: U65 · YCTD · stage transition · no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02
 * change_mode: FIX
 * What: resolveRecruitmentEmbedSearchParams for ?candidateId=; match pool or recruitment_candidate_id
 * Why: DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES — parent CC URL carries tab/candidateId; iframe src omits them
 * must_keep: U65 · YCTD · stage transition · no seed
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Linkedin,
  Globe,
  Users,
  Mail,
  Briefcase,
  Facebook,
  X,
  CalendarClock,
  RefreshCw,
  Loader2,
  Star,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  BarChart3,
  ClipboardCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ScheduleInterviewDialog } from './ScheduleInterviewDialog';
import { ManageActiveInterviewDialog } from './ManageActiveInterviewDialog';
import { CandidateFormDialog } from './CandidateFormDialog';
import { CandidateDetailView } from './CandidateDetailView';
import { CandidateEvaluationDialog } from './CandidateEvaluationDialog';
import {
  CandidateComparisonDialog,
  type CompareEvaluateTarget,
} from './CandidateComparisonDialog';
import { CandidateMailDialog } from './CandidateMailDialog';
import { CandidateAcceptOfferDialog } from './CandidateAcceptOfferDialog';
import { CandidateImportDialog } from './CandidateImportDialog';
import { HireEmployeeLinkDialog } from './HireEmployeeLinkDialog';
import { CandidateStageTransitionDialog } from './CandidateStageTransitionDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCandidateEvaluations } from '@/hooks/useCandidateEvaluations';
import { useJobRequisitions } from '@/hooks/useJobRequisitions';
import { deleteCandidatePool, listCandidatesPool, listRecruitmentCandidates, startCandidatePipeline, updateCandidatePoolStage } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  detectRecruitmentSpawnMissing,
  isRecruitmentWorkflowLocked,
  RECRUITMENT_WF_LOCKED_HINT_VI,
} from '@/lib/recruitmentWorkflowUi';
import { mapRecruitmentFunnelStage, RECRUITMENT_FUNNEL_LABEL_VI } from '@/lib/recruitmentFunnel';
import {
  needsHireEmployeePicker,
  resolveHireTargetStage,
} from '@/lib/recruitmentHireLink';
import { buildContractHireCtaPath } from '@/lib/contractWorkspaceHireCta';
import { useRecPipelineStagesEffective } from '@/hooks/useRecPipelineStagesEffective';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { recruitmentChannelOptionsFromCatalog } from '@/lib/catalogSearchPicker';
import {
  candidateSourceFilterValues,
  resolveCandidateSourceDisplayLabel,
} from '@/lib/candidateRecruitmentChannelUi';
import {
  shouldUseLaneAStageTransition,
} from '@/lib/recCandidateStageTransition';
import { shouldShowAcceptOfferCta } from '@/lib/recCandidateAcceptOffer';
import { RecruitmentWfSpawnBanner } from '@/components/recruitment/RecruitmentWfSpawnBanner';
import {
  getActiveInterviewId,
  getCandidateActiveInterviewBadge,
  mergeActiveInterviewOntoPoolCandidates,
} from './candidateActiveInterview';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import {
  mergeYctdDisplayOntoPoolCandidates,
  normalizeRequisitionId,
  parseRequisitionIdFromSearch,
  resolveCandidatePositionLabel,
  resolveCandidateYctdLabel,
  unionSpineOnlyCandidatesIntoList,
  resolveCandidatePipelineStage,
} from '@/lib/candidateUvYctdUi';
import { resolveRecruitmentEmbedSearchParams } from '@/lib/recruitmentEmbedDeepLink';

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
  /** Lane A spine status when pool row enriched (offer-ready CTA gate). */
  status?: string | null;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  /** Soft hire link — FR-HRM-INT-01 / G-DB-01. */
  employee_id?: string | null;
  workflow_instance_id?: string | null;
  /** Lane A spine-only row — not in candidates-pool (FE-02 union). */
  list_lane?: 'pool' | 'spine';
  /** Lane A id when pool enriched by YCTD merge (FR-05 transitions). */
  recruitment_candidate_id?: string | null;
  has_active_interview?: boolean | null;
  active_interview_id?: string | null;
  active_interview_status?: string | null;
  active_interview_at?: string | null;
  active_interview_display_time_vi_vn?: string | null;
  active_interview_badge_label?: string | null;
  active_interview?: {
    has_active_interview?: boolean | null;
    active_interview_id?: string | null;
    active_interview_status?: string | null;
    active_interview_at?: string | null;
    active_interview_display_time_vi_vn?: string | null;
    active_interview_badge_label?: string | null;
  } | null;
  created_at: string;
}

function isSpineOnlyListRow(c: Candidate): boolean {
  return c.list_lane === 'spine';
}

const getStageConfig = (t: any): Record<string, { label: string; color: string; icon: React.ReactNode }> => ({
  new: { label: RECRUITMENT_FUNNEL_LABEL_VI.new, color: 'bg-primary/10 text-primary', icon: <Users className="w-4 h-4" /> },
  applied: { label: t('recruitment.ct.stages.applied'), color: 'bg-primary/10 text-primary', icon: <Users className="w-4 h-4" /> },
  screening: { label: t('recruitment.ct.stages.screening'), color: 'bg-warning/15 text-warning', icon: <Clock className="w-4 h-4" /> },
  interview: { label: t('recruitment.ct.stages.interview'), color: 'bg-xevn-accent/15 text-xevn-accent', icon: <UserCheck className="w-4 h-4" /> },
  offer: { label: t('recruitment.ct.stages.offer'), color: 'bg-warning/15 text-warning', icon: <CheckCircle className="w-4 h-4" /> },
  hired: { label: t('recruitment.ct.stages.hired'), color: 'bg-success/15 text-success', icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: t('recruitment.ct.stages.rejected'), color: 'bg-destructive/15 text-destructive', icon: <XCircle className="w-4 h-4" /> },
});

function displayStageKey(stage: string | null | undefined): string {
  const mapped = mapRecruitmentFunnelStage(stage);
  if (stage === 'applied') return 'applied';
  return mapped;
}

function candidateStageLocked(c: Candidate): boolean {
  return isRecruitmentWorkflowLocked(c.workflow_instance_id, c.stage, 'candidate');
}

const getSourceConfig = (source: string, t: any) => {
  const sourceConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    'LinkedIn': { label: 'LinkedIn', icon: Linkedin, color: 'bg-primary/10 text-primary' },
    'Website': { label: 'Website', icon: Globe, color: 'bg-xevn-accent/15 text-xevn-accent' },
    'Giới thiệu': { label: t('recruitment.ct.sources.referral'), icon: Users, color: 'bg-success/15 text-success' },
    'Referral': { label: t('recruitment.ct.sources.referral'), icon: Users, color: 'bg-success/15 text-success' },
    'Email': { label: 'Email', icon: Mail, color: 'bg-warning/15 text-warning' },
    'TopCV': { label: 'TopCV', icon: Briefcase, color: 'bg-success/15 text-success' },
    'VietnamWorks': { label: 'VietnamWorks', icon: Briefcase, color: 'bg-destructive/15 text-destructive' },
    'Facebook': { label: 'Facebook', icon: Facebook, color: 'bg-primary/10 text-primary' },
    'Hội chợ việc làm': { label: t('recruitment.ct.sources.jobFair'), icon: Users, color: 'bg-warning/15 text-warning' },
  };
  return sourceConfig[source] || {
    label: source || t('recruitment.ct.sources.other'),
    icon: Briefcase,
    color: 'bg-xevn-neutral/15 text-xevn-textSecondary',
  };
};

export function CandidatesTab() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const stageConfig = getStageConfig(t);
  const {
    stageOptions: catalogStageOptions,
    hiredOutcomeKey,
    catalogCount,
    stageDisplayLabel,
    items: pipelineStageItems,
  } = useRecPipelineStagesEffective();

  const { catalogs } = useSettingsCatalogsOverview();
  const channelCatalogOptions = useMemo(
    () => recruitmentChannelOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const channelCatalogCount = channelCatalogOptions.length;

  const resolveSourceDisplayLabel = useCallback(
    (source: string) =>
      resolveCandidateSourceDisplayLabel(
        channelCatalogOptions,
        channelCatalogCount,
        source,
        (code) => getSourceConfig(code, t).label,
      ),
    [channelCatalogOptions, channelCatalogCount, t],
  );

  /** AC-PLT-REC-02 — when effective >0 bind catalog; empty = soft-allow starter display (U65). */
  const transitionStageOptions = useMemo(() => {
    if (catalogCount > 0) {
      return catalogStageOptions.map((o) => ({
        value: o.value,
        label: o.label,
        color: stageConfig[o.value]?.color || 'bg-primary/10 text-primary',
      }));
    }
    return Object.entries(stageConfig)
      .filter(([key]) => key !== 'new')
      .map(([key, config]) => ({ value: key, label: config.label, color: config.color }));
  }, [catalogCount, catalogStageOptions, stageConfig]);
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activeStageTab, setActiveStageTab] = useState('all');
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [contextRequisitionId, setContextRequisitionId] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<Candidate | null>(null);
  const [isManageInterviewOpen, setIsManageInterviewOpen] = useState(false);
  const [manageInterviewId, setManageInterviewId] = useState<string | null>(null);
  const [selectedCandidateForManage, setSelectedCandidateForManage] = useState<Candidate | null>(null);
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState<Candidate | null>(null);
  const [isEvaluationDialogOpen, setIsEvaluationDialogOpen] = useState(false);
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<Candidate | null>(null);
  const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
  const [compareInitialRequisitionId, setCompareInitialRequisitionId] = useState<string | null>(
    null,
  );
  const [compareInitialCandidateId, setCompareInitialCandidateId] = useState<string | null>(null);
  const [isMailDialogOpen, setIsMailDialogOpen] = useState(false);
  const [mailingCandidate, setMailingCandidate] = useState<Candidate | null>(null);
  const [isAcceptOfferOpen, setIsAcceptOfferOpen] = useState(false);
  const [acceptOfferCandidate, setAcceptOfferCandidate] = useState<Candidate | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [spawnMissingBanner, setSpawnMissingBanner] = useState(false);
  const [pipelineSubmittingId, setPipelineSubmittingId] = useState<string | null>(null);
  const [hirePending, setHirePending] = useState<Candidate | null>(null);
  const [hirePendingStage, setHirePendingStage] = useState<string | null>(null);
  const [hireSubmitting, setHireSubmitting] = useState(false);
  const [stageTransitionOpen, setStageTransitionOpen] = useState(false);
  const [stageTransitionCandidate, setStageTransitionCandidate] = useState<Candidate | null>(null);
  const [stageTransitionInitial, setStageTransitionInitial] = useState<string | null>(null);
  const [stageHistoryRefreshToken, setStageHistoryRefreshToken] = useState(0);
  
  /** FIX: AbortController to cancel stale requests when companyId changes */
  const abortControllerRef = useRef<AbortController | null>(null);
  /** FIX: Track synthetic candidate created from schedule conflict */
  const [syntheticCandidateCreated, setSyntheticCandidateCreated] = useState(false);
  /** FIX: Debounce search input to prevent excessive filtering */
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const { evaluations } = useCandidateEvaluations(isComparisonDialogOpen);
  const { requisitions: compareSeedRequisitions, refetch: refreshCompareRequisitions } =
    useJobRequisitions();

  const fetchCandidates = useCallback(async () => {
    if (!currentCompanyId) return;
    
    /** FIX: Cancel previous request to prevent race conditions */
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    try {
      const [poolResponse, spineResponse] = await Promise.all([
        listCandidatesPool({ company_id: currentCompanyId }),
        listRecruitmentCandidates({ company_id: currentCompanyId, page: 1, page_size: 500 }),
      ]);
      
      /** FIX: Check if request was cancelled before updating state */
      if (controller.signal.aborted) return;
      
      const spineRows = spineResponse.data ?? [];
      const withInterview = mergeActiveInterviewOntoPoolCandidates(
        poolResponse.data ?? [],
        spineRows,
      );
      const merged = mergeYctdDisplayOntoPoolCandidates(withInterview, spineRows);
      const list = unionSpineOnlyCandidatesIntoList(merged, spineRows);
      setCandidates(list as Candidate[]);
      setSelectedCandidateForDetail((prev) => {
        if (!prev) return prev;
        const next = (list as Candidate[]).find((c) => c.id === prev.id);
        return next ?? prev;
      });
    } catch (error: any) {
      /** FIX: Don't show error toast if request was aborted */
      if (error?.name === 'AbortError' || controller.signal.aborted) return;
      console.error('Error fetching candidates:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.ct.errorLoad'),
        variant: 'destructive',
      });
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [currentCompanyId, t, toast]);

  const openCompareForYctd = useCallback(
    (requisitionId: string | null | undefined, candidateId?: string | null) => {
      setCompareInitialRequisitionId(normalizeRequisitionId(requisitionId) || null);
      setCompareInitialCandidateId((candidateId ?? '').trim() || null);
      setIsComparisonDialogOpen(true);
    },
    [],
  );

  const compareTargetToCandidate = useCallback((target: CompareEvaluateTarget): Candidate => {
    const spineId = (target.recruitment_candidate_id ?? '').trim();
    return {
      id: target.id,
      company_id: currentCompanyId || '',
      full_name: target.full_name,
      email: target.email,
      position: target.position ?? null,
      requisition_id: target.requisition_id,
      recruitment_candidate_id: target.recruitment_candidate_id ?? null,
      list_lane: spineId ? 'spine' : 'pool',
      created_at: '',
    };
  }, [currentCompanyId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  /** FIX: Deep-link — ?candidateId= opens detail after list SoT loads (J-HRM-CTR-HIRE / QA harness). */
  const candidateIdFromUrl = useMemo(() => {
    const id = resolveRecruitmentEmbedSearchParams(location.search).get('candidateId')?.trim();
    return id || null;
  }, [location.search]);

  useEffect(() => {
    /** FIX: Only proceed when we have an id and data is loaded */
    if (!candidateIdFromUrl) return;
    
    /** Wait for data to load */
    if (loading || candidates.length === 0) return;
    
    const match = candidates.find(
      (c) =>
        c.id === candidateIdFromUrl ||
        (c.recruitment_candidate_id ?? '').trim() === candidateIdFromUrl,
    );
    
    if (match) {
      setSelectedCandidateForDetail(match);
    } else {
      /** FIX: Show toast when candidate not found from deep link */
      toast({
        title: 'Không tìm thấy ứng viên',
        description: `ID "${candidateIdFromUrl}" không tồn tại hoặc đã bị xóa.`,
        variant: 'destructive',
      });
      /** Clear the invalid candidateId from URL */
      const params = new URLSearchParams(location.search);
      params.delete('candidateId');
      const next = params.toString();
      navigate(
        { pathname: location.pathname, search: next ? `?${next}` : '' },
        { replace: true },
      );
    }
  }, [candidateIdFromUrl, candidates, loading, location.search, location.pathname, navigate, toast]);

  /** AC-REC-UV-04 — open create prefilled when ?requisition_id= present. */
  useEffect(() => {
    const reqId = parseRequisitionIdFromSearch(location.search);
    if (!reqId) return;
    setContextRequisitionId(reqId);
    setEditingCandidate(null);
    setIsFormDialogOpen(true);
  }, [location.search]);

  const clearContextRequisitionFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('requisition_id') && !params.has('recruitment_request_id')) return;
    params.delete('requisition_id');
    params.delete('recruitment_request_id');
    const next = params.toString();
    navigate(
      { pathname: location.pathname, search: next ? `?${next}` : '' },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

  const handleDelete = async () => {
    if (!deletingCandidate || !currentCompanyId) return;
    try {
      await deleteCandidatePool(deletingCandidate.id, currentCompanyId);
      toast({
        title: t('common.success'),
        description: t('recruitment.ct.deleteSuccess'),
      });

      fetchCandidates();
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.ct.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCandidate(null);
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsFormDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCandidate(null);
    setContextRequisitionId(parseRequisitionIdFromSearch(location.search));
    setIsFormDialogOpen(true);
  };

  const handleOpenYctdTab = () => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'requisitions');
    params.delete('requisition_id');
    params.delete('recruitment_request_id');
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  };

  const handleScheduleInterview = (candidate: Candidate) => {
    setSelectedCandidateForInterview(candidate);
    setIsScheduleDialogOpen(true);
  };

  const handleManageActiveInterview = (candidate: Candidate, interviewIdOverride?: string | null) => {
    const id = interviewIdOverride?.trim() || getActiveInterviewId(candidate);
    setSelectedCandidateForManage(candidate);
    setManageInterviewId(id);
    setIsManageInterviewOpen(true);
  };

  const handleActiveConflictFromSchedule = (payload: {
    interviewId: string;
    candidate: { id: string; fullName: string; email: string; phone?: string; position?: string };
  }) => {
    const existingInList =
      candidates.find((c) => c.id === payload.candidate.id) ||
      candidates.find((c) => c.email?.toLowerCase() === payload.candidate.email.toLowerCase());
    
    /** FIX: Track if we're creating synthetic data (candidate not in list) */
    const isSynthetic = !existingInList;
    if (isSynthetic) {
      setSyntheticCandidateCreated(true);
    }
    
    const row = existingInList || ({
      id: payload.candidate.id,
      company_id: currentCompanyId || '',
      full_name: payload.candidate.fullName,
      email: payload.candidate.email,
      phone: payload.candidate.phone || null,
      position: payload.candidate.position || null,
      active_interview: {
        has_active_interview: true,
        active_interview_id: payload.interviewId,
        active_interview_badge_label: 'Đã có lịch',
      },
    } as Candidate);
    handleManageActiveInterview(
      {
        ...row,
        active_interview: {
          ...(row.active_interview ?? { has_active_interview: true }),
          has_active_interview: true,
          active_interview_id: payload.interviewId,
        },
      },
      payload.interviewId,
    );
  };

  const openLaneAStageTransition = (candidate: Candidate, initialToStage?: string | null) => {
    if (candidateStageLocked(candidate)) {
      toast({
        title: t('common.error'),
        description: RECRUITMENT_WF_LOCKED_HINT_VI,
        variant: 'destructive',
      });
      return;
    }
    if (catalogCount <= 0) {
      return;
    }
    setStageTransitionCandidate(candidate);
    setStageTransitionInitial(
      initialToStage ?? resolveCandidatePipelineStage(candidate) ?? null,
    );
    setStageTransitionOpen(true);
  };

  const applyCandidateStage = async (
    candidateId: string,
    newStage: string,
    employeeId?: string | null,
  ) => {
    if (!currentCompanyId) throw new Error('No company selected');
    // RETAIN pool path — only for non-YCTD rows (≠ FR-05 timeline SoT).
    await updateCandidatePoolStage(candidateId, currentCompanyId, newStage, employeeId);
    toast({
      title: t('common.success'),
      description: t('recruitment.ct.stageUpdateSuccess'),
    });
    await fetchCandidates();
  };

  const handleUpdateStage = async (candidateId: string, newStage: string) => {
    try {
      if (!currentCompanyId) throw new Error('No company selected');
      const row = candidates.find((c) => c.id === candidateId);
      if (row && candidateStageLocked(row)) {
        toast({
          title: t('common.error'),
          description: RECRUITMENT_WF_LOCKED_HINT_VI,
          variant: 'destructive',
        });
        return;
      }
      // FR-05 O1/O3 — YCTD-bound → POST transitions dialog (not pool PATCH).
      if (row && shouldUseLaneAStageTransition(row)) {
        openLaneAStageTransition(row, newStage);
        return;
      }
      // FR-HRM-INT-01 #3/#5 — chốt hired / hired-outcome: gắn / xác nhận hồ sơ trước PATCH pool.
      if (needsHireEmployeePicker(newStage, row?.employee_id, hiredOutcomeKey)) {
        setHirePending(row ?? { id: candidateId, company_id: currentCompanyId, full_name: '', email: '', created_at: '' });
        setHirePendingStage(newStage);
        return;
      }
      await applyCandidateStage(candidateId, newStage, row?.employee_id);
    } catch (error: unknown) {
      console.error('Error updating stage:', error);
      toast({
        title: t('common.error'),
        description: toErrorMessage(error, t('recruitment.ct.stageUpdateError')),
        variant: 'destructive',
      });
    }
  };

  const handleConfirmHireLink = async (employeeId: string) => {
    if (!hirePending) return;
    setHireSubmitting(true);
    try {
      const targetStage = resolveHireTargetStage(hirePendingStage, hiredOutcomeKey);
      await applyCandidateStage(hirePending.id, targetStage, employeeId);
      setHirePending(null);
      setHirePendingStage(null);
      await fetchCandidates();
      toast({
        title: 'Đã chốt tuyển',
        description: 'Mở workspace tạo HĐ cho nhân viên vừa gắn.',
      });
      navigate(buildContractHireCtaPath(employeeId));
    } catch (error: unknown) {
      console.error('Error confirming hire link:', error);
      toast({
        title: t('common.error'),
        description: toErrorMessage(error, t('recruitment.ct.stageUpdateError')),
        variant: 'destructive',
      });
    } finally {
      setHireSubmitting(false);
    }
  };

  const handleStartPipeline = async (candidate: Candidate) => {
    if (!currentCompanyId) return;
    setPipelineSubmittingId(candidate.id);
    setSpawnMissingBanner(false);
    try {
      const result = await startCandidatePipeline(candidate.id, currentCompanyId);
      const missing = detectRecruitmentSpawnMissing(result);
      setSpawnMissingBanner(missing);
      if (missing) {
        toast({
          title: 'Đã bắt đầu nhưng thiếu instance QT',
          description: 'Chưa tạo được quy trình pipeline — kiểm tra mẫu QT ứng viên trên XBOS.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Đã bắt đầu quy trình ứng viên',
          description: 'Ứng viên đã vào quy trình phê duyệt / pipeline.',
        });
      }
      await fetchCandidates();
    } catch (error: unknown) {
      toast({
        title: t('common.error'),
        description: toErrorMessage(error, 'Không bắt đầu được pipeline QT'),
        variant: 'destructive',
      });
    } finally {
      setPipelineSubmittingId(null);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredCandidates.map((candidate) => ({
      [t('recruitment.ct.exFullName')]: candidate.full_name,
      'Email': candidate.email,
      [t('recruitment.ct.exPhone')]: candidate.phone || '',
      [t('recruitment.ct.exPosition')]: resolveCandidatePositionLabel(candidate),
      YCTD: resolveCandidateYctdLabel(candidate),
      [t('recruitment.ct.exSource')]: candidate.source || '',
      [t('recruitment.ct.exStage')]: stageConfig[candidate.stage || 'applied']?.label || '',
      [t('recruitment.ct.exRating')]: candidate.rating || '',
      [t('recruitment.ct.exAppliedDate')]: candidate.applied_date
        ? format(new Date(candidate.applied_date), 'dd/MM/yyyy', { locale: vi })
        : '',
      [t('recruitment.ct.exNationality')]: candidate.nationality || '',
      [t('recruitment.ct.exHometown')]: candidate.hometown || '',
      [t('recruitment.ct.exNotes')]: candidate.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('recruitment.ct.exSheetName'));

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 },
    ];

    XLSX.writeFile(workbook, `danh-sach-ung-vien-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

    toast({
      title: t('recruitment.ct.exportSuccess'),
      description: t('recruitment.ct.exportMsg', { count: exportData.length }),
    });
  };

  const uniqueSources = useMemo(() => {
    const fromCandidates = candidates
      .map((c) => c.source?.trim())
      .filter((s): s is string => Boolean(s));
    return candidateSourceFilterValues(channelCatalogOptions, channelCatalogCount, fromCandidates);
  }, [candidates, channelCatalogOptions, channelCatalogCount]);

  const filteredCandidates = useMemo(() => {
    /** FIX: Use debounced search for better performance */
    const query = debouncedSearchQuery.toLowerCase();
    return candidates.filter((candidate) => {
      const matchesSearch =
        !query ||
        candidate.full_name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.position?.toLowerCase().includes(query) ||
        resolveCandidatePositionLabel(candidate).toLowerCase().includes(query) ||
        resolveCandidateYctdLabel(candidate).toLowerCase().includes(query);

      const matchesStageTab =
        activeStageTab === 'all' ||
        candidate.stage === activeStageTab ||
        (activeStageTab === 'applied' && candidate.stage === 'new');
      const matchesStageFilter =
        stageFilter === 'all' ||
        candidate.stage === stageFilter ||
        (stageFilter === 'applied' && candidate.stage === 'new');
      const matchesSource = sourceFilter === 'all' || candidate.source === sourceFilter;

      return matchesSearch && matchesStageTab && matchesStageFilter && matchesSource;
    });
  }, [candidates, debouncedSearchQuery, activeStageTab, stageFilter, sourceFilter]);

  const stageStats = useMemo(() => {
    return {
      all: candidates.length,
      applied: candidates.filter((c) => c.stage === 'applied' || c.stage === 'new').length,
      screening: candidates.filter((c) => c.stage === 'screening').length,
      interview: candidates.filter((c) => c.stage === 'interview').length,
      offer: candidates.filter((c) => c.stage === 'offer').length,
      hired: candidates.filter((c) => c.stage === 'hired').length,
      rejected: candidates.filter((c) => c.stage === 'rejected').length,
    };
  }, [candidates]);

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return <span className="text-muted-foreground text-sm">-</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'fill-warning text-warning' : 'text-xevn-textMuted'}`}
          />
        ))}
      </div>
    );
  };

  const hasActiveFilters = stageFilter !== 'all' || sourceFilter !== 'all' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setStageFilter('all');
    setSourceFilter('all');
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
  };

  return (
    <div className="space-y-4" data-testid="rec-candidates-tab-precision">
      <RecruitmentWfSpawnBanner visible={spawnMissingBanner} />
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[20px] font-bold tracking-tight text-xevn-text">{t('recruitment.ct.title')}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            {t('recruitment.ct.importExcel')}
          </Button>
          <Button onClick={handleExportExcel} variant="outline" size="sm" disabled={filteredCandidates.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            {t('recruitment.ct.exportExcel')}
          </Button>
          <Button onClick={fetchCandidates} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('recruitment.ct.refresh')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="hdsd-rec-candidate-compare-open"
            onClick={() => {
              setCompareInitialRequisitionId(null);
              setCompareInitialCandidateId(null);
              setIsComparisonDialogOpen(true);
            }}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {t('recruitment.compareCandidates')}
          </Button>
          <Button onClick={handleCreate} data-testid={HDSD_MUTATE_TEST_IDS.candidateCreateBtn}>
            <Plus className="w-4 h-4 mr-2" />
            {t('recruitment.ct.addCandidate')}
          </Button>
        </div>
      </div>

      <Tabs value={activeStageTab} onValueChange={setActiveStageTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full">
          <TabsTrigger value="all" className="gap-2">
            {t('recruitment.ct.all')}
            <Badge variant="secondary" className="ml-1">{stageStats.all}</Badge>
          </TabsTrigger>
          {Object.entries(stageConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key} className="gap-1">
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
              <Badge variant="secondary" className="ml-1">{stageStats[key as keyof typeof stageStats]}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeStageTab} className="mt-4">
          <Card>
            <div className="p-4 border-b">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-xevn-textMuted" />
                  <Input
                    placeholder={t('recruitment.ct.searchPlaceholder')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      /** FIX: Debounce search to prevent excessive filtering */
                      if (searchDebounceRef.current) {
                        clearTimeout(searchDebounceRef.current);
                      }
                      searchDebounceRef.current = setTimeout(() => {
                        setDebouncedSearchQuery(value);
                      }, 300);
                    }}
                  />
                </div>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid={HDSD_MUTATE_TEST_IDS.candidateFilterSource}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder={t('recruitment.ct.sourcePlaceholder')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value="all"
                      data-testid={`${HDSD_MUTATE_TEST_IDS.candidateFilterSourceOptionPrefix}-all`}
                    >
                      {t('recruitment.ct.allSources')}
                    </SelectItem>
                    {uniqueSources.map((source) => {
                      const label = resolveSourceDisplayLabel(source);
                      const config =
                        channelCatalogCount > 0
                          ? {
                              label,
                              icon: Briefcase,
                              color: 'bg-xevn-neutral/15 text-xevn-textSecondary',
                            }
                          : getSourceConfig(source, t);
                      const Icon = config.icon;
                      return (
                        <SelectItem
                          key={source}
                          value={source}
                          data-testid={`${HDSD_MUTATE_TEST_IDS.candidateFilterSourceOptionPrefix}-${source}`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                    <X className="w-4 h-4 mr-1" />
                    {t('recruitment.ct.clearFilters')}
                  </Button>
                )}
              </div>

                {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-sm text-muted-foreground">{t('recruitment.ct.filtering')}</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {t('recruitment.ct.keyword')}: "{searchQuery}"
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        setSearchQuery('');
                        setDebouncedSearchQuery('');
                      }} />
                    </Badge>
                  )}
                  {sourceFilter !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {t('recruitment.ct.sourceLabel')}: {resolveSourceDisplayLabel(sourceFilter)}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSourceFilter('all')} />
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground ml-auto">
                    {t('recruitment.ct.candidateCount', { count: filteredCandidates.length, total: candidates.length })}
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {candidates.length === 0
                    ? t('recruitment.ct.noCandidates')
                    : t('recruitment.ct.noFilterResult')}
                </p>
              </CardContent>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('recruitment.ct.thCandidate')}</TableHead>
                    <TableHead>YCTD</TableHead>
                    <TableHead>{t('recruitment.ct.thPosition')}</TableHead>
                    <TableHead>{t('recruitment.ct.thSource')}</TableHead>
                    <TableHead>{t('recruitment.ct.thAppliedDate')}</TableHead>
                    <TableHead>{t('recruitment.ct.thStage')}</TableHead>
                    <TableHead>{t('recruitment.ct.thRating')}</TableHead>
                    <TableHead className="text-right">{t('recruitment.ct.thActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => {
                    const sourceLabel = resolveSourceDisplayLabel(candidate.source || '');
                    const sourceConf =
                      channelCatalogCount > 0
                        ? {
                            label: sourceLabel,
                            icon: Briefcase,
                            color: 'bg-xevn-neutral/15 text-xevn-textSecondary',
                          }
                        : getSourceConfig(candidate.source || '', t);
                    const SourceIcon = sourceConf.icon;
                    const activeInterviewBadge = getCandidateActiveInterviewBadge(candidate);
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={candidate.avatar_url || undefined} />
                              <AvatarFallback>{candidate.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.email}</p>
                              {activeInterviewBadge ? (
                                <button
                                  type="button"
                                  className="mt-1 flex flex-wrap items-center gap-2 text-left hover:opacity-90"
                                  data-testid="candidate-active-interview-badge"
                                  onClick={() => handleManageActiveInterview(candidate)}
                                  title="Xem / quản lý lịch đang hiệu lực"
                                >
                                  <Badge variant="secondary" className="bg-warning/15 text-warning">
                                    {activeInterviewBadge.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground" data-testid="candidate-active-interview-time">
                                    {activeInterviewBadge.time}
                                  </span>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          data-testid={HDSD_MUTATE_TEST_IDS.candidateListYctd}
                          data-requisition-id={
                            candidate.requisition_id || candidate.recruitment_request_id || ''
                          }
                        >
                          {resolveCandidateYctdLabel(candidate)}
                        </TableCell>
                        <TableCell
                          data-testid={HDSD_MUTATE_TEST_IDS.candidateListPosition}
                          data-position-key={candidate.position_key || ''}
                        >
                          {resolveCandidatePositionLabel(candidate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${sourceConf.color} border-0`}>
                            <SourceIcon className="w-3 h-3 mr-1" />
                            {sourceConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {candidate.applied_date
                            ? format(new Date(candidate.applied_date), 'dd/MM/yyyy', { locale: vi })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {candidateStageLocked(candidate) ? (
                            <div className="space-y-1">
                              <Badge className={stageConfig[displayStageKey(candidate.stage)]?.color || 'bg-gray-100'}>
                                {stageDisplayLabel(
                                  candidate.stage,
                                  stageConfig[displayStageKey(candidate.stage)]?.label ||
                                    RECRUITMENT_FUNNEL_LABEL_VI[mapRecruitmentFunnelStage(candidate.stage)],
                                )}
                              </Badge>
                              <p className="max-w-[8rem] text-[10px] leading-tight text-muted-foreground">
                                QT XBOS · không đổi tay
                              </p>
                            </div>
                          ) : shouldUseLaneAStageTransition(candidate) ? (
                            <div className="space-y-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 max-w-[11rem] justify-start px-2"
                                data-testid="hdsd-rec-candidate-stage-picker"
                                data-lane="yctd-transitions"
                                onClick={() => openLaneAStageTransition(candidate)}
                              >
                                <Badge className={stageConfig[displayStageKey(candidate.stage)]?.color || 'bg-gray-100'}>
                                  {stageDisplayLabel(
                                    candidate.stage,
                                    stageConfig[displayStageKey(candidate.stage)]?.label || candidate.stage,
                                  )}
                                </Badge>
                              </Button>
                            </div>
                          ) : isSpineOnlyListRow(candidate) ? (
                            <div className="space-y-1">
                              <Badge className={stageConfig[displayStageKey(candidate.stage)]?.color || 'bg-gray-100'}>
                                {stageDisplayLabel(
                                  candidate.stage,
                                  stageConfig[displayStageKey(candidate.stage)]?.label ||
                                    RECRUITMENT_FUNNEL_LABEL_VI[mapRecruitmentFunnelStage(candidate.stage)],
                                )}
                              </Badge>
                            </div>
                          ) : (
                            <Select
                              value={candidate.stage === 'new' ? 'applied' : candidate.stage || 'applied'}
                              onValueChange={(value) => handleUpdateStage(candidate.id, value)}
                              data-testid="hdsd-rec-candidate-stage-picker"
                            >
                              <SelectTrigger className="w-40 h-8">
                                <Badge className={stageConfig[displayStageKey(candidate.stage)]?.color || 'bg-gray-100'}>
                                  {stageDisplayLabel(
                                    candidate.stage,
                                    stageConfig[displayStageKey(candidate.stage)]?.label || candidate.stage,
                                  )}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                {transitionStageOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    <Badge className={opt.color}>{opt.label}</Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>{renderStars(candidate.rating)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!candidate.workflow_instance_id && !isSpineOnlyListRow(candidate) ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={pipelineSubmittingId === candidate.id}
                                    onClick={() => void handleStartPipeline(candidate)}
                                  >
                                    Bắt đầu QT
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Bắt đầu quy trình tuyển dụng cho ứng viên</TooltipContent>
                              </Tooltip>
                            ) : null}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid="rec-candidate-evaluate-btn"
                                  onClick={() => {
                                    setEvaluatingCandidate(candidate);
                                    setIsEvaluationDialogOpen(true);
                                  }}
                                >
                                  <ClipboardCheck className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.evaluateCandidate')}</TooltipContent>
                            </Tooltip>
                            {normalizeRequisitionId(candidate.requisition_id) ||
                            normalizeRequisitionId(candidate.recruitment_request_id) ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    data-testid="rec-candidate-compare-btn"
                                    onClick={() =>
                                      openCompareForYctd(
                                        candidate.requisition_id || candidate.recruitment_request_id,
                                        candidate.recruitment_candidate_id || candidate.id,
                                      )
                                    }
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t('recruitment.compareCandidates')}</TooltipContent>
                              </Tooltip>
                            ) : null}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCandidateForDetail(candidate)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t('recruitment.ct.viewDetail')}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  data-testid={
                                    activeInterviewBadge
                                      ? 'candidate-manage-interview-btn'
                                      : 'candidate-schedule-interview-btn'
                                  }
                                  onClick={() =>
                                    activeInterviewBadge
                                      ? handleManageActiveInterview(candidate)
                                      : handleScheduleInterview(candidate)
                                  }
                                >
                                  <CalendarClock className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {activeInterviewBadge
                                  ? 'Quản lý lịch phỏng vấn'
                                  : t('recruitment.ct.scheduleInterview')}
                              </TooltipContent>
                            </Tooltip>
                            {!isSpineOnlyListRow(candidate) ? (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(candidate)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('recruitment.ct.edit')}</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => {
                                        setDeletingCandidate(candidate);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('recruitment.ct.delete')}</TooltipContent>
                                </Tooltip>
                              </>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <CandidateFormDialog
        open={isFormDialogOpen}
        onOpenChange={(next) => {
          setIsFormDialogOpen(next);
          if (!next) {
            setContextRequisitionId('');
            clearContextRequisitionFromUrl();
          }
        }}
        candidate={editingCandidate}
        companyId={currentCompanyId || ''}
        onSuccess={fetchCandidates}
        defaultRequisitionId={editingCandidate ? null : contextRequisitionId}
        onOpenYctdTab={handleOpenYctdTab}
      />

      <ScheduleInterviewDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onSuccess={fetchCandidates}
        onActiveConflict={handleActiveConflictFromSchedule}
        candidateStage={selectedCandidateForInterview?.stage ?? null}
        candidate={
          selectedCandidateForInterview
            ? {
                id: selectedCandidateForInterview.id,
                fullName: selectedCandidateForInterview.full_name,
                email: selectedCandidateForInterview.email,
                phone: selectedCandidateForInterview.phone || null,
                position: selectedCandidateForInterview.position || null,
              }
            : null
        }
      />

      <ManageActiveInterviewDialog
        open={isManageInterviewOpen}
        onOpenChange={(open) => {
          setIsManageInterviewOpen(open);
          /** FIX: Refresh list after managing interview to ensure data consistency */
          if (!open) {
            fetchCandidates();
            setSyntheticCandidateCreated(false);
          }
        }}
        onSuccess={fetchCandidates}
        interviewId={manageInterviewId}
        badge={
          selectedCandidateForManage
            ? getCandidateActiveInterviewBadge(selectedCandidateForManage)
            : null
        }
        scheduledAtIso={
          selectedCandidateForManage?.active_interview?.active_interview_at ??
          selectedCandidateForManage?.active_interview_at ??
          null
        }
        statusLabel={
          selectedCandidateForManage?.active_interview?.active_interview_status ??
          selectedCandidateForManage?.active_interview_status ??
          null
        }
        candidate={
          selectedCandidateForManage
            ? {
                id: selectedCandidateForManage.id,
                fullName: selectedCandidateForManage.full_name,
                email: selectedCandidateForManage.email,
                position: selectedCandidateForManage.position || null,
              }
            : null
        }
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.ct.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.ct.confirmDeleteMsg', { name: deletingCandidate?.full_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.ct.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('recruitment.ct.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedCandidateForDetail && (
        <div className="fixed inset-0 z-50 bg-background">
          <div className="h-full overflow-auto p-6">
            <CandidateDetailView
              candidate={selectedCandidateForDetail}
              stageHistoryRefreshToken={stageHistoryRefreshToken}
              onOpenStageTransition={
                shouldUseLaneAStageTransition(selectedCandidateForDetail) &&
                !candidateStageLocked(selectedCandidateForDetail)
                  ? () => openLaneAStageTransition(selectedCandidateForDetail)
                  : undefined
              }
              onOpenMail={
                shouldUseLaneAStageTransition(selectedCandidateForDetail)
                  ? () => {
                      setMailingCandidate(selectedCandidateForDetail);
                      setIsMailDialogOpen(true);
                    }
                  : undefined
              }
              onOpenAcceptOffer={
                shouldShowAcceptOfferCta(
                  selectedCandidateForDetail,
                  pipelineStageItems,
                  catalogCount,
                )
                  ? () => {
                      setAcceptOfferCandidate(selectedCandidateForDetail);
                      setIsAcceptOfferOpen(true);
                    }
                  : undefined
              }
              onBack={() => setSelectedCandidateForDetail(null)}
              onEvaluate={() => {
                setEvaluatingCandidate(selectedCandidateForDetail);
                setIsEvaluationDialogOpen(true);
              }}
              onCompare={() =>
                openCompareForYctd(
                  selectedCandidateForDetail.requisition_id ||
                    selectedCandidateForDetail.recruitment_request_id,
                  selectedCandidateForDetail.recruitment_candidate_id ||
                    selectedCandidateForDetail.id,
                )
              }
              onEdit={() => {
                setEditingCandidate(selectedCandidateForDetail);
                setIsFormDialogOpen(true);
              }}
            />
          </div>
        </div>
      )}

      <CandidateStageTransitionDialog
        open={stageTransitionOpen}
        onOpenChange={(open) => {
          setStageTransitionOpen(open);
          if (!open) {
            setStageTransitionCandidate(null);
            setStageTransitionInitial(null);
          }
        }}
        candidate={stageTransitionCandidate}
        initialToStage={stageTransitionInitial}
        onSuccess={async () => {
          setStageHistoryRefreshToken((n) => n + 1);
          await fetchCandidates();
        }}
      />

      <CandidateMailDialog
        open={isMailDialogOpen}
        onOpenChange={(open) => {
          setIsMailDialogOpen(open);
          if (!open) setMailingCandidate(null);
        }}
        candidate={mailingCandidate}
        onSuccess={async () => {
          await fetchCandidates();
        }}
      />

      <CandidateAcceptOfferDialog
        open={isAcceptOfferOpen}
        onOpenChange={(open) => {
          setIsAcceptOfferOpen(open);
          if (!open) setAcceptOfferCandidate(null);
        }}
        candidate={acceptOfferCandidate}
        onSuccess={async (hireResult) => {
          setStageHistoryRefreshToken((n) => n + 1);
          await fetchCandidates();
          if (hireResult.employee_id && selectedCandidateForDetail) {
            setSelectedCandidateForDetail({
              ...selectedCandidateForDetail,
              employee_id: hireResult.employee_id,
              stage: hireResult.hired_outcome_stage || selectedCandidateForDetail.stage,
            });
          }
        }}
      />

      <CandidateEvaluationDialog
        candidate={evaluatingCandidate ? {
          id: evaluatingCandidate.id,
          full_name: evaluatingCandidate.full_name,
          email: evaluatingCandidate.email,
          position: evaluatingCandidate.position || null,
          recruitment_candidate_id: evaluatingCandidate.recruitment_candidate_id,
          list_lane: evaluatingCandidate.list_lane,
          requisition_id: evaluatingCandidate.requisition_id,
          recruitment_request_id: evaluatingCandidate.recruitment_request_id,
        } : null}
        open={isEvaluationDialogOpen}
        onOpenChange={setIsEvaluationDialogOpen}
        onSaved={fetchCandidates}
        onSuggestStageTransition={
          evaluatingCandidate && shouldUseLaneAStageTransition(evaluatingCandidate)
            ? () => openLaneAStageTransition(evaluatingCandidate)
            : undefined
        }
        onCompareByYctd={(requisitionId, candidateId) => {
          openCompareForYctd(requisitionId, candidateId);
        }}
      />

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
        onEvaluateCandidate={(target) => {
          const mapped = compareTargetToCandidate(target);
          setEvaluatingCandidate(mapped);
          setIsEvaluationDialogOpen(true);
        }}
        onChangeStage={(target) => {
          openLaneAStageTransition(compareTargetToCandidate(target));
        }}
      />

      <CandidateImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        companyId={currentCompanyId || ''}
        onImportSuccess={fetchCandidates}
      />

      <HireEmployeeLinkDialog
        open={!!hirePending}
        onOpenChange={(open) => {
          if (!open && !hireSubmitting) {
            setHirePending(null);
            setHirePendingStage(null);
          }
        }}
        candidateName={hirePending?.full_name || 'ứng viên'}
        initialEmployeeId={hirePending?.employee_id}
        submitting={hireSubmitting}
        onConfirm={handleConfirmHireLink}
      />
    </div>
  );
}
