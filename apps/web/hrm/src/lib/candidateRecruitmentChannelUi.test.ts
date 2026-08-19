import { describe, expect, it } from 'vitest';
import {
  candidateSourceFilterValues,
  candidateSourcePickerOptions,
  legacyCandidateSourceOptions,
  resolveCandidateSourceDisplayLabel,
} from './candidateRecruitmentChannelUi';

const r = (key: string) => key;

describe('candidateRecruitmentChannelUi — PO-HRM-REC-CHANNELS-CONSUMER-FE-01', () => {
  it('uses catalog options when EFF>0 (BR-REC-CH-SOT-01)', () => {
    const catalog = [{ value: 'WEB', label: 'Website', code: 'WEB' }];
    const opts = candidateSourcePickerOptions(catalog, 1, r);
    expect(opts).toEqual(catalog);
    expect(legacyCandidateSourceOptions(r).some((o) => o.value === 'LinkedIn')).toBe(true);
  });

  it('falls back to legacy list when EFF=0 (BR-REC-CH-SOT-02)', () => {
    const opts = candidateSourcePickerOptions([], 0, r);
    expect(opts.map((o) => o.value)).toContain('LinkedIn');
  });

  it('resolve display: catalog label or legacy raw when EFF>0', () => {
    const catalog = [{ value: 'WEB', label: 'Website công ty', code: 'WEB' }];
    expect(
      resolveCandidateSourceDisplayLabel(catalog, 1, 'WEB', () => 'legacy'),
    ).toBe('Website công ty');
    expect(
      resolveCandidateSourceDisplayLabel(catalog, 1, 'LinkedIn', () => 'legacy'),
    ).toBe('LinkedIn');
  });

  it('filter values union catalog + row legacy codes', () => {
    const catalog = [{ value: 'WEB', label: 'Web', code: 'WEB' }];
    const values = candidateSourceFilterValues(catalog, 1, ['LinkedIn', 'WEB']);
    expect(values).toEqual(['LinkedIn', 'WEB']);
  });
});
