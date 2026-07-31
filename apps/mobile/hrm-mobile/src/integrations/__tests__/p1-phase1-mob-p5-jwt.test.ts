import { describe, expect, it } from 'vitest';
import { resolveWireCompanyId } from '../companyWireScope';
import { resolveHrmCompanyHeaderId, resolveHrmWriteHeaderId } from '../hrmApiClient';

/** Mirrors UAT `authHeaders` + P5 body — Plane B′ `HRM_COMPANY_UUID_BY_SLUG` (not SHA256 hash). */
describe('P1-PHASE1-MOB-P5-JWT-01 attendance write scope', () => {
  const holdingUuid = '10000000-0000-4000-8000-000000000001';

  it('GET header uses membership slug; write header and body use Plane B′ UUID', () => {
    const scope = {
      companyId: 'holding',
      companyUuid: holdingUuid,
      tenantId: 'xevn',
      employeeId: '11111111-1111-4111-8111-111111111111',
    };
    expect(resolveHrmCompanyHeaderId(scope.companyUuid, scope.companyId)).toBe('holding');
    expect(resolveHrmWriteHeaderId(scope.companyUuid, scope.companyId)).toBe(holdingUuid);
    expect(resolveWireCompanyId(scope)).toBe(holdingUuid);
  });

  it('main rollup still maps header to legal UUID', () => {
    const duLichUuid = '7b626710-02eb-4a39-89c5-e9a90ecc74ff';
    expect(resolveHrmCompanyHeaderId(duLichUuid, 'main')).toBe(duLichUuid);
    expect(resolveHrmWriteHeaderId(duLichUuid, 'main')).toBe(duLichUuid);
    expect(resolveWireCompanyId({ companyUuid: duLichUuid, companyId: 'main' })).toBe(duLichUuid);
  });
});
