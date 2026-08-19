/** Client pagination for Settings catalog lists (PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01). */

export const SETTINGS_CATALOG_PAGE_SIZE = 10;



const SETTINGS_CATALOG_FOCUS_STORAGE_PREFIX = 'hrm-settings-catalog-focus:v1:';

/** Same-origin localStorage on CC portal document (parent when embedded). */
function settingsCatalogFocusStore(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    if (window.parent !== window) {
      return window.parent.localStorage;
    }
  } catch {
    /* cross-origin parent */
  }
  if (typeof localStorage === 'undefined') return null;
  return localStorage;
}

export function settingsCatalogFocusStorageKey(catalogTabId: string): string {
  return `${SETTINGS_CATALOG_FOCUS_STORAGE_PREFIX}${catalogTabId.trim().toLowerCase()}`;
}



/** Normalize catalog tab id for storage keys (CC embed / QA tab query parity). */

export function normalizeSettingsCatalogTabId(catalogTabId: string): string {

  return catalogTabId.trim().toLowerCase();

}



/** Persist row key so post-F5 mount can jump pagination (U65 — row must be in DOM from GET; localStorage for CC parent reload). */

export function writeSettingsCatalogFocus(catalogTabId: string, rowKey: string): void {
  const store = settingsCatalogFocusStore();
  if (!store) return;
  const key = rowKey.trim().toLowerCase();
  if (!key) return;
  store.setItem(settingsCatalogFocusStorageKey(catalogTabId), key);
}



/** Parent CC URL `?focus=` when HRM runs in portal iframe (same origin). */
export function readPortalParentSearchParam(param: string): string | null {
  if (typeof window === 'undefined' || window.parent === window) return null;
  try {
    const raw = new URLSearchParams(window.parent.location.search).get(param);
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Sync search `q` before first paint on F5 — localStorage (CC origin) + iframe `focus` + parent `focus`.
 * WorkItem: PO-HRM-SETTINGS-W3-F5-LIST-FE-06
 */
export function resolveSettingsCatalogInitialSearchQuery(
  catalogTabId: string,
  iframeFocusParam?: string | null,
): string {
  const tabKey = normalizeSettingsCatalogTabId(catalogTabId);
  const fromStore = readSettingsCatalogFocus(tabKey);
  const iframeSlug = iframeFocusParam?.trim().toLowerCase() || null;
  const parentFocus = readPortalParentSearchParam('focus')?.trim().toLowerCase() || null;
  return fromStore ?? iframeSlug ?? parentFocus ?? '';
}

/** Read persisted focus slug without clearing (safe for React Strict Mode remount). */

export function readSettingsCatalogFocus(catalogTabId: string): string | null {
  const store = settingsCatalogFocusStore();
  if (!store) return null;
  const raw = store.getItem(settingsCatalogFocusStorageKey(catalogTabId));
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return key || null;
}



export function clearSettingsCatalogFocus(catalogTabId: string): void {
  const store = settingsCatalogFocusStore();
  if (!store) return;
  store.removeItem(settingsCatalogFocusStorageKey(catalogTabId));
}



/** Read + clear focus key only when row is in `rows`; returns null when absent or row missing. */

export function consumeSettingsCatalogFocusPage<T>(

  catalogTabId: string,

  rows: T[],

  keyOf: (row: T) => string,

  pageSize: number = SETTINGS_CATALOG_PAGE_SIZE,

): number | null {

  const raw = readSettingsCatalogFocus(catalogTabId);

  if (!raw) return null;

  const needle = raw.trim().toLowerCase();

  const idx = rows.findIndex((row) => keyOf(row).trim().toLowerCase() === needle);

  if (idx < 0) return null;

  clearSettingsCatalogFocus(catalogTabId);

  return catalogPageForKey(rows, raw, keyOf, pageSize);

}



/** Resolve client page for a focus slug against current rows (no storage mutation). */

export function resolveSettingsCatalogFocusPage<T>(

  rows: T[],

  focusSlug: string,

  keyOf: (row: T) => string,

  pageSize: number = SETTINGS_CATALOG_PAGE_SIZE,

): number | null {

  const needle = focusSlug.trim().toLowerCase();

  if (!needle) return null;

  const idx = rows.findIndex((row) => keyOf(row).trim().toLowerCase() === needle);

  if (idx < 0) return null;

  return catalogPageForKey(rows, focusSlug, keyOf, pageSize);

}



/** Stable list order — matches admin sort_order then code (F5 page index parity). */

export function sortSettingsCatalogByOrderThenKey<T>(

  rows: T[],

  sortOrderOf: (row: T) => number | null | undefined,

  keyOf: (row: T) => string,

): T[] {

  return [...rows].sort((a, b) => {

    const sa = sortOrderOf(a) ?? 100;

    const sb = sortOrderOf(b) ?? 100;

    if (sa !== sb) return sa - sb;

    return keyOf(a).localeCompare(keyOf(b), 'vi');

  });

}



export type PaginatedSlice<T> = {

  page: number;

  pageSize: number;

  total: number;

  totalPages: number;

  slice: T[];

};



export function paginateCatalogRows<T>(

  rows: T[],

  page: number,

  pageSize: number = SETTINGS_CATALOG_PAGE_SIZE,

): PaginatedSlice<T> {

  const total = rows.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const safePage = Math.min(Math.max(1, page), totalPages);

  const start = (safePage - 1) * pageSize;

  return {

    page: safePage,

    pageSize,

    total,

    totalPages,

    slice: rows.slice(start, start + pageSize),

  };

}



export function filterCatalogByCodeOrName<T>(

  rows: T[],

  query: string,

  codeOf: (row: T) => string,

  nameOf: (row: T) => string,

): T[] {

  const q = query.trim().toLowerCase();

  if (!q) return rows;

  return rows.filter((row) => {

    const code = codeOf(row).toLowerCase();

    const name = (nameOf(row) ?? '').toLowerCase();

    return code.includes(q) || name.includes(q);

  });

}



/** Jump pagination to the page that contains `savedKey` after mutate (F5/list UX). */

export function catalogPageForKey<T>(

  rows: T[],

  savedKey: string,

  keyOf: (row: T) => string,

  pageSize: number = SETTINGS_CATALOG_PAGE_SIZE,

): number {

  const needle = savedKey.trim().toLowerCase();

  if (!needle) return 1;

  const idx = rows.findIndex((row) => keyOf(row).trim().toLowerCase() === needle);

  if (idx < 0) return 1;

  return Math.floor(idx / pageSize) + 1;

}



/** Playwright / U65 — stable row testid across W3 catalog panels (PO-HRM-SETTINGS-W3-F5-LIST-FE-05). */

export function settingsCatalogRowTestId(rowKey: string): string {

  const slug = rowKey.trim().toLowerCase();

  return slug ? `settings-catalog-row-${slug}` : 'settings-catalog-row';

}



/** Client page when list is narrowed to `focusSlug` (pair with search box prefill on F5). */

export function settingsCatalogFocusPageAfterSearch<T>(

  rows: T[],

  focusSlug: string,

  keyOf: (row: T) => string,

  pageSize: number = SETTINGS_CATALOG_PAGE_SIZE,

): number {

  const needle = focusSlug.trim().toLowerCase();

  if (!needle) return 1;

  const narrowed = rows.filter((row) => {

    const code = keyOf(row).trim().toLowerCase();

    return code.includes(needle);

  });

  if (narrowed.length === 0) return 1;

  return catalogPageForKey(narrowed, focusSlug, keyOf, pageSize);

}


