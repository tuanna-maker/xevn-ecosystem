import { describe, expect, it } from 'vitest';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import { MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import {
  buildEffectiveInfraFoundationCategories,
  countInfraSiteVisibleCustomFields,
  resolveDefaultInfraSiteOperatingEntityId,
  resolveInfraSiteConsumerFieldDefs,
} from './infraSiteConsumerContext';

const QA_FCAT_FIELD = {
  id: 'c-qa',
  fieldCode: 'company_infrastructure__capacity__qa_fcat_fld_062101',
  labelVi: 'QA-FCAT-FLD-062101',
  dataType: 'text',
  blockCode: 'capacity',
  visible: true,
};

describe('infraSiteConsumerContext (P1-INFRA-FCAT-CONSUMER-FE-01)', () => {
  it('wizard consumer parity: holding site reads defs stored under main after category save', () => {
    const savedCategories = [
      {
        id: 'fcat-qa',
        code: 'QA-FCAT-062101',
        nameVi: 'QA Wizard DM',
        appliesToCompanyIds: [GROUP_HOLDING_ROOT_ID],
      },
    ];
    const defsByEntity = {
      [MEMBER_DEFAULT_COMPANY_ID]: [QA_FCAT_FIELD],
    };

    const defs = resolveInfraSiteConsumerFieldDefs(
      GROUP_HOLDING_ROOT_ID,
      savedCategories,
      defsByEntity,
    );

    expect(defs).toHaveLength(1);
    expect(defs[0]?.labelVi).toBe('QA-FCAT-FLD-062101');
  });

  it('merges in-flight wizard draft into scope for preview entity count', () => {
    const draft = {
      id: 'fcat-draft',
      code: 'QA-FCAT-DRAFT',
      nameVi: 'Draft',
      appliesToCompanyIds: [GROUP_HOLDING_ROOT_ID],
    };
    const effective = buildEffectiveInfraFoundationCategories([], draft, true);
    const count = countInfraSiteVisibleCustomFields(
      GROUP_HOLDING_ROOT_ID,
      effective,
      { [GROUP_HOLDING_ROOT_ID]: [QA_FCAT_FIELD] },
    );
    expect(count).toBe(1);
  });

  it('resolveDefaultInfraSiteOperatingEntityId prefers wizard preview entity in scope', () => {
    const categories = [
      {
        id: 'fcat-1',
        code: 'HT-A',
        nameVi: 'Cat A',
        appliesToCompanyIds: [GROUP_HOLDING_ROOT_ID],
      },
    ];
    expect(resolveDefaultInfraSiteOperatingEntityId(categories, GROUP_HOLDING_ROOT_ID)).toBe(
      GROUP_HOLDING_ROOT_ID,
    );
    expect(resolveDefaultInfraSiteOperatingEntityId(categories, null)).toBe(GROUP_HOLDING_ROOT_ID);
  });
});
