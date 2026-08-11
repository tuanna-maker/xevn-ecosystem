/**
 * @CODE-MEMORY
 * Screen:     /employees/:id — Hồ sơ nhân viên (IA tab groups)
 * UC:         UX-P0-3 · UX-07 · P2-f screen matrix
 * BR:         click depth ≤2 · pin localStorage must_keep
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md Lane C Profile · docs/qa/evidence/ux-ui-erp-screen-matrix-01.md P2-f
 * Purpose:    Ánh xạ 15 tab Profile → 4 nhóm Core / HR / Career / Personal (không đụng Payroll).
 * WorkItem:   D-UX-PROFILE-TABS-01
 * Coded:      2026-07-28
 * Callers:    pages/EmployeeProfile.tsx
 * must_keep:  id tab ổn định (pin localStorage `employee-pinned-tabs`); Core luôn 1 click
 * LastVerified: docs/qa/evidence/d-ux-profile-tabs-01-20260728.md
 */

export type ProfileTabGroupId = 'core' | 'hr' | 'career' | 'personal';

export type ProfileTabId =
  | 'general'
  | 'work'
  | 'contract'
  | 'salary'
  | 'insurance'
  | 'training'
  | 'assets'
  | 'rewards'
  | 'cv'
  | 'kpi'
  | 'workHistory'
  | 'degrees'
  | 'certificates'
  | 'skills'
  | 'family';

/** Core = always-visible strip (happy path 1 click). */
export const PROFILE_CORE_TAB_IDS: readonly ProfileTabId[] = [
  'general',
  'work',
  'contract',
  'salary',
] as const;

/** Non-core groups — open group then pick tab (≤2 clicks). */
export const PROFILE_GROUP_TAB_IDS: Record<
  Exclude<ProfileTabGroupId, 'core'>,
  readonly ProfileTabId[]
> = {
  hr: ['insurance', 'training', 'assets', 'rewards'],
  career: ['cv', 'kpi', 'workHistory', 'degrees', 'certificates', 'skills'],
  personal: ['family'],
};

export const PROFILE_NON_CORE_GROUP_IDS: readonly Exclude<ProfileTabGroupId, 'core'>[] = [
  'hr',
  'career',
  'personal',
];

export const PROFILE_ALL_TAB_IDS: readonly ProfileTabId[] = [
  ...PROFILE_CORE_TAB_IDS,
  ...PROFILE_GROUP_TAB_IDS.hr,
  ...PROFILE_GROUP_TAB_IDS.career,
  ...PROFILE_GROUP_TAB_IDS.personal,
];

export function isCoreProfileTab(tabId: string): boolean {
  return (PROFILE_CORE_TAB_IDS as readonly string[]).includes(tabId);
}

export function resolveProfileTabGroup(tabId: string): ProfileTabGroupId | null {
  if (isCoreProfileTab(tabId)) return 'core';
  for (const groupId of PROFILE_NON_CORE_GROUP_IDS) {
    if ((PROFILE_GROUP_TAB_IDS[groupId] as readonly string[]).includes(tabId)) {
      return groupId;
    }
  }
  return null;
}

/** Tabs that may be pinned into the primary strip (non-core only). */
export function isPinnableProfileTab(tabId: string): boolean {
  const group = resolveProfileTabGroup(tabId);
  return group !== null && group !== 'core';
}
