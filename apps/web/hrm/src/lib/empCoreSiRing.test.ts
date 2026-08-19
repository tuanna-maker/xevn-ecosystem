/**
 * Unit — PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01 · empCoreSiRing
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_SI_10_PATH_ASSERT,
  assertCore10PrintableHonesty,
  core10HonestyBannerText,
  core10HonestyFooterLines,
  enrollmentStatusLabelFallback,
  formatInsuranceAmountVi,
  isForbiddenCoreSiSotPath,
  isInsuranceActionValidationError,
  isPhysicalEmployeeInsurancesPath,
  periodStatusLabelFallback,
  resolveInsurancePeriodStatusLabelVi,
  resolveInsuranceStatusLabelVi,
} from './empCoreSiRing';

describe('empCoreSiRing — PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01', () => {
  it('FE-derives enrollment statusLabelVi — BH Hoạt động = active (≠ CORE-07 path)', () => {
    expect(resolveInsuranceStatusLabelVi('active', null)).toBe('Hoạt động');
    expect(resolveInsuranceStatusLabelVi('active', 'Đang đóng BH (BE)')).toBe(
      'Đang đóng BH (BE)',
    );
    expect(enrollmentStatusLabelFallback('suspended')).toBe('Tạm hoãn');
    expect(enrollmentStatusLabelFallback('closed')).toBe('Đóng');
    expect(enrollmentStatusLabelFallback('stopped')).toBe('Ngừng');
  });

  it('FE-derives period statusLabelVi + amounts vi-VN', () => {
    expect(resolveInsurancePeriodStatusLabelVi('applying', null)).toBe('Đang áp dụng');
    expect(periodStatusLabelFallback('closed')).toBe('Đã đóng');
    expect(formatInsuranceAmountVi(1_050_000)).toBe((1050000).toLocaleString('vi-VN'));
    expect(formatInsuranceAmountVi(null)).toBe('—');
  });

  it('path lock — physical employee-insurances · Nest /core SI forbidden', () => {
    expect(CORE_SI_10_PATH_ASSERT.actions).toContain('/employee-insurances');
    expect(CORE_SI_10_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(isPhysicalEmployeeInsurancesPath('/api/hrm/employee-insurances?x=1')).toBe(
      true,
    );
    expect(isForbiddenCoreSiSotPath('/api/hrm/core/insurance')).toBe(true);
    expect(isForbiddenCoreSiSotPath('/api/hrm/employee-insurances')).toBe(false);
  });

  it('honesty footers — catalog/CRUD/LIVE≠DONE · PAY-06 OUT · CORE-09/07 RETAIN', () => {
    const lines = core10HonestyFooterLines();
    expect(lines.some((l) => l.includes('catalog ≠ CORE-10 DONE'))).toBe(true);
    expect(lines.some((l) => l.includes('enrollment CRUD ≠ CORE-10 DONE'))).toBe(true);
    expect(lines.some((l) => l.includes('LIVE actions ≠ module DONE'))).toBe(true);
    expect(lines.some((l) => l.includes('BH «Hoạt động» ≠ CORE-07'))).toBe(true);
    expect(lines.some((l) => l.includes('PAY AC-SI-TL-06 OUT'))).toBe(true);
    expect(lines.some((l) => l.includes('contracts_printable_ready=false'))).toBe(true);
    expect(assertCore10PrintableHonesty()).toBe(true);
    expect(core10HonestyBannerText()).toContain('catalog ≠ CORE-10 DONE');
  });

  it('recognizes ACTION-400 / HRM-SI-ACTION-400', () => {
    expect(isInsuranceActionValidationError('HRM-SI-ACTION-400')).toBe(true);
    expect(isInsuranceActionValidationError('ACTION-400')).toBe(true);
    expect(isInsuranceActionValidationError('HRM-EINS-200')).toBe(false);
  });
});
