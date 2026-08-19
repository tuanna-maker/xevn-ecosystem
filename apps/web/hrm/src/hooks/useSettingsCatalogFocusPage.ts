import { useCallback, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { syncSettingsCatalogFocusToPortalParent } from '@/lib/hrmPortalUrlSync';
import {
  normalizeSettingsCatalogTabId,
  resolveSettingsCatalogFocusPage,
  resolveSettingsCatalogInitialSearchQuery,
  settingsCatalogFocusPageAfterSearch,
  writeSettingsCatalogFocus,
} from '@/lib/settingsCatalogPagination';

/**
 * After mutate, remember row key for F5; on next mount+GET, jump search + page so row is in DOM.
 * WorkItem: PO-HRM-SETTINGS-W3-F5-LIST-FE-06 (sync q before paint + parent ?focus=)
 */
export { resolveSettingsCatalogInitialSearchQuery };

export function useSettingsCatalogFocusPage<T>(
  catalogTabId: string,
  items: T[],
  loading: boolean,
  keyOf: (row: T) => string,
  setPage: (page: number) => void,
  setSearchQuery?: (query: string) => void,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabKey = normalizeSettingsCatalogTabId(catalogTabId);
  const pendingFocusFromStorageRef = useRef(true);
  const appliedFocusRef = useRef(false);

  const focusFromUrl = searchParams.get('focus');

  useLayoutEffect(() => {
    if (loading || items.length === 0) return;
    if (!pendingFocusFromStorageRef.current || appliedFocusRef.current) return;

    const focusSlug =
      resolveSettingsCatalogInitialSearchQuery(tabKey, focusFromUrl) || null;
    if (!focusSlug) {
      pendingFocusFromStorageRef.current = false;
      return;
    }

    const pageOnFullList = resolveSettingsCatalogFocusPage(items, focusSlug, keyOf);
    if (pageOnFullList != null) {
      setSearchQuery?.(focusSlug);
      setPage(settingsCatalogFocusPageAfterSearch(items, focusSlug, keyOf));
      appliedFocusRef.current = true;
      pendingFocusFromStorageRef.current = false;
      return;
    }

    if (focusSlug) {
      setSearchQuery?.(focusSlug);
      setPage(1);
      appliedFocusRef.current = true;
      pendingFocusFromStorageRef.current = false;
    }
  }, [tabKey, items, loading, keyOf, setPage, setSearchQuery, focusFromUrl]);

  const rememberFocusForReload = useCallback(
    (rowKey: string) => {
      const slug = rowKey.trim().toLowerCase();
      if (!slug) return;
      writeSettingsCatalogFocus(tabKey, slug);
      syncSettingsCatalogFocusToPortalParent(tabKey, slug);
      appliedFocusRef.current = false;
      pendingFocusFromStorageRef.current = true;
      const next = new URLSearchParams(searchParams);
      next.set('focus', slug);
      setSearchParams(next, { replace: true });
    },
    [tabKey, searchParams, setSearchParams],
  );

  return { rememberFocusForReload };
}
