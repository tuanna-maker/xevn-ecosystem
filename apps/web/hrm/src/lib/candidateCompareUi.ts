/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → So sánh ứng viên (FR-UC-BP-REC-06b)
 * UC:         FR-UC-BP-REC-06b · AC-REC-CMP-01..05 · J-HRM-REC-CMP-01
 * BR:         BR-BP-REC-CMP-01 (YCTD-MIX) · max-N default 4
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 · REC-06b #1–#6
 * TechSpec:   docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §3 F-REC-CMP-01..02
 * DB:         docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md — soft FK requisition_id
 * API:        docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md §7 — empty 200[] · MAX-N · YCTD-MIX
 * Purpose:    Pure helpers So sánh theo YCTD — max-N, eval «chưa đánh giá», normalize list envelope.
 * WorkItem:   PO-HRM-REC-UV-YCTD-CMP-FE-01
 * Coded:      2026-08-06
 * Callers:    CandidateComparisonDialog
 * Callees:    none
 * must_keep:  SoT filter = YCTD · FORBIDDEN job_postings · no fake scores
 * SOLID:      Pure module — UI không invent nested write aggregate
 * LastVerified: candidateCompareUi.test.ts
 */

/** AC-REC-CMP-04 · UT-REC-CMP-03 — BE default N; FE mirrors for disable UX. */
export const REC_COMPARE_MAX_N = 4;

export type CompareEvalStatus = 'none' | 'partial' | 'complete' | string;

export type CompareApplicationListItem = {
  candidate_id: string;
  application_id?: string | null;
  full_name: string;
  email?: string | null;
  avatar_url?: string | null;
  position_name?: string | null;
  position_key?: string | null;
  stage?: string | null;
  eval_status?: CompareEvalStatus | null;
  scores?: Array<{
    criterion_name?: string;
    category?: string;
    actual_score?: number | null;
    required_score?: number;
    weight?: number;
  }> | null;
  result?: string | null;
  recommendation?: string | null;
  weighted_score?: number | null;
  overall_feedback?: string | null;
};

export type CompareMatrixResponse = {
  requisition_id: string;
  recruitment_request_id?: string;
  max_n?: number;
  criteria: Array<{ id?: string; name: string; weight?: number }>;
  rows: Array<{
    candidate_id: string;
    application_id?: string | null;
    full_name?: string;
    eval_status?: CompareEvalStatus | null;
    scores: Record<string, number | null | undefined>;
    weighted_score?: number | null;
    result?: string | null;
    recommendation?: string | null;
    overall_feedback?: string | null;
  }>;
};

/** True when FE may add another candidate (AC-REC-CMP-04). */
export function canAddCandidateToCompare(
  selectedCount: number,
  maxN: number = REC_COMPARE_MAX_N,
): boolean {
  return selectedCount < maxN;
}

/** SRS #6 / AC-REC-CMP-05 — missing eval still listed. */
export function isCompareEvalMissing(evalStatus: CompareEvalStatus | null | undefined): boolean {
  if (evalStatus == null || evalStatus === '') return true;
  const normalized = String(evalStatus).trim().toLowerCase();
  return normalized === 'none' || normalized === 'missing' || normalized === 'chua_danh_gia';
}

export function compareEvalBadgeLabel(
  evalStatus: CompareEvalStatus | null | undefined,
  chuaDanhGiaLabel: string,
): string | null {
  return isCompareEvalMissing(evalStatus) ? chuaDanhGiaLabel : null;
}

/** Normalize BE list envelopes (`data` | `items` | bare array). */
export function normalizeCompareListRows<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];
  const row = payload as { data?: unknown; items?: unknown };
  if (Array.isArray(row.data)) return row.data as T[];
  if (Array.isArray(row.items)) return row.items as T[];
  return [];
}

export function mapApplicationItemToCompareCandidate(item: CompareApplicationListItem) {
  const evalMissing = isCompareEvalMissing(item.eval_status);
  const hasScores = Array.isArray(item.scores) && item.scores.length > 0;
  return {
    id: item.candidate_id,
    application_id: item.application_id ?? null,
    full_name: item.full_name || '—',
    email: item.email ?? '',
    avatar_url: item.avatar_url ?? null,
    position: item.position_name ?? item.position_key ?? null,
    stage: item.stage ?? null,
    eval_status: item.eval_status ?? 'none',
    evaluation:
      evalMissing && !hasScores
        ? null
        : {
            id: item.application_id ?? item.candidate_id,
            total_score: item.weighted_score ?? null,
            weighted_score: item.weighted_score ?? null,
            recommendation: item.recommendation ?? null,
            result: item.result ?? null,
            overall_feedback: item.overall_feedback ?? null,
            evaluator_name: null as string | null,
            created_at: '',
            scores: (item.scores ?? []).map((s) => ({
              criterion_name: s.criterion_name ?? '—',
              category: s.category ?? '',
              actual_score: s.actual_score ?? null,
              required_score: s.required_score ?? 0,
              weight: s.weight ?? 0,
            })),
          },
  };
}

/** Radar rows from F-REC-CMP-02 matrix (preferred over FE-invented scores). */
export function buildRadarFromCompareMatrix(
  matrix: CompareMatrixResponse,
  selectedCandidateIds: string[],
): Array<Record<string, string | number>> {
  const selectedRows = matrix.rows.filter((r) => selectedCandidateIds.includes(r.candidate_id));
  if (selectedRows.length === 0 || matrix.criteria.length === 0) return [];
  return matrix.criteria.map((criterion) => {
    const point: Record<string, string | number> = { criterion: criterion.name };
    selectedRows.forEach((row, index) => {
      const key = criterion.id ?? criterion.name;
      const raw = row.scores?.[key] ?? row.scores?.[criterion.name];
      point[`candidate${index}`] = typeof raw === 'number' ? raw : 0;
      point[`candidateName${index}`] = row.full_name ?? row.candidate_id;
    });
    return point;
  });
}
