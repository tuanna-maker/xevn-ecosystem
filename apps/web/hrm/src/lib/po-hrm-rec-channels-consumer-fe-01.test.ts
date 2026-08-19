import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const formSrc = readFileSync(
  resolve(__dirname, '../components/recruitment/CandidateFormDialog.tsx'),
  'utf8',
);
const tabSrc = readFileSync(resolve(__dirname, '../components/recruitment/CandidatesTab.tsx'), 'utf8');
const detailSrc = readFileSync(
  resolve(__dirname, '../components/recruitment/CandidateDetailView.tsx'),
  'utf8',
);
const pickerSrc = readFileSync(resolve(__dirname, './catalogSearchPicker.ts'), 'utf8');

describe('PO-HRM-REC-CHANNELS-CONSUMER-FE-01 source locks', () => {
  it('catalog helpers exist and form wires overview + channel picker', () => {
    expect(pickerSrc).toContain('recruitmentChannelOptionsFromCatalog');
    expect(pickerSrc).toContain('resolveRecruitmentChannelLabel');
    expect(formSrc).toContain('useSettingsCatalogsOverview');
    expect(formSrc).toContain('recruitmentChannelOptionsFromCatalog');
    expect(formSrc).toContain('candidateSourcePickerOptions');
    expect(formSrc).not.toContain('getSourceOptions');
    expect(formSrc).toContain('hdsd-candidate-form-source');
  });

  it('CandidatesTab filter/list use catalog resolve', () => {
    expect(tabSrc).toContain('resolveCandidateSourceDisplayLabel');
    expect(tabSrc).toContain('candidateSourceFilterValues');
    expect(tabSrc).toContain('recruitmentChannelOptionsFromCatalog');
    expect(tabSrc).toContain('candidateFilterSource');
    expect(tabSrc).toContain('candidateFilterSourceOptionPrefix');
  });

  it('CandidateDetailView resolves source label from catalog', () => {
    expect(detailSrc).toContain('resolveCandidateSourceDisplayLabel');
    expect(detailSrc).toContain('recruitmentChannelOptionsFromCatalog');
  });
});
