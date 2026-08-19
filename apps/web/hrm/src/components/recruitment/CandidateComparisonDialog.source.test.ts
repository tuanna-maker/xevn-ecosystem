import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(resolve(__dirname, './CandidateComparisonDialog.tsx'), 'utf8');

describe('CandidateComparisonDialog YCTD SoT (PO-HRM-REC-UV-YCTD-CMP-FE-01)', () => {
  it('uses receivable YCTD picker — FORBIDDEN job_postings SoT', () => {
    expect(src).toContain('receivable: true');
    expect(src).toContain('listJobRequisitions');
    expect(src).toContain('listRecruitmentApplicationsByYctd');
    expect(src).toContain('getRecruitmentCompareMatrix');
    expect(src).not.toContain('job_posting_id');
    expect(src).not.toContain('listCandidateApplications');
    expect(src).toContain("r('selectYctd')");
  });

  it('wires empty / max-N / chưa đánh giá / HDSD testids', () => {
    expect(src).toContain('recCompareYctdEmpty');
    expect(src).toContain('recCompareUvEmpty');
    expect(src).toContain('recCompareUvNotEval');
    expect(src).toContain('recCompareMaxNHint');
    expect(src).toContain('REC_COMPARE_MAX_N');
    expect(src).toContain('canAddCandidateToCompare');
    expect(src).toContain("r('notEvaluated')");
    expect(src).toContain('HRM-REC-CMP-MAX-N');
    expect(src).toContain('HRM-REC-CMP-YCTD-MIX');
  });

  it('auto-selects first UV after YCTD load so GET /compare fires (R-REC-CMP-NET-CAPTURE)', () => {
    expect(src).toContain('getRecruitmentCompareMatrix');
    expect(src).toContain('rows.slice(0, 1)');
    expect(src).toContain('setSelectedCandidateIds(initialIds)');
    expect(src).toContain('R-REC-CMP-NET-CAPTURE');
  });
});
