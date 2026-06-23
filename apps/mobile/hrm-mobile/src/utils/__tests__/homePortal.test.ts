import { describe, expect, it } from 'vitest';

import {
  QUICK_ACCESS_TILES,
  buildHeroCarouselItems,
  getQuickAccessTiles,
  getQuickAccessTilesForPersona,
  pickLatestPayslipTeaser,
  resolveQuickAccessTile,
} from '../homePortal';

describe('homePortal — MOB-UX-13c home action grid', () => {
  it('getQuickAccessTiles employee has 9 Vietnamese tiles', () => {
    const tiles = getQuickAccessTiles(false);
    expect(tiles).toHaveLength(9);
    expect(tiles.map((t) => t.label)).toEqual([
      'Chấm công',
      'Nghỉ phép',
      'Phiếu lương',
      'Việc',
      'Đội nhóm',
      'Hợp đồng',
      'Vận hành',
      'Thông báo',
      'Hành trình',
    ]);
  });

  it('marks Báo cáo as Phase 1 stub; Hành trình navigates (MOB-UX-13g)', () => {
    expect(resolveQuickAccessTile('journey')?.stub).toBeUndefined();
    expect(resolveQuickAccessTile('reports', 'manager')?.stub).toBe(true);
    expect(resolveQuickAccessTile('payroll')?.stub).toBeUndefined();
  });

  it('buildHeroCarouselItems maps self birthday + colleague celebrations', () => {
    const items = buildHeroCarouselItems({
      viewerName: 'Nguyễn A',
      isBirthdayToday: true,
      birthdayBanner: 'Chúc mừng sinh nhật, Nguyễn A!',
      celebrations: [
        {
          employee_id: 'e-2',
          display_name: 'Trần B',
          month_day: '06-08',
          display_date: '08/06',
          avatar_url: null,
          avatar_initials: 'TB',
        },
      ],
    });

    expect(items).toHaveLength(2);
    expect(items[0].kind).toBe('birthday_self');
    expect(items[0].title).toContain('Chúc mừng sinh nhật');
    expect(items[1].kind).toBe('birthday_colleague');
    expect(items[1].title).toContain('Trần B');
    expect(items[1].subtitle).toContain('08/06');
  });

  it('buildHeroCarouselItems returns empty when no events (MOB-UX-16a — TopBar owns greeting)', () => {
    const items = buildHeroCarouselItems({
      viewerName: 'Lê C',
      isBirthdayToday: false,
      birthdayBanner: '',
      celebrations: [],
    });

    expect(items).toHaveLength(0);
  });

  it('pickLatestPayslipTeaser returns first row as teaser', () => {
    const teaser = pickLatestPayslipTeaser([
      {
        id: 'ps-1',
        period_label: 'Tháng 5/2026',
        net_amount: 15_000_000,
        currency: 'VND',
        status: 'paid',
      },
      {
        id: 'ps-0',
        period_label: 'Tháng 4/2026',
        net_amount: 14_000_000,
        currency: 'VND',
        status: 'paid',
      },
    ]);

    expect(teaser).toEqual({
      id: 'ps-1',
      periodLabel: 'Tháng 5/2026',
      netAmount: 15_000_000,
      currency: 'VND',
      status: 'paid',
    });
  });

  it('pickLatestPayslipTeaser returns null for empty list', () => {
    expect(pickLatestPayslipTeaser([])).toBeNull();
  });

  it('manager-only Báo cáo tile hidden for employee', () => {
    expect(getQuickAccessTiles(false).some((t) => t.id === 'reports')).toBe(false);
    expect(getQuickAccessTiles(true).some((t) => t.id === 'reports')).toBe(true);
  });

  it('QUICK_ACCESS_TILES legacy export has 8 entries', () => {
    expect(QUICK_ACCESS_TILES).toHaveLength(8);
  });

  it('MOB-UX-13e/14 — manager Duyệt label; grid keeps Chấm công (FAB hides for LDR)', () => {
    const mgr = getQuickAccessTilesForPersona('manager');
    expect(mgr.find((t) => t.id === 'approve')?.label).toBe('Duyệt');
    expect(mgr.some((t) => t.id === 'checkin')).toBe(true);

    const ldr = getQuickAccessTilesForPersona('leader');
    expect(ldr.find((t) => t.id === 'approve')?.label).toBe('Duyệt');
    expect(ldr.some((t) => t.id === 'checkin')).toBe(true);
    expect(ldr.some((t) => t.id === 'reports')).toBe(true);
    expect(ldr).toHaveLength(10);
  });
});
