import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  assertCrossTenantCleanupAllowed,
  assertMasterGroupBootstrapScope,
  assertTenantScopedDeleteSql,
  MASTER_BOOTSTRAP_COMPANY_ID,
  resolveMemberBootstrapCompanyId,
} from './tenant-bootstrap.policy';

/**
 * UC-ECO-MASTER-02 — Mở rộng tenant mới với tenant master (SRS §8.2).
 * L4 catalog: direct jest refs in this file.
 */
describe('UC-ECO-MASTER-02 tenant bootstrap policy', () => {
  it('allows master group bootstrap only on xevn + holding', () => {
    expect(() =>
      assertMasterGroupBootstrapScope({ tenantId: 'xevn', companyId: MASTER_BOOTSTRAP_COMPANY_ID }),
    ).not.toThrow();
  });

  it('rejects bootstrap catalog scope on member tenant (no cross-tenant overwrite)', () => {
    try {
      assertMasterGroupBootstrapScope({ tenantId: 'xe-du-lich', companyId: 'main' });
      fail('expected XBOS-TENANT-400');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiException);
      expect((error as ApiException).code).toBe('XBOS-TENANT-400');
      expect((error as ApiException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });

  it('resolves member default company as main while master uses holding', () => {
    expect(resolveMemberBootstrapCompanyId('xevn')).toBe(MASTER_BOOTSTRAP_COMPANY_ID);
    expect(resolveMemberBootstrapCompanyId('visun')).toBe('main');
    expect(resolveMemberBootstrapCompanyId('xevn', 'holding')).toBe(MASTER_BOOTSTRAP_COMPANY_ID);
  });

  it('blocks cross-tenant cleanup without explicit admin protection flag', () => {
    expect(() =>
      assertCrossTenantCleanupAllowed({ targetTenantId: 'xe-vietnam', explicitAdminFlag: false }),
    ).toThrow(ApiException);
    expect(() =>
      assertCrossTenantCleanupAllowed({ targetTenantId: 'xe-vietnam', explicitAdminFlag: true }),
    ).not.toThrow();
  });

  it('requires tenant_id predicate on destructive SQL (seed clearTenantOrg pattern)', () => {
    expect(() =>
      assertTenantScopedDeleteSql(
        'DELETE FROM public.xbos_org_unit WHERE tenant_id = $1',
        'xe-du-lich',
      ),
    ).not.toThrow();
    expect(() => assertTenantScopedDeleteSql('DELETE FROM public.xbos_org_unit', 'xe-du-lich')).toThrow(
      /tenant_id/,
    );
  });
});
