import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(resolve(__dirname, './CandidatesTab.tsx'), 'utf8');

describe('CandidatesTab one-active interview wiring', () => {
  it('renders active interview projection badge/time from BE helper', () => {
    expect(src).toContain('getCandidateActiveInterviewBadge(candidate)');
    expect(src).toContain('data-testid="candidate-active-interview-badge"');
    expect(src).toContain('data-testid="candidate-active-interview-time"');
  });

  it('merges Lane A listCandidates active_interview onto pool list', () => {
    expect(src).toContain('listRecruitmentCandidates');
    expect(src).toContain('mergeActiveInterviewOntoPoolCandidates');
    expect(src).toContain('listCandidatesPool');
  });

  it('refreshes candidates after create-interview success for persistence check', () => {
    expect(src).toContain('onSuccess={fetchCandidates}');
  });

  it('opens ManageActiveInterviewDialog for ACTIVE badge (AC-REC-IV-03..06)', () => {
    expect(src).toContain('ManageActiveInterviewDialog');
    expect(src).toContain('handleManageActiveInterview');
    expect(src).toContain('getActiveInterviewId');
    expect(src).toContain('onActiveConflict={handleActiveConflictFromSchedule}');
    expect(src).toContain('candidate-manage-interview-btn');
  });
});

describe('CandidatesTab UV↔YCTD list union (PO-HRM-REC-UV-YCTD-FE-02)', () => {
  it('unions spine-only into list SoT after pool YCTD merge', () => {
    expect(src).toContain('unionSpineOnlyCandidatesIntoList');
    expect(src).toContain('mergeYctdDisplayOntoPoolCandidates');
    expect(src).toContain('HDSD_MUTATE_TEST_IDS.candidateListYctd');
    expect(src).toContain('HDSD_MUTATE_TEST_IDS.candidateListPosition');
    expect(src).toContain('isSpineOnlyListRow');
  });
});
