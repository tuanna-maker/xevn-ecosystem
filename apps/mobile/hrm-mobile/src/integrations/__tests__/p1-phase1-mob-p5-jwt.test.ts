import { describe, expect, it } from 'vitest';
import { resolveWireCompanyId } from '../companyWireScope';
import { resolveHrmCompanyHeaderId, resolveHrmWriteHeaderId } from '../hrmApiClient';

/** Mirrors UAT `authHeaders` + P5 body contract for uat.nv####@xe.vn workforce. */
describe('P1-PHASE1-MOB-P5-JWT-01 attendance write scope', () => {
  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';

  it('GET header uses membership slug; write header and body use legal UUID', () => {
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
