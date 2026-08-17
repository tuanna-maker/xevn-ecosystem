import { describe, expect, it } from 'vitest';
import { parseQaLoginDeepLink, parseQaLogoutDeepLink, qaDeepLinkToSignInPayload } from '../qaLoginDeepLink';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW5hbnRfaWQiOiJ4ZXZuIiwiY29tcGFueV9pZCI6ImhvbGRpbmciLCJjb21wYW55X3V1aWQiOiIxMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJlbXBsb3llZV9pZCI6IjM3OTZkOTQ5LTQ1MTMtNDVjMC04OGZhLTMzMDMwYTA2MmIxNyIsInJvbGVzIjpbImVtcGxveWVlIl0sImlhdCI6MSwiZXhwIjo5OTk5OTk5OTk5fQ.sig';

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
    expect(parsed?.companyUuid).toBe('10000000-0000-4000-8000-000000000001');
    expect(parsed?.employeeId).toBe('3796d949-4513-45c0-88fa-33030a062b17');
  });

  it('returns null for unrelated URLs', () => {
    expect(parseQaLoginDeepLink('https://example.com/')).toBeNull();
    expect(parseQaLoginDeepLink('xevn://home')).toBeNull();
    expect(parseQaLoginDeepLink('xevn://qa-logout')).toBeNull();
  });
});

describe('parseQaLogoutDeepLink', () => {
  it('recognizes xevn://qa-logout (qa-device session reset assist)', () => {
    expect(parseQaLogoutDeepLink('xevn://qa-logout')).toBe(true);
    expect(parseQaLogoutDeepLink('xevn://qa-login?access_token=x')).toBe(false);
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

  it('normalizes pilot base_url from deep link', () => {
    const pilotBase = 'http://14.225.217.232:3001';
    const url = `xevn://qa-login?access_token=${encodeURIComponent(SAMPLE_JWT)}&tenant_id=xevn&company_id=holding&company_uuid=10000000-0000-4000-8000-000000000001&base_url=${encodeURIComponent(pilotBase)}`;
    const params = parseQaLoginDeepLink(url);
    expect(params?.baseUrl).toBe(pilotBase);
    const payload = qaDeepLinkToSignInPayload(params!);
    expect(payload.baseUrl).toBe(pilotBase);
  });

  it('P1-LEAVE-BALANCE-DEVICE-01: normalizes UUID company_id query to holding slug', () => {
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    const url = `xevn://qa-login?access_token=${encodeURIComponent(SAMPLE_JWT)}&tenant_id=xevn&company_id=${holdingUuid}&company_uuid=${holdingUuid}`;
    const params = parseQaLoginDeepLink(url);
    expect(params).not.toBeNull();
    const payload = qaDeepLinkToSignInPayload(params!);
    expect(payload.companyId).toBe('holding');
    expect(payload.memberships[0]?.company_id).toBe('holding');
  });

  it('W1-B-04: maps company_label/tenant_label/role_label/job_title_label into memberships', () => {
    const url =
      `xevn://qa-login?access_token=${encodeURIComponent(SAMPLE_JWT)}` +
      `&tenant_id=xevn&company_id=holding` +
      `&company_label=${encodeURIComponent('Tập đoàn X.E')}` +
      `&tenant_label=${encodeURIComponent('Tập đoàn XeVN')}` +
      `&role_label=${encodeURIComponent('Nhân viên')}` +
      `&job_title_label=${encodeURIComponent('Nhân viên')}`;
    const params = parseQaLoginDeepLink(url);
    const payload = qaDeepLinkToSignInPayload(params!);
    const m = payload.memberships[0];
    expect(m?.company_label).toBe('Tập đoàn X.E');
    expect(m?.tenant_label).toBe('Tập đoàn XeVN');
    expect(m?.role_label).toBe('Nhân viên');
    expect(m?.job_title_label).toBe('Nhân viên');
  });
});
