import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

vi.mock('./tenantScopeApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./tenantScopeApi')>();
  return {
    ...actual,
    fetchGroupOrgOverview: vi.fn(),
  };
});

vi.mock('./xbosHttp', () => ({
  xbosGetData: vi.fn(),
  xbosFetch: vi.fn(),
}));

import { fetchGroupOrgOverview } from './tenantScopeApi';
import { xbosFetch, xbosGetData } from './xbosHttp';
import {
  fetchOrgTreeForLegalEntity,
  findOrgUnitInTreeByCode,
  isHoldingDepartmentScope,
  isOrgUnitDuplicateKeyError,
  loadLegalEntityDepartmentTree,
  resolveDepartmentSaveContext,
  saveOrgUnit,
} from './orgFoundationApi';

const holdingUuid = '14f0a473-1111-4222-8333-abcdef012345';
const memberUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';

describe('orgFoundationApi dept tree (J-XBOS-07)', () => {
  beforeEach(() => {
    vi.mocked(fetchGroupOrgOverview).mockReset();
    vi.mocked(xbosGetData).mockReset();
    vi.mocked(xbosFetch).mockReset();
  });

  it('isHoldingDepartmentScope matches holding root id', () => {
    expect(isHoldingDepartmentScope({ id: GROUP_HOLDING_ROOT_ID })).toBe(true);
    expect(isHoldingDepartmentScope({ id: memberUuid, entityLevel: 'parent' })).toBe(true);
    expect(isHoldingDepartmentScope({ id: memberUuid, entityLevel: 'subsidiary' })).toBe(false);
  });

  it('loadLegalEntityDepartmentTree matches overview by UI entity id (holding root)', async () => {
    vi.mocked(fetchGroupOrgOverview).mockResolvedValue({
      trees: [
        {
          tenantId: GROUP_HOLDING_ROOT_ID,
          name: 'Tap doan',
          roleCode: 'group_ceo',
          tree: [
            {
              id: 'unit-1',
              code: 'QA-W4-PB-001',
              name: 'QA audit',
              org_type: 'department',
              payload: { headId: 'emp-1' },
            },
          ],
        },
      ],
    });

    const tree = await loadLegalEntityDepartmentTree('xevn', GROUP_HOLDING_ROOT_ID, {
      id: GROUP_HOLDING_ROOT_ID,
      tenantId: 'xevn',
      entityLevel: 'parent',
    });

    expect(tree).toHaveLength(1);
    expect(tree[0]?.code).toBe('QA-W4-PB-001');
  });

  it('loadLegalEntityDepartmentTree matches member legal-entity UUID in overview', async () => {
    vi.mocked(fetchGroupOrgOverview).mockResolvedValue({
      trees: [
        {
          tenantId: memberUuid,
          name: 'Du lich',
          roleCode: 'member_ceo',
          tree: [{ id: 'u2', code: 'PB-01', name: 'Sales', org_type: 'department' }],
        },
      ],
    });

    const tree = await loadLegalEntityDepartmentTree('xe-du-lich', memberUuid, {
      id: memberUuid,
      tenantId: 'xe-du-lich',
      code: 'XDL',
    });

    expect(tree).toHaveLength(1);
    expect(tree[0]?.code).toBe('PB-01');
  });

  it('loadLegalEntityDepartmentTree falls back to legal_entity_id tree query (UF-XBOS-12)', async () => {
    vi.mocked(fetchGroupOrgOverview).mockResolvedValue({ trees: [] });
    vi.mocked(xbosGetData).mockImplementation(async (path: string) => {
      if (path.includes('/org-foundation/legal-entities')) {
        return {
          items: [
            {
              id: memberUuid,
              tenant_id: 'xe-du-lich',
              company_id: 'main',
              code: 'XDL',
              name: 'Du lich',
            },
          ],
        };
      }
      if (path.includes('legal_entity_id=')) {
        return {
          tree: [{ id: 'u3', code: 'QA-UF12-001', name: 'QA dept', org_type: 'department' }],
        };
      }
      return {};
    });

    const tree = await loadLegalEntityDepartmentTree('xe-du-lich', memberUuid, {
      id: memberUuid,
      tenantId: 'xe-du-lich',
      code: 'XDL',
    });

    expect(tree).toHaveLength(1);
    expect(tree[0]?.code).toBe('QA-UF12-001');
    expect(xbosGetData).toHaveBeenCalledWith(
      expect.stringContaining('legal_entity_id='),
      expect.objectContaining({ scope: 'org-foundation.org-tree-legal-entity' }),
    );
  });

  it('fetchOrgTreeForLegalEntity requests scoped org-units tree', async () => {
    vi.mocked(xbosGetData).mockResolvedValueOnce({
      tree: [{ id: 'u4', code: 'PB-SCOPED', name: 'Scoped', org_type: 'department' }],
    });

    const tree = await fetchOrgTreeForLegalEntity(memberUuid, 'xe-du-lich', 'main');
    expect(tree).toHaveLength(1);
    expect(tree[0]?.code).toBe('PB-SCOPED');
    expect(xbosGetData).toHaveBeenCalledWith(
      expect.stringContaining(`legal_entity_id=${encodeURIComponent(memberUuid)}`),
      expect.any(Object),
    );
  });

  it('resolveDepartmentSaveContext resolves holding legalEntityId from API list', async () => {
    vi.mocked(xbosGetData).mockResolvedValue({
      items: [
        {
          id: holdingUuid,
          tenant_id: 'xevn',
          company_id: 'holding',
          code: 'XEVN',
          name: 'Tap doan',
          entity_type: 'holding',
        },
      ],
    });

    const ctx = await resolveDepartmentSaveContext({
      id: GROUP_HOLDING_ROOT_ID,
      tenantId: 'xevn',
      code: 'XEVN',
      entityLevel: 'parent',
    });

    expect(ctx).toEqual({
      tenantId: 'xevn',
      companyId: 'holding',
      legalEntityId: holdingUuid,
    });
  });

  it('findOrgUnitInTreeByCode matches nested department code case-insensitively', () => {
    const tree = [
      {
        id: 'root',
        code: 'HQ',
        name: 'HQ',
        org_type: 'company',
        children: [{ id: 'unit-dup', code: 'QA-W4-PB-003', name: 'Audit', org_type: 'department' }],
      },
    ];
    expect(findOrgUnitInTreeByCode(tree, 'qa-w4-pb-003')?.id).toBe('unit-dup');
    expect(findOrgUnitInTreeByCode(tree, 'missing')).toBeNull();
  });

  it('isOrgUnitDuplicateKeyError detects postgres duplicate key message', () => {
    expect(
      isOrgUnitDuplicateKeyError(
        new Error('org-foundation.org-units.create failed: duplicate key value violates unique constraint (HTTP 500)'),
      ),
    ).toBe(true);
    expect(isOrgUnitDuplicateKeyError(new Error('not found'))).toBe(false);
  });

  it('saveOrgUnit PUTs existing unit when code already in org tree (D-W4-DEPT-DUP-SAVE-01)', async () => {
    vi.mocked(xbosGetData).mockResolvedValue({
      tree: [{ id: 'existing-unit', code: 'QA-W4-PB-003', name: 'Old', org_type: 'department' }],
    });
    vi.mocked(xbosFetch).mockResolvedValue({
      data: { id: 'existing-unit', code: 'QA-W4-PB-003', name: 'Updated' },
    });

    const saved = await saveOrgUnit(
      'xevn',
      'holding',
      {
        code: 'QA-W4-PB-003',
        name: 'Updated',
        orgType: 'department',
        legalEntityId: holdingUuid,
      },
      undefined,
    );

    expect(saved.id).toBe('existing-unit');
    expect(xbosFetch).toHaveBeenCalledTimes(1);
    expect(xbosFetch).toHaveBeenCalledWith(
      '/org-foundation/org-units/existing-unit',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('saveOrgUnit retries PUT after duplicate POST (reactive fallback)', async () => {
    vi.mocked(xbosGetData)
      .mockResolvedValueOnce({ tree: [] })
      .mockResolvedValueOnce({
        tree: [{ id: 'existing-unit', code: 'QA-W4-PB-004', name: 'Old', org_type: 'department' }],
      });
    vi.mocked(xbosFetch)
      .mockRejectedValueOnce(
        new Error('org-foundation.org-units.create failed: duplicate key value violates unique constraint (HTTP 500)'),
      )
      .mockResolvedValueOnce({
        data: { id: 'existing-unit', code: 'QA-W4-PB-004', name: 'Updated' },
      });

    const saved = await saveOrgUnit(
      'xevn',
      'holding',
      {
        code: 'QA-W4-PB-004',
        name: 'Updated',
        orgType: 'department',
        legalEntityId: holdingUuid,
      },
      undefined,
    );

    expect(saved.id).toBe('existing-unit');
    expect(xbosFetch).toHaveBeenCalledTimes(2);
    expect(xbosFetch).toHaveBeenLastCalledWith(
      '/org-foundation/org-units/existing-unit',
      expect.objectContaining({ method: 'PUT' }),
    );
  });
});
