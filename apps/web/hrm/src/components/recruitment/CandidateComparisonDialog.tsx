/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → Đánh giá → So sánh ứng viên (dialog)
 * UC:         FR-UC-BP-REC-06b Diễn biến #1–#6 · Thành công · J-HRM-REC-CMP-01
 * BR:         BR-BP-REC-CMP-01 · AC-REC-CMP-01..05
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 · FR-UC-BP-REC-06b
 * TechSpec:   docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §3 F-REC-CMP-01..02
 * DB:         docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md — soft FK requisition_id · eval neo application
 * API:        docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md §7 · errors MAX-N / YCTD-MIX
 * Purpose:    Dialog so sánh UV theo bộ chọn YCTD (không tin đăng); empty 0 YCTD/0 UV; max-N; «chưa đánh giá».
 * WorkItem:   PO-HRM-REC-UV-YCTD-CMP-FE-01
 * Coded:      2026-08-06
 * Callers:    pages/Recruitment.tsx evaluations tab
 * Callees:    listJobRequisitions(receivable) · listRecruitmentApplicationsByYctd · getRecruitmentCompareMatrix
 * FE-Actions: | Mở dialog | fetch YCTD receivable | |
 *             | Chọn YCTD | load UV+evals | |
 *             | Toggle UV ≤ N | GET compare matrix | |
 * must_keep:  YCTD SoT only · scores từ BE · no job_postings picker · no fake matrix · U65 zero-seed
 * SOLID:      Dialog UI; pure map/max-N trong candidateCompareUi
 * LastVerified: docs/qa/evidence/po-hrm-rec-uv-yctd-cmp-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-22 FIX-REC-CMP-NEO-SCORE
 * change_mode: FIX
 * What: Merge F-REC-CMP-02 matrix into UV cards; empty-score guidance; keep YCTD SoT
 * Why: Compare blank when evals stored on recruitment_candidate_id / criterion_name shape
 * must_keep: YCTD SoT · getRecruitmentCompareMatrix · max-N · no job_postings · no fake scores
 *
 * @CODE-MEMORY-CHANGE 2026-08-22 PO-HRM-REC-06B-EVAL-CTA-FE-01
 * change_mode: ADD
 * What: Nút «Đánh giá» trên UV chưa đánh giá (list + card) → parent mở REC-06
 * Why: Sponsor — so sánh không có CTA đánh giá → nút không hiện / luồng đứt
 * must_keep: YCTD SoT · max-N · parent owns CandidateEvaluationDialog
 *
 * @CODE-MEMORY-CHANGE 2026-08-22 PO-HRM-REC-06B-POST-COMPARE-ACTIONS-FE-01
 * change_mode: ADD
 * What: CTA sau so sánh trên thẻ UV + footer — Đánh giá lại · Đổi trạng thái (offer/loại)
 * Why: Sponsor screenshot — radar đủ nhưng thiếu chức năng quyết định sau REC-06b
 * must_keep: YCTD SoT · parent owns stage/eval dialogs · no fake scores
 *
 * @CODE-MEMORY-CHANGE 2026-08-22 FIX-REC-CMP-UV-LIST-EMPTY
 * change_mode: FIX
 * What: Fetch UV theo company_id của YCTD đã chọn + listCompanyId; fallback spine list;
 *       wasOpenRef + initialRequisitionId/initialCandidateId deep-link from REC-06
 * Why: YCTD meta UV 2 nhưng list trống — FE gửi company scope lệch OU của YCTD/UV
 * must_keep: YCTD SoT · listRecruitmentApplicationsByYctd · no job_postings
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ClipboardCheck,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { useToast } from '@/hooks/use-toast';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { HRM_API_MAX_PAGE_SIZE } from '@/lib/hrmDataMode';
import {
  coerceHrmListCompanyId,
  HRM_LIST_DEFAULT_COMPANY_ID,
  normalizeHrmApiListCompanyId,
} from '@/lib/hrmListScope';
import {
  REC_COMPARE_MAX_N,
  buildRadarFromCompareMatrix,
  buildCompareApplicationsFromEvaluations,
  buildCompareYctdPickerFromCandidates,
  buildCompareYctdPickerFromEvaluations,
  canAddCandidateToCompare,
  compareEvalBadgeLabel,
  isCompareEvalMissing,
  mapApplicationItemToCompareCandidate,
  mergeCompareMatrixIntoCandidates,
  normalizeCompareListRows,
  formatCompareCandidateSubtitle,
  dedupeCompareCandidatesById,
  type CompareApplicationListItem,
  type CompareEvalListRow,
  type CompareMatrixResponse,
} from '@/lib/candidateCompareUi';
import {
  dedupeRowsById,
  filterComparePickerYctds,
  filterYctdPickerRowsByQuery,
  formatYctdOptionLabel,
  formatYctdOptionMetaLine,
  formatYctdOptionPrimaryLine,
  sortCompareYctdPickerRows,
  type UvYctdPickerRow,
} from '@/lib/candidateUvYctdUi';
import {
  getRecruitmentCompareMatrix,
  getJobRequisition,
  listCandidateEvaluations,
  listJobRequisitions,
  listRecruitmentApplicationsByYctd,
  listRecruitmentCandidates,
  type HrmJobRequisition,
} from '@/integrations/hrmApi';

