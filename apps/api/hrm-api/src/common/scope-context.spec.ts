import { HttpStatus } from '@nestjs/common';
import { signServiceJwt } from './jwt-sign';
import { resolveScopeContext } from './scope-context';
import { ApiException } from './api.exception';

describe('resolveScopeContext (UC-ECO-SCOPE-02)', () => {
  it('accepts portal x-tenant-id main when JWT tenant is xevn (J-HRM-06 embed alias)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'main',
      companyId: 'main',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'main' });
  });

  it('throws SCOPE_CONTEXT_MISMATCH when header tenant differs from token', () => {
    const token = signServiceJwt({
      sub: 'user-1',
      tenantId: 'xevn',
      companyId: 'main',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'other-tenant',
        companyId: 'main',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
        getStatus: expect.any(Function),
      }),
    );
  });

  it('throws SCOPE_CONTEXT_MISMATCH when header company differs from token', () => {
    const token = signServiceJwt({
      sub: 'user-1',
      tenantId: 'xevn',
      companyId: 'main',
    });
    try {
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: 'other-co',
      });
      fail('expected mismatch');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('SCOPE_CONTEXT_MISMATCH');
      expect((error as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });

  it('accepts group CEO operating slug filter when JWT companyId is main (AC-INT-SW-02)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    for (const slug of [
      'holding',
      'trsport',
      'logistics',
      'finance',
      'services',
    ] as const) {
      const scope = resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: slug,
      });
      expect(scope).toEqual({ tenantId: 'xevn', companyId: 'main' });
    }
  });

  it('rejects member CEO operating slug outside main bucket (ADR §5)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xe-du-lich',
        companyId: 'holding',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
      }),
    );
  });

  /**
   * PO-UC-TC-W4-BE-AU-MEMBER-MAIN-SCOPE-01 — TC-HRM-IM-03-SCOPE-AU corrected matrix:
   * - own tenant + main → accept (ADR §5 operating bucket; not holding rollup)
   * - group tenant xevn + main → 409
   * - holding slug → 409
   */
  it('PO-UC-TC-W4: member CEO accepts own company_id=main (ADR §5 own bucket)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    expect(scope).toEqual({ tenantId: 'xe-du-lich', companyId: 'main' });
  });

  it('PO-UC-TC-W4: member CEO blocked on group rollup headers xevn/main', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: 'main',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
        getStatus: expect.any(Function),
      }),
    );
    try {
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: 'main',
      });
    } catch (error) {
      expect((error as ApiException).getStatus()).toBe(HttpStatus.CONFLICT);
    }
  });

  it('PO-UC-TC-W4: member CEO blocked on company_id=holding (not own main)', () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xe-du-lich',
        companyId: 'holding',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
      }),
    );
  });

  it('accepts UUID request company_id when token has slug + matching company_uuid (mobile attendance)', () => {
    const companyUuid = '85945933-632a-4bca-8fe9-3bbe8bc9294b';
    const token = signServiceJwt({
      sub: 'uat0001@xevn.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: companyUuid,
      employee_id: 'emp-1',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: companyUuid,
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'holding' });
  });

  it('accepts slug header when body uses matching attendance company UUID', () => {
    const companyUuid = '85945933-632a-4bca-8fe9-3bbe8bc9294b';
    const token = signServiceJwt({
      sub: 'uat0001@xevn.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: companyUuid,
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: companyUuid,
    });
    expect(scope.companyId).toBe('holding');
  });

  it('throws SCOPE_CONTEXT_MISMATCH when UUID request does not match token company_uuid', () => {
    const token = signServiceJwt({
      sub: 'uat0001@xevn.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: '11111111-1111-4111-8111-111111111111',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
      }),
    );
  });

  it('throws SCOPE_CONTEXT_MISMATCH when token lacks company_uuid and request uses foreign UUID', () => {
    const token = signServiceJwt({
      sub: 'user-1',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
      }),
    );
  });

  it('U78-U84: accepts Plane B′ UUID header when token has matching operating slug without company_uuid', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0002@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      roleCode: 'employee',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: '10000000-0000-4000-8000-000000000002',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'trsport' });
  });

  it('U78-U84: member portal header main normalizes to JWT operating slug (mgr approve)', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0002@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      company_uuid: '10000000-0000-4000-8000-000000000002',
      roleCode: 'employee',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: 'main',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'trsport' });
  });

  it('U78-U84: group CEO header main stays main (does not rewrite to member slug)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: 'main',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'main' });
  });

  it('accepts group CEO pilot company_uuid on metadata submit (UF-HRM-11)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const holdingUuid = '10000000-0000-4000-8000-000000000001';
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: holdingUuid,
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'main' });
  });

  it('accepts mobile standalone group CEO JWT holding + request main (D-HRM-W2A-SCOPE-PARITY-01)', () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      employee_id: 'portal-gceo-uuid',
      roles: ['employee', 'manager', 'hr_manager'],
    });
    const scope = resolveScopeContext(`Bearer ${token}`, {
      tenantId: 'xevn',
      companyId: 'main',
    });
    expect(scope).toEqual({ tenantId: 'xevn', companyId: 'main' });
  });

  it('rejects holding JWT + main request for non-group mobile user', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      employee_id: 'emp-1',
      roles: ['employee'],
    });
    expect(() =>
      resolveScopeContext(`Bearer ${token}`, {
        tenantId: 'xevn',
        companyId: 'main',
      }),
    ).toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: 'SCOPE_CONTEXT_MISMATCH',
      }),
    );
  });
});
