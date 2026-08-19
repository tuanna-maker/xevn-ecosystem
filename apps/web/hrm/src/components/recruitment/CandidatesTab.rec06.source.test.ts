import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(resolve(__dirname, './CandidatesTab.tsx'), 'utf8');
const mailSrc = readFileSync(resolve(__dirname, './CandidateMailDialog.tsx'), 'utf8');
const evalSrc = readFileSync(resolve(__dirname, './CandidateEvaluationDialog.tsx'), 'utf8');
const detailSrc = readFileSync(resolve(__dirname, './CandidateDetailView.tsx'), 'utf8');
const apiSrc = readFileSync(resolve(__dirname, '../../integrations/hrmApi.ts'), 'utf8');

describe('CandidatesTab REC-06 mail + eval wiring', () => {
  it('opens CandidateMailDialog for YCTD-bound UV', () => {
    expect(tabSrc).toContain('CandidateMailDialog');
    expect(tabSrc).toContain('onOpenMail');
    expect(tabSrc).toContain('setIsMailDialogOpen');
  });

  it('passes neo fields + onSuggestStageTransition into evaluation dialog', () => {
    expect(tabSrc).toContain('recruitment_candidate_id: evaluatingCandidate.recruitment_candidate_id');
    expect(tabSrc).toContain('onSuggestStageTransition');
    expect(tabSrc).toContain('openLaneAStageTransition(evaluatingCandidate)');
  });
});

describe('CandidateMailDialog physical path lock', () => {
  it('POST/GET mail via hrmApi under /recruitment/candidates', () => {
    expect(mailSrc).toContain('sendRecruitmentCandidateMail');
    expect(mailSrc).toContain('listRecruitmentCandidateMail');
    expect(mailSrc).toContain('rec-mail-submit');
    expect(mailSrc).toContain('interview_invite');
    expect(mailSrc).not.toMatch(/\/api\/hrm\/rec\//);
  });
});

describe('CandidateEvaluationDialog FR-06 Pass/Fail neo', () => {
  it('commits Pass/Fail with recruitment_candidate_id and no auto stage', () => {
    expect(evalSrc).toContain('recruitment_candidate_id');
    expect(evalSrc).toContain('commit: true');
    expect(evalSrc).toContain('validateRecEvalCommit');
    expect(evalSrc).toContain('rec-eval-commit');
    expect(evalSrc).toContain('onSuggestStageTransition');
    expect(evalSrc).not.toMatch(/\/api\/hrm\/rec\//);
  });
});

describe('CandidateDetailView mail CTA', () => {
  it('exposes Gửi thư testid when onOpenMail provided', () => {
    expect(detailSrc).toContain('onOpenMail');
    expect(detailSrc).toContain('rec-mail-open-detail');
  });
});

describe('hrmApi REC-06 clients — physical /recruitment/ only', () => {
  it('defines mail POST/GET and eval neo query under /recruitment/', () => {
    expect(apiSrc).toContain(
      '/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/mail',
    );
    expect(apiSrc).toContain('recruitment_candidate_id');
    expect(apiSrc).toContain('/api/hrm/recruitment/candidate-evaluations');
    expect(apiSrc).not.toMatch(/\/api\/hrm\/rec\/applications/);
  });
});
