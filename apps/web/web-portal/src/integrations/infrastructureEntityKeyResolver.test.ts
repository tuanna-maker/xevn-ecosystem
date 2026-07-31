import { describe, expect, it } from 'vitest';
import { GROUP_HOLDING_COMPANY_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import {
  infraEntityIdsMatch,
  isForbiddenInfraScopeKey,
  isInfraScopeKeySelected,
  isOperatingEntityInFoundationScope,
  normalizeFoundationCategoriesScopeForPersist,
  normalizeInfraAppliesToCompanyIdsForPersist,
  resolveInfraEntityConfigKeys,
  resolveInfraScopedRecord,
  toggleInfraAppliesToCompanyId,
} from './infrastructureEntityKeyResolver';

const VISUN_ID = 'eb3fb3fc-0081-446b-8d99-2b398dddc709';
/** Plane B′ logistics — must never persist in appliesToCompanyIds. */
const B_PRIME_LOGISTICS = '10000000-0000-4000-8000-000000000003';

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

describe('AC-INF-KEY scope plane (D-XBOS-INF-SCOPE-KEY-PLANE-FE-01)', () => {
  it('AC-INF-KEY-01: tick member persists Plane A LE UUID', () => {
    const next = toggleInfraAppliesToCompanyId([], VISUN_ID);
    expect(next).toEqual([VISUN_ID]);
    expect(normalizeInfraAppliesToCompanyIdsForPersist(next)).toEqual([VISUN_ID]);
  });

  it('AC-INF-KEY-02: tick holding prefers xbos-group-holding-root', () => {
    expect(toggleInfraAppliesToCompanyId([], GROUP_HOLDING_ROOT_ID)).toEqual([GROUP_HOLDING_ROOT_ID]);
    expect(toggleInfraAppliesToCompanyId([], MEMBER_DEFAULT_COMPANY_ID)).toEqual([
      GROUP_HOLDING_ROOT_ID,
    ]);
    expect(toggleInfraAppliesToCompanyId([], GROUP_HOLDING_COMPANY_ID)).toEqual([
      GROUP_HOLDING_ROOT_ID,
    ]);
    expect(
      normalizeInfraAppliesToCompanyIdsForPersist([MEMBER_DEFAULT_COMPANY_ID, 'holding', VISUN_ID]),
    ).toEqual([GROUP_HOLDING_ROOT_ID, VISUN_ID]);
  });

  it('AC-INF-KEY-03: LE UUID in scope → custom fields visible via resolveInfraScopedRecord', () => {
    const defs = [
      { id: 'c1', fieldCode: 'site_cap', labelVi: 'Công suất', blockCode: 'general', visible: true },
    ];
    const merged = resolveInfraScopedRecord(
      VISUN_ID,
      { [VISUN_ID]: defs },
      [{ appliesToCompanyIds: [VISUN_ID] }],
    );
    expect(merged).toHaveLength(1);
    expect(isOperatingEntityInFoundationScope(VISUN_ID, [{ appliesToCompanyIds: [VISUN_ID] }])).toBe(
      true,
    );
  });

  it('AC-INF-KEY-04: holding-only scope does not claim member site in-scope', () => {
    const categories = [{ appliesToCompanyIds: [GROUP_HOLDING_ROOT_ID] }];
    expect(isOperatingEntityInFoundationScope(VISUN_ID, categories)).toBe(false);
    expect(isOperatingEntityInFoundationScope(GROUP_HOLDING_ROOT_ID, categories)).toBe(true);
  });

  it('AC-INF-KEY-05: F5 checkbox matches GET via exact + holding alias', () => {
    expect(isInfraScopeKeySelected(GROUP_HOLDING_ROOT_ID, [MEMBER_DEFAULT_COMPANY_ID])).toBe(true);
    expect(isInfraScopeKeySelected(GROUP_HOLDING_ROOT_ID, ['holding'])).toBe(true);
    expect(isInfraScopeKeySelected(GROUP_HOLDING_ROOT_ID, [GROUP_HOLDING_ROOT_ID])).toBe(true);
    expect(isInfraScopeKeySelected(VISUN_ID, [MEMBER_DEFAULT_COMPANY_ID])).toBe(false);
    expect(isInfraScopeKeySelected(VISUN_ID, [VISUN_ID])).toBe(true);
  });

  it('never writes B′ or workforce member slugs into appliesToCompanyIds', () => {
    expect(isForbiddenInfraScopeKey(B_PRIME_LOGISTICS)).toBe(true);
    expect(isForbiddenInfraScopeKey('logistics')).toBe(true);
    expect(isForbiddenInfraScopeKey('trsport')).toBe(true);
    expect(isForbiddenInfraScopeKey(VISUN_ID)).toBe(false);
    expect(isForbiddenInfraScopeKey(GROUP_HOLDING_COMPANY_ID)).toBe(false);

    expect(
      normalizeInfraAppliesToCompanyIdsForPersist([
        B_PRIME_LOGISTICS,
        'logistics',
        'trsport',
        'finance',
        'services',
        VISUN_ID,
        'main',
      ]),
    ).toEqual([VISUN_ID, GROUP_HOLDING_ROOT_ID]);

    expect(toggleInfraAppliesToCompanyId([VISUN_ID], 'logistics')).toEqual([VISUN_ID]);
    expect(toggleInfraAppliesToCompanyId([], B_PRIME_LOGISTICS)).toEqual([]);
  });

  it('normalizeFoundationCategoriesScopeForPersist collapses aliases per row', () => {
    const rows = normalizeFoundationCategoriesScopeForPersist([
      { id: 'a', appliesToCompanyIds: ['main', VISUN_ID, 'logistics'] },
      { id: 'b', appliesToCompanyIds: ['holding'] },
    ]);
    expect(rows[0]?.appliesToCompanyIds).toEqual([GROUP_HOLDING_ROOT_ID, VISUN_ID]);
    expect(rows[1]?.appliesToCompanyIds).toEqual([GROUP_HOLDING_ROOT_ID]);
  });

  it('untick holding removes all aliases', () => {
    expect(
      toggleInfraAppliesToCompanyId(
        [MEMBER_DEFAULT_COMPANY_ID, VISUN_ID],
        GROUP_HOLDING_ROOT_ID,
      ),
    ).toEqual([VISUN_ID]);
  });
});
