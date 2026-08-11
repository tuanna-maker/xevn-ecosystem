import { describe, expect, it } from 'vitest';
import {
  CONTRACT_DATES_REQUIRED_TOAST,
  CONTRACT_EFFECTIVE_REQUIRED_TOAST,
  contractTypeRequiresEndDate,
  defaultContractExpiryDate,
  ensureContractCreateDates,
  isOpenEndedContractType,
  resolveContractTypeForDatePolicy,
  validateContractDatesForSubmit,
} from './contractEndDatePolicy';

describe('FE-HRM-G-CI-01 — contractEndDatePolicy', () => {
  it.each([
    'indefinite',
    'permanent',
    'HDLD_KTH',
    'Hợp đồng không thời hạn',
    'HDLD vô thời hạn',
  ])('treats %s as open-ended (expiry optional)', (type) => {
    expect(isOpenEndedContractType(type)).toBe(true);
    expect(contractTypeRequiresEndDate(type)).toBe(false);
  });

  it.each(['Hợp đồng 1 năm', 'fixed_term', 'Hợp đồng thử việc'])(
    'requires expiry for %s',
    (type) => {
      expect(isOpenEndedContractType(type)).toBe(false);
      expect(contractTypeRequiresEndDate(type)).toBe(true);
    },
  );

  it('allows open-ended submit without expiry', () => {
    expect(
      validateContractDatesForSubmit({
        contractType: 'Hợp đồng không thời hạn',
        effectiveDate: '2026-07-22',
        expiryDate: '',
      }),
    ).toEqual({ ok: true });
  });

  it('blocks fixed-term without expiry with legacy toast', () => {
    expect(
      validateContractDatesForSubmit({
        contractType: 'Hợp đồng 1 năm',
        effectiveDate: '2026-07-22',
        expiryDate: '',
      }),
    ).toEqual({ ok: false, message: CONTRACT_DATES_REQUIRED_TOAST });
  });

  it('defaultContractExpiryDate — fixed-term +1y, probation +2mo', () => {
    const effective = new Date('2026-01-15');
    expect(defaultContractExpiryDate(effective, 'Hợp đồng 1 năm').getFullYear()).toBe(2027);
    expect(defaultContractExpiryDate(effective, 'probation').getMonth()).toBe(2);
  });

  it('blocks open-ended without effective date', () => {
    expect(
      validateContractDatesForSubmit({
        contractType: 'HDLD_KTH',
        effectiveDate: '',
        expiryDate: '',
      }),
    ).toEqual({ ok: false, message: CONTRACT_EFFECTIVE_REQUIRED_TOAST });
  });

  it('resolveContractTypeForDatePolicy — empty type uses picker or fixed_term fallback', () => {
    expect(resolveContractTypeForDatePolicy('', ['HDLD_1Y'])).toBe('HDLD_1Y');
    expect(resolveContractTypeForDatePolicy('', [])).toBe('fixed_term');
  });

  it('ensureContractCreateDates — prefill effective + expiry when UI omits date fields', () => {
    const { effective_date, expiry_date } = ensureContractCreateDates({
      effectiveDate: undefined,
      expiryDate: undefined,
      contractType: '',
      pickerOptionValues: ['Hợp đồng 1 năm'],
    });
    expect(effective_date).toBeInstanceOf(Date);
    expect(expiry_date).toBeInstanceOf(Date);
    expect(expiry_date!.getFullYear()).toBe(effective_date.getFullYear() + 1);
  });
});
