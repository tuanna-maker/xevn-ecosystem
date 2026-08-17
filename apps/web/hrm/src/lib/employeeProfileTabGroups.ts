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
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01 · D-HRM-EMP-PROFILE-PERM-FALLBACK-01
 * change_mode: ADD (restore)
 * What: Khôi phục employeeProfileTabGroups từ stash 43c479a — import của EmployeeProfile
 * Why: QA RET3 Vite 500 thiếu module → #root trống trên detail
 * SRS/BR: UX-UI-ERP-ANALYSIS Lane C · J-HRM-02
 * must_keep: PROFILE_CORE_TAB_IDS · pin ids · Employees list · FE-LIBS-01 · Fleet · U65
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-03
 * change_mode: ADD
 * What: parseProfileTabParam — deep-link ?tab=insurance (SI timeline under HR group)
 * Why: R-EMP-SI-FE-ACTION-UI — nested popover tab not opened by text click → timelineRoot=false
 * must_keep: PROFILE_CORE_TAB_IDS · pin ids · U65 · D2/D6 untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * change_mode: ADD
 * What: ProfileTabId `documents` under career — checklist giấy tờ (UC-BP-CORE-03)
 * Why: F-CORE-CHK-01 bind · deep-link ?tab=documents · J-HRM-CORE-03-04
 * must_keep: PROFILE_CORE_TAB_IDS · pin ids · Nest /core DENY · U65 · sealed CORE peers
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
  | 'documents'
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
  career: ['cv', 'kpi', 'workHistory', 'degrees', 'certificates', 'documents', 'skills'],
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

/**
 * Parse `?tab=` deep-link for EmployeeProfile (U65 / J-HRM / SI timeline).
 * Accepts exact ProfileTabId only — never invents tabs.
 */
export function parseProfileTabParam(
  raw: string | null | undefined,
): ProfileTabId | null {
  const id = (raw ?? '').trim();
  if (!id) return null;
  return (PROFILE_ALL_TAB_IDS as readonly string[]).includes(id)
    ? (id as ProfileTabId)
    : null;
}
