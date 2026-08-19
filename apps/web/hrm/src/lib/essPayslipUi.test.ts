import { describe, expect, it } from 'vitest';
import {
  canConfirmEssPayslip,
  formatEssConfirmStamp,
  formatEssMoney,
  resolveEssConfirmBadgeKind,
  resolveEssPayslipCompanyId,
  shouldShowEssOwnOnlyHint,
} from './essPayslipUi';

describe('essPayslipUi', () => {
  it('allows confirm only for processed/paid and not yet confirmed', () => {
    expect(canConfirmEssPayslip({ status: 'processed', ess_confirmed: false })).toBe(true);
    expect(canConfirmEssPayslip({ status: 'paid', ess_confirmed: false })).toBe(true);
    expect(canConfirmEssPayslip({ status: 'draft', ess_confirmed: false })).toBe(false);
    expect(canConfirmEssPayslip({ status: 'processed', ess_confirmed: true })).toBe(false);
  });

  it('formats display-ready money without inventing totals', () => {
    expect(formatEssMoney(12345000)).toMatch(/12\.345\.000/);
    expect(formatEssMoney(null)).toBe('—');
    expect(formatEssMoney('not-a-number')).toBe('—');
  });

  it('formats confirm stamp vi-VN or em-dash', () => {
    expect(formatEssConfirmStamp(null)).toBe('—');
    expect(formatEssConfirmStamp('')).toBe('—');
    expect(formatEssConfirmStamp('2026-08-07T10:30:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('resolves confirm badge kinds for list/detail', () => {
    expect(resolveEssConfirmBadgeKind({ status: 'processed', ess_confirmed: true })).toBe('confirmed');
    expect(resolveEssConfirmBadgeKind({ status: 'processed', ess_confirmed: false })).toBe('pending');
    expect(resolveEssConfirmBadgeKind({ status: 'draft', ess_confirmed: false })).toBe('draft');
  });

  it('D-PAY-ESS-FE-SCOPE-COERCE: preserves holding (no coerce→main) preferring JWT', () => {
    expect(
      resolveEssPayslipCompanyId({
        jwtCompanyId: 'holding',
        queryCompanyId: 'holding',
        authCompanyId: 'main',
      }),
    ).toBe('holding');
    expect(
      resolveEssPayslipCompanyId({
        jwtCompanyId: null,
        queryCompanyId: 'holding',
        authCompanyId: 'main',
      }),
    ).toBe('holding');
    expect(
      resolveEssPayslipCompanyId({
        jwtCompanyId: 'main',
        queryCompanyId: 'holding',
        authCompanyId: 'main',
      }),
    ).toBe('main');
  });

  it('hides CEO own-only hint on scope mismatch (not 403 ESS)', () => {
    expect(shouldShowEssOwnOnlyHint('Phạm vi tenant/công ty không khớp phiên đăng nhập.')).toBe(false);
    expect(
      shouldShowEssOwnOnlyHint(
        'Phiếu lương cá nhân chỉ dành cho tài khoản gắn hồ sơ nhân viên. Không xem hoặc xác nhận phiếu của người khác.',
      ),
    ).toBe(true);
  });
});
