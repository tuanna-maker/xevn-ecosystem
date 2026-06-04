import { describe, expect, it } from 'vitest';
import { resolveLegalEntityApiIdFromList } from './legalEntityIdResolver';
import type { LegalEntityApiRow } from './orgFoundationApi';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

const LEGAL_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

function row(partial: Partial<LegalEntityApiRow> & Pick<LegalEntityApiRow, 'tenant_id' | 'code' | 'name'>): LegalEntityApiRow {
  return {
    id: LEGAL_UUID,
    tenant_id: partial.tenant_id,
    company_id: 'main',
    code: partial.code,
    name: partial.name,
    ...partial,
  };
}

describe('legalEntityIdResolver (UC-CC-03)', () => {
  const entities = [
    row({ tenant_id: 'xe-du-lich', code: 'XDL', name: 'Du lịch', id: LEGAL_UUID }),
  ];

  it('resolves holding root via entity_type holding', () => {
    const holdingUuid = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
    const withHolding = [
      ...entities,
      row({
        tenant_id: 'xevn',
        code: 'XEVN',
        name: 'Tap doan',
        id: holdingUuid,
        entity_type: 'holding',
        company_id: 'holding',
      }),
    ];
    expect(
      resolveLegalEntityApiIdFromList({ id: GROUP_HOLDING_ROOT_ID, code: 'XEVN', tenantId: 'xevn' }, withHolding),
    ).toBe(holdingUuid);
  });

  it('returns null for holding root when no holding row in API list', () => {
    expect(
      resolveLegalEntityApiIdFromList({ id: GROUP_HOLDING_ROOT_ID, code: 'XEVN', tenantId: 'xevn' }, entities),
    ).toBeNull();
  });

  it('matches legal-entity UUID from group-member-units', () => {
    expect(
      resolveLegalEntityApiIdFromList(
        { id: LEGAL_UUID, code: 'XDL', tenantId: 'xe-du-lich' },
        entities,
      ),
    ).toBe(LEGAL_UUID);
  });

  it('maps member row when UI id is tenant_id (legacy)', () => {
    expect(
      resolveLegalEntityApiIdFromList(
        { id: 'xe-du-lich', code: 'XDL', tenantId: 'xe-du-lich' },
        entities,
      ),
    ).toBe(LEGAL_UUID);
  });

  it('maps by tenant + code when UI id is stale', () => {
    expect(
      resolveLegalEntityApiIdFromList(
        { id: 'stale-row-id', code: 'XDL', tenantId: 'xe-du-lich' },
        entities,
      ),
    ).toBe(LEGAL_UUID);
  });

  it('BR-ORG-LINK-01: feeds CompanyRaciPanel scope (resolved UUID, not tenant slug)', () => {
    const resolved = resolveLegalEntityApiIdFromList(
      { id: 'xe-du-lich', code: 'XDL', tenantId: 'xe-du-lich' },
      entities,
    );
    expect(resolved).toBe(LEGAL_UUID);
    expect(resolved).not.toBe('xe-du-lich');
  });

  it('returns null for unknown slug without legal-entity seed (no 404 loop)', () => {
    expect(
      resolveLegalEntityApiIdFromList(
        { id: 'xe-unknown-unit', code: 'UNK', tenantId: 'xe-unknown' },
        entities,
      ),
    ).toBeNull();
  });
});
