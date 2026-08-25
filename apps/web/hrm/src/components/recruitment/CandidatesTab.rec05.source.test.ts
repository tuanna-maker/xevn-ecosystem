import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(resolve(__dirname, './CandidatesTab.tsx'), 'utf8');
const dialogSrc = readFileSync(resolve(__dirname, './CandidateStageTransitionDialog.tsx'), 'utf8');
const historySrc = readFileSync(resolve(__dirname, './CandidateStageHistoryPanel.tsx'), 'utf8');
const detailSrc = readFileSync(resolve(__dirname, './CandidateDetailView.tsx'), 'utf8');
const apiSrc = readFileSync(resolve(__dirname, '../../integrations/hrmApi.ts'), 'utf8');

describe('CandidatesTab REC-05 stage transition wiring', () => {
  it('opens Lane A transition dialog for YCTD-bound UV (not pool stage SoT)', () => {
    expect(tabSrc).toContain('CandidateStageTransitionDialog');
    expect(tabSrc).toContain('shouldUseLaneAStageTransition');
    expect(tabSrc).toContain('openLaneAStageTransition');
    expect(tabSrc).toContain('data-lane="yctd-transitions"');
  });

  it('RETAIN pool updateCandidatePoolStage only on non-YCTD path', () => {
    expect(tabSrc).toContain('updateCandidatePoolStage');
    expect(tabSrc).toContain('RETAIN pool path');
  });

  it('passes stageHistoryRefreshToken + onOpenStageTransition into detail', () => {
    expect(tabSrc).toContain('stageHistoryRefreshToken');
    expect(tabSrc).toContain('onOpenStageTransition');
  });
});

describe('CandidateStageTransitionDialog physical path lock', () => {
  it('POSTs /recruitment/candidates transitions via hrmApi helper', () => {
    expect(dialogSrc).toContain('postRecruitmentCandidateTransition');
    expect(dialogSrc).toContain('rec-stage-reject-note');
    expect(dialogSrc).toContain('catalogCount <= 0');
    expect(dialogSrc).not.toMatch(/\/api\/hrm\/rec\//);
  });
});

describe('CandidateStageHistoryPanel + detail timeline', () => {
  it('GETs stage-history and renders panel on detail tab', () => {
    expect(historySrc).toContain('listRecruitmentCandidateStageHistory');
    expect(historySrc).toContain('rec-stage-history-panel');
    expect(detailSrc).toContain('CandidateStageHistoryPanel');
    expect(detailSrc).toContain('rec-stage-history-tab');
  });
});

describe('hrmApi REC-05 clients — physical /recruitment/ only', () => {
  it('defines POST transitions + GET stage-history under /recruitment/candidates', () => {
    expect(apiSrc).toContain('/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/transitions');
    expect(apiSrc).toContain('/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/stage-history');
    expect(apiSrc).not.toMatch(/\/api\/hrm\/rec\/applications/);
  });
});
