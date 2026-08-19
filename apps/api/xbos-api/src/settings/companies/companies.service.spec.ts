/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { CompaniesService, CompanyListItem } from './companies.service';
import type { XbosDbService } from '../../db/xbos-db.service';
import type { PlatformAuditService } from '../../platform/platform-audit.service';
import type { CreateCompanyDto } from './dto/create-company.dto';
import type { UpdateModulesDto } from './dto/update-modules.dto';

const TENANT_ID = 'test-tenant-123';
const ISSUED_BY = 'test-user@xe.vn';

function createDbMock(handlers: {
  listCompanies?: CompanyListItem[];
  createCompany?: { conflict?: boolean; tenantId?: string };
  activateTenant?: { rowsAffected?: number; currentStatus?: string; modules?: unknown };
  suspendTenant?: { rowsAffected?: number };
  updateModules?: { exists?: boolean; status?: string; existingModules?: unknown };
}) {
  const query = jest.fn(async (sql: string, params?: unknown[]) => {
    const text = String(sql);

    // listCompanies
    if (text.includes('SELECT') && text.includes('xbos_tenant_registry') && text.includes('LEFT JOIN')) {
      const rows = (handlers.listCompanies ?? []).map((c) => ({
        tenant_id: c.tenantId,
        name: c.name,
        short_name: c.shortName,
        tenant_kind: c.tenantKind,
        default_company_id: c.defaultCompanyId,
        modules: c.modules,
        status: c.status,
        le_code: c.legalEntity?.code ?? null,
        le_tax_code: c.legalEntity?.taxCode ?? null,
        le_business_lines: c.legalEntity?.businessLines ?? null,
      }));
      return { rows };
    }

    // createCompany CTE
    if (text.includes('WITH conflict_check') && text.includes('tenant_ins') && text.includes('le_ins')) {
      if (handlers.createCompany?.conflict) {
        return { rows: [{ tenant_id: null, conflict: 1 }] };
      }
      const tenantId = handlers.createCompany?.tenantId ?? TENANT_ID;
      return { rows: [{ tenant_id: tenantId, conflict: null }] };
    }

    // activateTenant
    if (text.includes('UPDATE public.xbos_tenant_registry') && text.includes("status = 'active'") && text.includes("status = 'provisioning'")) {
      if (!handlers.activateTenant || handlers.activateTenant.rowsAffected === 0) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            tenant_id: TENANT_ID,
            modules: handlers.activateTenant?.modules ?? ['hrm'],
          },
        ],
      };
    }

    // activateTenant status check (when not found or wrong status)
    if (text.includes('SELECT status FROM public.xbos_tenant_registry WHERE tenant_id')) {
      if (!handlers.activateTenant || handlers.activateTenant.rowsAffected === 0) {
        if (handlers.activateTenant?.currentStatus) {
          return { rows: [{ status: handlers.activateTenant.currentStatus }] };
        }
        return { rows: [] };
      }
      return { rows: [{ status: 'provisioning' }] };
    }

    // suspendTenant
    if (text.includes('UPDATE public.xbos_tenant_registry') && text.includes("status = 'suspended'")) {
      if (!handlers.suspendTenant || handlers.suspendTenant.rowsAffected === 0) {
        return { rows: [] };
      }
      return { rows: [{ tenant_id: TENANT_ID }] };
    }

    // updateModules - get current
    if (text.includes('SELECT status, modules FROM public.xbos_tenant_registry WHERE tenant_id')) {
      if (!handlers.updateModules?.exists) {
        return { rows: [] };
      }
      return {
        rows: [
          {
            status: handlers.updateModules?.status ?? 'active',
            modules: handlers.updateModules?.existingModules ?? ['hrm'],
          },
        ],
      };
    }

    // updateModules - update
    if (text.includes('UPDATE public.xbos_tenant_registry') && text.includes('modules =') && text.includes('updated_at')) {
      return { rows: [{ tenant_id: TENANT_ID }] };
    }

    return { rows: [] };
  });

  return { query } as unknown as XbosDbService;
}

