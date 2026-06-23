import { afterEach, describe, expect, it } from 'vitest';
import { getPortalJwtCompanyId, resolveHrmSpreadsheetScope } from './hrmSpreadsheetScope';

const STORAGE_TOKEN = 'xevn.portal.accessToken';

/** JWT payload: { companyId: "main", tenantId: "xevn" } */
const JWT_MAIN =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJtYWluIiwidGVuYW50SWQiOiJ4ZXZuIn0.';

describe('hrmSpreadsheetScope', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('prefers portal JWT company over iframe query companyId', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_MAIN);
    const scope = resolveHrmSpreadsheetScope('xevn', '?portal=1&tenantId=xevn&companyId=xevn');
    expect(scope?.companyId).toBe('main');
    expect(scope?.tenantId).toBe('xevn');
  });

  it('reads companyId from portal JWT — main/holding return null (rollup sentinel)', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_MAIN);
    expect(getPortalJwtCompanyId()).toBeNull();
  });

  it('maps iframe companyId=holding to main for Nest scope headers', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_MAIN);
    const scope = resolveHrmSpreadsheetScope('holding', '?portal=1&tenantId=xevn&companyId=holding');
    expect(scope?.companyId).toBe('main');
  });
});
