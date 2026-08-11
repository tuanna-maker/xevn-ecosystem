import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import {
  PermissionMatrixRowDto,
  SavePermissionMatrixRequestDto,
} from './save-permission-matrix.dto';

describe('SavePermissionMatrixRequestDto (G-DTO-W2-POS-01)', () => {
  const bodyMeta: ArgumentMetadata = {
    type: 'body',
    metatype: SavePermissionMatrixRequestDto,
    data: '',
  };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('accepts FR-CC-P0-04 save body with PermissionMatrixRow flags + dataScope', async () => {
    const dto = (await pipe.transform(
      {
        roleId: 'role-ceo',
        rows: [
          {
            rowId: 'pm-org-1',
            view: true,
            write: true,
            delete: false,
            approve: true,
            dataScope: 'group',
          },
        ],
      },
      bodyMeta,
    )) as SavePermissionMatrixRequestDto;
    expect(dto.roleId).toBe('role-ceo');
    expect(dto.rows).toHaveLength(1);
    expect(dto.rows[0]).toMatchObject({
      rowId: 'pm-org-1',
      view: true,
      dataScope: 'group',
    });
  });

  it('rejects missing roleId and invalid dataScope', async () => {
    await expect(pipe.transform({ rows: [] }, bodyMeta)).rejects.toThrow();
    await expect(
      pipe.transform(
        {
          roleId: 'role-ceo',
          rows: [{ rowId: 'pm-org-1', dataScope: 'planet' }],
        },
        bodyMeta,
      ),
    ).rejects.toThrow();
  });

  it('accepts empty rows array (valid no-op partition)', async () => {
    const dto = (await pipe.transform(
      { roleId: 'role-ceo', rows: [] },
      bodyMeta,
    )) as SavePermissionMatrixRequestDto;
    expect(dto.rows).toEqual([]);
  });

  it('PermissionMatrixRowDto standalone accepts personal default shape', async () => {
    const rowMeta: ArgumentMetadata = {
      type: 'body',
      metatype: PermissionMatrixRowDto,
      data: '',
    };
    const row = (await pipe.transform(
      { rowId: 'pm-sys-2', view: true, write: false, delete: false, approve: false, dataScope: 'personal' },
      rowMeta,
    )) as PermissionMatrixRowDto;
    expect(row.dataScope).toBe('personal');
  });
});