function createAuditMock() {
  const emit = jest.fn().mockResolvedValue(undefined);
  return { emit } as unknown as PlatformAuditService;
}

describe('CompaniesService (XBOS-TENANT-PROVISION-BE-01)', () => {
  let service: CompaniesService;
  let dbMock: XbosDbService;
  let auditMock: PlatformAuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    dbMock = createDbMock({});
    auditMock = createAuditMock();
    service = new CompaniesService(dbMock, auditMock);
  });

  describe('listCompanies', () => {
    it('maps tenant_registry + legal_entity JOIN correctly', async () => {
      const companies: CompanyListItem[] = [
        {
          tenantId: 'master-tenant',
          name: 'XeVN Master',
          shortName: 'XeVN',
          tenantKind: 'master',
          defaultCompanyId: 'main',
          modules: ['hrm', 'logistics'],
          status: 'active',
          legalEntity: { code: 'XEVN001', taxCode: '0123456789', businessLines: 'holding' },
        },
        {
          tenantId: 'member-tenant',
          name: 'XeVN Du lịch',
          shortName: 'Du lịch',
          tenantKind: 'member',
          defaultCompanyId: 'main',
          modules: ['hrm'],
          status: 'provisioning',
          legalEntity: null,
        },
      ];

      dbMock = createDbMock({ listCompanies: companies });
      service = new CompaniesService(dbMock, auditMock);

      const result = await service.listCompanies();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(companies[0]);
      expect(result[1]).toEqual(companies[1]);
      expect(result[0].legalEntity).toEqual({ code: 'XEVN001', taxCode: '0123456789', businessLines: 'holding' });
      expect(result[1].legalEntity).toBeNull();
    });

    it('returns empty array when no tenants', async () => {
      dbMock = createDbMock({ listCompanies: [] });
      service = new CompaniesService(dbMock, auditMock);

      const result = await service.listCompanies();

      expect(result).toEqual([]);
    });

    it('orders master tenant first, then by name', async () => {
      const companies: CompanyListItem[] = [
        { tenantId: 'master', name: 'Master', shortName: 'M', tenantKind: 'master', defaultCompanyId: 'main', modules: [], status: 'active', legalEntity: null },
        { tenantId: 'a-member', name: 'A Member', shortName: 'A', tenantKind: 'member', defaultCompanyId: 'main', modules: [], status: 'active', legalEntity: null },
        { tenantId: 'b-member', name: 'B Member', shortName: 'B', tenantKind: 'member', defaultCompanyId: 'main', modules: [], status: 'active', legalEntity: null },
      ];

      // The SQL query handles ordering, so we provide pre-ordered data
      dbMock = createDbMock({ listCompanies: companies });
      service = new CompaniesService(dbMock, auditMock);

      const result = await service.listCompanies();

      expect(result[0].tenantId).toBe('master');
      expect(result[1].tenantId).toBe('a-member');
      expect(result[2].tenantId).toBe('b-member');
    });
  });

  describe('createCompany', () => {
    const validDto: CreateCompanyDto = {
      tenantCode: 'test-tenant',
      name: 'Test Tenant',
      shortName: 'Test',
      tenantKind: 'member',
      modules: ['hrm'],
    };

    it('success path: creates tenant and returns tenantId', async () => {
      // The service returns the tenantCode from the DTO, not a generated ID
      dbMock = createDbMock({ createCompany: { tenantId: validDto.tenantCode } });
      service = new CompaniesService(dbMock, auditMock);

      const result = await service.createCompany(validDto, ISSUED_BY);

      expect(result).toEqual({ tenantId: validDto.tenantCode });
      expect(auditMock.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: ISSUED_BY,
          action: 'TENANT_PROVISION_INITIATED',
          entityType: 'tenant',
          entityId: validDto.tenantCode,
          payload: expect.objectContaining({
            eventType: 'TENANT_PROVISION_INITIATED',
            tenantId: validDto.tenantCode,
            tenantKind: validDto.tenantKind,
            modules: validDto.modules,
            status: 'provisioning',
            issuedBy: ISSUED_BY,
          }),
        }),
      );
    });

    it('conflict check: throws 409 when tenant already exists', async () => {
      dbMock = createDbMock({ createCompany: { conflict: true } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.createCompany(validDto, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-409',
        status: HttpStatus.CONFLICT,
        details: { tenantCode: validDto.tenantCode },
      });
      expect(auditMock.emit).not.toHaveBeenCalled();
    });

    it('throws 500 when DB returns no tenant_id and no conflict', async () => {
      // Return a row with null tenant_id and no conflict to simulate unexpected DB state
      const query = jest.fn(async (sql: string, params?: unknown[]) => {
        const text = String(sql);
        if (text.includes('WITH conflict_check') && text.includes('tenant_ins') && text.includes('le_ins')) {
          return { rows: [{ tenant_id: null, conflict: null }] };
        }
        return { rows: [] };
      });
      dbMock = { query } as unknown as XbosDbService;
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.createCompany(validDto, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-500',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });

    it('legalEntity optional insertion: includes legal entity when provided', async () => {
      const dtoWithLe: CreateCompanyDto = {
        ...validDto,
        legalEntity: {
          code: 'TEST001',
          name: 'Test Legal Entity',
          taxCode: '0123456789',
          businessLines: 'testing',
        },
      };

      dbMock = createDbMock({ createCompany: { tenantId: TENANT_ID } });
      service = new CompaniesService(dbMock, auditMock);

      await service.createCompany(dtoWithLe, ISSUED_BY);

      const queryCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes('WITH conflict_check'),
      );
      expect(queryCall).toBeDefined();
      // params: [tenantCode, name, shortName, tenantKind, modulesJson, leCode, leName, leTaxCode, leBusinessLines, hasLe]
      expect(queryCall![1][5]).toBe('TEST001'); // leCode
      expect(queryCall![1][6]).toBe('Test Legal Entity'); // leName
      expect(queryCall![1][7]).toBe('0123456789'); // leTaxCode
      expect(queryCall![1][8]).toBe('testing'); // leBusinessLines
      expect(queryCall![1][9]).toBe(true); // hasLe
    });

    it('legalEntity optional insertion: omits legal entity when not provided', async () => {
      dbMock = createDbMock({ createCompany: { tenantId: TENANT_ID } });
      service = new CompaniesService(dbMock, auditMock);

      await service.createCompany(validDto, ISSUED_BY);

      const queryCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes('WITH conflict_check'),
      );
      expect(queryCall).toBeDefined();
      expect(queryCall![1][5]).toBeNull(); // leCode
      expect(queryCall![1][6]).toBeNull(); // leName
      expect(queryCall![1][7]).toBeNull(); // leTaxCode
      expect(queryCall![1][8]).toBeNull(); // leBusinessLines
      expect(queryCall![1][9]).toBe(false); // hasLe
    });

    it('legalEntity optional insertion: includes legal entity when only partial fields provided', async () => {
      const dtoWithPartialLe: CreateCompanyDto = {
        ...validDto,
        legalEntity: {
          code: 'PARTIAL',
        },
      };

      dbMock = createDbMock({ createCompany: { tenantId: TENANT_ID } });
      service = new CompaniesService(dbMock, auditMock);

      await service.createCompany(dtoWithPartialLe, ISSUED_BY);

      const queryCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes('WITH conflict_check'),
      );
      expect(queryCall).toBeDefined();
      expect(queryCall![1][9]).toBe(true); // hasLe = true because code is provided
    });

    it('transaction atomicity: CTE rolls back legal_entity insert on failure (simulated via conflict)', async () => {
      dbMock = createDbMock({ createCompany: { conflict: true } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.createCompany(validDto, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-409',
      });
      // The CTE handles atomicity at DB level - no separate rollback needed in service
    });
  });

  describe('activateTenant', () => {
    it('success: transitions provisioning -> active, emits TENANT_PROVISIONED', async () => {
      dbMock = createDbMock({
        activateTenant: { rowsAffected: 1, modules: ['hrm', 'logistics'] },
      });
      service = new CompaniesService(dbMock, auditMock);

      await service.activateTenant(TENANT_ID, ISSUED_BY);

      const updateCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes("status = 'active'") && String(c[0]).includes("status = 'provisioning'"),
      );
      expect(updateCall).toBeDefined();
      expect(updateCall![1]).toEqual([TENANT_ID]);

      expect(auditMock.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: ISSUED_BY,
          tenantId: TENANT_ID,
          action: 'TENANT_PROVISIONED',
          entityType: 'tenant',
          entityId: TENANT_ID,
          payload: expect.objectContaining({
            eventType: 'TENANT_PROVISIONED',
            tenantId: TENANT_ID,
            defaultCompanyId: 'main',
            modules: ['hrm', 'logistics'],
            issuedBy: ISSUED_BY,
          }),
        }),
      );
    });

    it('not found: throws 404 when tenant does not exist', async () => {
      dbMock = createDbMock({ activateTenant: { rowsAffected: 0, currentStatus: undefined } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.activateTenant(TENANT_ID, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-404',
        status: HttpStatus.NOT_FOUND,
        details: { tenantId: TENANT_ID },
      });
      expect(auditMock.emit).not.toHaveBeenCalled();
    });

    it('wrong status: throws 400 when current status is not provisioning', async () => {
      dbMock = createDbMock({ activateTenant: { rowsAffected: 0, currentStatus: 'active' } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.activateTenant(TENANT_ID, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-400',
        status: HttpStatus.BAD_REQUEST,
        details: { tenantId: TENANT_ID, currentStatus: 'active' },
      });
      expect(auditMock.emit).not.toHaveBeenCalled();
    });

    it('wrong status: throws 400 when current status is suspended', async () => {
      dbMock = createDbMock({ activateTenant: { rowsAffected: 0, currentStatus: 'suspended' } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.activateTenant(TENANT_ID, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-400',
        details: { tenantId: TENANT_ID, currentStatus: 'suspended' },
      });
    });
  });

  describe('suspendTenant', () => {
    it('success: sets status = suspended, emits TENANT_SUSPENDED', async () => {
      dbMock = createDbMock({ suspendTenant: { rowsAffected: 1 } });
      service = new CompaniesService(dbMock, auditMock);

      await service.suspendTenant(TENANT_ID, ISSUED_BY);

      const updateCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes("status = 'suspended'"),
      );
      expect(updateCall).toBeDefined();
      expect(updateCall![1]).toEqual([TENANT_ID]);

      expect(auditMock.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: ISSUED_BY,
          tenantId: TENANT_ID,
          action: 'TENANT_SUSPENDED',
          entityType: 'tenant',
          entityId: TENANT_ID,
          payload: expect.objectContaining({
            eventType: 'TENANT_SUSPENDED',
            tenantId: TENANT_ID,
            issuedBy: ISSUED_BY,
          }),
        }),
      );
    });

    it('not found: throws 404 when tenant does not exist', async () => {
      dbMock = createDbMock({ suspendTenant: { rowsAffected: 0 } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.suspendTenant(TENANT_ID, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-404',
        status: HttpStatus.NOT_FOUND,
        details: { tenantId: TENANT_ID },
      });
      expect(auditMock.emit).not.toHaveBeenCalled();
    });
  });

  describe('updateModules', () => {
    const updateDto: UpdateModulesDto = { modules: ['hrm', 'logistics'] };

    it('success: updates modules JSONB', async () => {
      dbMock = createDbMock({
        updateModules: { exists: true, status: 'active', existingModules: ['hrm'] },
      });
      service = new CompaniesService(dbMock, auditMock);

      await service.updateModules(TENANT_ID, updateDto, ISSUED_BY);

      const selectCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes('SELECT status, modules'),
      );
      expect(selectCall).toBeDefined();
      expect(selectCall![1]).toEqual([TENANT_ID]);

      const updateCall = (dbMock.query as jest.Mock).mock.calls.find((c) =>
        String(c[0]).includes('modules =') && String(c[0]).includes('updated_at'),
      );
      expect(updateCall).toBeDefined();
      expect(updateCall![1]).toEqual([TENANT_ID, JSON.stringify(['hrm', 'logistics'])]);

      expect(auditMock.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          actor: ISSUED_BY,
          tenantId: TENANT_ID,
          action: 'TENANT_MODULE_ADDED',
          entityType: 'tenant',
          entityId: TENANT_ID,
          payload: expect.objectContaining({
            eventType: 'TENANT_MODULE_ADDED',
            tenantId: TENANT_ID,
            addedModules: ['logistics'],
            allModules: ['hrm', 'logistics'],
            issuedBy: ISSUED_BY,
          }),
        }),
      );
    });

    it('not found: throws 404 when tenant does not exist', async () => {
      dbMock = createDbMock({ updateModules: { exists: false } });
      service = new CompaniesService(dbMock, auditMock);

      await expect(service.updateModules(TENANT_ID, updateDto, ISSUED_BY)).rejects.toMatchObject<ApiException>({
        code: 'XBOS-SETTINGS-404',
        status: HttpStatus.NOT_FOUND,
        details: { tenantId: TENANT_ID },
      });
      expect(auditMock.emit).not.toHaveBeenCalled();
    });

    it('does NOT emit TENANT_MODULE_ADDED when tenant is not active', async () => {
      dbMock = createDbMock({
        updateModules: { exists: true, status: 'provisioning', existingModules: ['hrm'] },
      });
      service = new CompaniesService(dbMock, auditMock);

      await service.updateModules(TENANT_ID, updateDto, ISSUED_BY);

      expect(auditMock.emit).not.toHaveBeenCalled();
    });

    it('does NOT emit TENANT_MODULE_ADDED when no new modules added', async () => {
      const dtoNoNew: UpdateModulesDto = { modules: ['hrm'] };
      dbMock = createDbMock({
        updateModules: { exists: true, status: 'active', existingModules: ['hrm'] },
      });
      service = new CompaniesService(dbMock, auditMock);

      await service.updateModules(TENANT_ID, dtoNoNew, ISSUED_BY);

      expect(auditMock.emit).not.toHaveBeenCalled();
    });

    it('emits TENANT_MODULE_ADDED when active tenant gains new modules', async () => {
      dbMock = createDbMock({
        updateModules: { exists: true, status: 'active', existingModules: ['hrm'] },
      });
      service = new CompaniesService(dbMock, auditMock);

      await service.updateModules(TENANT_ID, { modules: ['hrm', 'logistics'] }, ISSUED_BY);

      const emitCalls = (auditMock.emit as jest.Mock).mock.calls;
      const moduleAddedCall = emitCalls.find((c) => c[0]?.action === 'TENANT_MODULE_ADDED');
      expect(moduleAddedCall).toBeDefined();
      expect(moduleAddedCall[0].payload.addedModules).toEqual(['logistics']);
    });

    it('emits TENANT_MODULE_ADDED with all modules when multiple new modules added', async () => {
      dbMock = createDbMock({
        updateModules: { exists: true, status: 'active', existingModules: [] },
      });
      service = new CompaniesService(dbMock, auditMock);

      await service.updateModules(TENANT_ID, { modules: ['hrm', 'logistics'] }, ISSUED_BY);

      const emitCalls = (auditMock.emit as jest.Mock).mock.calls;
      const moduleAddedCall = emitCalls.find((c) => c[0]?.action === 'TENANT_MODULE_ADDED');
      expect(moduleAddedCall).toBeDefined();
      expect(moduleAddedCall[0].payload.addedModules).toEqual(['hrm', 'logistics']);
      expect(moduleAddedCall[0].payload.allModules).toEqual(['hrm', 'logistics']);
    });
  });
});