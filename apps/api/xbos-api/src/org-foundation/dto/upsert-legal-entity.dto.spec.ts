import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { LegalEntityEnrichPipe } from '../pipes/legal-entity-enrich.pipe';
import { UpsertLegalEntityDto } from './upsert-legal-entity.dto';

describe('UpsertLegalEntityDto (Command Center PUT)', () => {
  const enrich = new LegalEntityEnrichPipe();
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: UpsertLegalEntityDto, data: '' };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('P1-CC-BE-MEMBER-LEGAL-BROWSER-PUT-01: accepts exact QA browser body after enrich + ValidationPipe', async () => {
    const raw = {
      code: 'XE_DU_LICH',
      name: 'QA L25 browser save retest 20260604',
      entityType: 'subsidiary',
      taxCode: '0123456789',
      charterCapital: 1_000_000_000,
      payload: {
        companyForm: {
          nameVi: 'QA L25 browser save retest 20260604',
          shortName: 'XE_DU_LICH',
          enterpriseCode: '0123456789',
          entityLevel: 'subsidiary',
        },
      },
    };
    const dto = await pipe.transform(enrich.transform(raw, bodyMeta), bodyMeta);
    expect(dto).toMatchObject({
      code: 'XE_DU_LICH',
      name: 'QA L25 browser save retest 20260604',
    });
  });

  it('accepts payload-only body after enrich + ValidationPipe (browser-shaped)', async () => {
    const raw = {
      entityType: 'subsidiary',
      taxCode: '0312345678',
      charterCapital: 11111,
      payload: {
        companyForm: {
          shortName: 'XE_DU_LICH',
          nameVi: 'save11111',
          enterpriseCode: '1111',
        },
      },
    };
    const dto = await pipe.transform(enrich.transform(raw, bodyMeta), bodyMeta);
    expect(dto).toMatchObject({ code: 'XE_DU_LICH', name: 'save11111' });
  });
});
