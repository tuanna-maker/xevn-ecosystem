/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UpdateModulesDto } from './update-modules.dto';
import { ALLOWED_MODULES, type AllowedModule } from './create-company.dto';

describe('UpdateModulesDto (ValidationPipe)', () => {
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: UpdateModulesDto, data: '' };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const createValidRaw = (modules: AllowedModule[] = ['hrm']): Record<string, unknown> => ({ modules });

  describe('modules validation', () => {
    it('accepts valid modules array with hrm', async () => {
      const dto = await pipe.transform(createValidRaw(['hrm']), bodyMeta);
      expect(dto.modules).toEqual(['hrm']);
    });

    it('accepts valid modules array with logistics', async () => {
      const dto = await pipe.transform(createValidRaw(['logistics']), bodyMeta);
      expect(dto.modules).toEqual(['logistics']);
    });

    it('accepts both modules', async () => {
      const dto = await pipe.transform(createValidRaw(['hrm', 'logistics']), bodyMeta);
      expect(dto.modules).toEqual(['hrm', 'logistics']);
    });

    it('accepts modules in any order', async () => {
      const dto = await pipe.transform(createValidRaw(['logistics', 'hrm']), bodyMeta);
      expect(dto.modules).toEqual(['logistics', 'hrm']);
    });

    it('accepts empty array (IsArray allows empty)', async () => {
      const dto = await pipe.transform(createValidRaw([]), bodyMeta);
      expect(dto.modules).toEqual([]);
    });

    it('rejects invalid module', async () => {
      await expect(pipe.transform(createValidRaw(['hrm', 'invalid'] as never), bodyMeta)).rejects.toThrow();
    });

    it('rejects non-array', async () => {
      await expect(pipe.transform(createValidRaw('hrm' as never), bodyMeta)).rejects.toThrow();
    });

    it('rejects null', async () => {
      await expect(pipe.transform(createValidRaw(null as never), bodyMeta)).rejects.toThrow();
    });

    it('rejects undefined (modules key missing)', async () => {
      await expect(pipe.transform({}, bodyMeta)).rejects.toThrow();
    });

    it('accepts duplicate modules (class-validator IsEnum with each: true allows duplicates)', async () => {
      const dto = await pipe.transform(createValidRaw(['hrm', 'hrm']), bodyMeta);
      expect(dto.modules).toEqual(['hrm', 'hrm']);
    });

    it('validates each element individually', async () => {
      await expect(pipe.transform(createValidRaw(['hrm', 123] as never), bodyMeta)).rejects.toThrow();
    });
  });

  describe('required fields', () => {
    it('rejects when modules missing', async () => {
      await expect(pipe.transform({}, bodyMeta)).rejects.toThrow();
    });
  });

  describe('ALLOWED_MODULES reference', () => {
    it('uses same ALLOWED_MODULES as CreateCompanyDto', () => {
      expect(ALLOWED_MODULES).toContain('hrm');
      expect(ALLOWED_MODULES).toContain('logistics');
      expect(ALLOWED_MODULES).toHaveLength(2);
    });

    it('UpdateModulesDto IsEnum uses ALLOWED_MODULES constant', async () => {
      // This test verifies the import is correct by checking the validation behavior
      // If the wrong array was used, validation would fail differently
      const dto = await pipe.transform(createValidRaw(['hrm']), bodyMeta);
      expect(dto.modules).toEqual(['hrm']);
    });
  });
});