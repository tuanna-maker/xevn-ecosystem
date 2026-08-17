import { describe, expect, it } from 'vitest';
import {
  buildRecruitmentCostSummary,
  formatRecruitmentCostVnd,
  sumActiveJobPostingHeadcount,
} from './recruitmentDashboardAggregator';

/**
 * Aggregator domain SoT DISABLED (UC-BP-REC-08) —
 * Nest GET /recruitment/dashboard* owns KH/%/funnel/ETA.
 */
describe('recruitmentDashboardAggregator (disabled SoT)', () => {
  it('never invents VND cost (O10)', () => {
    expect(buildRecruitmentCostSummary()).toEqual({
      avgCostPerCandidate: null,
      costTopCV: null,
      cost24h: null,
      hasData: false,
    });
    expect(formatRecruitmentCostVnd(null)).toBeNull();
  });

  it('DENY job_postings headcount as KH SoT (returns 0 stub)', () => {
    expect(sumActiveJobPostingHeadcount()).toBe(0);
  });
});
