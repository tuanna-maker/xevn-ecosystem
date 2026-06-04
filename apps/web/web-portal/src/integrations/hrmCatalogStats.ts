import { buildApiAuthHeaders } from './authSession';

export type HrmCatalogEffectiveStats = {
  catalogCount: number;
  effectiveItemCount: number;
};

export type HrmSettingsCatalogOverviewRow = {
  catalogKey: string;
  effectiveItems?: Array<{ code: string; status?: string }>;
};

/** Pure sum for tests and panel display. */
export function sumEffectiveCatalogItems(catalogs: HrmSettingsCatalogOverviewRow[]): HrmCatalogEffectiveStats {
  let effectiveItemCount = 0;
  for (const cat of catalogs) {
    effectiveItemCount += (cat.effectiveItems ?? []).filter((i) => i.status !== 'draft').length;
  }
  return { catalogCount: catalogs.length, effectiveItemCount };
}

export async function fetchHrmEffectiveCatalogStats(): Promise<HrmCatalogEffectiveStats | null> {
  try {
    const res = await fetch('/api/hrm/settings-catalogs', {
      headers: { Accept: 'application/json', ...(await buildApiAuthHeaders()) },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { catalogs?: HrmSettingsCatalogOverviewRow[] } };
    const catalogs = json?.data?.catalogs ?? [];
    return sumEffectiveCatalogItems(catalogs);
  } catch {
    return null;
  }
}
