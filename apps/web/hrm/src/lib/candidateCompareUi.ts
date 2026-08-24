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
  /** Lane A spine id — prefer over candidate_id for compare matrix (F-REC-CMP-02). */
  recruitment_candidate_id?: string | null;
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

/** Normalize BE list envelopes (`data` | `items` | bare array | nested ok.data). */
export function normalizeCompareListRows<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];
  const row = payload as { data?: unknown; items?: unknown };
  if (Array.isArray(row.data)) return row.data as T[];
  if (Array.isArray(row.items)) return row.items as T[];
  // Nested: { data: { data: T[] } } or { data: { items: T[] } }
  if (row.data && typeof row.data === 'object') {
    const nested = row.data as { data?: unknown; items?: unknown };
    if (Array.isArray(nested.data)) return nested.data as T[];
    if (Array.isArray(nested.items)) return nested.items as T[];
  }
  return [];
}

export function mapApplicationItemToCompareCandidate(item: CompareApplicationListItem) {
  const evalMissing = isCompareEvalMissing(item.eval_status);
  const normalizedScores = (item.scores ?? []).map((s) => ({
    criterion_name:
      s.criterion_name ??
      (s as { criterion?: string; name?: string }).criterion ??
      (s as { name?: string }).name ??
      '—',
    category: s.category ?? '',
    actual_score:
      s.actual_score ??
      (s as { score?: number | null; value?: number | null }).score ??
      (s as { value?: number | null }).value ??
      null,
    required_score: s.required_score ?? 0,
    weight: s.weight ?? 0,
  }));
  const hasScores = normalizedScores.some(
    (s) => s.actual_score != null && Number.isFinite(Number(s.actual_score)),
  );
  const weighted =
    item.weighted_score ??
    (item as { total_score?: number | null }).total_score ??
    null;
  const spineId = resolveCompareSpineCandidateId(item);
  return {
    id: spineId,
    application_id: item.application_id ?? spineId ?? null,
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
            total_score: weighted,
            weighted_score: weighted,
            recommendation: item.recommendation ?? null,
            result: item.result ?? null,
            overall_feedback: item.overall_feedback ?? null,
            evaluator_name: null as string | null,
            created_at: '',
            scores: normalizedScores,
          },
  };
}

export type CompareCandidateMapped = ReturnType<typeof mapApplicationItemToCompareCandidate>;

/**
 * Prefer BE matrix (F-REC-CMP-02) over list-side eval when both present —
 * fills cards/radar when list join missed neo but compare resolved scores.
 */
export function mergeCompareMatrixIntoCandidates(
  candidates: CompareCandidateMapped[],
  matrix: CompareMatrixResponse | null | undefined,
): CompareCandidateMapped[] {
  if (!matrix?.rows?.length) return candidates;
  const byId = new Map(matrix.rows.map((r) => [r.candidate_id, r]));
  return candidates.map((c) => {
    const row = byId.get(c.id);
    if (!row) return c;
    const evalMissing = isCompareEvalMissing(row.eval_status ?? c.eval_status);
    const scoreEntries = Object.entries(row.scores ?? {}).filter(([key]) => {
      // Prefer criterion names over template UUID keys when both set.
      return !/^[0-9a-f-]{36}$/i.test(key);
    });
    const scores =
      scoreEntries.length > 0
        ? scoreEntries.map(([criterion_name, actual_score]) => ({
            criterion_name,
            category: '',
            actual_score: typeof actual_score === 'number' ? actual_score : null,
            required_score: 0,
            weight: 0,
          }))
        : c.evaluation?.scores ?? [];
    const hasScores = scores.some((s) => s.actual_score != null);
    if (evalMissing && !hasScores) {
      return {
        ...c,
        eval_status: row.eval_status ?? c.eval_status,
        full_name: row.full_name || c.full_name,
      };
    }
    const weighted = row.weighted_score ?? c.evaluation?.weighted_score ?? null;
    return {
      ...c,
      full_name: row.full_name || c.full_name,
      eval_status: row.eval_status ?? c.eval_status,
      evaluation: {
        id: row.application_id ?? c.application_id ?? c.id,
        total_score: weighted,
        weighted_score: weighted,
        recommendation: row.recommendation ?? c.evaluation?.recommendation ?? null,
        result: row.result ?? c.evaluation?.result ?? null,
        overall_feedback: row.overall_feedback ?? c.evaluation?.overall_feedback ?? null,
        evaluator_name: c.evaluation?.evaluator_name ?? null,
        created_at: c.evaluation?.created_at ?? '',
        scores,
      },
    };
  });
}

function readCompareMatrixScore(
  row: CompareMatrixResponse['rows'][number] | undefined,
  criterion: CompareMatrixResponse['criteria'][number],
): number | null {
  if (!row) return null;
  const key = criterion.id ?? criterion.name;
  const raw = row.scores?.[key] ?? row.scores?.[criterion.name];
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return null;
  return raw;
}

