/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import 'reflect-metadata';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { CreateCompanyDto, LegalEntitySubDto, AllowedModule, ALLOWED_MODULES, ALLOWED_TENANT_KINDS } from './create-company.dto';

describe('CreateCompanyDto (ValidationPipe)', () => {
  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: CreateCompanyDto, data: '' };
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const createValidRaw = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    tenantCode: 'test-tenant',
    name: 'Test Tenant',
    shortName: 'Test',
    tenantKind: 'member',
    modules: ['hrm'],
    ...overrides,
  });

  describe('tenantCode validation', () => {
    it('accepts valid tenantCode: lowercase, starts with letter, [a-z0-9-], 3-50 chars', async () => {
      const validCodes = ['abc', 'test-tenant', 'a1b2c3', 'tenant-with-dashes', 'a' + 'b'.repeat(48)];
      for (const code of validCodes) {
        const dto = await pipe.transform(createValidRaw({ tenantCode: code }), bodyMeta);
        expect(dto.tenantCode).toBe(code);
      }
    });

    it('rejects uppercase letters', async () => {
      await expect(pipe.transform(createValidRaw({ tenantCode: 'Test-Tenant' }), bodyMeta)).rejects.toThrow();
    });

    it('rejects starting with number', async () => {
      await expect(pipe.transform(createValidRaw({ tenantCode: '1test' }), bodyMeta)).rejects.toThrow();
    });

    it('rejects starting with dash', async () => {
      await expect(pipe.transform(createValidRaw({ tenantCode: '-test' }), bodyMeta)).rejects.toThrow();
    });

    it('rejects special characters', async () => {
      const invalidCodes = ['test_tenant', 'test.tenant', 'test@tenant', 'test tenant', 'test/tenant'];
      for (const code of invalidCodes) {
        await expect(pipe.transform(createValidRaw({ tenantCode: code }), bodyMeta)).rejects.toThrow();
      }
    });

    it('rejects too short (< 3 chars)', async () => {
      await expect(pipe.transform(createValidRaw({ tenantCode: 'ab' }), bodyMeta)).rejects.toThrow();
    });

    it('rejects too long (> 50 chars)', async () => {
      await expect(pipe.transform(createValidRaw({ tenantCode: 'a' + 'b'.repeat(50) }), bodyMeta)).rejects.toThrow(); // 51 chars
    });

    it('rejects empty string', async () => {
      await expect(pipe.transform(createValidRaw({ tenantCode: '' }), bodyMeta)).rejects.toThrow();
    });
  });

  describe('name validation', () => {
    it('accepts valid name', async () => {
      const dto = await pipe.transform(createValidRaw({ name: 'Valid Name' }), bodyMeta);
      expect(dto.name).toBe('Valid Name');
    });

    it('accepts empty name (IsString allows empty)', async () => {
      const dto = await pipe.transform(createValidRaw({ name: '' }), bodyMeta);
      expect(dto.name).toBe('');
    });

    it('accepts whitespace-only name (IsString allows)', async () => {
      const dto = await pipe.transform(createValidRaw({ name: '   ' }), bodyMeta);
      expect(dto.name).toBe('   ');
    });
  });

  describe('shortName validation', () => {
    it('accepts valid shortName', async () => {
      const dto = await pipe.transform(createValidRaw({ shortName: 'Valid' }), bodyMeta);
      expect(dto.shortName).toBe('Valid');
    });

    it('accepts empty shortName (IsString allows empty)', async () => {
      const dto = await pipe.transform(createValidRaw({ shortName: '' }), bodyMeta);
      expect(dto.shortName).toBe('');
    });
  });

  describe('tenantKind validation', () => {
    it('accepts "master"', async () => {
      const dto = await pipe.transform(createValidRaw({ tenantKind: 'master' }), bodyMeta);
      expect(dto.tenantKind).toBe('master');
    });

    it('accepts "member"', async () => {
      const dto = await pipe.transform(createValidRaw({ tenantKind: 'member' }), bodyMeta);
      expect(dto.tenantKind).toBe('member');
    });

    it('rejects invalid tenantKind', async () => {
      await expect(pipe.transform(createValidRaw({ tenantKind: 'invalid' }), bodyMeta)).rejects.toThrow();
    });

    it('rejects empty tenantKind', async () => {
      await expect(pipe.transform(createValidRaw({ tenantKind: '' }), bodyMeta)).rejects.toThrow();
    });
  });

  describe('modules validation', () => {
    it('accepts valid modules array', async () => {
      const validModules: AllowedModule[][] = [
        ['hrm'],
        ['logistics'],
        ['hrm', 'logistics'],
        ['logistics', 'hrm'],
      ];
      for (const modules of validModules) {
        const dto = await pipe.transform(createValidRaw({ modules }), bodyMeta);
        expect(dto.modules).toEqual(modules);
      }
    });

    it('accepts empty array (IsArray allows empty)', async () => {
      const dto = await pipe.transform(createValidRaw({ modules: [] }), bodyMeta);
      expect(dto.modules).toEqual([]);
    });

    it('rejects invalid module', async () => {
      await expect(pipe.transform(createValidRaw({ modules: ['hrm', 'invalid'] }), bodyMeta)).rejects.toThrow();
    });

    it('rejects non-array', async () => {
      await expect(pipe.transform(createValidRaw({ modules: 'hrm' }), bodyMeta)).rejects.toThrow();
    });

    it('accepts duplicate modules (class-validator IsEnum with each: true allows duplicates)', async () => {
      const dto = await pipe.transform(createValidRaw({ modules: ['hrm', 'hrm'] }), bodyMeta);
      expect(dto.modules).toEqual(['hrm', 'hrm']);
    });
  });

  describe('legalEntity validation', () => {
    it('accepts undefined legalEntity (optional)', async () => {
      const dto = await pipe.transform(createValidRaw({ legalEntity: undefined }), bodyMeta);
      expect(dto.legalEntity).toBeUndefined();
    });

    it('accepts legalEntity with all fields', async () => {
      const dto = await pipe.transform(createValidRaw({
        legalEntity: {
          code: 'LE001',
          name: 'Legal Entity',
          taxCode: '0123456789',
          businessLines: 'testing',
        },
      }), bodyMeta);
      expect(dto.legalEntity).toEqual({
        code: 'LE001',
        name: 'Legal Entity',
        taxCode: '0123456789',
        businessLines: 'testing',
      });
    });

    it('accepts legalEntity with partial fields', async () => {
      const partialEntities = [
        { code: 'LE001' },
        { name: 'Legal Entity' },
        { taxCode: '0123456789' },
        { businessLines: 'testing' },
        { code: 'LE001', name: 'Legal Entity' },
      ];
      for (const le of partialEntities) {
        const dto = await pipe.transform(createValidRaw({ legalEntity: le }), bodyMeta);
        expect(dto.legalEntity).toEqual(le);
      }
    });

    it('accepts legalEntity with empty strings (optional fields)', async () => {
      const dto = await pipe.transform(createValidRaw({
        legalEntity: {
          code: '',
          name: '',
          taxCode: '',
          businessLines: '',
        },
      }), bodyMeta);
      expect(dto.legalEntity).toEqual({
        code: '',
        name: '',
        taxCode: '',
        businessLines: '',
      });
    });

    it('rejects non-object legalEntity', async () => {
      await expect(pipe.transform(createValidRaw({ legalEntity: 'invalid' }), bodyMeta)).rejects.toThrow();
    });

    it('validates nested fields are strings when provided', async () => {
      const invalidEntities = [
        { code: 123 },
        { name: 123 },
        { taxCode: 123 },
        { businessLines: 123 },
      ];
      for (const le of invalidEntities) {
        await expect(pipe.transform(createValidRaw({ legalEntity: le }), bodyMeta)).rejects.toThrow();
      }
    });
  });

  describe('required fields', () => {
    it('rejects when tenantCode missing', async () => {
      const raw = createValidRaw();
      delete raw.tenantCode;
      await expect(pipe.transform(raw, bodyMeta)).rejects.toThrow();
    });

    it('rejects when name missing', async () => {
      const raw = createValidRaw();
      delete raw.name;
      await expect(pipe.transform(raw, bodyMeta)).rejects.toThrow();
    });

    it('rejects when shortName missing', async () => {
      const raw = createValidRaw();
      delete raw.shortName;
      await expect(pipe.transform(raw, bodyMeta)).rejects.toThrow();
    });

    it('rejects when tenantKind missing', async () => {
      const raw = createValidRaw();
      delete raw.tenantKind;
      await expect(pipe.transform(raw, bodyMeta)).rejects.toThrow();
    });

    it('rejects when modules missing', async () => {
      const raw = createValidRaw();
      delete raw.modules;
      await expect(pipe.transform(raw, bodyMeta)).rejects.toThrow();
    });
  });

  describe('ALLOWED_MODULES constant', () => {
    it('contains hrm and logistics', () => {
      expect(ALLOWED_MODULES).toContain('hrm');
      expect(ALLOWED_MODULES).toContain('logistics');
      expect(ALLOWED_MODULES).toHaveLength(2);
    });
  });

  describe('ALLOWED_TENANT_KINDS constant', () => {
    it('contains master and member', () => {
      expect(ALLOWED_TENANT_KINDS).toContain('master');
      expect(ALLOWED_TENANT_KINDS).toContain('member');
      expect(ALLOWED_TENANT_KINDS).toHaveLength(2);
    });
  });
});

describe('LegalEntitySubDto (ValidationPipe)', () => {
  const leMeta: ArgumentMetadata = { type: 'body', metatype: LegalEntitySubDto, data: '' };
  const lePipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  it('accepts all valid fields', async () => {
    const dto = await lePipe.transform({
      code: 'LE001',
      name: 'Legal Entity',
      taxCode: '0123456789',
      businessLines: 'testing',
    }, leMeta);
    expect(dto).toEqual({
      code: 'LE001',
      name: 'Legal Entity',
      taxCode: '0123456789',
      businessLines: 'testing',
    });
  });

  it('accepts partial fields', async () => {
    const dto = await lePipe.transform({ code: 'LE001' }, leMeta);
    expect(dto).toEqual({ code: 'LE001' });
  });

  it('accepts empty object', async () => {
    const dto = await lePipe.transform({}, leMeta);
    expect(dto).toEqual({});
  });

  it('rejects non-string fields', async () => {
    const invalid = [
      { code: 123 },
      { name: 123 },
      { taxCode: 123 },
      { businessLines: 123 },
    ];
    for (const data of invalid) {
      await expect(lePipe.transform(data, leMeta)).rejects.toThrow();
    }
  });
});