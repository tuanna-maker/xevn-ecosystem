import { describe, expect, it } from 'vitest';

import type { HomeCelebrationItem } from '../dashboardHubCelebrate';
import {
  buildJourneyEventsFromFeed,
  buildSelfTenureMilestones,
  composeTenureFromEmployees,
  formatTenureYearsVi,
  groupJourneyEventsByYear,
  isHireAnniversaryToday,
  limitJourneyPreview,
  mergeCelebrationChips,
  resolveTenureYears,
  shouldShowCultureStrip,
  shouldShowJourneySection,
} from '../journeyTimeline';

describe('journeyTimeline — MOB-UX-13g', () => {
  it('resolveTenureYears floors completed years', () => {
    expect(resolveTenureYears('2024-06-09', new Date(2026, 5, 9))).toBe(2);
    expect(resolveTenureYears('2024-06-10', new Date(2026, 5, 9))).toBe(1);
  });

  it('isHireAnniversaryToday matches month-day only', () => {
    expect(isHireAnniversaryToday('2020-06-09', '06-09')).toBe(true);
    expect(isHireAnniversaryToday('2020-06-10', '06-09')).toBe(false);
  });

  it('composeTenureFromEmployees returns colleagues with anniversary today', () => {
    const rows = composeTenureFromEmployees(
      [
        {
          id: 'e1',
          full_name: 'Nguyễn A',
          status: 'active',
          hired_at: '2021-06-09',
        },
        {
          id: 'e2',
          full_name: 'Trần B',
          status: 'active',
          hired_at: '2020-06-10',
        },
      ],
      '06-09',
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].display_name).toBe('Nguyễn A');
    expect(rows[0].years).toBeGreaterThanOrEqual(1);
  });

  it('formatTenureYearsVi is Vietnamese only', () => {
    expect(formatTenureYearsVi(3)).toBe('3 năm');
    expect(formatTenureYearsVi(0)).toBe('Gia nhập');
  });

  it('mergeCelebrationChips combines birthday + tenure labels', () => {
    const birthdays: HomeCelebrationItem[] = [
      {
        employee_id: 'b1',
        display_name: 'A',
        month_day: '06-09',
        display_date: '09/06',
        avatar_url: null,
        avatar_initials: 'A',
      },
    ];
    const chips = mergeCelebrationChips(birthdays, [
      {
        employee_id: 't1',
        display_name: 'B',
        years: 5,
        display_date: '09/06',
        avatar_url: null,
        avatar_initials: 'B',
      },
    ]);
    expect(chips).toHaveLength(2);
    expect(chips[0].chipLabel).toBe('Sinh nhật');
    expect(chips[1].chipLabel).toBe('5 năm');
  });

  it('buildSelfTenureMilestones includes join + completed milestones', () => {
    const events = buildSelfTenureMilestones('2020-01-15', 'Nguyễn A');
    expect(events[0].title).toBe('Gia nhập công ty');
    expect(events.some((e) => e.title === '1 năm gắn bó')).toBe(true);
  });

  it('buildJourneyEventsFromFeed composes attendance + payslip + inbox', () => {
    const events = buildJourneyEventsFromFeed({
      displayName: 'Nguyễn A',
      hiredAt: '2020-06-09',
      checkInSummary: 'Chấm lúc 08:05',
      checkInStatus: 'present',
      checkInDateIso: '2026-06-09',
      payslipTeaser: {
        id: 'ps-1',
        periodLabel: 'Tháng 5/2026',
        netAmount: 10_000_000,
        currency: 'VND',
        status: 'paid',
      },
      inboxRows: [
        {
          id: 'in-1',
          event_type: 'payslip.published',
          payload: {},
          read_at: null,
          created_at: '2026-06-08T10:00:00Z',
        },
      ],
      celebrations: [],
      tenureToday: [],
    });
    expect(events.some((e) => e.kind === 'attendance')).toBe(true);
    expect(events.some((e) => e.kind === 'payslip')).toBe(true);
    expect(events.some((e) => e.kind === 'tenure_join')).toBe(true);
  });

  it('groupJourneyEventsByYear sorts descending', () => {
    const grouped = groupJourneyEventsByYear([
      {
        id: 'a',
        kind: 'workflow',
        title: 'A',
        subtitle: 's',
        dateIso: '2024-03-01',
        year: 2024,
        sortKey: '2024-03-01',
      },
      {
        id: 'b',
        kind: 'workflow',
        title: 'B',
        subtitle: 's',
        dateIso: '2026-01-01',
        year: 2026,
        sortKey: '2026-01-01',
      },
    ]);
    expect(grouped[0].year).toBe(2026);
    expect(grouped[1].year).toBe(2024);
  });

  it('limitJourneyPreview caps home card rows', () => {
    const preview = limitJourneyPreview(
      [
        {
          id: '1',
          kind: 'workflow',
          title: '1',
          subtitle: 's',
          dateIso: '2026-01-01',
          year: 2026,
          sortKey: '2026-01-01',
        },
        {
          id: '2',
          kind: 'workflow',
          title: '2',
          subtitle: 's',
          dateIso: '2026-01-02',
          year: 2026,
          sortKey: '2026-01-02',
        },
        {
          id: '3',
          kind: 'workflow',
          title: '3',
          subtitle: 's',
          dateIso: '2026-01-03',
          year: 2026,
          sortKey: '2026-01-03',
        },
        {
          id: '4',
          kind: 'workflow',
          title: '4',
          subtitle: 's',
          dateIso: '2026-01-04',
          year: 2026,
          sortKey: '2026-01-04',
        },
      ],
      3,
    );
    expect(preview).toHaveLength(3);
  });

  it('shouldShowCultureStrip and shouldShowJourneySection hide when empty', () => {
    expect(shouldShowCultureStrip([])).toBe(false);
    expect(shouldShowJourneySection([])).toBe(false);
    expect(
      shouldShowJourneySection([
        {
          id: 'x',
          kind: 'tenure_join',
          title: 'Gia nhập',
          subtitle: 's',
          dateIso: '2020-01-01',
          year: 2020,
          sortKey: '2020-01-01',
        },
      ]),
    ).toBe(true);
  });
});
