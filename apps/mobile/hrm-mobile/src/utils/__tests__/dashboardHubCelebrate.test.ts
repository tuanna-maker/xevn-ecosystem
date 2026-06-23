import { describe, expect, it } from 'vitest';
import {
  composeCelebrationsFromEmployees,
  filterApprovedLeaveCoveringToday,
  formatDisplayDateFromMonthDay,
  formatCelebrationCardSubtitle,
  formatWhosOutCardSubtitle,
  formatWhosOutRowSubtitle,
  formatWhosOutSectionTitle,
  limitCelebrationPreview,
  mapWhosOutFromLeaveRows,
  monthDayFromIsoDate,
  parseCelebrationItems,
  parseWhosOutItems,
  resolveBirthdayBannerText,
  sanitizeCelebrationItem,
  shouldShowCelebrationsSection,
  shouldShowWhosOutSection,
  todayIsoInHoChiMinh,
  todayMonthDayInHoChiMinh,
  type ApprovedLeaveWhosOutRow,
  type EmployeeCelebrationSource,
} from '../dashboardHubCelebrate';

describe('dashboardHubCelebrate — MOB-UX-04b (J-MOB-08/09)', () => {
  it('todayMonthDayInHoChiMinh uses Asia/Ho_Chi_Minh (BR-BDAY-04)', () => {
    const fixed = new Date('2026-06-07T02:00:00.000Z');
    expect(todayIsoInHoChiMinh(fixed)).toBe('2026-06-07');
    expect(todayMonthDayInHoChiMinh(fixed)).toBe('06-07');
  });

  it('monthDayFromIsoDate extracts MM-DD without birth year', () => {
    expect(monthDayFromIsoDate('1990-06-07')).toBe('06-07');
    expect(monthDayFromIsoDate('')).toBeNull();
    expect(monthDayFromIsoDate('invalid')).toBeNull();
  });

  it('formatDisplayDateFromMonthDay renders DD/MM', () => {
    expect(formatDisplayDateFromMonthDay('06-07')).toBe('07/06');
  });

  it('sanitizeCelebrationItem rejects birth_year leak (AC-MOB-HUB-08-04)', () => {
    expect(
      sanitizeCelebrationItem({
        employee_id: 'e1',
        display_name: 'An',
        birth_year: 1990,
        month_day: '06-07',
      }),
    ).toBeNull();
    expect(
      sanitizeCelebrationItem({
        employee_id: 'e1',
        display_name: 'An',
        month_day: '1990-06-07',
      }),
    ).toBeNull();
  });

  it('parseCelebrationItems maps API block without birth_year', () => {
    const items = parseCelebrationItems({
      total_count: 2,
      items: [
        {
          employee_id: 'e1',
          display_name: 'Trần B',
          month_day: '06-07',
          display_date: '07/06',
          avatar_url: null,
          avatar_initials: 'TB',
        },
        {
          employee_id: 'e2',
          display_name: 'Leaked',
          birth_year: 1988,
          month_day: '06-07',
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0]?.display_name).toBe('Trần B');
    expect(JSON.stringify(items)).not.toContain('birth_year');
  });

  it('composeCelebrationsFromEmployees filters active + DOB match only (BR-BDAY-03/05)', () => {
    const employees: EmployeeCelebrationSource[] = [
      {
        id: 'e1',
        full_name: 'Nguyễn A',
        status: 'active',
        custom_fields: { date_of_birth: '1985-06-07' },
      },
      {
        id: 'e2',
        full_name: 'Inactive',
        status: 'inactive',
        custom_fields: { date_of_birth: '1990-06-07' },
      },
      {
        id: 'e3',
        full_name: 'Archived',
        status: 'active',
        archived_at: '2026-01-01',
        custom_fields: { date_of_birth: '1992-06-07' },
      },
      {
        id: 'e4',
        full_name: 'Wrong day',
        status: 'active',
        custom_fields: { date_of_birth: '1990-06-08' },
      },
    ];
    const hits = composeCelebrationsFromEmployees(employees, '06-07', 10);
    expect(hits.map((h) => h.employee_id)).toEqual(['e1']);
    expect(hits[0]?.display_date).toBe('07/06');
    expect(JSON.stringify(hits)).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('limitCelebrationPreview caps at 10 with hasMore', () => {
    const items = Array.from({ length: 12 }, (_, i) => ({
      employee_id: `e${i}`,
      display_name: `NV ${i}`,
      month_day: '06-07',
      display_date: '07/06',
      avatar_url: null,
      avatar_initials: 'NV',
    }));
    const { preview, totalCount, hasMore } = limitCelebrationPreview(items, 10);
    expect(preview).toHaveLength(10);
    expect(totalCount).toBe(12);
    expect(hasMore).toBe(true);
  });

  it('filterApprovedLeaveCoveringToday only approved overlap (BR-WHO-01/02)', () => {
    const rows: ApprovedLeaveWhosOutRow[] = [
      {
        id: 'lr1',
        employee_name: 'A',
        leave_type: 'annual',
        start_date: '2026-06-05',
        end_date: '2026-06-10',
        status: 'approved',
      },
      {
        id: 'lr2',
        employee_name: 'B',
        leave_type: 'sick',
        start_date: '2026-06-07',
        end_date: '2026-06-07',
        status: 'pending',
      },
      {
        id: 'lr3',
        employee_name: 'C',
        leave_type: 'annual',
        start_date: '2026-06-08',
        end_date: '2026-06-09',
        status: 'approved',
      },
    ];
    const out = filterApprovedLeaveCoveringToday(rows, '2026-06-07');
    expect(out.map((r) => r.id)).toEqual(['lr1']);
  });

  it('mapWhosOutFromLeaveRows + parseWhosOutItems for home summary shape', () => {
    const mapped = mapWhosOutFromLeaveRows([
      {
        id: 'lr9',
        employee_id: 'emp-9',
        employee_name: 'Phạm D',
        leave_type: 'annual',
        start_date: '2026-06-07',
        end_date: '2026-06-07',
        status: 'approved',
      },
    ]);
    expect(mapped[0]?.leave_request_id).toBe('lr9');
    expect(formatWhosOutRowSubtitle('annual')).toBe('Nghỉ phép năm');

    const parsed = parseWhosOutItems({
      total_count: 1,
      items: [
        {
          employee_id: 'emp-9',
          display_name: 'Phạm D',
          leave_type: 'annual',
          leave_request_id: 'lr9',
        },
      ],
    });
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.display_name).toBe('Phạm D');
  });

  it('sanitizeWhosOutItem accepts leave_id alias', () => {
    const parsed = parseWhosOutItems({
      items: [
        {
          employee_id: 'emp-1',
          employee_name: 'Huỳnh Văn An',
          leave_type: 'annual',
          leave_id: '6c887177-2930-47a2-8d1f-4eba305556f8',
        },
      ],
    });
    expect(parsed[0]?.leave_request_id).toBe('6c887177-2930-47a2-8d1f-4eba305556f8');
  });

  it('parseWhosOutItems accepts employee_name alias and raw array', () => {
    const fromAlias = parseWhosOutItems({
      total_count: 1,
      items: [
        {
          employee_id: 'emp-1',
          employee_name: 'Trần E',
          leave_type: 'annual',
          leave_request_id: 'lr-1',
        },
      ],
    });
    expect(fromAlias).toHaveLength(1);
    expect(fromAlias[0]?.display_name).toBe('Trần E');

    const fromArray = parseWhosOutItems([
      {
        employee_id: 'emp-2',
        display_name: 'Lê F',
        leave_type: 'sick',
        id: 'lr-2',
      },
    ]);
    expect(fromArray).toHaveLength(1);
    expect(fromArray[0]?.leave_request_id).toBe('lr-2');
  });

  it('section visibility helpers hide empty blocks (AC-MOB-HUB-08-03 / 09-04)', () => {
    expect(shouldShowCelebrationsSection([])).toBe(false);
    expect(shouldShowWhosOutSection([])).toBe(false);
    expect(shouldShowCelebrationsSection([{ employee_id: 'e1' } as never])).toBe(true);
    expect(formatWhosOutSectionTitle(3)).toBe('Ai nghỉ hôm nay');
    expect(resolveBirthdayBannerText('An')).toBe('Chúc mừng sinh nhật, An!');
    expect(
      formatWhosOutCardSubtitle({
        employee_id: 'e1',
        display_name: 'A',
        leave_type: 'annual',
        leave_request_id: 'lr1',
        start_date: '2026-06-07',
        end_date: '2026-06-09',
      }),
    ).toContain('Nghỉ phép năm');
    expect(
      formatCelebrationCardSubtitle({
        employee_id: 'e1',
        display_name: 'B',
        month_day: '06-08',
        display_date: '08/06',
        avatar_url: null,
        avatar_initials: 'B',
      }),
    ).toBe('Sinh nhật · 08/06');
  });
});
