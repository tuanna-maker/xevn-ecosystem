/**
 * Shared HRM list load-failure helpers.
 * Defects: D-HRM-INS-EMPTY-MASK-01 · D-P1-HRM-INTSVC-429-SILENT-EMPTY-01
 *
 * Rule: non-2xx (incl. RATE-429) must never coerce to happy-path empty
 * («Không có dữ liệu» / 0 / `-`).
 */
import { ApiClientError } from '@/lib/apiError';

/** True when a list fetch failed and there are no rows to show. */
export function isListFetchFailureEmpty(
  fetchError: string | null | undefined,
  itemCount: number,
): boolean {
  return Boolean(fetchError?.trim()) && itemCount === 0;
}

/** Classify HTTP 429 / RATE-429 as load failure (not empty dataset). */
export function isRateLimitApiError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.status === 429 || error.code === 'RATE-429';
  }
  if (typeof error === 'object' && error !== null) {
    const candidate = error as { status?: number; code?: string };
    return candidate.status === 429 || candidate.code === 'RATE-429';
  }
  return false;
}

/** Short label for summary/stat cards when load failed (never `0` or `-`). */
export const HRM_LIST_LOAD_FAILED_SHORT = 'Không tải được';
