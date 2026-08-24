import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const interviewsSrc = readFileSync(resolve(__dirname, './InterviewsTab.tsx'), 'utf8');
const candidatesSrc = readFileSync(resolve(__dirname, './CandidatesTab.tsx'), 'utf8');
const evalSrc = readFileSync(
  resolve(__dirname, './CandidateEvaluationDialog.tsx'),
  'utf8',
);

describe('InterviewsTab → CandidateEvaluationDialog FR-06 neo', () => {
  it('marks Lane A interview candidate as spine with recruitment_candidate_id', () => {
    expect(interviewsSrc).toContain("list_lane: 'spine'");
    expect(interviewsSrc).toContain(
      'recruitment_candidate_id: interviewForEvaluation.candidate_id',
    );
  });

  it('wires REC-06 → REC-06b compare from interview eval', () => {
    expect(interviewsSrc).toContain('onCompareByYctd');
    expect(interviewsSrc).toContain('CandidateComparisonDialog');
    expect(interviewsSrc).toContain('openCompareForYctd');
    expect(interviewsSrc).toContain('seedEvaluations={evaluations}');
    expect(interviewsSrc).toContain('useCandidateEvaluations');
  });
});

describe('CandidatesTab → compare wiring', () => {
  it('mounts compare dialog with YCTD deep-link props and eval handoff', () => {
    expect(candidatesSrc).toContain('CandidateComparisonDialog');
    expect(candidatesSrc).toContain('initialRequisitionId');
    expect(candidatesSrc).toContain('initialCandidateId');
    expect(candidatesSrc).toContain('onCompareByYctd');
    expect(candidatesSrc).toContain('openCompareForYctd');
    expect(candidatesSrc).toContain('seedEvaluations={evaluations}');
    expect(candidatesSrc).toContain('useCandidateEvaluations');
  });
});

describe('CandidateEvaluationDialog feedback reset guard', () => {
  it('fetches on open/candidateId — not whole candidate object (avoids 1-char Textarea wipe)', () => {
    expect(evalSrc).toContain('candidateId');
    expect(evalSrc).toContain('[open, currentCompanyId, candidateId]');
    expect(evalSrc).not.toMatch(/\[open, currentCompanyId, candidate\]/);
  });

  it('exposes REC-06 → REC-06b compare CTA with spine YCTD fallback', () => {
    expect(evalSrc).toContain('onCompareByYctd');
    expect(evalSrc).toContain('handleCompareByYctd');
    expect(evalSrc).toContain('rec-eval-compare-yctd');
    expect(evalSrc).toContain('listRecruitmentCandidates');
    expect(evalSrc).toContain('normalizeRequisitionId');
  });
});
