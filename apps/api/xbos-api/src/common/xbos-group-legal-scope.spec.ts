import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { signServiceJwt } from './jwt-sign';
import {
  assertJwtMayReadLegalEntityPartition,
  isLegalEntityUuid,
  resolveRaciMatrixJwtScope,
  resolveXbosGroupLegalMutationScopeContext,
  resolveXbosGroupLegalReadScopeContext,
  XBOS_GROUP_LEGAL_HOLDING,
  XBOS_GROUP_OPERATING_MAIN,
} from './xbos-group-legal-scope';

describe('resolveXbosGroupLegalReadScopeContext (ADR C2)', () => {
  it('maps group CEO JWT main to holding for catalog/org/audit reads', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: XBOS_GROUP_LEGAL_HOLDING });
  });

  it('maps group CEO JWT main with explicit query holding to holding (UF-XBOS-14 browser GET)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: XBOS_GROUP_LEGAL_HOLDING,
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: XBOS_GROUP_LEGAL_HOLDING });
  });

  it('PO-UC-TC-W3-BE-LOG09-SCOPE: group CEO JWT main may read logistics catalog partition (dest verify)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: 'logistics',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'logistics' });
  });

  it('PO-UC-TC-W3-BE-LOG09-SCOPE: group CEO still 409 on unknown company slug', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    expect(() =>
      resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: 'other-company',
      }),
    ).toThrow(expect.objectContaining<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' }));
  });

  it('maps group CEO JWT main with omitted companyId to holding', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, { tenantId: 'xevn' });
    expect(scope.companyId).toBe(XBOS_GROUP_LEGAL_HOLDING);
  });

  it('allows group CEO JWT main to read member registry tenant xe-du-lich (edit preload)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(scope).toEqual({ tenantId: 'xe-du-lich', companyId: XBOS_GROUP_OPERATING_MAIN });
  });

  it('does not alias member CEO on main', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'company_ceo',
    });
    const scope = resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(scope).toEqual({ tenantId: 'xe-du-lich', companyId: XBOS_GROUP_OPERATING_MAIN });
  });

  it('U28: member CEO blocked on group rollup (xevn/main headers)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'company_ceo',
    });
    try {
      resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: XBOS_GROUP_OPERATING_MAIN,
      });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
    }
  });

  it('detects legal-entity UUID path keys', () => {
    expect(isLegalEntityUuid('a1b2c3d4-e5f6-4789-a012-3456789abcde')).toBe(true);
    expect(isLegalEntityUuid('main')).toBe(false);
  });

  it('resolveRaciMatrixJwtScope: group CEO ignores conflicting member tenant header', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveRaciMatrixJwtScope(`Bearer ${token}`, {
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: XBOS_GROUP_OPERATING_MAIN });
  });

  it('assertJwtMayReadLegalEntityPartition: group CEO may read member partition', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    expect(() =>
      assertJwtMayReadLegalEntityPartition(`Bearer ${token}`, { tenantId: 'xevn', companyId: 'main' }, {
        tenantId: 'xe-du-lich',
        companyId: 'main',
      }),
    ).not.toThrow();
  });

  it('org-foundation GET parity: partition assert blocks member CEO cross-tenant UUID', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'company_ceo',
    });
    const jwtScope = resolveRaciMatrixJwtScope(`Bearer ${token}`, {
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(() =>
      assertJwtMayReadLegalEntityPartition(`Bearer ${token}`, jwtScope, {
        tenantId: 'xe-vtc',
        companyId: 'main',
      }),
    ).toThrow(expect.objectContaining<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' }));
  });

  it('assertJwtMayReadLegalEntityPartition: member CEO cannot read other tenant', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'company_ceo',
    });
    try {
      assertJwtMayReadLegalEntityPartition(`Bearer ${token}`, { tenantId: 'xe-du-lich', companyId: 'main' }, {
        tenantId: 'xe-vtc',
        companyId: 'main',
      });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
    }
  });

  it('still rejects JWT holding vs request main (no reverse alias)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_LEGAL_HOLDING,
    });
    try {
      resolveXbosGroupLegalReadScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: XBOS_GROUP_OPERATING_MAIN,
      });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
      expect((error as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });
});

describe('resolveXbosGroupLegalMutationScopeContext (P1-CC-BE-MEMBER-LEGAL-SAVE-01)', () => {
  it('maps group CEO holding write to xevn/holding partition', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalMutationScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: XBOS_GROUP_LEGAL_HOLDING,
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: XBOS_GROUP_LEGAL_HOLDING });
  });

  it('allows group CEO JWT main to mutate member registry tenant xe-tmdv', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalMutationScopeContext(`Bearer ${token}`, {
      tenantId: 'xe-tmdv',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(scope).toEqual({ tenantId: 'xe-tmdv', companyId: XBOS_GROUP_OPERATING_MAIN });
  });

  it('allows member company slug as companyId for member tenant mutation', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'group_ceo',
    });
    const scope = resolveXbosGroupLegalMutationScopeContext(`Bearer ${token}`, {
      tenantId: 'xe-tmdv',
      companyId: 'xe-tmdv',
    });
    expect(scope).toEqual({ tenantId: 'xe-tmdv', companyId: 'xe-tmdv' });
  });

  it('does not bypass strict scope for member CEO', () => {
    const token = signServiceJwt({
      sub: 'tmdv.ceo@xe.vn',
      tenantId: 'xe-tmdv',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'company_ceo',
    });
    const scope = resolveXbosGroupLegalMutationScopeContext(`Bearer ${token}`, {
      tenantId: 'xe-tmdv',
      companyId: XBOS_GROUP_OPERATING_MAIN,
    });
    expect(scope).toEqual({ tenantId: 'xe-tmdv', companyId: XBOS_GROUP_OPERATING_MAIN });
  });

  it('rejects member CEO mutating another tenant partition', () => {
    const token = signServiceJwt({
      sub: 'tmdv.ceo@xe.vn',
      tenantId: 'xe-tmdv',
      companyId: XBOS_GROUP_OPERATING_MAIN,
      roleCode: 'company_ceo',
    });
    try {
      resolveXbosGroupLegalMutationScopeContext(`Bearer ${token}`, {
        tenantId: 'xe-du-lich',
        companyId: XBOS_GROUP_OPERATING_MAIN,
      });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
    }
  });

  it('still rejects JWT holding vs request main on mutation', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: XBOS_GROUP_LEGAL_HOLDING,
    });
    try {
      resolveXbosGroupLegalMutationScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: XBOS_GROUP_OPERATING_MAIN,
      });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
    }
  });
});
