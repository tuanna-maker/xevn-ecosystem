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
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ClipboardCheck,
  ArrowRightLeft,
} from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  buildCompareCriteriaTableRows,
  buildRadarFromCompareMatrix,
  compareMatrixHasScoredData,
  buildCompareApplicationsFromEvaluations,
  buildCompareYctdPickerFromCandidates,
  buildCompareYctdPickerFromEvaluations,
  canAddCandidateToCompare,
  compareEvalBadgeLabel,
  isCompareEvalMissing,
  mapApplicationItemToCompareCandidate,
  mergeCompareMatrixIntoCandidates,
  normalizeCompareListRows,
  resolveCompareMatrixCandidateIds,
  formatCompareCandidateSubtitle,
  dedupeCompareCandidatesById,
  type CompareApplicationListItem,
  type CompareEvalListRow,
  type CompareMatrixResponse,
} from '@/lib/candidateCompareUi';
import {
  dedupeRowsById,
  filterComparePickerYctds,
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
  /** Parity tab «Yêu cầu tuyển dụng» — SoT requisitions; tránh fallback eval/UV-only. */
  seedRequisitions?: readonly HrmJobRequisition[] | null;
  /** Refresh requisitions khi mở dialog (cùng hook useJobRequisitions ở Recruitment). */
  refreshRequisitions?: () => Promise<HrmJobRequisition[]>;
}

type CompareCandidateRow = ReturnType<typeof mapApplicationItemToCompareCandidate>;

/** Dropdown 2 dòng; ItemText chỉ primary để trigger không tràn (Radix mirror ItemText). */
function CompareYctdSelectItem({ row }: { row: UvYctdPickerRow }) {
  const primary = formatYctdOptionPrimaryLine(row);
  const meta = formatYctdOptionMetaLine(row);
  return (
    <SelectPrimitive.Item
      value={row.id}
      title={formatYctdOptionLabel(row)}
      className="relative flex w-full cursor-default select-none flex-col items-stretch rounded-input py-2 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground"
    >
      <span className="absolute left-2 top-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="block min-w-0 truncate text-left font-medium">
        {primary}
      </SelectPrimitive.ItemText>
      {meta ? (
        <span className="mt-0.5 min-w-0 truncate text-left text-xs text-muted-foreground">
          {meta}
        </span>
      ) : null}
    </SelectPrimitive.Item>
  );
}

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

function mapRequisitionsToComparePicker(rows: readonly HrmJobRequisition[]): UvYctdPickerRow[] {
  return sortCompareYctdPickerRows(
    dedupeRowsById(filterComparePickerYctds(rows.map(toPickerRow))),
  );
}

function buildCompareYctdScopeCompanyIds(
  companyId: string,
  evalCompanyIds: readonly string[],
): string[] {
  const ids: string[] = [];
  const push = (value: string | null | undefined) => {
    const normalized = normalizeHrmApiListCompanyId(value);
    if (normalized && !ids.includes(normalized)) ids.push(normalized);
  };
  push(companyId);
  push(HRM_LIST_DEFAULT_COMPANY_ID);
  for (const rawId of evalCompanyIds) push(rawId);
  return ids;
}

async function loadCompareYctdPickerFromRequisitionsList(
  companyId: string,
): Promise<UvYctdPickerRow[]> {
  const response = await listJobRequisitions({
    company_id: companyId,
    page: 1,
    page_size: HRM_API_MAX_PAGE_SIZE,
  });
  return mapRequisitionsToComparePicker(jobRequisitionListRows(response));
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
    const [receivableRes, scopeRes] = await Promise.allSettled([
      listJobRequisitions({ ...baseQuery, receivable: true }),
      listJobRequisitions(baseQuery),
    ]);
    if (receivableRes.status === 'fulfilled') {
      mergedRaw.push(...jobRequisitionListRows(receivableRes.value));
    }
    if (scopeRes.status === 'fulfilled') {
      mergedRaw.push(...jobRequisitionListRows(scopeRes.value));
    }
  }
  return mapRequisitionsToComparePicker(mergedRaw);
}

