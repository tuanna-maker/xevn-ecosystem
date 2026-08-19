/**
 * @CODE-MEMORY
 * WorkItem: PO-UC-TC-W3-FE-DM09
 * Purpose: Unit tests for XBOS-DM-09 clone catalog body builders + error code surfacing.
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-DM09
 * change_mode: ADD
 * What: Assert dest resolve, body onConflict=reject, VAL-013 self-copy, CFG-409 extract
 */
import { describe, expect, it } from 'vitest';
import type { Company } from '../data/mock-data';
import { GROUP_HOLDING_COMPANY_ID, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import {
  CLONE_CATALOG_KEYS,
  buildCloneCatalogBody,
  extractXbosErrorCode,
  formatCloneCatalogUserError,
  listCloneMemberCandidates,
  resolveCloneDestFromMember,
} from './configSyncCloneCatalog';

function company(partial: Partial<Company> & Pick<Company, 'id' | 'code' | 'name'>): Company {
  return {
    employeeCount: 0,
    revenue: 0,
    status: 'active',
    address: '',
    establishedDate: '2020-01-01',
    entityLevel: 'subsidiary',
    ...partial,
  };
}

describe('configSyncCloneCatalog (PO-UC-TC-W3-FE-DM09)', () => {
  it('exposes P0∪P1 catalog keys for DM-09 UI (not apply-to-members semantics)', () => {
    expect([...CLONE_CATALOG_KEYS]).toContain('job_titles');
    expect([...CLONE_CATALOG_KEYS]).toContain('leave_types');
    expect([...CLONE_CATALOG_KEYS]).toContain('contract_types');
  });

  it('listCloneMemberCandidates excludes holding root', () => {
    const rows = [
      company({
        id: GROUP_HOLDING_ROOT_ID,
        code: 'HOLD',
        name: 'Holding',
        entityLevel: 'parent',
        tenantId: MASTER_TENANT_ID,
      }),
      company({
        id: 'xe-du-lich-row',
        code: 'XDL',
        name: 'Xe Du Lịch',
        entityLevel: 'subsidiary',
        tenantId: 'xe-du-lich',
      }),
    ];
    expect(listCloneMemberCandidates(rows).map((r) => r.id)).toEqual(['xe-du-lich-row']);
  });

  it('resolveCloneDestFromMember: member tenant → companyId main', () => {
    const dest = resolveCloneDestFromMember(
      company({
        id: 'xe-du-lich-row',
        code: 'XDL',
        name: 'Xe Du Lịch',
        tenantId: 'xe-du-lich',
      }),
    );
    expect(dest).toEqual({
      destTenantId: 'xe-du-lich',
      destCompanyId: MEMBER_DEFAULT_COMPANY_ID,
    });
  });

  it('buildCloneCatalogBody defaults onConflict=reject + holding source', () => {
    const body = buildCloneCatalogBody({
      destMember: company({
        id: 'xe-du-lich-row',
        code: 'XDL',
        name: 'Xe Du Lịch',
        tenantId: 'xe-du-lich',
      }),
      actor: 'ceo@xe.vn',
    });
    expect(body).toEqual({
      tenantId: MASTER_TENANT_ID,
      companyId: GROUP_HOLDING_COMPANY_ID,
      destTenantId: 'xe-du-lich',
      destCompanyId: MEMBER_DEFAULT_COMPANY_ID,
      onConflict: 'reject',
      actor: 'ceo@xe.vn',
    });
  });

  it('resolveCloneDestFromMember rejects holding-only row (no dest target)', () => {
    expect(() =>
      resolveCloneDestFromMember(
        company({
          id: GROUP_HOLDING_COMPANY_ID,
          code: 'HOLD',
          name: 'Holding',
          tenantId: MASTER_TENANT_ID,
          entityLevel: 'parent',
        }),
      ),
    ).toThrow(/Không xác định được phạm vi đích/);
  });

  it('extractXbosErrorCode + formatCloneCatalogUserError surface CFG-409', () => {
    const withCode =
      'config-sync.clone-catalog failed: Clone blocked · XBOS-CFG-409 (HTTP 409)';
    expect(extractXbosErrorCode(withCode)).toBe('XBOS-CFG-409');
    expect(formatCloneCatalogUserError(new Error(withCode))).toContain('XBOS-CFG-409');

    const bare409 =
      'config-sync.clone-catalog failed: overlapping item codes (HTTP 409)';
    expect(formatCloneCatalogUserError(new Error(bare409))).toContain('XBOS-CFG-409');
  });
});
