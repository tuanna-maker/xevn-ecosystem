import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { LegalEntityEnrichPipe } from '../pipes/legal-entity-enrich.pipe';
import { UpsertLegalEntityDto } from './upsert-legal-entity.dto';

describe('UpsertLegalEntityDto (Command Center PUT)', () => {
  const enrich = new LegalEntityEnrichPipe();
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
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
    const dto = await pipe.transform(enrich.transform(raw), {
      type: 'body',
      metatype: UpsertLegalEntityDto,
    } as ArgumentMetadata);
    expect(dto).toMatchObject({ code: 'XE_DU_LICH', name: 'save11111' });
  });
});