export type CompareEvaluateTarget = {
  id: string;
  full_name: string;
  email: string;
  requisition_id: string;
  recruitment_candidate_id?: string;
  application_id?: string | null;
  position?: string | null;
};

interface CandidateComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Prefill YCTD when opening from Đánh giá row (same requisition_id). */
  initialRequisitionId?: string | null;
  /** Preselect matched UV after load (REC-06 → REC-06b deep-link). */
  initialCandidateId?: string | null;
  /** REC-06 — parent opens evaluation dialog (chưa đánh giá / đánh giá lại). */
  onEvaluateCandidate?: (target: CompareEvaluateTarget) => void;
  /** REC-05 / APP-02 — parent opens stage transition (offer / loại sau so sánh). */
  onChangeStage?: (target: CompareEvaluateTarget) => void;
  /** Rows đã load ở tab Đánh giá — fast-path YCTD picker (parity nghiệp vụ REC-06b). */
  seedEvaluations?: readonly CompareEvalListRow[] | null;
}

type CompareCandidateRow = ReturnType<typeof mapApplicationItemToCompareCandidate>;

const getResultConfig = (t: (k: string) => string) => ({
  pass: {
    label: t('rc.results.pass'),
    color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  fail: {
    label: t('rc.results.fail'),
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="w-4 h-4" />,
  },
  pending: {
    label: t('rc.results.pending'),
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    icon: <AlertCircle className="w-4 h-4" />,
  },
});

const getRecommendationConfig = (t: (k: string) => string) => ({
  strong_hire: {
    label: t('rc.recommendations.strongHire'),
    color: 'text-green-700 bg-green-100 dark:bg-green-900/30',
  },
  hire: {
    label: t('rc.recommendations.hire'),
    color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  },
  maybe: {
    label: t('rc.recommendations.maybe'),
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  },
  no_hire: {
    label: t('rc.recommendations.noHire'),
    color: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  },
});

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(39, 100%, 50%)',
  'hsl(142, 71%, 45%)',
  'hsl(280, 85%, 65%)',
];

function toPickerRow(row: HrmJobRequisition): UvYctdPickerRow {
  return {
    id: row.id,
    company_id: row.company_id,
    title: row.title,
    status: row.status,
    jd_code: row.jd_code,
    jd_title: row.jd_title,
    code: row.code,
    position_key: row.position_key,
    position_name: row.position_name,
    recruitment_request_id: row.recruitment_request_id,
    department: row.department,
    headcount: row.headcount,
    candidate_count: row.candidate_count,
    created_at: row.created_at,
  };
}

function resolveYctdCompanyId(
  yctdId: string,
  rows: readonly UvYctdPickerRow[],
  fallbackCompanyId: string,
): string {
  const fromRow = (rows.find((row) => row.id === yctdId)?.company_id ?? '').trim();
  return fromRow || fallbackCompanyId;
}

function jobRequisitionListRows(
  response: Awaited<ReturnType<typeof listJobRequisitions>>,
): HrmJobRequisition[] {
  return response.data ?? [];
}

function evalRowToPickerRow(row: {
  id: string;
  company_id: string;
  title: string;
  status: string;
  candidate_count: number;
}): UvYctdPickerRow {
  return {
    id: row.id,
    company_id: row.company_id,
    title: row.title,
    status: row.status as UvYctdPickerRow['status'],
    candidate_count: row.candidate_count,
  };
}

async function loadCompareYctdFromEvaluations(
  evalCompanyIds: readonly string[],
): Promise<UvYctdPickerRow[]> {
  const tried = new Set<string>();
  const merged: UvYctdPickerRow[] = [];
  for (const rawId of evalCompanyIds) {
    const companyId = normalizeHrmApiListCompanyId(rawId);
    if (!companyId || tried.has(companyId)) continue;
    tried.add(companyId);
    try {
      const evalRes = await listCandidateEvaluations({ company_id: companyId });
      const evalRows = (evalRes.data ?? []) as CompareEvalListRow[];
      merged.push(
        ...filterComparePickerYctds(
          buildCompareYctdPickerFromEvaluations(evalRows).map(evalRowToPickerRow),
        ),
      );
    } catch {
      /* thử scope kế tiếp — parity tab Đánh giá */
    }
  }
  return sortCompareYctdPickerRows(dedupeRowsById(merged));
}

