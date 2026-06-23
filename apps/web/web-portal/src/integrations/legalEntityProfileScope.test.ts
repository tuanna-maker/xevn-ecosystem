import { describe, expect, it } from 'vitest';
import {
  legalProfileScopePersistMessage,
  resolveLegalProfileScopeFromState,
  resolveShareholderApiEntityKey,
} from './legalEntityProfileScope';
import type { LegalEntityApiRow } from './orgFoundationApi';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

const HOLDING_UUID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';

function holdingRow(partial: Partial<LegalEntityApiRow> = {}): LegalEntityApiRow {
  return {
    id: HOLDING_UUID,
    tenant_id: 'xevn',
    company_id: 'holding',
    code: 'XEVN',
    name: 'Tập đoàn XeVN',
    entity_type: 'holding',
    ...partial,
  };
}

describe('resolveLegalProfileScopeFromState (UF-XBOS-05)', () => {
  it('resolves holding root via resolvedLegalEntityApiId', () => {
    const scope = resolveLegalProfileScopeFromState({
      uiEntityId: GROUP_HOLDING_ROOT_ID,
      tenantId: 'xevn',
      code: 'XEVN',
      resolvedLegalEntityApiId: HOLDING_UUID,
      legalEntityApiCache: [],
    });
    expect(scope.entityId).toBe(HOLDING_UUID);
    expect(scope.tenantId).toBe('xevn');
  });

  it('resolves holding root from API cache when resolved id not set yet', () => {
    const scope = resolveLegalProfileScopeFromState({
      uiEntityId: GROUP_HOLDING_ROOT_ID,
      tenantId: 'xevn',
      code: 'XEVN',
      resolvedLegalEntityApiId: null,
      legalEntityApiCache: [holdingRow()],
    });
    expect(scope.entityId).toBe(HOLDING_UUID);
  });

  it('returns null for holding root when no persisted row exists', () => {
    const scope = resolveLegalProfileScopeFromState({
      uiEntityId: GROUP_HOLDING_ROOT_ID,
      tenantId: 'xevn',
      code: 'XEVN',
      resolvedLegalEntityApiId: null,
      legalEntityApiCache: [],
    });
    expect(scope.entityId).toBeNull();
  });

  it('does not treat holding UI id as persisted UUID', () => {
    const scope = resolveLegalProfileScopeFromState({
      uiEntityId: GROUP_HOLDING_ROOT_ID,
      tenantId: 'xevn',
      resolvedLegalEntityApiId: null,
      legalEntityApiCache: [],
    });
    expect(scope.entityId).toBeNull();
  });

  it('resolves member unit by direct UUID', () => {
    const memberUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    const scope = resolveLegalProfileScopeFromState({
      uiEntityId: memberUuid,
      tenantId: 'xe-du-lich',
      code: 'XDL',
      resolvedLegalEntityApiId: null,
      legalEntityApiCache: [
        {
          id: memberUuid,
          tenant_id: 'xe-du-lich',
          company_id: 'main',
          code: 'XDL',
          name: 'Du lịch',
        },
      ],
    });
    expect(scope.entityId).toBe(memberUuid);
  });
});

describe('legalProfileScopePersistMessage', () => {
  it('shows holding-specific guidance', () => {
    expect(legalProfileScopePersistMessage(GROUP_HOLDING_ROOT_ID)).toContain('Lưu thay đổi');
  });

  it('shows generic message for other entities', () => {
    expect(legalProfileScopePersistMessage('xe-du-lich')).toContain('pháp nhân');
  });
});

describe('resolveShareholderApiEntityKey (D-UF-WEB-XBOS-05-R3)', () => {
  it('returns persisted UUID for holding root when resolved (network path must not use UI id)', () => {
    expect(
      resolveShareholderApiEntityKey(GROUP_HOLDING_ROOT_ID, HOLDING_UUID),
    ).toBe(HOLDING_UUID);
  });

  it('falls back to holding UI root id when UUID not yet resolved', () => {
    expect(resolveShareholderApiEntityKey(GROUP_HOLDING_ROOT_ID, null)).toBe(GROUP_HOLDING_ROOT_ID);
  });

  it('returns resolved UUID for member units', () => {
    const memberUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    expect(resolveShareholderApiEntityKey('xe-du-lich', memberUuid)).toBe(memberUuid);
  });

  it('returns null for new entity', () => {
    expect(resolveShareholderApiEntityKey('new', null)).toBeNull();
  });
});