function mergeSeedEvalIntoCompareYctdPicker(
  rows: readonly UvYctdPickerRow[],
  seedEvalRows: readonly CompareEvalListRow[],
): UvYctdPickerRow[] {
  if (seedEvalRows.length === 0) return [...rows];
  const fromSeed = filterComparePickerYctds(
    buildCompareYctdPickerFromEvaluations(seedEvalRows).map(evalRowToPickerRow),
  );
  if (rows.length === 0) {
    return sortCompareYctdPickerRows(dedupeRowsById(fromSeed));
  }
  const knownIds = new Set(rows.map((row) => row.id));
  const supplemental = fromSeed.filter((row) => !knownIds.has(row.id));
  if (supplemental.length === 0) return [...rows];
  return sortCompareYctdPickerRows(dedupeRowsById([...rows, ...supplemental]));
}

async function loadCompareYctdPickerRows(
  companyId: string,
  prefYctd: string,
  evalCompanyIds: readonly string[],
  seedEvalRows: readonly CompareEvalListRow[] = [],
  preloadedRequisitions: readonly HrmJobRequisition[] = [],
): Promise<UvYctdPickerRow[]> {
  const primaryCompanyId = normalizeHrmApiListCompanyId(companyId);
  const scopeIds = buildCompareYctdScopeCompanyIds(companyId, evalCompanyIds);
  const preloadedRows =
    preloadedRequisitions.length > 0
      ? mapRequisitionsToComparePicker(preloadedRequisitions)
      : [];

  let apiRows: UvYctdPickerRow[] = [];
  try {
    apiRows = await loadRequisitionsAcrossCompanyScopes(scopeIds);
  } catch {
    apiRows = [];
  }
  if (apiRows.length === 0) {
    try {
      apiRows = await loadCompareYctdPickerFromRequisitionsList(primaryCompanyId);
    } catch {
      apiRows = [];
    }
  }

  /** API rollup first — preloaded tab seed bổ sung; không bỏ qua multi-scope khi seed đã có dòng. */
  let rows = sortCompareYctdPickerRows(dedupeRowsById([...apiRows, ...preloadedRows]));
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
          rows = sortCompareYctdPickerRows(
            dedupeRowsById([toPickerRow(pinned), ...rows]),
          );
          break;
        }
      } catch {
        /* deep-link YCTD vẫn giữ selectedYctdId — UV fetch chạy theo id */
      }
    }
  }
  return rows;
}

const EMPTY_COMPARE_SEED_EVAL_ROWS: CompareEvalListRow[] = [];

const COMPARE_YCTD_FETCH_MS = 8_000;

async function loadCompareYctdPickerRowsWithTimeout(
  companyId: string,
  prefYctd: string,
  evalCompanyIds: readonly string[],
  seedEvalRows: readonly CompareEvalListRow[] = [],
  preloadedRequisitions: readonly HrmJobRequisition[] = [],
): Promise<UvYctdPickerRow[]> {
  return Promise.race([
    loadCompareYctdPickerRows(
      companyId,
      prefYctd,
      evalCompanyIds,
      seedEvalRows,
      preloadedRequisitions,
    ),
    new Promise<UvYctdPickerRow[]>((resolve) => {
      setTimeout(() => resolve([]), COMPARE_YCTD_FETCH_MS);
    }),
  ]);
}

function buildFastCompareYctdPickerRows(
  preloadedRequisitions: readonly HrmJobRequisition[],
  seedEvalRows: readonly CompareEvalListRow[],
): UvYctdPickerRow[] {
  const preloadedRows =
    preloadedRequisitions.length > 0
      ? mapRequisitionsToComparePicker(preloadedRequisitions)
      : [];
  if (preloadedRows.length === 0 && seedEvalRows.length === 0) return [];
  return mergeSeedEvalIntoCompareYctdPicker(preloadedRows, seedEvalRows);
}

