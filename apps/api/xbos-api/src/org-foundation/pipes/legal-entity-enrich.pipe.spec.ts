import { LegalEntityEnrichPipe } from './legal-entity-enrich.pipe';

describe('LegalEntityEnrichPipe', () => {
  const pipe = new LegalEntityEnrichPipe();

  it('lifts code/name from payload.companyForm when top-level missing', () => {
    const out = pipe.transform({
      entityType: 'subsidiary',
      payload: {
        companyForm: { shortName: 'XE_DU_LICH', nameVi: 'save11111', enterpriseCode: '1111' },
      },
    }) as Record<string, unknown>;
    expect(out.code).toBe('XE_DU_LICH');
    expect(out.name).toBe('save11111');
  });

  it('keeps explicit top-level code/name', () => {
    const out = pipe.transform({
      code: 'VISUN',
      name: 'Visun Corp',
      payload: { companyForm: { shortName: 'XE_DU_LICH', nameVi: 'other' } },
    }) as Record<string, unknown>;
    expect(out.code).toBe('VISUN');
    expect(out.name).toBe('Visun Corp');
  });
});
