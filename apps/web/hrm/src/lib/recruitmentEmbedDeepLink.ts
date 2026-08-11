/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — CC embed deep-link (?tab= · ?candidateId=)
 * UC:         FR-UC-BP-REC-07 · J-HRM-CTR-HIRE-01
 * WorkItem:   PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02
 * Purpose:    Merge parent portal query into iframe search — locked iframe src omits tab/candidateId.
 * must_keep:  portal/tenant/company on iframe; U65; G4 URL seal
 */

export const RECRUITMENT_DEEP_LINK_PARAM_KEYS = ['tab', 'candidateId'] as const;

const RECRUITMENT_ALLOWED_TABS = new Set([
  'dashboard',
  'requisitions',
  'jd-library',
  'jobs',
  'candidates',
  'proposals',
  'campaigns',
  'interviews',
  'evaluations',
  'plans',
  'reports',
]);

function normalizeSearchString(search: string): string {
  const raw = search.trim();
  if (!raw) return '';
  return raw.startsWith('?') ? raw : `?${raw}`;
}

/**
 * CC embed: portal pathname query may include `tab` + `candidateId` while locked iframe src
 * only carries portal/tenant/company — merge parent params when iframe search lacks them.
 */
export function mergePortalParentRecruitmentSearch(search: string): string {
  const iframeQs = normalizeSearchString(search);
  const iframeParams = new URLSearchParams(iframeQs.startsWith('?') ? iframeQs.slice(1) : iframeQs);
  const iframeTab = (iframeParams.get('tab') ?? '').trim();
  const iframeCandidateId = (iframeParams.get('candidateId') ?? '').trim();
  if (iframeTab && iframeCandidateId) return iframeQs;

  if (typeof window === 'undefined' || window.parent === window) {
    return iframeQs;
  }

  try {
    const parentParams = new URLSearchParams(window.parent.location.search);
    const merged = new URLSearchParams(iframeParams);
    for (const key of RECRUITMENT_DEEP_LINK_PARAM_KEYS) {
      if ((merged.get(key) ?? '').trim()) continue;
      const value = parentParams.get(key);
      if (value?.trim()) merged.set(key, value.trim());
    }
    const qs = merged.toString();
    return qs ? `?${qs}` : iframeQs;
  } catch {
    return iframeQs;
  }
}

export function resolveRecruitmentEmbedSearchParams(search: string): URLSearchParams {
  const merged = mergePortalParentRecruitmentSearch(search);
  const raw = merged.startsWith('?') ? merged.slice(1) : merged;
  return new URLSearchParams(raw);
}

/** Resolve `?tab=` from iframe or parent portal search (CC embed deep-link). */
export function resolveRecruitmentTabFromSearch(search: string): string | null {
  const tab = resolveRecruitmentEmbedSearchParams(search).get('tab')?.trim();
  if (!tab || !RECRUITMENT_ALLOWED_TABS.has(tab)) return null;
  return tab;
}