async function loadCompareApplicationsFromEvaluations(
  evalCompanyIds: readonly string[],
  requisitionId: string,
  seedEvalRows: readonly CompareEvalListRow[] = [],
): Promise<CompareApplicationListItem[]> {
  const fromSeed = buildCompareApplicationsFromEvaluations(seedEvalRows, requisitionId);
  if (fromSeed.length > 0) return fromSeed;
  const tried = new Set<string>();
  for (const rawId of evalCompanyIds) {
    const companyId = normalizeHrmApiListCompanyId(rawId);
    if (!companyId || tried.has(companyId)) continue;
    tried.add(companyId);
    try {
      const evalRes = await listCandidateEvaluations({ company_id: companyId });
      const items = buildCompareApplicationsFromEvaluations(
        (evalRes.data ?? []) as CompareEvalListRow[],
        requisitionId,
      );
      if (items.length > 0) return items;
    } catch {
      /* thử scope kế tiếp */
    }
  }
  return [];
}

async function loadCompareYctdFromCandidates(
  queryCompanyIds: readonly string[],
): Promise<UvYctdPickerRow[]> {
  const tried = new Set<string>();
  const merged: UvYctdPickerRow[] = [];
  for (const rawId of queryCompanyIds) {
    const companyId = normalizeHrmApiListCompanyId(rawId);
    if (!companyId || tried.has(companyId)) continue;
    tried.add(companyId);
    try {
      const res = await listRecruitmentCandidates({
        company_id: companyId,
        page: 1,
        page_size: HRM_API_MAX_PAGE_SIZE,
      });
      merged.push(
        ...filterComparePickerYctds(
          buildCompareYctdPickerFromCandidates(res.data ?? []).map(evalRowToPickerRow),
        ),
      );
    } catch {
      /* thử scope kế tiếp */
    }
  }
  return sortCompareYctdPickerRows(dedupeRowsById(merged));
}

async function loadRequisitionsAcrossCompanyScopes(
  companyIds: readonly string[],
): Promise<UvYctdPickerRow[]> {
  const tried = new Set<string>();
  const mergedRaw: HrmJobRequisition[] = [];
  for (const rawId of companyIds) {
    const scopedCompanyId = normalizeHrmApiListCompanyId(rawId);
    if (!scopedCompanyId || tried.has(scopedCompanyId)) continue;
    tried.add(scopedCompanyId);
    const baseQuery = {
      company_id: scopedCompanyId,
      page: 1,
      page_size: HRM_API_MAX_PAGE_SIZE,
    };
    try {
      const [receivableRes, scopeRes] = await Promise.all([
        listJobRequisitions({ ...baseQuery, receivable: true }),
        listJobRequisitions(baseQuery),
      ]);
      mergedRaw.push(
        ...jobRequisitionListRows(scopeRes),
        ...jobRequisitionListRows(receivableRes),
      );
    } catch {
      /* thử scope kế tiếp — parity tab Đánh giá / CEO rollup */
    }
  }
  return sortCompareYctdPickerRows(
    dedupeRowsById(filterComparePickerYctds(mergedRaw).map(toPickerRow)),
  );
}

function mergeSeedEvalIntoCompareYctdPicker(
  rows: readonly UvYctdPickerRow[],
  seedEvalRows: readonly CompareEvalListRow[],
): UvYctdPickerRow[] {
  if (seedEvalRows.length === 0) return [...rows];
  const fromSeed = filterComparePickerYctds(
    buildCompareYctdPickerFromEvaluations(seedEvalRows).map(evalRowToPickerRow),
  );
  return sortCompareYctdPickerRows(dedupeRowsById([...fromSeed, ...rows]));
}

async function loadCompareYctdPickerRows(
  companyId: string,
  prefYctd: string,
  evalCompanyIds: readonly string[],
  seedEvalRows: readonly CompareEvalListRow[] = [],
): Promise<UvYctdPickerRow[]> {
  const scopeIds = [...evalCompanyIds, companyId]
    .map((id) => normalizeHrmApiListCompanyId(id))
    .filter((id, index, all) => id && all.indexOf(id) === index);
  let rows = await loadRequisitionsAcrossCompanyScopes(scopeIds);
  rows = mergeSeedEvalIntoCompareYctdPicker(rows, seedEvalRows);
  if (rows.length === 0) {
    rows = await loadCompareYctdFromEvaluations(evalCompanyIds);
  }
  if (rows.length === 0) {
    rows = await loadCompareYctdFromCandidates(evalCompanyIds);
  }
  if (prefYctd && !rows.some((row) => row.id === prefYctd)) {
    for (const rawId of scopeIds) {
      const scopedCompanyId = normalizeHrmApiListCompanyId(rawId);
      if (!scopedCompanyId) continue;
      try {
        const pinned = await getJobRequisition(prefYctd, scopedCompanyId);
        if (pinned?.id) {
          rows = sortCompareYctdPickerRows(dedupeRowsById([toPickerRow(pinned), ...rows]));
          break;
        }
      } catch {
        /* deep-link YCTD vẫn giữ selectedYctdId — UV fetch chạy theo id */
      }
    }
  }
  return rows;
}