/** True when at least one selected UV has a stored numeric score (not template-only nulls). */
export function compareMatrixHasScoredData(
  matrix: CompareMatrixResponse,
  selectedCandidateIds: string[],
): boolean {
  if (!matrix.rows.length || !matrix.criteria.length || selectedCandidateIds.length === 0) {
    return false;
  }
  const selectedRows = matrix.rows.filter((r) => selectedCandidateIds.includes(r.candidate_id));
  for (const row of selectedRows) {
    for (const criterion of matrix.criteria) {
      if (readCompareMatrixScore(row, criterion) != null) return true;
    }
  }
  return false;
}

/** Criteria table rows — keeps null for «chưa đánh giá» cells (AC-REC-CMP-05). */
export function buildCompareCriteriaTableRows(
  matrix: CompareMatrixResponse,
  selectedCandidateIds: string[],
): Array<Record<string, string | number | null>> {
  if (matrix.criteria.length === 0 || selectedCandidateIds.length === 0) return [];
  return matrix.criteria.map((criterion) => {
    const point: Record<string, string | number | null> = { criterion: criterion.name };
    selectedCandidateIds.forEach((candidateId, index) => {
      const row = matrix.rows.find((r) => r.candidate_id === candidateId);
      point[`candidate${index}`] = readCompareMatrixScore(row, criterion);
      point[`candidateName${index}`] = row?.full_name ?? candidateId;
    });
    return point;
  });
}

/** Radar rows from F-REC-CMP-02 matrix (preferred over FE-invented scores). */
export function buildRadarFromCompareMatrix(
  matrix: CompareMatrixResponse,
  selectedCandidateIds: string[],
): Array<Record<string, string | number>> {
  if (!compareMatrixHasScoredData(matrix, selectedCandidateIds)) return [];
  const selectedRows = matrix.rows.filter((r) => selectedCandidateIds.includes(r.candidate_id));
  if (selectedRows.length === 0 || matrix.criteria.length === 0) return [];
  return matrix.criteria.map((criterion) => {
    const point: Record<string, string | number> = { criterion: criterion.name };
    selectedCandidateIds.forEach((candidateId, index) => {
      const row = selectedRows.find((r) => r.candidate_id === candidateId);
      point[`candidate${index}`] = readCompareMatrixScore(row, criterion) ?? 0;
      point[`candidateName${index}`] = row?.full_name ?? candidateId;
    });
    return point;
  });
}

/** UV subtitle — email + stage so same-name candidates stay distinguishable. */
export function formatCompareCandidateSubtitle(row: {
  email?: string | null;
  stage?: string | null;
  position?: string | null;
}): string {
  const email = (row.email ?? '').trim();
  const stage = (row.stage ?? '').trim();
  const position = (row.position ?? '').trim();
  const parts: string[] = [];
  if (email) parts.push(email);
  if (stage) parts.push(stage);
  if (!email && position) parts.push(position);
  return parts.length > 0 ? parts.join(' · ') : '—';
}

