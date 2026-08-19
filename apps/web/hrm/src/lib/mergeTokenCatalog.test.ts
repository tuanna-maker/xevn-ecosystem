import { describe, expect, it } from 'vitest';
import {
  formatMergeTokenDisplay,
  isValidMergeTokenKeyFormat,
  MERGE_TOKEN_PRINTABLE_HONESTY,
  mergeTokenDomainLabel,
  mergeTokenRingLabel,
  mergeTokenStatusLabel,
  normalizeMergeTokenKey,
} from './mergeTokenCatalog';

describe('mergeTokenCatalog (PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01)', () => {
  it('accepts open-catalog format keys including custom.#9+ style', () => {
    expect(isValidMergeTokenKeyFormat('custom.emp.badge')).toBe(true);
    expect(isValidMergeTokenKeyFormat('custom.emp.field_9')).toBe(true);
    expect(isValidMergeTokenKeyFormat('{{employee.full_name}}')).toBe(true);
    expect(isValidMergeTokenKeyFormat('contract.contract_number')).toBe(true);
  });

  it('rejects format-only failures — not closed enum', () => {
    expect(isValidMergeTokenKeyFormat('BAD KEY!!')).toBe(false);
    expect(isValidMergeTokenKeyFormat('9starts_digit')).toBe(false);
    expect(isValidMergeTokenKeyFormat('#legacy#')).toBe(false);
    expect(isValidMergeTokenKeyFormat('')).toBe(false);
  });

  it('normalizes braces and case', () => {
    expect(normalizeMergeTokenKey('{{Employee.Full_Name}}')).toBe('employee.full_name');
  });

  it('display-ready label never raw-key-only when labelVi present', () => {
    expect(formatMergeTokenDisplay('custom.emp.badge', 'Mã thẻ NV')).toBe(
      'Mã thẻ NV ({{custom.emp.badge}})',
    );
  });

  it('ring/domain/status labels are vi-VN · printable honesty false', () => {
    expect(mergeTokenRingLabel('custom')).toBe('Tuỳ chỉnh');
    expect(mergeTokenDomainLabel('CTR')).toBe('Hợp đồng');
    expect(mergeTokenStatusLabel('retired')).toBe('Đã ngừng');
    expect(MERGE_TOKEN_PRINTABLE_HONESTY).toBe(false);
  });
});
