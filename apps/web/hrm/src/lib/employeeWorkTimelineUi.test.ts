import { describe, expect, it } from 'vitest';
import {
  isDecisionSourcedWorkTimeline,
  mapWorkTimelineList,
  workTimelineDecisionLabel,
} from './employeeWorkTimelineUi';

describe('employeeWorkTimelineUi — PO-HRM-E2E-LINK-EMP-FE-01', () => {
  it('maps decision neo fields for F5 surface', () => {
    const items = mapWorkTimelineList({
      data: [
        {
          id: 'wh1',
          event_date: '2026-08-01',
          title: 'Bổ nhiệm TP KD',
          event_type: 'promotion',
          status: 'current',
          position_key: 'TP_KD',
          decision_id: 'dec-uuid-1',
          decision_code: 'QD-2026-001',
          source_module: 'decision',
        },
      ],
    });
    expect(items).toHaveLength(1);
    expect(isDecisionSourcedWorkTimeline(items[0])).toBe(true);
    expect(workTimelineDecisionLabel(items[0])).toBe('QSĐ QD-2026-001');
  });

  it('manual rows without decision stay unlabeled', () => {
    const items = mapWorkTimelineList([
      {
        id: 'wh2',
        event_date: '2026-01-01',
        title: 'Nhập tay',
        event_type: 'position',
        status: 'completed',
        position_key: 'NV',
        source_module: 'manual',
      },
    ]);
    expect(isDecisionSourcedWorkTimeline(items[0])).toBe(false);
    expect(workTimelineDecisionLabel(items[0])).toBeNull();
  });
});
