import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const formSrc = readFileSync(resolve(__dirname, './CandidateFormDialog.tsx'), 'utf8');
const tabSrc = readFileSync(resolve(__dirname, './CandidatesTab.tsx'), 'utf8');

describe('CandidateFormDialog UV↔YCTD wiring (PO-HRM-REC-UV-YCTD-FE-01)', () => {
  it('requires YCTD SELECT and derived position — no free-text position SoT', () => {
    expect(formSrc).toContain('listJobRequisitions');
    expect(formSrc).toContain('receivable: true');
    expect(formSrc).toContain('buildCandidateCreateWithYctdPayload');
    expect(formSrc).toContain('deriveUvPositionFromYctd');
    expect(formSrc).toContain('HDSD_MUTATE_TEST_IDS.candidateFormYctd');
    expect(formSrc).toContain('HDSD_MUTATE_TEST_IDS.candidateFormPosition');
    expect(formSrc).toContain('readOnly');
    expect(formSrc).not.toMatch(/name=\"position\"/);
    expect(formSrc).toContain('UV_YCTD_REQUIRED_VI');
    expect(formSrc).toContain('defaultRequisitionId');
  });

  it('CandidatesTab merges YCTD display + context prefill + create testid', () => {
    expect(tabSrc).toContain('mergeYctdDisplayOntoPoolCandidates');
    expect(tabSrc).toContain('unionSpineOnlyCandidatesIntoList');
    expect(tabSrc).toContain('parseRequisitionIdFromSearch');
    expect(tabSrc).toContain('HDSD_MUTATE_TEST_IDS.candidateCreateBtn');
    expect(tabSrc).toContain('HDSD_MUTATE_TEST_IDS.candidateListYctd');
    expect(tabSrc).toContain('onOpenYctdTab');
    expect(tabSrc).toContain('defaultRequisitionId');
  });

  it('binds candidate source to recruitment_channels catalog (PO-HRM-REC-CHANNELS-CONSUMER-FE-01)', () => {
    expect(formSrc).toContain('recruitmentChannelOptionsFromCatalog');
    expect(formSrc).toContain('candidateSourcePickerOptions');
    expect(formSrc).not.toContain('getSourceOptions');
  });
});
