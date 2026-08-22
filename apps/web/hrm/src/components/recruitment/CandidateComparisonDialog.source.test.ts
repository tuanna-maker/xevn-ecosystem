import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(resolve(__dirname, './CandidateComparisonDialog.tsx'), 'utf8');

describe('CandidateComparisonDialog YCTD SoT (PO-HRM-REC-UV-YCTD-CMP-FE-01)', () => {
  it('uses receivable YCTD picker — FORBIDDEN job_postings SoT', () => {
    expect(src).toContain('receivable: true');
    expect(src).toContain('listJobRequisitions');
    expect(src).toContain('filterComparePickerYctds');
    expect(src).toContain('getJobRequisition');
    expect(src).toContain('listRecruitmentApplicationsByYctd');
    expect(src).toContain('Lane A spine SoT first');
    expect(src).toContain('listRecruitmentCandidates');
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
    expect(src).toContain("r('compareNoScoresTitle')");
    expect(src).toContain("r('compareNoScoresHint')");
  });

  it('auto-selects first YCTD on open and first UV after load (R-REC-CMP-NET-CAPTURE)', () => {
    expect(src).toContain('setSelectedYctdId(rows[0].id)');
    expect(src).toContain('getRecruitmentCompareMatrix');
    expect(src).toContain('rows.slice(0, 1)');
    expect(src).toContain('setSelectedCandidateIds(initialIds)');
    expect(src).toContain('R-REC-CMP-NET-CAPTURE');
  });

  it('prefills YCTD + UV when returning from REC-06 So sánh theo YCTD', () => {
    expect(src).toContain('initialCandidateId');
    expect(src).toContain('initialRequisitionId');
    expect(src).toContain('prefUv');
  });

  it('wires post-compare evaluate / stage CTAs and deep-link props', () => {
    expect(src).toContain('CompareEvaluateTarget');
    expect(src).toContain('onEvaluateCandidate');
    expect(src).toContain('handleEvaluateClick');
    expect(src).toContain('onChangeStage');
    expect(src).toContain('handleStageClick');
    expect(src).toContain('hdsd-rec-compare-evaluate-btn');
    expect(src).toContain('hdsd-rec-compare-stage-btn');
    expect(src).toContain('hdsd-rec-compare-actions-footer');
    expect(src).toContain("tr('compareReEvaluate')");
    expect(src).toContain("tr('compareChangeStage')");
  });

  it('uses YCTD picker helpers and matrix merge from pure modules', () => {
    expect(src).toContain('useHrmOperatingUnitFilter');
    expect(src).toContain('listCompanyId || currentCompanyId');
    expect(src).toContain('coerceHrmListCompanyId');
    expect(src).toContain('loadCompareYctdFromCandidates');
    expect(src).toContain('loadRequisitionsAcrossCompanyScopes');
    expect(src).toContain('mergeSeedEvalIntoCompareYctdPicker');
    expect(src).toContain('seedEvaluations');
    expect(src).toContain('buildCompareYctdPickerFromCandidates');
    expect(src).toContain('filterComparePickerYctds');
    expect(src).toContain('recCompareYctdSearch');
  });
});
