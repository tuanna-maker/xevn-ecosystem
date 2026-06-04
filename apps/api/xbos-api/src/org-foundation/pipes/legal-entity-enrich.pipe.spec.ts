import { ArgumentMetadata } from '@nestjs/common';
import { LegalEntityEnrichPipe } from './legal-entity-enrich.pipe';
import { UpsertLegalEntityDto } from '../dto/upsert-legal-entity.dto';

describe('LegalEntityEnrichPipe', () => {
  const pipe = new LegalEntityEnrichPipe();
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: UpsertLegalEntityDto, data: '' };

  it('lifts code/name from payload.companyForm when top-level missing', () => {
    const out = pipe.transform(
      {
        entityType: 'subsidiary',
        payload: {
          companyForm: { shortName: 'XE_DU_LICH', nameVi: 'save11111', enterpriseCode: '1111' },
        },
      },
      bodyMeta,
    ) as Record<string, unknown>;
    expect(out.code).toBe('XE_DU_LICH');
    expect(out.name).toBe('save11111');
  });

  it('keeps explicit top-level code/name', () => {
    const out = pipe.transform(
      {
        code: 'VISUN',
        name: 'Visun Corp',
        payload: { companyForm: { shortName: 'XE_DU_LICH', nameVi: 'other' } },
      },
      bodyMeta,
    ) as Record<string, unknown>;
    expect(out.code).toBe('VISUN');
    expect(out.name).toBe('Visun Corp');
  });

  it('no-ops for non-UpsertLegalEntityDto params', () => {
    const raw = { foo: 1 };
    expect(pipe.transform(raw, { type: 'query', metatype: String, data: '' })).toBe(raw);
  });
});
