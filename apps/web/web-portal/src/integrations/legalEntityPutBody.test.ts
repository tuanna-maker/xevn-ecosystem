import { describe, expect, it } from 'vitest';
import { normalizeLegalEntityPutBody } from './legalEntityPutBody';

describe('normalizeLegalEntityPutBody', () => {
  it('lifts code/name from companyForm when top-level omitted', () => {
    const out = normalizeLegalEntityPutBody({
      code: undefined as unknown as string,
      name: undefined as unknown as string,
      payload: {
        companyForm: {
          shortName: 'XE_DU_LICH',
          nameVi: 'save11111',
          enterpriseCode: '1111',
        },
      },
    });
    expect(out.code).toBe('XE_DU_LICH');
    expect(out.name).toBe('save11111');
  });

  it('prefers companyForm.shortName over wrong top-level code (L2.5 browser save)', () => {
    const editedName = 'QA L25 browser save 20260604';
    const out = normalizeLegalEntityPutBody({
      code: editedName,
      name: editedName,
      payload: {
        companyForm: {
          shortName: 'XE_DU_LICH',
          nameVi: editedName,
          enterpriseCode: '0312345678',
        },
      },
    });
    expect(out.code).toBe('XE_DU_LICH');
    expect(out.name).toBe(editedName);
    expect((out.payload?.companyForm as { shortName?: string }).shortName).toBe('XE_DU_LICH');
    expect((out.payload?.companyForm as { nameVi?: string }).nameVi).toBe(editedName);
  });

  it('falls back to top-level code when shortName missing', () => {
    const out = normalizeLegalEntityPutBody({
      code: 'XE_TMDV',
      name: 'Thương mại dịch vụ',
      payload: { companyForm: { nameVi: 'Thương mại dịch vụ' } },
    });
    expect(out.code).toBe('XE_TMDV');
    expect(out.name).toBe('Thương mại dịch vụ');
  });
});
