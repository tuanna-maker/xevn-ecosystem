import { describe, expect, it } from 'vitest';
import {
  baseAmountFromPackage,
  buildCompensationLines,
  deriveComponentCode,
  isProbationContractType,
  normalizeCompensationComponentCode,
} from './compensationLines';

describe('buildCompensationLines (CD-FB-08 / AC-CD-F5 / SRC-02)', () => {
  it('requires base + ≥2 distinct allowance codes and emits component_code', () => {
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
      const base = ok.lines.find((l) => l.line_type === 'base');
      const an = ok.lines.find((l) => l.allowance_code === 'PHU_CAP_AN');
      const xang = ok.lines.find((l) => l.allowance_code === 'PHU_CAP_XANG');
      expect(base?.component_code).toBe('base');
      expect(an?.component_code).toBe('phu_cap_an');
      expect(xang?.component_code).toBe('phu_cap_xang');
    }
  });

  it('rejects empty / zero base (U65 ViMoney empty must not POST)', () => {
    const empty = buildCompensationLines({
      baseAmount: '',
      probationAmount: '',
      includeProbation: false,
      allowances: [
        { allowance_code: 'PHU_CAP_AN', amount: '1' },
        { allowance_code: 'PHU_CAP_XANG', amount: '2' },
      ],
      changeReason: '',
      effectiveFrom: '2026-07-19',
    });
    expect(empty.ok).toBe(false);

    const zero = buildCompensationLines({
      baseAmount: '0',
      probationAmount: '',
      includeProbation: false,
      allowances: [
        { allowance_code: 'PHU_CAP_AN', amount: '1' },
        { allowance_code: 'PHU_CAP_XANG', amount: '2' },
      ],
      changeReason: '',
      effectiveFrom: '2026-07-19',
    });
    expect(zero.ok).toBe(false);
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

  it('includes probation line with component_code when enabled', () => {
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
      const probation = ok.lines.find((l) => l.line_type === 'probation');
      expect(probation?.amount).toBe(12_000_000);
      expect(probation?.component_code).toBe('probation');
    }
  });

  it('rejects includeProbation without amount (R-EMP-SH-FE-CB-CLICK root cause)', () => {
    const res = buildCompensationLines({
      baseAmount: '13579000',
      probationAmount: '',
      includeProbation: true,
      allowances: [
        { allowance_code: 'PHU_CAP_AN', amount: '777000' },
        { allowance_code: 'PHU_CAP_XANG', amount: '300000' },
      ],
      changeReason: '',
      effectiveFrom: '2026-09-01',
    });
    expect(res.ok).toBe(false);
  });

  it('honors explicit component_code override on allowance', () => {
    const ok = buildCompensationLines({
      baseAmount: '10000000',
      probationAmount: '',
      includeProbation: false,
      allowances: [
        { allowance_code: 'PHU_CAP_AN', amount: '777000', component_code: 'PHU_CAP_AN' },
        { allowance_code: 'PHU_CAP_XANG', amount: '300000' },
      ],
      changeReason: '',
      effectiveFrom: '2026-09-01',
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.lines.find((l) => l.allowance_code === 'PHU_CAP_AN')?.component_code).toBe(
        'phu_cap_an',
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

  it('deriveComponentCode matches DATA §4.2', () => {
    expect(normalizeCompensationComponentCode('PHU_CAP_AN')).toBe('phu_cap_an');
    expect(deriveComponentCode({ line_type: 'base' })).toBe('base');
    expect(deriveComponentCode({ line_type: 'probation' })).toBe('probation');
    expect(
      deriveComponentCode({ line_type: 'allowance', allowance_code: 'PHU_CAP_AN' }),
    ).toBe('phu_cap_an');
    expect(
      deriveComponentCode({
        line_type: 'allowance',
        allowance_code: 'PHU_CAP_AN',
        component_code: 'Meal_Allow',
      }),
    ).toBe('meal_allow');
  });
});
