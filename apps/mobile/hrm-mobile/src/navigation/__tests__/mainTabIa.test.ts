import { describe, expect, it } from 'vitest';

import {
  EXPECTED_MAIN_TAB_LABELS,
  MAIN_TAB_COUNT,
  MAIN_TAB_IA,
  MAIN_TAB_LABELS_JOINED,
} from '../mainTabIa';

describe('mainTabIa — D-MOB-UX09-IA-01 ZenHR 4-tab', () => {
  it('locks 4 tabs with benchmark labels Trang chủ|Đội nhóm|Phiếu lương|Hồ sơ', () => {
    expect(MAIN_TAB_IA).toHaveLength(4);
    expect(MAIN_TAB_LABELS_JOINED).toBe(EXPECTED_MAIN_TAB_LABELS);
    expect(MAIN_TAB_COUNT).toBe(4);
  });

  it('uses payslip wallet + profile person icons (not menu/document)', () => {
    const payslip = MAIN_TAB_IA.find((t) => t.key === 'TabPayslip');
    const profile = MAIN_TAB_IA.find((t) => t.key === 'TabProfile');
    expect(payslip?.iconOutline).toBe('wallet-outline');
    expect(profile?.iconOutline).toBe('person-outline');
  });

  it('preserves team directory tab key for FAB CheckIn path', () => {
    expect(MAIN_TAB_IA[1]).toMatchObject({ key: 'TabAttendance', label: 'Đội nhóm' });
  });
});