export function CandidateComparisonDialog({
  open,
  onOpenChange,
  initialRequisitionId = null,
  initialCandidateId = null,
  onEvaluateCandidate,
  onChangeStage,
  seedEvaluations = null,
}: CandidateComparisonDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId, loading: authLoading } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  /** Align với useJobRequisitions — OU filter first; never empty (rollup main). */
  const effectiveCompanyId = coerceHrmListCompanyId(
    listCompanyId || currentCompanyId || HRM_LIST_DEFAULT_COMPANY_ID,
  );
  /** Parity tab Đánh giá — main first for group CEO rollup (ADR-GROUP-CEO-MAIN). */
  const evalListCompanyIds = useMemo(() => {
    const ids: string[] = [];
    const push = (value: string | null | undefined) => {
      const normalized = normalizeHrmApiListCompanyId(value);
      if (normalized && !ids.includes(normalized)) ids.push(normalized);
    };
    push(HRM_LIST_DEFAULT_COMPANY_ID);
    push(effectiveCompanyId);
    push(listCompanyId);
    push(currentCompanyId);
    return ids;
  }, [currentCompanyId, listCompanyId, effectiveCompanyId]);

  const seedEvalRows = useMemo((): CompareEvalListRow[] => {
    if (!seedEvaluations?.length) return [];
    return seedEvaluations.map((row) => ({
      requisition_id: row.requisition_id,
      recruitment_candidate_id: row.recruitment_candidate_id,
      candidate_id: row.candidate_id,
      yctd_title: row.yctd_title,
      yctd_company_id: row.yctd_company_id,
      candidate_name: row.candidate_name,
      candidate_email: row.candidate_email,
      candidate_position: row.candidate_position,
      candidate_stage: row.candidate_stage,
      weighted_score: row.weighted_score,
      result: row.result,
      recommendation: row.recommendation,
      overall_feedback: row.overall_feedback,
      scores: row.scores,
      created_at: row.created_at,
    }));
  }, [seedEvaluations]);
  const { toast } = useToast();
  const r = (key: string) => t(`rc.${key}`);
  const tr = (key: string) => t(`recruitment.${key}`);
  const resultConfig = getResultConfig(t);
  const recommendationConfig = getRecommendationConfig(t);
  const wasOpenRef = useRef(false);

  const [yctdList, setYctdList] = useState<UvYctdPickerRow[]>([]);
  const [yctdQuery, setYctdQuery] = useState('');
  const [selectedYctdId, setSelectedYctdId] = useState<string>('');
  const [candidates, setCandidates] = useState<CompareCandidateRow[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<CompareMatrixResponse | null>(null);
  const [loadingYctd, setLoadingYctd] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);

  const resetSelection = useCallback(() => {
    setCandidates([]);
    setSelectedCandidateIds([]);
    setMatrix(null);
  }, []);

  const buildEvaluateTarget = useCallback(
    (candidate: CompareCandidateRow): CompareEvaluateTarget | null => {
      const requisitionId = (selectedYctdId || '').trim();
      if (!requisitionId) return null;
      return {
        id: candidate.id,
        full_name: candidate.full_name,
        email: candidate.email || '',
        requisition_id: requisitionId,
        recruitment_candidate_id: candidate.id,
        application_id: candidate.application_id,
        position: candidate.position,
      };
    },
    [selectedYctdId],
  );

  const handleEvaluateClick = useCallback(
    (event: React.MouseEvent, candidate: CompareCandidateRow) => {
      event.preventDefault();
      event.stopPropagation();
      if (!onEvaluateCandidate) return;
      const target = buildEvaluateTarget(candidate);
      if (!target) return;
      onOpenChange(false);
      onEvaluateCandidate(target);
    },
    [buildEvaluateTarget, onEvaluateCandidate, onOpenChange],
  );

  const handleStageClick = useCallback(
    (event: React.MouseEvent, candidate: CompareCandidateRow) => {
      event.preventDefault();
      event.stopPropagation();
      if (!onChangeStage) return;
      const target = buildEvaluateTarget(candidate);
      if (!target) return;
      onOpenChange(false);
      onChangeStage(target);
    },
    [buildEvaluateTarget, onChangeStage, onOpenChange],
  );

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (!justOpened) return;

    resetSelection();
    setYctdQuery('');
    const prefYctd = (initialRequisitionId ?? '').trim();
    setSelectedYctdId(prefYctd);
  }, [open, initialRequisitionId, resetSelection]);

  useEffect(() => {
    if (!open || !effectiveCompanyId || authLoading) return;
    let cancelled = false;
    const prefYctd = (initialRequisitionId ?? '').trim();
    const fetchYctd = async () => {
      setLoadingYctd(true);
      try {
        const rows = await loadCompareYctdPickerRows(
          effectiveCompanyId,
          prefYctd,
          evalListCompanyIds,
          seedEvalRows,
        );
        if (!cancelled) {
          setYctdList(rows);
          if (prefYctd) {
            setSelectedYctdId(prefYctd);
          } else if (rows.length > 0) {
            setSelectedYctdId(rows[0].id);
          } else {
            setSelectedYctdId('');
          }
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t('common.error'),
            description: toErrorMessage(error, r('fetchYctdError')),
            variant: 'destructive',
          });
          setYctdList([]);
          setSelectedYctdId('');
        }
      } finally {
        if (!cancelled) setLoadingYctd(false);
      }
    };
    void fetchYctd();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/t unstable on re-render
  }, [open, effectiveCompanyId, initialRequisitionId, evalListCompanyIds, seedEvalRows, authLoading]);

  useEffect(() => {
    if (!selectedYctdId || !effectiveCompanyId) {
      resetSelection();
      return;
    }
    // Tránh YCTD-MIX: xóa UV cũ ngay khi đổi YCTD — không chờ fetch async.
    setCandidates([]);
    setSelectedCandidateIds([]);
    setMatrix(null);
    let cancelled = false;
    const fetchUv = async () => {
      setLoadingCandidates(true);
      try {
        const yctdCompanyId = resolveYctdCompanyId(selectedYctdId, yctdList, effectiveCompanyId);
        const activeYctdId = selectedYctdId;
        /** Lane A spine SoT first — seed eval có thể mang pool id → BE YCTD-MIX. */
        let items: CompareApplicationListItem[] = [];
        try {
          const response = await listRecruitmentApplicationsByYctd({
            company_id: yctdCompanyId,
            requisition_id: activeYctdId,
            include: 'evals',
          });
          items = normalizeCompareListRows<CompareApplicationListItem>(response);
        } catch {
          items = [];
        }
        if (items.length === 0) {
          const fallback = await listRecruitmentCandidates({
            company_id: yctdCompanyId,
            requisition_id: activeYctdId,
            page: 1,
            page_size: HRM_API_MAX_PAGE_SIZE,
          });
          items = (fallback.data ?? []).map((row) => ({
            candidate_id: row.id,
            recruitment_candidate_id: row.id,
            application_id: row.id,
            full_name: row.full_name,
            email: row.email,
            position_name: row.position_name ?? null,
            position_key: row.position_key ?? null,
            stage: row.status,
            eval_status: 'none' as const,
          }));
        }
        if (items.length === 0) {
          items = buildCompareApplicationsFromEvaluations(seedEvalRows, activeYctdId);
        }
        if (items.length === 0) {
          items = await loadCompareApplicationsFromEvaluations(
            evalListCompanyIds,
            activeYctdId,
            seedEvalRows,
          );
        }
        if (!cancelled && selectedYctdId === activeYctdId) {
          const rows = dedupeCompareCandidatesById(
            items.map(mapApplicationItemToCompareCandidate),
          );
          setCandidates(rows);
          const prefUv = (initialCandidateId ?? '').trim();
          const matched = prefUv
            ? rows.find(
                (row) =>
                  row.id === prefUv || (row.application_id ?? '').trim() === prefUv,
              )
            : undefined;
          // Soft OBS R-REC-CMP-NET-CAPTURE: auto-select first UV when no deep-link id.
          const initialIds = matched
            ? [matched.id]
            : prefUv
              ? []
              : rows.slice(0, 1).map((row) => row.id);
          setSelectedCandidateIds(initialIds);
          setMatrix(null);
        }
      } catch (error) {
        if (!cancelled) {
          toast({
            title: t('common.error'),
            description: toErrorMessage(error, r('compareFetchError')),
            variant: 'destructive',
          });
          resetSelection();
        }
      } finally {
        if (!cancelled) setLoadingCandidates(false);
      }
    };
    void fetchUv();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/t unstable; yctdList read at call time
  }, [
    selectedYctdId,
    effectiveCompanyId,
    initialCandidateId,
    resetSelection,
    evalListCompanyIds,
    seedEvalRows,
    yctdList,
  ]);

  const loadMatrix = useCallback(
    async (candidateIds: string[], uvRows: readonly CompareCandidateRow[]) => {
      if (!selectedYctdId || !effectiveCompanyId || candidateIds.length === 0) {
        setMatrix(null);
        return;
      }
      const scopedIds = candidateIds.filter((id) => uvRows.some((row) => row.id === id));
      if (scopedIds.length === 0) {
        setMatrix(null);
        return;
      }
      const yctdCompanyId = resolveYctdCompanyId(selectedYctdId, yctdList, effectiveCompanyId);
      setLoadingMatrix(true);
      try {
        const payload = await getRecruitmentCompareMatrix({
          company_id: yctdCompanyId,
          requisition_id: selectedYctdId,
          candidate_ids: scopedIds,
        });
        setMatrix(payload);
      } catch (error) {
        setMatrix(null);
        const code = error instanceof ApiClientError ? error.code : undefined;
        toast({
          title: t('common.error'),
          description: toErrorMessage(
            error,
            code === 'HRM-REC-CMP-MAX-N'
              ? r('maxCompare')
              : code === 'HRM-REC-CMP-YCTD-MIX'
                ? r('mixBlocked')
                : r('compareFetchError'),
          ),
          variant: 'destructive',
        });
      } finally {
        setLoadingMatrix(false);
      }
    },
    [selectedYctdId, effectiveCompanyId, yctdList, t, toast],
  );

  useEffect(() => {
    if (selectedCandidateIds.length === 0 || candidates.length === 0) {
      setMatrix(null);
      return;
    }
    void loadMatrix(selectedCandidateIds, candidates);
  }, [selectedCandidateIds, candidates, loadMatrix]);

  const filteredYctdList = useMemo(
    () => filterYctdPickerRowsByQuery(yctdList, yctdQuery),
    [yctdList, yctdQuery],
  );

  /** REC-06b §2 — UV list theo YCTD đã chọn; ô search chỉ lọc YCTD picker (không ẩn UV). */
  const filteredCandidatesForList = useMemo(() => [...candidates], [candidates]);

  const mergedCandidates = useMemo(
    () => mergeCompareMatrixIntoCandidates(candidates, matrix),
    [candidates, matrix],
  );

  const selectedCandidates = useMemo(
    () => mergedCandidates.filter((c) => selectedCandidateIds.includes(c.id)),
    [mergedCandidates, selectedCandidateIds],
  );

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) return prev.filter((id) => id !== candidateId);
      if (!canAddCandidateToCompare(prev.length, REC_COMPARE_MAX_N)) {
        toast({ title: r('limitReached'), description: r('maxCompare') });
        return prev;
      }
      return [...prev, candidateId];
    });
  };

  const radarData = useMemo(() => {
    if (matrix && selectedCandidateIds.length > 0) {
      return buildRadarFromCompareMatrix(matrix, selectedCandidateIds);
    }
    if (selectedCandidates.length === 0) return [];
    const allCriteria = new Set<string>();
    selectedCandidates.forEach((c) => {
      c.evaluation?.scores.forEach((s) => allCriteria.add(s.criterion_name));
    });
    return Array.from(allCriteria).map((criterion) => {
      const dataPoint: Record<string, string | number> = { criterion };
      selectedCandidates.forEach((candidate, index) => {
        const score = candidate.evaluation?.scores.find((s) => s.criterion_name === criterion);
        dataPoint[`candidate${index}`] = score?.actual_score ?? 0;
        dataPoint[`candidateName${index}`] = candidate.full_name;
      });
      return dataPoint;
    });
  }, [matrix, selectedCandidateIds, selectedCandidates]);

  const atMaxN = selectedCandidateIds.length >= REC_COMPARE_MAX_N;
  const showPostCompareActions = Boolean(onEvaluateCandidate || onChangeStage);

  const renderEvaluateLabel = (candidate: CompareCandidateRow) =>
    isCompareEvalMissing(candidate.eval_status)
      ? tr('evaluateCandidate')
      : tr('compareReEvaluate');

  const contentHeightClass =
    showPostCompareActions && selectedCandidates.length > 0
      ? 'flex h-[calc(90vh-168px)]'
      : 'flex h-[calc(90vh-100px)]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] p-0"
        data-testid={HDSD_MUTATE_TEST_IDS.recCompareDialog}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {r('compareTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className={contentHeightClass}>
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b space-y-2">
              <label className="text-sm font-medium block" htmlFor="rec-compare-yctd">
                {r('selectYctd')}
              </label>
              {loadingYctd || authLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <Input
                    value={yctdQuery}
                    onChange={(e) => setYctdQuery(e.target.value)}
                    placeholder={r('searchYctdPlaceholder')}
                    aria-label={r('searchYctdPlaceholder')}
                    data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdSearch}
                  />
                  {yctdList.length === 0 ? (
                    <div
                      className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground"
                      data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdEmpty}
                    >
                      <p>{r('noYctdEmpty')}</p>
                    </div>
                  ) : filteredYctdList.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                      <p>{r('searchYctdEmpty')}</p>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-36 rounded-md border">
                      <div
                        className="p-1 space-y-1"
                        role="listbox"
                        aria-label={r('selectYctd')}
                        id="rec-compare-yctd"
                      >
                        {filteredYctdList.map((yctd) => {
                          const selected = selectedYctdId === yctd.id;
                          return (
                            <button
                              key={yctd.id}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdPicker}
                              className={`w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent ${
                                selected ? 'bg-accent text-accent-foreground' : ''
                              }`}
                              onClick={() => {
                                if (selectedYctdId === yctd.id) return;
                                setSelectedYctdId(yctd.id);
                                setSelectedCandidateIds([]);
                                setMatrix(null);
                              }}
                              title={formatYctdOptionLabel(yctd)}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{formatYctdOptionPrimaryLine(yctd)}</span>
                                {formatYctdOptionMetaLine(yctd) ? (
                                  <span className="text-xs text-muted-foreground">
                                    {formatYctdOptionMetaLine(yctd)}
                                  </span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : candidates.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-testid={
                      selectedYctdId
                        ? HDSD_MUTATE_TEST_IDS.recCompareUvEmpty
                        : HDSD_MUTATE_TEST_IDS.recCompareYctdEmpty
                    }
                  >
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {selectedYctdId ? r('noCandidatesForYctd') : r('selectYctdToView')}
                    </p>
                  </div>
                ) : filteredCandidatesForList.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvEmpty}
                  >
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{r('searchYctdEmpty')}</p>
                  </div>
                ) : (
                  filteredCandidatesForList.map((candidate) => {
                    const merged = mergedCandidates.find((c) => c.id === candidate.id) ?? candidate;
                    const selected = selectedCandidateIds.includes(candidate.id);
                    const disabled = !selected && atMaxN;
                    const notEvalLabel = compareEvalBadgeLabel(
                      merged.eval_status,
                      r('notEvaluated'),
                    );
                    return (
                      <div
                        key={candidate.id}
                        role="button"
                        tabIndex={disabled ? -1 : 0}
                        aria-disabled={disabled}
                        data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvRow}
                        data-candidate-id={candidate.id}
                        data-eval-status={merged.eval_status ?? 'none'}
                        onClick={() => {
                          if (disabled) {
                            toast({ title: r('limitReached'), description: r('maxCompare') });
                            return;
                          }
                          toggleCandidate(candidate.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) toggleCandidate(candidate.id);
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all ${
                          selected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-pointer'
                            : disabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-muted/50 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={merged.avatar_url || ''} />
                            <AvatarFallback>
                              {merged.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{merged.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {formatCompareCandidateSubtitle(merged)}
                            </p>
                            {showPostCompareActions ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {onEvaluateCandidate ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="h-7"
                                    data-testid="hdsd-rec-compare-evaluate-btn"
                                    onClick={(e) => handleEvaluateClick(e, merged)}
                                  >
                                    <ClipboardCheck className="w-3 h-3 mr-1" />
                                    {renderEvaluateLabel(merged)}
                                  </Button>
                                ) : null}
                                {onChangeStage ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7"
                                    data-testid="hdsd-rec-compare-stage-btn"
                                    onClick={(e) => handleStageClick(e, merged)}
                                  >
                                    <ArrowRightLeft className="w-3 h-3 mr-1" />
                                    {tr('compareChangeStage')}
                                  </Button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          {notEvalLabel || isCompareEvalMissing(merged.eval_status) ? (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-xs"
                              data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvNotEval}
                            >
                              {r('notEvaluated')}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="shrink-0">
                              {merged.evaluation?.weighted_score?.toFixed(1) || '—'}
                            </Badge>
                          )}
                        </div>
                        {merged.evaluation?.result &&
                          resultConfig[merged.evaluation.result as keyof typeof resultConfig] && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge
                                className={`text-xs ${
                                  resultConfig[
                                    merged.evaluation.result as keyof typeof resultConfig
                                  ].color
                                }`}
                              >
                                {
                                  resultConfig[
                                    merged.evaluation.result as keyof typeof resultConfig
                                  ].icon
                                }
                                <span className="ml-1">
                                  {
                                    resultConfig[
                                      merged.evaluation.result as keyof typeof resultConfig
                                    ].label
                                  }
                                </span>
                              </Badge>
                            </div>
                          )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/30 space-y-1">
              <p
                className="text-xs text-muted-foreground"
                data-testid={HDSD_MUTATE_TEST_IDS.recCompareSelectedCount}
              >
                {r('selectedCompare').replace('{{count}}', String(selectedCandidateIds.length))}
              </p>
              {atMaxN ? (
                <p
                  className="text-xs text-amber-700 dark:text-amber-400"
                  data-testid={HDSD_MUTATE_TEST_IDS.recCompareMaxNHint}
                >
                  {r('maxCompare')}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-auto" data-testid={HDSD_MUTATE_TEST_IDS.recCompareMatrix}>
            {loadingMatrix && selectedCandidates.length > 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">{r('selectToCompare')}</p>
                  <p className="text-sm">{r('clickToAdd')}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedCandidates.map((candidate, index) => (
                    <Card key={candidate.id} className="relative overflow-hidden">
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={candidate.avatar_url || ''} />
                            <AvatarFallback
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                                color: 'white',
                              }}
                            >
                              {candidate.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{candidate.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.position || '—'}
                            </p>
                          </div>
                        </div>
                        {candidate.evaluation && !isCompareEvalMissing(candidate.eval_status) ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{r('totalScore')}</span>
                              <span
                                className="text-2xl font-bold"
                                style={{ color: COLORS[index % COLORS.length] }}
                              >
                                {candidate.evaluation.weighted_score?.toFixed(1) || '—'}
                              </span>
                            </div>
                            {candidate.evaluation.recommendation &&
                              recommendationConfig[
                                candidate.evaluation
                                  .recommendation as keyof typeof recommendationConfig
                              ] && (
                                <Badge
                                  className={`w-full justify-center ${
                                    recommendationConfig[
                                      candidate.evaluation
                                        .recommendation as keyof typeof recommendationConfig
                                    ].color
                                  }`}
                                >
                                  {
                                    recommendationConfig[
                                      candidate.evaluation
                                        .recommendation as keyof typeof recommendationConfig
                                    ].label
                                  }
                                </Badge>
                              )}
                          </div>
                        ) : (
                          <p
                            className="text-sm text-muted-foreground text-center py-4"
                            data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvNotEval}
                          >
                            {r('notEvaluated')}
                          </p>
                        )}
                        {showPostCompareActions ? (
                          <div className="mt-3 flex flex-col gap-2">
                            {onEvaluateCandidate ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="w-full"
                                data-testid="hdsd-rec-compare-evaluate-btn"
                                onClick={(e) => handleEvaluateClick(e, candidate)}
                              >
                                <ClipboardCheck className="w-4 h-4 mr-2" />
                                {renderEvaluateLabel(candidate)}
                              </Button>
                            ) : null}
                            {onChangeStage ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-full"
                                data-testid="hdsd-rec-compare-stage-btn"
                                onClick={(e) => handleStageClick(e, candidate)}
                              >
                                <ArrowRightLeft className="w-4 h-4 mr-2" />
                                {tr('compareChangeStage')}
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedCandidates.length > 0 && radarData.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('compareNoScoresTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{r('compareNoScoresHint')}</p>
                    </CardContent>
                  </Card>
                ) : null}

                {radarData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('criteriaChart')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis
                              dataKey="criterion"
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              tickLine={false}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 5]}
                              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                              tickCount={6}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                fontSize: '12px',
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                              formatter={(value) => {
                                const index = parseInt(String(value).replace('candidate', ''), 10);
                                return (
                                  <span className="text-foreground">
                                    {selectedCandidates[index]?.full_name || value}
                                  </span>
                                );
                              }}
                            />
                            {selectedCandidates.map((_, index) => (
                              <Radar
                                key={index}
                                name={`candidate${index}`}
                                dataKey={`candidate${index}`}
                                stroke={COLORS[index % COLORS.length]}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.2}
                                strokeWidth={2}
                              />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedCandidates.filter((c) => c.evaluation).length >= 2 &&
                  radarData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{r('criteriaDetail')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium">{r('criteria')}</th>
                                {selectedCandidates.map((candidate, index) => (
                                  <th
                                    key={candidate.id}
                                    className="text-center py-2 px-3 font-medium"
                                  >
                                    <div className="flex items-center justify-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                          backgroundColor: COLORS[index % COLORS.length],
                                        }}
                                      />
                                      <span className="truncate max-w-[100px]">
                                        {candidate.full_name}
                                      </span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {radarData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b last:border-0">
                                  <td className="py-2 px-3">{row.criterion}</td>
                                  {selectedCandidates.map((candidate, index) => {
                                    const score = Number(row[`candidate${index}`] ?? 0);
                                    const maxScore = Math.max(
                                      ...selectedCandidates.map((_, i) =>
                                        Number(row[`candidate${i}`] || 0),
                                      ),
                                    );
                                    const isMax = score === maxScore && score > 0;
                                    return (
                                      <td key={candidate.id} className="text-center py-2 px-3">
                                        <span
                                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                            isMax
                                              ? 'bg-green-100 text-green-700 font-bold dark:bg-green-900/30'
                                              : ''
                                          }`}
                                        >
                                          {score || '—'}
                                        </span>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                              <tr className="border-t-2 font-medium">
                                <td className="py-2 px-3">{r('totalScore')}</td>
                                {selectedCandidates.map((candidate) => {
                                  const score = candidate.evaluation?.weighted_score;
                                  const maxScore = Math.max(
                                    ...selectedCandidates.map(
                                      (c) => c.evaluation?.weighted_score || 0,
                                    ),
                                  );
                                  const isMax = score === maxScore && !!score && score > 0;
                                  return (
                                    <td key={candidate.id} className="text-center py-2 px-3">
                                      <span
                                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${
                                          isMax
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                        }`}
                                      >
                                        {score?.toFixed(1) || '—'}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {selectedCandidates.some((c) => c.evaluation?.overall_feedback) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('overallFeedback')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCandidates.map(
                        (candidate, index) =>
                          candidate.evaluation?.overall_feedback && (
                            <div key={candidate.id} className="flex gap-3">
                              <div
                                className="w-1 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <div>
                                <p className="font-medium text-sm mb-1">{candidate.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {candidate.evaluation.overall_feedback}
                                </p>
                              </div>
                            </div>
                          ),
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
        {showPostCompareActions && selectedCandidates.length > 0 ? (
          <DialogFooter
            className="px-6 py-3 border-t gap-3 sm:justify-between sm:space-x-0"
            data-testid="hdsd-rec-compare-actions-footer"
          >
            <p className="text-sm text-muted-foreground text-left max-w-xl">
              {tr('compareNextStepHint')}
            </p>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
