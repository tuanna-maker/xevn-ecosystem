import { useEffect, useRef } from 'react';

/**
 * Reset client page when catalog search `q` changes — never on mount.
 * Mount reset races with useSettingsCatalogFocusPage layout jump (F5 0/4).
 * WorkItem: PO-HRM-SETTINGS-W3-F5-LIST-FE-04
 */
export type SettingsCatalogQueryPageSyncOptions = {
  /** F5 focus prefill — do not clobber page jump when q becomes bootstrap slug (FE-06). */
  bootstrapFocusQuery?: string;
};

export function useSettingsCatalogQueryPageSync(
  q: string,
  setPage: (page: number) => void,
  options?: SettingsCatalogQueryPageSyncOptions,
): void {
  const skipMountResetRef = useRef(true);
  const bootstrap = options?.bootstrapFocusQuery?.trim().toLowerCase() ?? '';
  useEffect(() => {
    if (skipMountResetRef.current) {
      skipMountResetRef.current = false;
      return;
    }
    const normalized = q.trim().toLowerCase();
    if (bootstrap && normalized === bootstrap) {
      return;
    }
    setPage(1);
  }, [q, setPage, bootstrap]);
}
