import { describe, expect, it } from 'vitest';
import {
  getLinkedDataEmptyCopy,
  isLinkedDataGap,
  PORTAL_HRM_CATALOG_SYNC_PATH,
} from './hrmLinkedDataEmpty';

describe('isLinkedDataGap', () => {
  it('returns false when not in API mode', () => {
    expect(isLinkedDataGap(0, 100, false)).toBe(false);
  });

  it('returns false when list has rows', () => {
    expect(isLinkedDataGap(3, 100, true)).toBe(false);
  });

  it('returns true when list empty and workforce > 0 in API mode', () => {
    expect(isLinkedDataGap(0, 42, true)).toBe(true);
  });

  it('returns false when workforce unknown or zero', () => {
    expect(isLinkedDataGap(0, null, true)).toBe(false);
    expect(isLinkedDataGap(0, 0, true)).toBe(false);
  });
});

describe('getLinkedDataEmptyCopy', () => {
  it('returns menu-specific copy for P-CC menus', () => {
    const ins = getLinkedDataEmptyCopy('insurance');
    expect(ins.title).toMatch(/BHXH/i);
    const rec = getLinkedDataEmptyCopy('recruitment');
    expect(rec.body).toMatch(/requisition/i);
    const con = getLinkedDataEmptyCopy('contracts');
    expect(con.body).toMatch(/hợp đồng/i);
  });
});

describe('PORTAL_HRM_CATALOG_SYNC_PATH', () => {
  it('points to catalog governance settings', () => {
    expect(PORTAL_HRM_CATALOG_SYNC_PATH).toContain('hrm_catalog_governance');
  });
});
