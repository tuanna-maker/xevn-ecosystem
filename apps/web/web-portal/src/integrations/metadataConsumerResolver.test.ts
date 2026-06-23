import { describe, expect, it } from 'vitest';
import { GROUP_HOLDING_COMPANY_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import {
  assertMetadataConsumerParity,
  countVisibleMetadataFieldDefs,
  resolveMetadataCustomBlocks,
  resolveMetadataFieldDefs,
} from './metadataConsumerResolver';

const VISUN_ID = 'eb3fb3fc-0081-446b-8d99-2b398dddc709';

const MAIN_DEF = {
  id: 'c1',
  fieldCode: 'qa_meta_main',
  labelVi: 'QA Meta Main',
  dataType: 'text',
  blockCode: 'general',
  visible: true,
};

const HOLDING_DEF = {
  id: 'c2',
  fieldCode: 'qa_meta_holding',
  labelVi: 'QA Meta Holding',
  dataType: 'text',
  blockCode: 'general',
  visible: true,
};

describe('metadataConsumerResolver (P1-METADATA-CONSUMER-PARITY-FE-02)', () => {
  it('K2: modal and site detail share defs when stored under main for holding entity', () => {
    const defsByEntity = { [MEMBER_DEFAULT_COMPANY_ID]: [MAIN_DEF] };
    const ctx = {
      pipeline: 'infra' as const,
      entityId: GROUP_HOLDING_ROOT_ID,
      foundationCategories: [],
      blockCode: 'general',
    };

    const { parity, modalDefs, consumerDefs } = assertMetadataConsumerParity(ctx, defsByEntity);
    expect(parity).toBe(true);
    expect(modalDefs).toHaveLength(1);
    expect(consumerDefs[0]?.labelVi).toBe('QA Meta Main');
  });

  it('K2: member site inherits main defs via foundation scope (modal ≡ consumer)', () => {
    const defsByEntity = { [MEMBER_DEFAULT_COMPANY_ID]: [MAIN_DEF] };
    const foundationCategories = [
      { appliesToCompanyIds: [GROUP_HOLDING_ROOT_ID, VISUN_ID] },
    ];
    const ctx = {
      pipeline: 'infra' as const,
      entityId: VISUN_ID,
      foundationCategories,
      blockCode: 'general',
    };

    const modalDefs = resolveMetadataFieldDefs(ctx, defsByEntity);
    const consumerDefs = resolveMetadataFieldDefs(
      { ...ctx, blockCode: undefined },
      defsByEntity,
    ).filter((f) => f.blockCode === 'general');

    expect(modalDefs).toEqual(consumerDefs);
    expect(modalDefs[0]?.fieldCode).toBe('qa_meta_main');
  });

  it('direct map[entityId] would miss main defs — resolver finds them for holding alias', () => {
    const defsByEntity = { [MEMBER_DEFAULT_COMPANY_ID]: [MAIN_DEF] };
    const direct = defsByEntity[GROUP_HOLDING_ROOT_ID] ?? [];
    const resolved = resolveMetadataFieldDefs(
      {
        pipeline: 'infra',
        entityId: GROUP_HOLDING_ROOT_ID,
        foundationCategories: [],
      },
      defsByEntity,
    );

    expect(direct).toHaveLength(0);
    expect(resolved).toHaveLength(1);
  });

  it('countVisibleMetadataFieldDefs uses resolver for apply success count', () => {
    const defsByEntity = {
      [MEMBER_DEFAULT_COMPANY_ID]: [MAIN_DEF, { ...HOLDING_DEF, visible: false }],
    };
    const count = countVisibleMetadataFieldDefs(
      {
        pipeline: 'infra',
        entityId: GROUP_HOLDING_COMPANY_ID,
        foundationCategories: [],
      },
      defsByEntity,
    );
    expect(count).toBe(1);
  });

  it('K5: legal_entity_static pipeline returns empty defs (no companyForm bind)', () => {
    const defsByEntity = { [MEMBER_DEFAULT_COMPANY_ID]: [MAIN_DEF] };
    const defs = resolveMetadataFieldDefs(
      {
        pipeline: 'legal_entity_static',
        entityId: VISUN_ID,
      },
      defsByEntity,
    );
    expect(defs).toEqual([]);
  });

  it('group_hr pipeline resolves holding alias to main-keyed defs', () => {
    const defsByEntity = { [MEMBER_DEFAULT_COMPANY_ID]: [MAIN_DEF] };
    const defs = resolveMetadataFieldDefs(
      {
        pipeline: 'group_hr',
        entityId: GROUP_HOLDING_ROOT_ID,
      },
      defsByEntity,
    );
    expect(defs).toHaveLength(1);
    expect(defs[0]?.fieldCode).toBe('qa_meta_main');
  });

  it('resolveMetadataCustomBlocks merges blocks under main for holding modal entity', () => {
    const blocksByEntity = {
      [MEMBER_DEFAULT_COMPANY_ID]: [
        {
          id: 'bl1',
          blockCode: 'custom_a',
          labelVi: 'Khối A',
          visible: true,
          order: 10,
        },
      ],
    };
    const blocks = resolveMetadataCustomBlocks(
      {
        pipeline: 'infra',
        entityId: GROUP_HOLDING_ROOT_ID,
        foundationCategories: [],
      },
      blocksByEntity,
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.blockCode).toBe('custom_a');
  });
});
