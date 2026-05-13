/**
 * Normalizes `data` from HRM API success envelopes: some endpoints return `{ total, data }`,
 * others return `{ total, page, page_size, data }`, and a few return a bare array (e.g. service-requests list).
 */
export function readListRows<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

export function readListTotal(data: unknown): number {
  if (data && typeof data === 'object' && 'total' in data) {
    const t = (data as { total: unknown }).total;
    if (typeof t === 'number' && Number.isFinite(t)) return t;
  }
  return readListRows(data).length;
}
