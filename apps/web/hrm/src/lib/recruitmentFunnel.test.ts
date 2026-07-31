import { describe, expect, it } from 'vitest';
import {
  buildRecruitmentFunnelCounts,
  mapRecruitmentFunnelStage,
  RECRUITMENT_FUNNEL_STAGES,
} from './recruitmentFunnel';

describe('recruitmentFunnel (AC-CD-F6-03)', () => {
  it('exposes exactly 6 normative stages', () => {
    expect(RECRUITMENT_FUNNEL_STAGES).toEqual([
      'new',
      'screening',
      'interview',
      'offer',
      'hired',
      'rejected',
    ]);
  });

  it('maps applied → new (waiting CV)', () => {
    expect(mapRecruitmentFunnelStage('applied')).toBe('new');
    expect(mapRecruitmentFunnelStage('new')).toBe('new');
    expect(mapRecruitmentFunnelStage('')).toBe('new');
  });

  it('aggregates funnel counts from live stages (no hardcoded mock)', () => {
    const counts = buildRecruitmentFunnelCounts([
      { stage: 'applied' },
      { stage: 'new' },
      { stage: 'screening' },
      { stage: 'interview' },
      { stage: 'offer' },
      { stage: 'hired' },
      { stage: 'rejected' },
      { stage: 'interview' },
    ]);
    expect(counts.new).toBe(2);
    expect(counts.screening).toBe(1);
    expect(counts.interview).toBe(2);
    expect(counts.offer).toBe(1);
    expect(counts.hired).toBe(1);
    expect(counts.rejected).toBe(1);
    expect(counts.total).toBe(8);
  });
});
