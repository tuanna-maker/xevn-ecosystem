/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Ứng viên badge lịch PV
 * UC:         UC-BP-REC-06a · AC-REC-IV-01/06
 * BR:         BR-REC-IV-DISPLAY — FE bind active_interview only (cấm suy ACTIVE)
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md F-REC-IV-04
 * Purpose:    Helpers badge + ACTIVE id từ BE display-ready projection
 * WorkItem:   PO-HRM-REC-IV-ONE-ACTIVE-FE-02
 * Coded:      2026-08-06
 * Callers:    CandidatesTab · ManageActiveInterviewDialog
 * Callees:    date-fns format vi-VN
 * must_keep:  Bind projection only · no invent ACTIVE · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: ADD active_interview_id picker + 409 details extract for manage cancel/complete/R-A
 * Why: AC-REC-IV-03..06 · BA Diễn biến #4–#7 — manage needs ACTIVE id (projection or 409)
 * must_keep: badge label/time · merge by email · no Lane B SoT · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-fe-01.md
 */
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VI_DATETIME_PATTERN = /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/;

export type ActiveInterviewProjection = {
  has_active_interview?: boolean | null;
  /** ACTIVE row id for PATCH status / R-A (AC-REC-IV-06). */
  active_interview_id?: string | null;
  active_interview_status?: string | null;
  active_interview_at?: string | null;
  active_interview_display_time_vi_vn?: string | null;
  active_interview_badge_label?: string | null;
};

export type CandidateActiveInterviewLike = ActiveInterviewProjection & {
  active_interview?: ActiveInterviewProjection | null;
};

export type CandidateActiveInterviewBadge = {
  label: string;
  time: string;
};

function pickProjection(candidate: CandidateActiveInterviewLike): ActiveInterviewProjection {
  return candidate.active_interview ?? candidate;
}

function normalizeDisplayTime(displayValue: string | null | undefined): string | null {
  if (typeof displayValue !== 'string') return null;
  const normalized = displayValue.trim();
  if (!normalized) return null;
  return VI_DATETIME_PATTERN.test(normalized) ? normalized : null;
}

function formatIsoFallback(isoValue: string | null | undefined): string {
  if (typeof isoValue !== 'string' || !isoValue.trim()) return '—';
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) return '—';
  return format(parsed, 'dd/MM/yyyy HH:mm', { locale: vi });
}

export function getCandidateActiveInterviewBadge(
  candidate: CandidateActiveInterviewLike,
): CandidateActiveInterviewBadge | null {
  const projection = pickProjection(candidate);
  if (!projection.has_active_interview) return null;

  const label = projection.active_interview_badge_label?.trim() || 'Đã có lịch';
  const displayTime = normalizeDisplayTime(projection.active_interview_display_time_vi_vn);
  const time = displayTime ?? formatIsoFallback(projection.active_interview_at);

  return { label, time };
}

/** Resolve ACTIVE interview id from nested projection or flat row fields. */
export function getActiveInterviewId(candidate: CandidateActiveInterviewLike): string | null {
  const nested = candidate.active_interview?.active_interview_id?.trim();
  if (nested) return nested;
  const flat = candidate.active_interview_id?.trim();
  return flat || null;
}

/** Extract active_interview_id from HRM-REC-IV-409-ACTIVE details (AC-REC-IV-06). */
export function pickActiveInterviewIdFrom409Details(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const id = (details as { active_interview_id?: unknown }).active_interview_id;
  if (typeof id !== 'string') return null;
  const trimmed = id.trim();
  return trimmed || null;
}

/** Normalize email for Lane A (spine) ↔ Lane B (pool) merge keys. */
export function normalizeCandidateEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export type SpineCandidateWithActiveInterview = {
  email: string;
  active_interview_id?: string | null;
  active_interview?: ActiveInterviewProjection | null;
};

/**
 * Build email → active_interview map from Lane A listCandidates rollup (BE display-ready).
 * FE must not infer ACTIVE from catalog/local state — only consume BE projection.
 */
export function buildActiveInterviewByEmailMap(
  spineCandidates: SpineCandidateWithActiveInterview[],
): Map<string, ActiveInterviewProjection> {
  const map = new Map<string, ActiveInterviewProjection>();
  for (const row of spineCandidates) {
    const emailKey = normalizeCandidateEmail(row.email);
    if (!emailKey || !row.active_interview) continue;
    const projection: ActiveInterviewProjection = {
      ...row.active_interview,
      active_interview_id:
        row.active_interview.active_interview_id ?? row.active_interview_id ?? null,
    };
    map.set(emailKey, projection);
  }
  return map;
}

/** Merge Lane A active_interview projection onto Lane B pool rows (match by email). */
export function mergeActiveInterviewOntoPoolCandidates<T extends { email: string | null }>(
  poolRows: T[],
  spineCandidates: SpineCandidateWithActiveInterview[],
): Array<T & { active_interview?: ActiveInterviewProjection | null }> {
  const byEmail = buildActiveInterviewByEmailMap(spineCandidates);
  return poolRows.map((row) => {
    const projection = byEmail.get(normalizeCandidateEmail(row.email));
    if (!projection) return row;
    return { ...row, active_interview: projection };
  });
}
