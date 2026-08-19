/**
 * @CODE-MEMORY
 * WorkItem: PO-UC-TC-W3-FE-LOG09
 * Purpose: Unit tests for clone-bundle payload builders + logistics dest resolve.
 */
import { describe, expect, it } from 'vitest';
import type { Company } from '../data/mock-data';
import { GROUP_HOLDING_COMPANY_ID, MASTER_TENANT_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import {
  CLONE_BUNDLE_LOGISTICS_DOMAINS,
  buildCloneCatalogBundleBody,
  ensureLogisticsCloneDestOption,
  formatCloneBundleSuccessMessage,
  listCloneBundleDestCandidates,
  resolveCloneBundleDestScope,
} from './configSyncCloneBundle';

function company(partial: Partial<Company> & Pick<Company, 'id' | 'code' | 'name'>): Company {
  return {
    employeeCount: 0,
    revenue: 0,
    status: 'active',
    address: '',
    establishedDate: '2020-01-01',
    entityLevel: 'subsidiary',
    tenantId: MASTER_TENANT_ID,
    ...partial,
  };
}

describe('configSyncCloneBundle (PO-UC-TC-W3-FE-LOG09)', () => {
  it('LOG-09 domains constant is logistics only', () => {
    expect([...CLONE_BUNDLE_LOGISTICS_DOMAINS]).toEqual(['logistics']);
  });

  it('excludes holding synthetic root from dest candidates', () => {
    const rows = [
      company({
        id: GROUP_HOLDING_ROOT_ID,
        code: 'HOLD',
        name: 'Holding',
        entityLevel: 'parent',
      }),
      company({ id: 'logistics', code: 'LGTS', name: 'Logistics' }),
    ];
    const candidates = listCloneBundleDestCandidates(rows);
    expect(candidates.map((r) => r.id)).toEqual(['logistics']);
  });

  it('maps LGTS / logistics aliases to catalog partition logistics', () => {
    expect(resolveCloneBundleDestScope(company({ id: 'lgts', code: 'LGTS', name: 'LGTS' }))).toEqual(
      { tenantId: MASTER_TENANT_ID, companyId: 'logistics' },
    );
    expect(
      resolveCloneBundleDestScope(company({ id: 'uuid-1', code: 'LGTS', name: 'Logistics' })),
    ).toEqual({ tenantId: MASTER_TENANT_ID, companyId: 'logistics' });
    expect(
      resolveCloneBundleDestScope(company({ id: 'logistics', code: 'X', name: 'Logistics' })),
    ).toEqual({ tenantId: MASTER_TENANT_ID, companyId: 'logistics' });
  });

  it('keeps non-logistics master member id as dest companyId', () => {
    expect(
      resolveCloneBundleDestScope(
        company({ id: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665', code: 'VISUN', name: 'Visun' }),
      ),
    ).toEqual({
      tenantId: MASTER_TENANT_ID,
      companyId: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
    });
  });

  it('ensureLogisticsCloneDestOption injects synthetic logistics when missing', () => {
    const onlyVisun = [
      company({ id: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665', code: 'VISUN', name: 'Visun' }),
    ];
    const withLog = ensureLogisticsCloneDestOption(onlyVisun);
    expect(withLog.some((r) => resolveCloneBundleDestScope(r).companyId === 'logistics')).toBe(true);
  });

  it('buildCloneCatalogBundleBody sources holding + domains logistics + dest logistics', () => {
    const body = buildCloneCatalogBundleBody({
      destMember: company({ id: 'logistics', code: 'LGTS', name: 'Logistics' }),
      actor: 'ceo@xe.vn',
      onConflict: 'overwrite',
      keyPrefix: 'log_dm_',
    });
    expect(body).toEqual({
      sourceTenantId: MASTER_TENANT_ID,
      sourceCompanyId: GROUP_HOLDING_COMPANY_ID,
      destTenantId: MASTER_TENANT_ID,
      destCompanyId: 'logistics',
      domains: ['logistics'],
      onConflict: 'overwrite',
      keyPrefix: 'log_dm_',
      actor: 'ceo@xe.vn',
    });
    expect(body.domains).not.toContain('hrm');
  });

  it('rejects source==dest', () => {
    expect(() =>
      buildCloneCatalogBundleBody({
        destMember: company({
          id: GROUP_HOLDING_COMPANY_ID,
          code: 'HOLD',
          name: 'Holding',
        }),
      }),
    ).toThrow(/VAL-013|khác nguồn/i);
  });

  it('formatCloneBundleSuccessMessage surfaces XBOS-CFG-205', () => {
    const msg = formatCloneBundleSuccessMessage({
      code: 'XBOS-CFG-205',
      data: {
        source: { tenantId: 'xevn', companyId: 'holding' },
        dest: { tenantId: 'xevn', companyId: 'logistics' },
        domains: ['logistics'],
        keyPrefix: 'log_dm_',
        onConflict: 'overwrite',
        matchedCount: 92,
        copied: [
          { catalogKey: 'log_dm_1', version: 2, checksum: 'sha256:a', domain: 'logistics' },
          { catalogKey: 'log_dm_10', version: 2, checksum: 'sha256:b', domain: 'logistics' },
        ],
        skipped: [],
        copiedCount: 92,
        skippedCount: 0,
      },
    });
    expect(msg).toContain('XBOS-CFG-205');
    expect(msg).toContain('92');
    expect(msg).toContain('log_dm_1');
  });

  it('source contract documents clone-bundle path — not apply-to-members or single-key clone', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const src = readFileSync(resolve(__dirname, './configSyncCloneBundle.ts'), 'utf8');
    expect(src).toContain('/config-sync/catalogs/clone-bundle');
    expect(src).not.toContain('/apply-to-members');
    expect(src).not.toMatch(/catalog\/\$\{.*\}\/clone/);
  });
});