export function CandidateComparisonDialog({
  open,
  onOpenChange,
  initialRequisitionId = null,
  initialCandidateId = null,
  onEvaluateCandidate,
  onChangeStage,
  seedEvaluations = null,
  seedRequisitions = null,
  refreshRequisitions,
}: CandidateComparisonDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId, loading: authLoading } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  /** Parity useJobRequisitions + tab YCTD — OU filter first. */
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
    if (!seedEvaluations?.length) return EMPTY_COMPARE_SEED_EVAL_ROWS;
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
  const matrixRequestRef = useRef(0);

  const [yctdList, setYctdList] = useState<UvYctdPickerRow[]>([]);
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
      setLoadingYctd(false);
      return;
    }
    const justOpened = !wasOpenRef.current;
    wasOpenRef.current = true;
    if (!justOpened) return;

    resetSelection();
    const prefYctd = (initialRequisitionId ?? '').trim();
    setSelectedYctdId(prefYctd);
  }, [open, initialRequisitionId, resetSelection]);

  const seedRequisitionCount = seedRequisitions?.length ?? 0;
  const seedEvalCount = seedEvalRows.length;

  useEffect(() => {
    if (!open || !effectiveCompanyId || authLoading) return;
    let cancelled = false;
    const prefYctd = (initialRequisitionId ?? '').trim();
    const fetchYctd = async () => {
      setLoadingYctd(true);
      try {
        let preloadedRequisitions: HrmJobRequisition[] = [...(seedRequisitions ?? [])];
        const fastRows = buildFastCompareYctdPickerRows(
          preloadedRequisitions,
          seedEvalRows,
        );
        if (!cancelled && fastRows.length > 0) {
          setYctdList(fastRows);
          if (!prefYctd) {
            setSelectedYctdId(fastRows[0].id);
          }
        }
        if (refreshRequisitions && preloadedRequisitions.length === 0) {
          try {
            const fresh = await Promise.race([
              refreshRequisitions(),
              new Promise<HrmJobRequisition[]>((resolve) => {
                setTimeout(() => resolve([]), COMPARE_YCTD_FETCH_MS);
              }),
            ]);
            if (fresh.length > 0) preloadedRequisitions = fresh;
          } catch {
            /* giữ seedRequisitions từ tab YCTD nếu refresh lỗi (hrm-api/proxy) */
          }
        }
        const rows = await loadCompareYctdPickerRowsWithTimeout(
          effectiveCompanyId,
          prefYctd,
          evalListCompanyIds,
          seedEvalRows,
          preloadedRequisitions,
        );
        const resolvedRows =
          rows.length > 0
            ? rows
            : fastRows.length > 0
              ? fastRows
              : buildFastCompareYctdPickerRows(preloadedRequisitions, seedEvalRows);
        if (!cancelled) {
          setYctdList(resolvedRows);
          if (prefYctd) {
            setSelectedYctdId(prefYctd);
          } else if (resolvedRows.length > 0) {
            setSelectedYctdId(resolvedRows[0].id);
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
        setLoadingYctd(false);
      }
    };
    void fetchYctd();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/t unstable on re-render
  }, [
    open,
    effectiveCompanyId,
    initialRequisitionId,
    evalListCompanyIds,
    seedEvalCount,
    seedRequisitionCount,
    refreshRequisitions,
    authLoading,
  ]);

  useEffect(() => {
    if (!selectedYctdId || !effectiveCompanyId) {
      resetSelection();
      return;
    }
    // Tránh YCTD-MIX: xóa UV cũ ngay khi đổi YCTD — không chờ fetch async.
    matrixRequestRef.current += 1;
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
      const scopedIds = resolveCompareMatrixCandidateIds(uvRows, candidateIds);
      if (scopedIds.length === 0) {
        setMatrix(null);
        return;
      }
      const yctdCompanyId = resolveYctdCompanyId(selectedYctdId, yctdList, effectiveCompanyId);
      const requestId = ++matrixRequestRef.current;
      setLoadingMatrix(true);
      try {
        const payload = await getRecruitmentCompareMatrix({
          company_id: yctdCompanyId,
          requisition_id: selectedYctdId,
          candidate_ids: scopedIds,
        });
        if (requestId !== matrixRequestRef.current) return;
        setMatrix(payload);
      } catch (error) {
        if (requestId !== matrixRequestRef.current) return;
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
        if (requestId === matrixRequestRef.current) {
          setLoadingMatrix(false);
        }
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

  const handleYctdChange = useCallback((value: string) => {
    if (!value || selectedYctdId === value) return;
    matrixRequestRef.current += 1;
    setSelectedYctdId(value);
    setSelectedCandidateIds([]);
    setMatrix(null);
  }, [selectedYctdId]);

  /** REC-06b §2 — UV list theo YCTD đã chọn (sidebar). */
  const filteredCandidatesForList = useMemo(() => [...candidates], [candidates]);

  const selectedYctdRow = useMemo(
    () => yctdList.find((row) => row.id === selectedYctdId) ?? null,
    [yctdList, selectedYctdId],
  );

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

  const hasChartScores = useMemo(() => {
    if (matrix && compareMatrixHasScoredData(matrix, selectedCandidateIds)) return true;
    return selectedCandidates.some((c) =>
      (c.evaluation?.scores ?? []).some(
        (s) => s.actual_score != null && Number.isFinite(Number(s.actual_score)),
      ),
    );
  }, [matrix, selectedCandidateIds, selectedCandidates]);

  const radarData = useMemo(() => {
    if (matrix && selectedCandidateIds.length > 0 && hasChartScores) {
      return buildRadarFromCompareMatrix(matrix, selectedCandidateIds);
    }
    if (!hasChartScores || selectedCandidates.length === 0) return [];
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
  }, [matrix, selectedCandidateIds, selectedCandidates, hasChartScores]);

  const criteriaTableRows = useMemo(() => {
    if (matrix && selectedCandidateIds.length >= 2 && matrix.criteria.length > 0) {
      return buildCompareCriteriaTableRows(matrix, selectedCandidateIds);
    }
    if (hasChartScores && radarData.length > 0) {
      return radarData;
    }
    return [];
  }, [matrix, selectedCandidateIds, hasChartScores, radarData]);

  const atMaxN = selectedCandidateIds.length >= REC_COMPARE_MAX_N;
  const showPostCompareActions = Boolean(onEvaluateCandidate || onChangeStage);

  const renderEvaluateLabel = (candidate: CompareCandidateRow) =>
    isCompareEvalMissing(candidate.eval_status)
      ? tr('evaluateCandidate')
      : tr('compareReEvaluate');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] p-0 flex flex-col overflow-hidden"
        data-testid={HDSD_MUTATE_TEST_IDS.recCompareDialog}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {r('compareTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="w-80 shrink-0 min-w-0 border-r flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b space-y-2 min-w-0">
              <label className="text-sm font-medium block truncate" htmlFor="rec-compare-yctd">
                {r('selectYctd')}
              </label>
              {authLoading || loadingYctd ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : yctdList.length === 0 ? (
                <div
                  className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground"
                  data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdEmpty}
                >
                  <p>{r('noYctdEmpty')}</p>
                </div>
              ) : (
                <Select value={selectedYctdId || undefined} onValueChange={handleYctdChange}>
                  <SelectTrigger
                    id="rec-compare-yctd"
                    className="min-w-0 [&>span:first-child]:min-w-0 [&>span:first-child]:truncate"
                    data-testid={HDSD_MUTATE_TEST_IDS.recCompareYctdPicker}
                  >
                    <SelectValue placeholder={r('selectYctdPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="max-w-[min(24rem,calc(100vw-2rem))]">
                    {yctdList.map((yctd) => (
                      <CompareYctdSelectItem key={yctd.id} row={yctd} />
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedYctdRow && formatYctdOptionMetaLine(selectedYctdRow) ? (
                <p
                  className="text-xs text-muted-foreground line-clamp-2 break-words"
                  title={formatYctdOptionMetaLine(selectedYctdRow)}
                  data-testid="rec-compare-yctd-meta"
                >
                  {formatYctdOptionMetaLine(selectedYctdRow)}
                </p>
              ) : null}
            </div>
            <ScrollArea className="flex-1 min-h-0">
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

          <div
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
            data-testid={HDSD_MUTATE_TEST_IDS.recCompareMatrix}
          >
            {loadingMatrix && selectedCandidates.length > 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedCandidates.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">{r('selectToCompare')}</p>
                  <p className="text-sm">{r('clickToAdd')}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="shrink-0 border-b bg-background p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {selectedCandidates.map((candidate, index) => (
                      <Card key={candidate.id} className="relative overflow-hidden">
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <CardContent className="p-3 pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-9 w-9">
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
                              <p className="font-medium truncate text-sm">{candidate.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {candidate.position || '—'}
                              </p>
                            </div>
                          </div>
                          {candidate.evaluation && !isCompareEvalMissing(candidate.eval_status) ? (
                            <div className="space-y-1.5 mb-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{r('totalScore')}</span>
                                <span
                                  className="text-xl font-bold"
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
                                    className={`w-full justify-center text-xs ${
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
                              className="text-sm text-muted-foreground text-center py-2 mb-2"
                              data-testid={HDSD_MUTATE_TEST_IDS.recCompareUvNotEval}
                            >
                              {r('notEvaluated')}
                            </p>
                          )}
                          {showPostCompareActions ? (
                            <div className="flex flex-col gap-1.5">
                              {onEvaluateCandidate ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="w-full h-8 text-xs"
                                  data-testid="hdsd-rec-compare-evaluate-btn"
                                  onClick={(e) => handleEvaluateClick(e, candidate)}
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                                  {renderEvaluateLabel(candidate)}
                                </Button>
                              ) : null}
                              {onChangeStage ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-8 text-xs"
                                  data-testid="hdsd-rec-compare-stage-btn"
                                  onClick={(e) => handleStageClick(e, candidate)}
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                                  {tr('compareChangeStage')}
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 space-y-4">
                {hasChartScores && radarData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{r('criteriaChart')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 pb-4">
                      <div className="h-[280px] min-h-[220px]">
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

                {selectedCandidates.length >= 2 &&
                  hasChartScores &&
                  criteriaTableRows.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{r('criteriaDetail')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium max-w-[9rem] w-[35%]">
                                  {r('criteria')}
                                </th>
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
                              {criteriaTableRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b last:border-0">
                                  <td className="py-2 px-3 max-w-[9rem]">
                                    <span className="block truncate" title={String(row.criterion)}>
                                      {row.criterion}
                                    </span>
                                  </td>
                                  {selectedCandidates.map((candidate, index) => {
                                    const raw = row[`candidate${index}`];
                                    const score =
                                      typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
                                    const numericScores = selectedCandidates
                                      .map((_, i) => {
                                        const cell = row[`candidate${i}`];
                                        return typeof cell === 'number' && Number.isFinite(cell)
                                          ? cell
                                          : null;
                                      })
                                      .filter((v): v is number => v != null);
                                    const maxScore =
                                      numericScores.length > 0 ? Math.max(...numericScores) : 0;
                                    const isMax = score != null && score === maxScore && score > 0;
                                    return (
                                      <td key={candidate.id} className="text-center py-2 px-3">
                                        <span
                                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                            isMax
                                              ? 'bg-green-100 text-green-700 font-bold dark:bg-green-900/30'
                                              : ''
                                          }`}
                                        >
                                          {score ?? '—'}
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
                </ScrollArea>
              </>
            )}
          </div>
        </div>
        {showPostCompareActions && selectedCandidates.length > 0 ? (
          <DialogFooter
            className="px-6 py-3 border-t gap-3 shrink-0 sm:justify-between sm:space-x-0"
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
