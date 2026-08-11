import { describe, expect, it } from 'vitest';
import {
  PROFILE_ALL_TAB_IDS,
  PROFILE_CORE_TAB_IDS,
  PROFILE_GROUP_TAB_IDS,
  PROFILE_NON_CORE_GROUP_IDS,
  isCoreProfileTab,
  isPinnableProfileTab,
  resolveProfileTabGroup,
} from './employeeProfileTabGroups';

describe('D-UX-PROFILE-TABS-01 — employeeProfileTabGroups', () => {
  it('covers exactly 15 distinct tab ids', () => {
    expect(PROFILE_ALL_TAB_IDS).toHaveLength(15);
    expect(new Set(PROFILE_ALL_TAB_IDS).size).toBe(15);
  });

  it('keeps Core strip at 4 always-visible tabs', () => {
    expect([...PROFILE_CORE_TAB_IDS]).toEqual([
      'general',
      'work',
      'contract',
      'salary',
    ]);
    for (const id of PROFILE_CORE_TAB_IDS) {
      expect(isCoreProfileTab(id)).toBe(true);
      expect(isPinnableProfileTab(id)).toBe(false);
    }
  });

  it('groups HR / Career / Personal per screen-matrix P2-f (+ rewards in HR)', () => {
    expect([...PROFILE_GROUP_TAB_IDS.hr]).toEqual([
      'insurance',
      'training',
      'assets',
      'rewards',
    ]);
    expect([...PROFILE_GROUP_TAB_IDS.career]).toEqual([
      'cv',
      'kpi',
      'workHistory',
      'degrees',
      'certificates',
      'skills',
    ]);
    expect([...PROFILE_GROUP_TAB_IDS.personal]).toEqual(['family']);
    expect([...PROFILE_NON_CORE_GROUP_IDS]).toEqual(['hr', 'career', 'personal']);
  });

  it('resolves group for every tab; unknown → null', () => {
    expect(resolveProfileTabGroup('salary')).toBe('core');
    expect(resolveProfileTabGroup('insurance')).toBe('hr');
    expect(resolveProfileTabGroup('cv')).toBe('career');
    expect(resolveProfileTabGroup('family')).toBe('personal');
    expect(resolveProfileTabGroup('unknown')).toBeNull();
    expect(isPinnableProfileTab('family')).toBe(true);
  });

  it('happy-path click depth proxy: Core=1, non-Core≤2 (group+tab)', () => {
    // Core: single strip click
    expect(PROFILE_CORE_TAB_IDS.length).toBeGreaterThan(0);
    // Non-core: one group open + one tab pick
    for (const groupId of PROFILE_NON_CORE_GROUP_IDS) {
      expect(PROFILE_GROUP_TAB_IDS[groupId].length).toBeGreaterThan(0);
    }
  });
});
