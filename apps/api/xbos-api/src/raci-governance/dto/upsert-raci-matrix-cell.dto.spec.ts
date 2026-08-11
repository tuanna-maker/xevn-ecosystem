import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UpsertRaciMatrixCellRequestDto } from './upsert-raci-matrix-cell.dto';

describe('UpsertRaciMatrixCellRequestDto (G-DTO-W2-RACI-01)', () => {
  const bodyMeta: ArgumentMetadata = {
    type: 'body',
    metatype: UpsertRaciMatrixCellRequestDto,
    data: '',
  };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('accepts FR-XBOS-RACI-02 #5 upsert body (snake_case)', async () => {
    const dto = (await pipe.transform(
      {
        activity_id: '11111111-1111-4111-8111-111111111111',
        org_column_id: 'ceo',
        raci_letters: 'RA',
        actor_id: 'ceo@xe.vn',
      },
      bodyMeta,
    )) as UpsertRaciMatrixCellRequestDto;
    expect(dto).toMatchObject({
      activity_id: '11111111-1111-4111-8111-111111111111',
      org_column_id: 'ceo',
      raci_letters: 'RA',
      actor_id: 'ceo@xe.vn',
    });
  });

  it('accepts empty raci_letters clear override (#6) and normalizes lowercase', async () => {
    const clear = (await pipe.transform(
      {
        activity_id: 'act-1',
        org_column_id: 'hcns',
        raci_letters: '',
      },
      bodyMeta,
    )) as UpsertRaciMatrixCellRequestDto;
    expect(clear.raci_letters).toBe('');

    const lower = (await pipe.transform(
      {
        activity_id: 'act-1',
        org_column_id: 'hcns',
        raci_letters: ' r a ',
      },
      bodyMeta,
    )) as UpsertRaciMatrixCellRequestDto;
    expect(lower.raci_letters).toBe('RA');
  });

  it('rejects missing activity_id / org_column_id and invalid letters', async () => {
    await expect(pipe.transform({ org_column_id: 'ceo', raci_letters: 'R' }, bodyMeta)).rejects.toThrow();
    await expect(pipe.transform({ activity_id: 'act-1', raci_letters: 'R' }, bodyMeta)).rejects.toThrow();
    await expect(
      pipe.transform({ activity_id: 'act-1', org_column_id: 'ceo', raci_letters: 'XYZ' }, bodyMeta),
    ).rejects.toThrow();
  });

  it('rejects unknown properties (forbidNonWhitelisted)', async () => {
    await expect(
      pipe.transform(
        {
          activity_id: 'act-1',
          org_column_id: 'ceo',
          raci_letters: 'R',
          extra_field: true,
        },
        bodyMeta,
      ),
    ).rejects.toThrow();
  });
});
