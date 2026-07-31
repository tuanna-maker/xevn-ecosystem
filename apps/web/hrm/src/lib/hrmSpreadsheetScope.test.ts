import { afterEach, describe, expect, it } from 'vitest';
import {
  getPortalJwtCompanyId,
  getPortalJwtRoleCode,
  resolveHrmSpreadsheetScope,
} from './hrmSpreadsheetScope';

const STORAGE_TOKEN = 'xevn.portal.accessToken';

/** JWT payload: { companyId: "main", tenantId: "xevn" } */
const JWT_MAIN =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJtYWluIiwidGVuYW50SWQiOiJ4ZXZuIn0.';

/** JWT payload: { companyId: "main", tenantId: "xevn", roleCode: "group_ceo" } */
const JWT_ROLE =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJtYWluIiwidGVuYW50SWQiOiJ4ZXZuIiwicm9sZUNvZGUiOiJncm91cF9jZW8ifQ.';

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

  it('AC-CD-F3-01: reads roleCode from portal JWT for context chip', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_ROLE);
    expect(getPortalJwtRoleCode()).toBe('group_ceo');
  });
});
