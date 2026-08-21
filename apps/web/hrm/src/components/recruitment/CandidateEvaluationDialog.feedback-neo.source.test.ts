import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const interviewsSrc = readFileSync(resolve(__dirname, './InterviewsTab.tsx'), 'utf8');
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
});

describe('CandidateEvaluationDialog feedback reset guard', () => {
  it('fetches on open/candidateId — not whole candidate object (avoids 1-char Textarea wipe)', () => {
    expect(evalSrc).toContain('candidateId');
    expect(evalSrc).toContain('[open, currentCompanyId, candidateId]');
    expect(evalSrc).not.toMatch(/\[open, currentCompanyId, candidate\]/);
  });
});
