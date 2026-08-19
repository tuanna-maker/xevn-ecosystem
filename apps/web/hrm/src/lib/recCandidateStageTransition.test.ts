import { describe, expect, it } from 'vitest';
import {
  formatStageHistoryChangedAt,
  isRecStageRejectOutcome,
  isRecStageReverseTransition,
  isYctdBoundStageHome,
  resolveLaneACandidateIdForTransition,
  shouldUseLaneAStageTransition,
} from '@/lib/recCandidateStageTransition';

describe('recCandidateStageTransition helpers (UC-BP-REC-05)', () => {
  const catalog = [
    { stageKey: 'screening', nameVi: 'Sàng lọc', sortOrder: 10, isRejectOutcome: false },
    { stageKey: 'interview', nameVi: 'Phỏng vấn', sortOrder: 20, isRejectOutcome: false },
    { stageKey: 'rejected', nameVi: 'Từ chối', sortOrder: 90, isRejectOutcome: true },
  ];

  it('detects YCTD-bound stage home and Lane A id from spine merge', () => {
    expect(isYctdBoundStageHome({ requisition_id: 'req-1' })).toBe(true);
    expect(isYctdBoundStageHome({})).toBe(false);

    const poolEnriched = {
      id: 'pool-1',
      list_lane: 'pool' as const,
      requisition_id: 'req-1',
      recruitment_candidate_id: 'spine-9',
    };
    expect(resolveLaneACandidateIdForTransition(poolEnriched)).toBe('spine-9');
    expect(shouldUseLaneAStageTransition(poolEnriched)).toBe(true);

    const spine = {
      id: 'spine-2',
      list_lane: 'spine' as const,
      requisition_id: 'req-2',
    };
    expect(resolveLaneACandidateIdForTransition(spine)).toBe('spine-2');
  });

  it('flags reject outcome from catalog or fallback keys', () => {
    expect(isRecStageRejectOutcome(catalog, 'rejected', 3)).toBe(true);
    expect(isRecStageRejectOutcome(catalog, 'interview', 3)).toBe(false);
    expect(isRecStageRejectOutcome([], 'withdrawn', 0)).toBe(true);
  });

  it('detects reverse by lower sort_order', () => {
    expect(isRecStageReverseTransition(catalog, 'interview', 'screening')).toBe(true);
    expect(isRecStageReverseTransition(catalog, 'screening', 'interview')).toBe(false);
  });

  it('formats changed_at as dd/MM/yyyy HH:mm or em-dash', () => {
    expect(formatStageHistoryChangedAt(null)).toBe('—');
    expect(formatStageHistoryChangedAt('not-a-date')).toBe('—');
    const formatted = formatStageHistoryChangedAt('2026-08-09T07:30:00+07:00');
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });
});
