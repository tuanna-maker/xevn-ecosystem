/**
 * @CODE-MEMORY
 * WorkItem: BM-FE-CFG-APPLY-MEMBERS-01 · D-FE-XBOS-CTRL-G1-ALLOWLIST-01
 * Purpose: Unit tests for apply-to-members payload builders + allow-list.
 *
 * @CODE-MEMORY-CHANGE 2026-07-29 D-FE-XBOS-CTRL-G1-ALLOWLIST-01
 * change_mode: ADD
 * What: Assert P0∪P1 10 keys; DEC alias hr_decision_types; writeKey bind; Tier C/P2 reject
 */
import { describe, expect, it } from 'vitest';
import type { Company } from '../data/mock-data';
import { GROUP_HOLDING_COMPANY_ID, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import {
  APPLY_TO_MEMBERS_CATALOG_KEYS,
  buildApplyCatalogTargets,
  buildApplyCatalogToMembersBody,
  isApplyToMembersCatalogKey,
  listApplyMemberCandidates,
  resolveApplyToMembersCanonicalKey,
  resolveApplyWriteKey,
} from './configSyncApplyMembers';

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

describe('configSyncApplyMembers (BM-FE-CFG-APPLY-MEMBERS-01)', () => {
  it('allow-list is P0∪P1 (10 keys) mirroring BE G1', () => {
    expect([...APPLY_TO_MEMBERS_CATALOG_KEYS]).toEqual([
      'job_titles',
      'recruitment_channels',
      'job_grades',
      'departments',
      'leave_types',
      'contract_types',
      'employment_types',
      'pay_types',
      'shifts',
      'decision_types',
    ]);
    expect(isApplyToMembersCatalogKey('job_titles')).toBe(true);
    expect(isApplyToMembersCatalogKey('departments')).toBe(true);
    expect(isApplyToMembersCatalogKey('leave_types')).toBe(true);
    expect(isApplyToMembersCatalogKey('decision_types')).toBe(true);
    expect(isApplyToMembersCatalogKey('hr_decision_types')).toBe(true);
    // Tier C / P2 remain rejected on FE allow-list
    expect(isApplyToMembersCatalogKey('cost_centers')).toBe(false);
    expect(isApplyToMembersCatalogKey('salary_components')).toBe(false);
  });

  it('DEC alias: hr_decision_types → decision_types; writeKey prefers source L0', () => {
    expect(resolveApplyToMembersCanonicalKey('hr_decision_types')).toBe('decision_types');
    expect(resolveApplyWriteKey('decision_types', 'hr_decision_types')).toBe('hr_decision_types');
    expect(resolveApplyWriteKey('decision_types', 'decision_types')).toBe('decision_types');
    expect(resolveApplyWriteKey('decision_types', null)).toBe('decision_types');
    expect(resolveApplyWriteKey('departments', 'hr_decision_types')).toBe('departments');
  });

  it('listApplyMemberCandidates excludes holding synthetic root and parent rows', () => {
    const rows = [
      company({
        id: GROUP_HOLDING_ROOT_ID,
        code: 'HOLD',
        name: 'Holding',
        entityLevel: 'parent',
        tenantId: MASTER_TENANT_ID,
      }),
      company({
        id: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
        code: 'VISUN',
        name: 'Visun',
        entityLevel: 'subsidiary',
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
    const candidates = listApplyMemberCandidates(rows);
    expect(candidates.map((c) => c.id)).toEqual([
      'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
      'xe-du-lich-row',
    ]);
  });

  it('buildApplyCatalogTargets: master-tenant UUID + member-tenant main', () => {
    const targets = buildApplyCatalogTargets([
      company({
        id: GROUP_HOLDING_ROOT_ID,
        code: 'HOLD',
        name: 'Holding',
        entityLevel: 'parent',
        tenantId: MASTER_TENANT_ID,
      }),
      company({
        id: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
        code: 'VISUN',
        name: 'Visun',
        tenantId: MASTER_TENANT_ID,
      }),
      company({
        id: 'any-uuid',
        code: 'XDL',
        name: 'Xe Du Lịch',
        tenantId: 'xe-du-lich',
      }),
    ]);
    expect(targets).toEqual([
      {
        tenantId: MASTER_TENANT_ID,
        companyId: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
      },
      { tenantId: 'xe-du-lich', companyId: MEMBER_DEFAULT_COMPANY_ID },
    ]);
  });

  it('buildApplyCatalogToMembersBody sources holding + selected targets + actor', () => {
    const body = buildApplyCatalogToMembersBody({
      selectedMembers: [
        company({
          id: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
          code: 'VISUN',
          name: 'Visun',
          tenantId: MASTER_TENANT_ID,
        }),
      ],
      actor: 'ceo@xe.vn',
    });
    expect(body).toEqual({
      tenantId: MASTER_TENANT_ID,
      companyId: GROUP_HOLDING_COMPANY_ID,
      targets: [
        {
          tenantId: MASTER_TENANT_ID,
          companyId: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
        },
      ],
      actor: 'ceo@xe.vn',
    });
  });
});