/** Deduplicate compare list payloads by candidate id. */
export function dedupeCompareCandidatesById<T extends { id: string }>(rows: readonly T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    const id = String(row.id ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

/** Lane A spine id for F-REC-CMP-02 — prefer recruitment_candidate_id over pool candidate_id. */
export function resolveCompareSpineCandidateId(
  item: Pick<CompareApplicationListItem, 'candidate_id' | 'recruitment_candidate_id'>,
): string {
  const spine = (item.recruitment_candidate_id ?? '').trim();
  if (spine) return spine;
  return (item.candidate_id ?? '').trim();
}

/**
 * Map sidebar selection → spine ids accepted by GET /compare.
 * Matches id or application_id aliases on loaded UV rows (same YCTD list).
 */
export function resolveCompareMatrixCandidateIds(
  uvRows: readonly { id: string; application_id?: string | null }[],
  selectedIds: readonly string[],
): string[] {
  const bySpineId = new Map<string, string>();
  const byAlias = new Map<string, string>();
  for (const row of uvRows) {
    const spine = String(row.id ?? '').trim();
    if (!spine) continue;
    bySpineId.set(spine, spine);
    const appId = String(row.application_id ?? '').trim();
    if (appId) byAlias.set(appId, spine);
  }
  const resolved: string[] = [];
  const seen = new Set<string>();
  for (const raw of selectedIds) {
    const key = String(raw ?? '').trim();
    if (!key) continue;
    const spine = bySpineId.get(key) ?? byAlias.get(key);
    if (!spine || seen.has(spine)) continue;
    seen.add(spine);
    resolved.push(spine);
  }
  return resolved;
}

/** Row shape from GET /candidate-evaluations (group CEO scope parity). */
export type CompareEvalListRow = {
  requisition_id?: string | null;
  recruitment_candidate_id?: string | null;
  candidate_id?: string | null;
  yctd_title?: string | null;
  yctd_company_id?: string | null;
  candidate_name?: string | null;
  candidate_email?: string | null;
  candidate_position?: string | null;
  candidate_stage?: string | null;
  weighted_score?: number | null;
  result?: string | null;
  recommendation?: string | null;
  overall_feedback?: string | null;
  scores?: CompareApplicationListItem['scores'];
  created_at?: string | null;
};

/**
 * Fallback YCTD picker when listJobRequisitions rollup misses legacy `main` rows —
 * same SoT as tab Đánh giá (requisition_id on eval neo).
 */
export function buildCompareYctdPickerFromEvaluations(
  evalRows: readonly CompareEvalListRow[],
): Array<{
  id: string;
  company_id: string;
  title: string;
  status: string;
  candidate_count: number;
}> {
  const byReq = new Map<
    string,
    { id: string; company_id: string; title: string; uvIds: Set<string> }
  >();
  for (const row of evalRows) {
    const id = (row.requisition_id ?? '').trim();
    if (!id) continue;
    const uvId = (row.recruitment_candidate_id ?? row.candidate_id ?? '').trim();
    let entry = byReq.get(id);
    if (!entry) {
      entry = {
        id,
        company_id: (row.yctd_company_id ?? 'main').trim() || 'main',
        title: (row.yctd_title ?? 'YCTD').trim() || 'YCTD',
        uvIds: new Set<string>(),
      };
      byReq.set(id, entry);
    }
    if (uvId) entry.uvIds.add(uvId);
  }
  return [...byReq.values()].map((entry) => ({
    id: entry.id,
    company_id: entry.company_id,
    title: entry.title,
    status: 'open',
    candidate_count: entry.uvIds.size,
  }));
}

/** Build compare UV list for one YCTD from eval rows (latest eval per UV). */
export function buildCompareApplicationsFromEvaluations(
  evalRows: readonly CompareEvalListRow[],
  requisitionId: string,
): CompareApplicationListItem[] {
  const req = requisitionId.trim();
  if (!req) return [];
  const byUv = new Map<string, CompareEvalListRow>();
  for (const row of evalRows) {
    if ((row.requisition_id ?? '').trim() !== req) continue;
    const uvId = (row.recruitment_candidate_id ?? '').trim();
    if (!uvId) continue;
    const prev = byUv.get(uvId);
    const prevTs = prev?.created_at ? Date.parse(String(prev.created_at)) : 0;
    const rowTs = row.created_at ? Date.parse(String(row.created_at)) : 0;
    if (!prev || (Number.isFinite(rowTs) && rowTs >= prevTs)) {
      byUv.set(uvId, row);
    }
  }
  return [...byUv.values()].map((row) => {
    const uvId = (row.recruitment_candidate_id ?? '').trim();
    const scores = Array.isArray(row.scores) ? row.scores : null;
    const hasScores =
      (scores?.some((s) => s?.actual_score != null) ?? false) ||
      row.weighted_score != null;
    return {
      candidate_id: uvId,
      recruitment_candidate_id: (row.recruitment_candidate_id ?? uvId).trim() || uvId,
      application_id: uvId,
      full_name: String(row.candidate_name ?? '—'),
      email: row.candidate_email ?? null,
      position_name: row.candidate_position ?? null,
      stage: row.candidate_stage ?? null,
      eval_status: hasScores ? 'complete' : 'none',
      scores,
      result: row.result ?? null,
      recommendation: row.recommendation ?? null,
      weighted_score: row.weighted_score ?? null,
      overall_feedback: row.overall_feedback ?? null,
    };
  });
}

/** Fallback YCTD picker from Lane A spine (tab Ứng viên / UV list) when requisitions rollup empty. */
export function buildCompareYctdPickerFromCandidates(
  candidates: readonly Array<{
    requisition_id?: string | null;
    company_id?: string | null;
    yctd_title?: string | null;
    status?: string | null;
  }>,
): Array<{
  id: string;
  company_id: string;
  title: string;
  status: string;
  candidate_count: number;
}> {
  const byReq = new Map<
    string,
    { id: string; company_id: string; title: string; status: string; count: number }
  >();
  for (const row of candidates) {
    const id = (row.requisition_id ?? '').trim();
    if (!id) continue;
    let entry = byReq.get(id);
    if (!entry) {
      entry = {
        id,
        company_id: (row.company_id ?? 'main').trim() || 'main',
        title: (row.yctd_title ?? 'YCTD').trim() || 'YCTD',
        status: (row.status ?? 'open').trim() || 'open',
        count: 0,
      };
      byReq.set(id, entry);
    }
    entry.count += 1;
  }
  return [...byReq.values()].map((entry) => ({
    id: entry.id,
    company_id: entry.company_id,
    title: entry.title,
    status: entry.status,
    candidate_count: entry.count,
  }));
}
