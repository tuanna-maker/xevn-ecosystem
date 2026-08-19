/**
 * Helpers — PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01 C&B ring
 */
import { describe, expect, it } from 'vitest';
import {
  isCoreCbPackagesPhysicalPath,
  isCoreCbSiPhysicalPath,
  isForbiddenCoreCompensationSotPath,
  maskBankAccountView,
  maskTaxIdView,
  splitSiEnrollmentUpdate,
} from './empCoreCbRing';

describe('empCoreCbRing', () => {
  it('recognizes packages / SI physical paths and forbids Nest /core SoT', () => {
    expect(
      isCoreCbPackagesPhysicalPath('/api/hrm/contracts-insurance/compensation-packages'),
    ).toBe(true);
    expect(
      isCoreCbPackagesPhysicalPath(
        '/api/hrm/contracts-insurance/compensation-packages/abc/revise',
      ),
    ).toBe(true);
    expect(
      isCoreCbPackagesPhysicalPath('/api/hrm/contracts-insurance/compensation-history'),
    ).toBe(true);
    expect(isCoreCbSiPhysicalPath('/api/hrm/employee-insurances/x/actions')).toBe(true);
    expect(
      isForbiddenCoreCompensationSotPath('/api/hrm/core/employees/1/compensation'),
    ).toBe(true);
    expect(isForbiddenCoreCompensationSotPath('/api/hrm/employees/1')).toBe(false);
  });

  it('masks bank / MST for view-only', () => {
    expect(maskBankAccountView('0123456789')).toMatch(/6789$/);
    expect(maskBankAccountView('')).toBe('—');
    expect(maskTaxIdView('0312345678')).toMatch(/678$/);
  });

  it('splits SI update — rate change vs meta-only PATCH', () => {
    const withRate = splitSiEnrollmentUpdate({
      previous: { contribution: 1_000_000, employer_contribution: 2_000_000 },
      next: {
        provider: 'BHXH',
        contribution: 1_100_000,
        employer_contribution: 2_000_000,
        notes: 'điều chỉnh',
      },
    });
    expect(withRate.rateChange).toEqual({
      contribution: 1_100_000,
      employer_contribution: 2_000_000,
    });
    expect(withRate.metaOnly).not.toHaveProperty('contribution');
    expect(withRate.metaOnly).not.toHaveProperty('employer_contribution');
    expect(withRate.metaOnly.provider).toBe('BHXH');

    const metaOnly = splitSiEnrollmentUpdate({
      previous: { contribution: 1_000_000, employer_contribution: 2_000_000 },
      next: {
        provider: 'BHXH',
        contribution: 1_000_000,
        employer_contribution: 2_000_000,
        notes: 'ghi chú',
      },
    });
    expect(metaOnly.rateChange).toBeNull();
    expect(metaOnly.metaOnly).not.toHaveProperty('contribution');
  });
});
