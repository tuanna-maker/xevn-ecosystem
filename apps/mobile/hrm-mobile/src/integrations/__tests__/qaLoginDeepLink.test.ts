import { describe, expect, it } from 'vitest';
import { parseQaLoginDeepLink, qaDeepLinkToSignInPayload } from '../qaLoginDeepLink';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJ4ZXZuIiwiY29tcGFueV9pZCI6ImhvbGRpbmciLCJjb21wYW55X3V1aWQiOiI2ZWZhYTVkNi1hNGE4LTRiZmQtODA1YS0zYzRmMDAzZTQwMTMiLCJlbXBsb3llZV9pZCI6IjM3OTZkOTQ5LTQ1MTMtNDVjMC04OGZhLTMzMDMwYTA2MmIxNyIsInJvbGVzIjpbImVtcGxveWVlIl0sImlhdCI6MSwiZXhwIjo5OTk5OTk5OTk5fQ.sig';

describe('parseQaLoginDeepLink', () => {
  it('parses xevn://qa-login with token query params', () => {
    const url = `xevn://qa-login?access_token=${encodeURIComponent(SAMPLE_JWT)}&tenant_id=xevn&company_id=holding`;
    const parsed = parseQaLoginDeepLink(url);
    expect(parsed).not.toBeNull();
    expect(parsed?.tenantId).toBe('xevn');
    expect(parsed?.companyId).toBe('holding');
    expect(parsed?.accessToken).toBe(SAMPLE_JWT);
  });

  it('backfills scope fields from JWT claims when query omits them', () => {
    const url = `xevn://qa-login?token=${encodeURIComponent(SAMPLE_JWT)}`;
    const parsed = parseQaLoginDeepLink(url);
    expect(parsed?.companyUuid).toBe('6efaa5d6-a4a8-4bfd-805a-3c4f003e4013');
    expect(parsed?.employeeId).toBe('3796d949-4513-45c0-88fa-33030a062b17');
  });

  it('returns null for unrelated URLs', () => {
    expect(parseQaLoginDeepLink('https://example.com/')).toBeNull();
    expect(parseQaLoginDeepLink('xevn://home')).toBeNull();
  });
});

describe('qaDeepLinkToSignInPayload', () => {
  it('maps deep link params to SignInPayload', () => {
    const params = parseQaLoginDeepLink(
      `xevn://qa-login?access_token=${encodeURIComponent(SAMPLE_JWT)}&tenant_id=xevn&company_id=holding`,
    );
    expect(params).not.toBeNull();
    const payload = qaDeepLinkToSignInPayload(params!);
    expect(payload.tenantId).toBe('xevn');
    expect(payload.companyId).toBe('holding');
    expect(payload.accessToken).toBe(SAMPLE_JWT);
    expect(payload.roles).toContain('employee');
    expect(payload.memberships).toHaveLength(1);
    expect(payload.memberships[0]?.company_id).toBe('holding');
    expect(payload.memberships[0]?.employee_id).toBe('3796d949-4513-45c0-88fa-33030a062b17');
  });

  it('P1-LEAVE-BALANCE-DEVICE-01: normalizes UUID company_id query to holding slug', () => {
    const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
    const url = `xevn://qa-login?access_token=${encodeURIComponent(SAMPLE_JWT)}&tenant_id=xevn&company_id=${holdingUuid}&company_uuid=${holdingUuid}`;
    const params = parseQaLoginDeepLink(url);
    expect(params).not.toBeNull();
    const payload = qaDeepLinkToSignInPayload(params!);
    expect(payload.companyId).toBe('holding');
    expect(payload.memberships[0]?.company_id).toBe('holding');
  });
});
