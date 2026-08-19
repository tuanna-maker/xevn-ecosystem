import { describe, expect, it } from 'vitest';

import vi from '@/i18n/locales/vi.json';
import { ATTENDANCE_RULES_TAB_IDS } from './Attendance';

describe('attendance rules subtabs labels (PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01)', () => {
  it('has one distinct Vietnamese label per rules tab id', () => {
    const rulesTabs = vi.attendance.rulesTabs as Record<string, string>;
    const labels = ATTENDANCE_RULES_TAB_IDS.map((id) => rulesTabs[id]);
    expect(labels.every(Boolean)).toBe(true);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('only device tab uses exact label «Máy chấm công»', () => {
    const rulesTabs = vi.attendance.rulesTabs as Record<string, string>;
    const deviceMatches = ATTENDANCE_RULES_TAB_IDS.filter((id) => rulesTabs[id] === 'Máy chấm công');
    expect(deviceMatches).toEqual(['device']);
  });
});
