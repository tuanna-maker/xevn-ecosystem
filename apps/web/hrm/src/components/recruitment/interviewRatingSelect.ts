/**
 * @CODE-MEMORY 2026-08-06 PO-HRM-REC-INTERVIEW-SELECT-FE-01
 * Screen: HRM Recruitment → Phỏng vấn (InterviewsTab) — Update rating Select
 * UC / BR: C-CONSOLE-CRASH only · BA HOLD one-active interview
 * Purpose: Radix Select cấm SelectItem value=""; sentinel `__none__` ↔ API rating null
 * WorkItem: PO-HRM-REC-INTERVIEW-SELECT-FE-01
 * Coded: 2026-08-06
 * Callers: InterviewsTab → rating FormField / onSubmitUpdate
 * Callees: updateInterviewCatalog.rating (number | null)
 * must_keep: createInterviewCatalog contract · không đổi BR one-active
 * SOLID: tách map sentinel khỏi UI tab
 * LastVerified: docs/qa/evidence/po-hrm-rec-interview-select-fe-01.md
 */

/** Radix Select forbids SelectItem value=""; sentinel maps to API rating null. */
export const INTERVIEW_RATING_NONE_SENTINEL = '__none__';

export function ratingFormValue(rating: number | null | undefined): string {
  return rating != null && rating > 0 ? String(rating) : INTERVIEW_RATING_NONE_SENTINEL;
}

export function ratingApiValue(formRating: string | undefined): number | null {
  if (!formRating || formRating === INTERVIEW_RATING_NONE_SENTINEL) return null;
  const parsed = parseInt(formRating, 10);
  return Number.isFinite(parsed) ? parsed : null;
}
