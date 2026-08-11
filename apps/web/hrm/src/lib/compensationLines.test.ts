import { describe, expect, it } from 'vitest';
import {
  baseAmountFromPackage,
  buildCompensationLines,
  isProbationContractType,
} from './compensationLines';

describe('buildCompensationLines (CD-FB-08 / AC-CD-F5)', () => {
  it('requires base + ≥2 distinct allowance codes', () => {
    const ok = buildCompensationLines({
      baseAmount: '15000000',
      probationAmount: '',
      includeProbation: false,
      allowances: [
        { allowance_code: 'PHU_CAP_AN', amount: '500000' },
        { allowance_code: 'PHU_CAP_XANG', amount: '300000' },
      ],
      changeReason: '',
      effectiveFrom: '2026-07-19',
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.lines.some((l) => l.line_type === 'base')).toBe(true);
      expect(ok.lines.filter((l) => l.line_type === 'allowance')).toHaveLength(2);
    }
  });

  it('rejects fewer than 2 allowances (AC-CD-F5-03)', () => {
    const res = buildCompensationLines({
      baseAmount: '10000000',
      probationAmount: '',
      includeProbation: false,
      allowances: [{ allowance_code: 'PHU_CAP_AN', amount: '100000' }],
      changeReason: '',
      effectiveFrom: '2026-07-19',
    });
    expect(res.ok).toBe(false);
  });

  it('includes probation line when enabled', () => {
    const ok = buildCompensationLines({
      baseAmount: '15000000',
      probationAmount: '12000000',
      includeProbation: true,
      allowances: [
        { allowance_code: 'PHU_CAP_AN', amount: '1' },
        { allowance_code: 'PHU_CAP_XANG', amount: '2' },
      ],
      changeReason: '',
      effectiveFrom: '2026-07-19',
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.lines.some((l) => l.line_type === 'probation' && l.amount === 12_000_000)).toBe(
        true,
      );
    }
  });

  it('detects probation contract types', () => {
    expect(isProbationContractType('Hợp đồng thử việc')).toBe(true);
    expect(isProbationContractType('Hợp đồng 1 năm')).toBe(false);
  });

  it('reads base from package lines', () => {
    expect(
      baseAmountFromPackage([
        { line_type: 'allowance', amount: 1 },
        { line_type: 'base', amount: 9_000_000 },
      ]),
    ).toBe(9_000_000);
    expect(baseAmountFromPackage([])).toBeNull();
  });
});
