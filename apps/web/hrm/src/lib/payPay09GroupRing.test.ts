import { describe, expect, it } from 'vitest';
import {
  PAY09_FORBIDDEN_HARDCODE_CODES,
  PAY09_GROUP_HONESTY_FOOTER,
  assertNoHardcodedPayrollGroupSeed,
  buildMatchRuleFromForm,
  formatPayrollGroupMatchSourceLabelVi,
  formatPayrollGroupStatusLabelVi,
  joinCommaSeparatedIds,
  parseCommaSeparatedIds,
} from './payPay09GroupRing';

describe('payPay09GroupRing', () => {
  it('honesty footer denies module DONE flip', () => {
    expect(PAY09_GROUP_HONESTY_FOOTER).toContain('payroll_e2e_ready=false');
    expect(PAY09_GROUP_HONESTY_FOOTER).toContain('≠ FR-UC-BP-PAY-09 DONE');
  });

  it('status and match_source labels vi-VN', () => {
    expect(formatPayrollGroupStatusLabelVi('active')).toBe('Đang dùng');
    expect(formatPayrollGroupStatusLabelVi('retired')).toBe('Ngừng sử dụng');
    expect(formatPayrollGroupMatchSourceLabelVi('explicit_list')).toBe('Danh sách đặc thù');
  });

  it('parse/join comma-separated ids', () => {
    expect(parseCommaSeparatedIds('a, b; c')).toEqual(['a', 'b', 'c']);
    expect(joinCommaSeparatedIds(['x', 'y'])).toBe('x, y');
  });

  it('buildMatchRuleFromForm omits empty arrays', () => {
    expect(buildMatchRuleFromForm({ departmentIdsText: '', positionKeysText: 'mgr', employeeIdsText: '' })).toEqual({
      position_keys: ['mgr'],
    });
  });

  it('assertNoHardcodedPayrollGroupSeed flags forbidden enum', () => {
    expect(assertNoHardcodedPayrollGroupSeed(['CUSTOM-01'])).toBe(true);
    for (const code of PAY09_FORBIDDEN_HARDCODE_CODES) {
      expect(assertNoHardcodedPayrollGroupSeed([code])).toBe(false);
    }
  });
});
