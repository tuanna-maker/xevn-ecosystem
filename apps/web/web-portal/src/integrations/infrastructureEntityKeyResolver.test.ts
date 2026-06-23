import { describe, expect, it } from 'vitest';
import { GROUP_HOLDING_COMPANY_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import {
  infraEntityIdsMatch,
  isOperatingEntityInFoundationScope,
  resolveInfraEntityConfigKeys,
  resolveInfraScopedRecord,
} from './infrastructureEntityKeyResolver';

const VISUN_ID = 'eb3fb3fc-0081-446b-8d99-2b398dddc709';

describe('infrastructureEntityKeyResolver (J-XBOS-05)', () => {
  it('matches holding UI id with main and holding scope ids', () => {
    expect(infraEntityIdsMatch(GROUP_HOLDING_ROOT_ID, MEMBER_DEFAULT_COMPANY_ID)).toBe(true);
    expect(infraEntityIdsMatch(MEMBER_DEFAULT_COMPANY_ID, GROUP_HOLDING_COMPANY_ID)).toBe(true);
    expect(infraEntityIdsMatch(GROUP_HOLDING_ROOT_ID, VISUN_ID)).toBe(false);
  });

  it('resolveInfraEntityConfigKeys expands holding aliases', () => {
    const keys = resolveInfraEntityConfigKeys(GROUP_HOLDING_ROOT_ID, []);
    expect(keys).toContain(MEMBER_DEFAULT_COMPANY_ID);
    expect(keys).toContain(GROUP_HOLDING_ROOT_ID);
    expect(keys).toContain(GROUP_HOLDING_COMPANY_ID);
  });

  it('resolveInfraScopedRecord reads defs stored under main for holding site', () => {
    const defs = [
      { id: 'c1', fieldCode: 'qa_w2', labelVi: 'QA W2 Infra Custom', blockCode: 'general', visible: true },
    ];
    const merged = resolveInfraScopedRecord(
      GROUP_HOLDING_ROOT_ID,
      { [MEMBER_DEFAULT_COMPANY_ID]: defs },
      [],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.labelVi).toBe('QA W2 Infra Custom');
  });

  it('resolveInfraScopedRecord inherits main defs for member in shared foundation scope', () => {
    const defs = [
      { id: 'c1', fieldCode: 'qa_w2', labelVi: 'QA W2 Infra Custom', blockCode: 'general', visible: true },
    ];
    const merged = resolveInfraScopedRecord(
      VISUN_ID,
      { [MEMBER_DEFAULT_COMPANY_ID]: defs },
      [{ appliesToCompanyIds: [GROUP_HOLDING_ROOT_ID, VISUN_ID] }],
    );
    expect(merged).toHaveLength(1);
  });

  it('isOperatingEntityInFoundationScope is alias-aware for main vs holding root', () => {
    const categories = [{ appliesToCompanyIds: [MEMBER_DEFAULT_COMPANY_ID, VISUN_ID] }];
    expect(isOperatingEntityInFoundationScope(GROUP_HOLDING_ROOT_ID, categories)).toBe(true);
    expect(isOperatingEntityInFoundationScope('11d2bb7b-out-of-scope', categories)).toBe(false);
  });
});
