import { afterEach, describe, expect, it } from 'vitest';
import {
  getPortalJwtCatalogCompanyId,
  getPortalJwtCompanyId,
  getPortalJwtEssCompanyId,
  getPortalJwtRoleCode,
  resolveHrmMutateCompanyScope,
  resolveHrmSettingsCatalogScope,
  resolveHrmSpreadsheetScope,
} from './hrmSpreadsheetScope';

const STORAGE_TOKEN = 'xevn.portal.accessToken';

/** JWT payload: { companyId: "main", tenantId: "xevn" } */
const JWT_MAIN =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJtYWluIiwidGVuYW50SWQiOiJ4ZXZuIn0.';

/** JWT payload: { companyId: "main", tenantId: "xevn", roleCode: "group_ceo" } */
const JWT_ROLE =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJtYWluIiwidGVuYW50SWQiOiJ4ZXZuIiwicm9sZUNvZGUiOiJncm91cF9jZW8ifQ.';

/** JWT payload: { companyId: "trsport", tenantId: "xevn" } — member mgr AP */
const JWT_TRSPORT =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJ0cnNwb3J0IiwidGVuYW50SWQiOiJ4ZXZuIn0.';

/** JWT payload: { companyId: "holding", tenantId: "xevn" } — ESS uat.nv0001 */
const JWT_HOLDING =
  'eyJhbGciOiJub25lIn0.eyJjb21wYW55SWQiOiJob2xkaW5nIiwidGVuYW50SWQiOiJ4ZXZuIn0.';

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

  it('U78-U84 AP: mutate scope uses member JWT company — not catalog main rollup', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_TRSPORT);
    expect(getPortalJwtCompanyId()).toBe('trsport');
    // Catalog helper still anchors master-tenant portal to main (must_keep).
    expect(
      resolveHrmSpreadsheetScope('trsport', '?portal=1&tenantId=xevn&companyId=trsport')?.companyId,
    ).toBe('main');
    // Mutate helper must send operating unit for approve header (L1 201 with trsport).
    const mutate = resolveHrmMutateCompanyScope(
      'trsport',
      '?portal=1&tenantId=xevn&companyId=trsport',
    );
    expect(mutate?.companyId).toBe('trsport');
    expect(mutate?.tenantId).toBe('xevn');
  });

  it('U78-U84 AP: mutate scope prefers OU hint when JWT is rollup main', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_MAIN);
    const mutate = resolveHrmMutateCompanyScope(
      'trsport',
      '?portal=1&tenantId=xevn&companyId=trsport',
    );
    expect(mutate?.companyId).toBe('trsport');
  });

  it('PO-UC-TC-W4 CREATE-CATALOG: settings catalog scope uses member JWT OU (not spreadsheet main)', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_TRSPORT);
    expect(getPortalJwtCatalogCompanyId()).toBe('trsport');
    // Spreadsheet / import still anchors master-tenant portal to main (must_keep).
    expect(
      resolveHrmSpreadsheetScope('trsport', '?portal=1&tenantId=xevn&companyId=trsport')?.companyId,
    ).toBe('main');
    // Leave picker + sync-from-xbos must hit trsport partition (BE create assert parity).
    expect(
      resolveHrmSettingsCatalogScope('trsport', '?portal=1&tenantId=xevn&companyId=trsport')
        ?.companyId,
    ).toBe('trsport');
  });

  it('PO-UC-TC-W4 CREATE-CATALOG: Group CEO catalog scope stays main (BE→holding)', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_MAIN);
    expect(getPortalJwtCatalogCompanyId()).toBeNull();
    expect(
      resolveHrmSettingsCatalogScope('trsport', '?portal=1&tenantId=xevn&companyId=trsport')
        ?.companyId,
    ).toBe('main');
  });

  it('D-PAY-ESS-FE-SCOPE-COERCE: ESS JWT preserves holding (not null/main)', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_HOLDING);
    expect(getPortalJwtCompanyId()).toBeNull(); // rollup sentinel helper
    expect(getPortalJwtCatalogCompanyId()).toBe('holding');
    expect(getPortalJwtEssCompanyId()).toBe('holding');
  });

  it('D-PAY-ESS-FE-SCOPE-COERCE: ESS JWT keeps main for CEO 403 path', () => {
    sessionStorage.setItem(STORAGE_TOKEN, JWT_MAIN);
    expect(getPortalJwtEssCompanyId()).toBe('main');
  });
});
