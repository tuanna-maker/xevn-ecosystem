import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UpsertInfrastructureSettingsDto } from './upsert-infrastructure-settings.dto';

describe('UpsertInfrastructureSettingsDto (ValidationPipe)', () => {
  const bodyMeta: ArgumentMetadata = {
    type: 'body',
    metatype: UpsertInfrastructureSettingsDto,
    data: '',
  };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('accepts FE payload with foundationCategories and sites arrays', async () => {
    const raw = {
      foundationCategories: [
        {
          id: 'fcat-core',
          code: 'HT-LOG-CS',
          nameVi: 'Danh mục hạ tầng logistics',
          description: 'Origin catalog',
          appliesToCompanyIds: ['holding'],
        },
      ],
      sites: [
        {
          id: 'inf-hq-001',
          siteCode: 'KHO-HQ-01',
          name: 'Kho trung tâm XEVN HQ',
          facilityType: 'warehouse',
          operatingEntityId: 'holding',
          status: 'active',
        },
      ],
      blockTitleOverridesByEntity: { holding: { general: 'Khối Thông tin chung' } },
      customBlocksByEntity: { holding: [] },
      customFieldDefsByEntity: { legal_entity: [{ code: 'tax_id', label: 'MST' }] },
    };
    const dto = await pipe.transform(raw, bodyMeta);
    expect(dto).toMatchObject({
      foundationCategories: expect.any(Array),
      sites: expect.any(Array),
      customFieldDefsByEntity: expect.any(Object),
    });
    expect((dto as UpsertInfrastructureSettingsDto).foundationCategories).toHaveLength(1);
    expect((dto as UpsertInfrastructureSettingsDto).sites).toHaveLength(1);
  });

  it('accepts customFieldDefsByEntity-only payload (QA probe shape)', async () => {
    const raw = {
      customFieldDefsByEntity: { legal_entity: [{ code: 'tax_id', label: 'MST' }] },
    };
    const dto = await pipe.transform(raw, bodyMeta);
    expect(dto).toMatchObject({
      customFieldDefsByEntity: { legal_entity: [{ code: 'tax_id', label: 'MST' }] },
    });
  });

  it('rejects foundationCategories when sent as object instead of array', async () => {
    await expect(
      pipe.transform({ foundationCategories: { id: 'bad' } }, bodyMeta),
    ).rejects.toThrow();
  });
});
