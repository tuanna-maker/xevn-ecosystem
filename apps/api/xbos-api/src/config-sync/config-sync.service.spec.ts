import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ConfigSyncService } from './config-sync.service';
import { XbosDbService } from '../db/xbos-db.service';
import { PlatformAuditService } from '../platform/platform-audit.service';
import { createHash } from 'node:crypto';

describe('ConfigSyncService', () => {
  const db = {
    query: jest.fn(),
  } as unknown as XbosDbService;
  const platformAudit = {
    emit: jest.fn().mockResolvedValue(undefined),
  } as unknown as PlatformAuditService;

  let service: ConfigSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigSyncService(db, platformAudit);
    db.query = jest.fn().mockResolvedValue({ rows: [] });
  });

  it('rejects invalid catalog key format', async () => {
    await expect(service.getCatalogForTarget('bad key', 'hrm', 'xevn', 'vtc')).rejects.toMatchObject<ApiException>({
      code: 'XBOS-VAL-002',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('keeps version unchanged when checksum is unchanged', async () => {
    const publishChecksum = `sha256:${createHash('sha256')
      .update(JSON.stringify([{ code: 'CEO', label: 'CEO', status: 'active' }]))
      .digest('hex')}`;

    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes('SELECT version, checksum')) {
        return Promise.resolve({
          rows: [{ version: 7, checksum: publishChecksum }],
        });
      }
      if (sql.includes('SELECT catalog_key, name, domain, assigned_systems, version, checksum, updated_at')) {
        return Promise.resolve({
          rows: [
            {
              catalog_key: 'job_titles',
              name: 'Job Titles',
              domain: 'human_resources',
              assigned_systems: ['hrm', 'xbos'],
              version: 7,
              checksum: publishChecksum,
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }
      if (sql.includes('SELECT code, label, unit, status')) {
        return Promise.resolve({
          rows: [{ code: 'CEO', label: 'CEO', status: 'active', unit: null }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await service.publishCatalog('job_titles', {
      tenantId: 'xevn',
      companyId: 'vtc',
      name: 'Job Titles',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
    });

    expect(result.version).toBe(7);
    // W1-B-03-TC-CAT / OS 28 — display-ready item labels on publish response
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        code: 'CEO',
        label: 'CEO',
        status: 'active',
        status_label: 'Đang dùng',
        status_tone: 'success',
      }),
    );
    const publishUpsertCall = (db.query as jest.Mock).mock.calls.find((call) =>
      String(call[0]).includes('INSERT INTO public.config_catalogs'),
    );
    expect(publishUpsertCall?.[1][6]).toBe(7);
    expect(platformAudit.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'config_catalog.publish',
        entityType: 'config_catalog',
        entityId: 'job_titles',
        tenantId: 'xevn',
        companyId: 'vtc',
      }),
    );
  });

  it('rejects publish payload without items', async () => {
    await expect(
      service.publishCatalog('job_titles', {
        tenantId: 'xevn',
        companyId: 'holding',
        name: 'Titles',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        items: [],
      }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-VAL-005',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('UC-ECO-MASTER-02: bootstrapXevnGroupConfig publishes only master holding catalogs', async () => {
    const publishSpy = jest.spyOn(service, 'publishCatalog').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'holding',
      key: 'job_titles',
      name: 'Titles',
      domain: 'human_resources',
      assignedTo: ['hrm'],
      version: 1,
      checksum: 'sha256:abc',
      updatedAt: new Date().toISOString(),
      items: [{ code: 'CEO', label: 'CEO', status: 'active' }],
    });

    const result = await service.bootstrapXevnGroupConfig();

    expect(result.seeded_catalogs).toBe(3);
    expect(publishSpy).toHaveBeenCalledTimes(3);
    for (const [, payload] of publishSpy.mock.calls) {
      expect(payload.tenantId).toBe('xevn');
      expect(payload.companyId).toBe('holding');
    }
    publishSpy.mockRestore();
  });

  it('fails fast on checksum mismatch for retrieve', async () => {
    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (sql.includes('SELECT catalog_key, name, domain, assigned_systems, version, checksum, updated_at')) {
        return Promise.resolve({
          rows: [
            {
              catalog_key: 'job_titles',
              name: 'Job Titles',
              domain: 'human_resources',
              assigned_systems: ['hrm'],
              version: 2,
              checksum: 'sha256:invalid',
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }
      if (sql.includes('SELECT code, label, unit, status')) {
        return Promise.resolve({
          rows: [{ code: 'CEO', label: 'CEO', status: 'active', unit: null }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    await expect(service.getCatalogForTarget('job_titles', 'hrm', 'xevn', 'vtc')).rejects.toMatchObject<ApiException>({
      code: 'XBOS-CFG-004',
      status: HttpStatus.CONFLICT,
    });
  });

  it('G-BM-REC-01: applyCatalogToMembers rejects keys outside allow-list', async () => {
    await expect(
      service.applyCatalogToMembers('cost_centers', {
        tenantId: 'xevn',
        companyId: 'holding',
        memberCompanyIds: ['vtc'],
      }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-CFG-005',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('G-BM-REC-01: applyCatalogToMembers requires targets or memberCompanyIds', async () => {
    await expect(
      service.applyCatalogToMembers('job_titles', {
        tenantId: 'xevn',
        companyId: 'holding',
      }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-VAL-011',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('G-BM-REC-01 / XBOS-DM-HRM-07: applyCatalogToMembers fans out to member scopes via publish', async () => {
    const sourceItems = [{ code: 'CEO', label: 'CEO', status: 'active' as const }];
    const publishSpy = jest.spyOn(service, 'publishCatalog').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      key: 'job_titles',
      name: 'Titles',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 1,
      checksum: 'sha256:applied',
      updatedAt: new Date().toISOString(),
      items: sourceItems,
    });
    jest.spyOn(service, 'getCatalogForTarget').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'holding',
      key: 'job_titles',
      name: 'Titles',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 3,
      checksum: 'sha256:source',
      updatedAt: new Date().toISOString(),
      items: sourceItems,
    });

    const result = await service.applyCatalogToMembers('job_titles', {
      tenantId: 'xevn',
      companyId: 'holding',
      targets: [{ tenantId: 'xe-du-lich', companyId: 'main' }],
      memberCompanyIds: ['vtc'],
      actor: 'group_ceo',
    });

    expect(result.appliedCount).toBe(2);
    expect(publishSpy).toHaveBeenCalledTimes(2);
    expect(publishSpy).toHaveBeenCalledWith(
      'job_titles',
      expect.objectContaining({
        tenantId: 'xe-du-lich',
        companyId: 'main',
        name: 'Titles',
        items: sourceItems,
        actor: 'group_ceo',
      }),
    );
    expect(publishSpy).toHaveBeenCalledWith(
      'job_titles',
      expect.objectContaining({
        tenantId: 'xevn',
        companyId: 'vtc',
      }),
    );
    expect(platformAudit.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'config_catalog.apply_to_members',
        entityId: 'job_titles',
        tenantId: 'xevn',
        companyId: 'holding',
      }),
    );
    publishSpy.mockRestore();
  });

  it('G-BM-REC-01: applyCatalogToMembers rejects target equal to source', async () => {
    await expect(
      service.applyCatalogToMembers('recruitment_channels', {
        tenantId: 'xevn',
        companyId: 'holding',
        memberCompanyIds: ['holding'],
      }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-VAL-012',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('E-XBOS-CTRL-G1 / XBOS-CFG-005: Tier C / P2 keys still rejected (salary_components)', async () => {
    await expect(
      service.applyCatalogToMembers('salary_components', {
        tenantId: 'xevn',
        companyId: 'holding',
        memberCompanyIds: ['vtc'],
      }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-CFG-005',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('E-XBOS-CTRL-G1 P0: departments + leave_types pass allow-list and fan-out', async () => {
    const sourceItems = [{ code: 'HCNS', label: 'HCNS', status: 'active' as const }];
    const publishSpy = jest.spyOn(service, 'publishCatalog').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'vtc',
      key: 'departments',
      name: 'Departments',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 1,
      checksum: 'sha256:applied',
      updatedAt: new Date().toISOString(),
      items: sourceItems,
    });
    jest.spyOn(service, 'getCatalogForTarget').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'holding',
      key: 'departments',
      name: 'Departments',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 2,
      checksum: 'sha256:source',
      updatedAt: new Date().toISOString(),
      items: sourceItems,
    });

    const dept = await service.applyCatalogToMembers('departments', {
      tenantId: 'xevn',
      companyId: 'holding',
      memberCompanyIds: ['vtc'],
    });
    expect(dept.catalogKey).toBe('departments');
    expect(dept.writeKey).toBe('departments');
    expect(publishSpy).toHaveBeenCalledWith('departments', expect.any(Object));

    jest.spyOn(service, 'getCatalogForTarget').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'holding',
      key: 'leave_types',
      name: 'Leave',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 1,
      checksum: 'sha256:leave',
      updatedAt: new Date().toISOString(),
      items: [{ code: 'AL', label: 'Phép năm', status: 'active' }],
    });
    publishSpy.mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'vtc',
      key: 'leave_types',
      name: 'Leave',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 1,
      checksum: 'sha256:leave-applied',
      updatedAt: new Date().toISOString(),
      items: [{ code: 'AL', label: 'Phép năm', status: 'active' }],
    });

    const leave = await service.applyCatalogToMembers('leave_types', {
      tenantId: 'xevn',
      companyId: 'holding',
      memberCompanyIds: ['vtc'],
    });
    expect(leave.catalogKey).toBe('leave_types');
    expect(publishSpy).toHaveBeenCalledWith('leave_types', expect.any(Object));
    publishSpy.mockRestore();
  });

  it('E-XBOS-CTRL-G1 P1: decision_types alias hr_decision_types writes source L0 key', async () => {
    const sourceItems = [{ code: 'BO_NHIEM', label: 'Bổ nhiệm', status: 'active' as const }];
    const publishSpy = jest.spyOn(service, 'publishCatalog').mockResolvedValue({
      contractVersion: 'xbos-config-v1',
      checksumAlgorithm: 'sha256:items-canonical-v1',
      tenantId: 'xevn',
      companyId: 'vtc',
      key: 'hr_decision_types',
      name: 'DEC',
      domain: 'human_resources',
      assignedTo: ['hrm', 'xbos'],
      version: 1,
      checksum: 'sha256:dec-applied',
      updatedAt: new Date().toISOString(),
      items: sourceItems,
    });
    const getSpy = jest.spyOn(service, 'getCatalogForTarget').mockImplementation(async (key: string) => {
      if (key === 'decision_types') {
        throw new ApiException('XBOS-CFG-001', 'missing', HttpStatus.NOT_FOUND);
      }
      if (key === 'hr_decision_types') {
        return {
          contractVersion: 'xbos-config-v1' as const,
          checksumAlgorithm: 'sha256:items-canonical-v1' as const,
          tenantId: 'xevn',
          companyId: 'holding',
          key: 'hr_decision_types',
          name: 'DEC',
          domain: 'human_resources',
          assignedTo: ['hrm', 'xbos'] as ('hrm' | 'xbos')[],
          version: 4,
          checksum: 'sha256:dec-source',
          updatedAt: new Date().toISOString(),
          items: sourceItems,
        };
      }
      throw new ApiException('XBOS-CFG-001', 'missing', HttpStatus.NOT_FOUND);
    });

    const viaCanonical = await service.applyCatalogToMembers('decision_types', {
      tenantId: 'xevn',
      companyId: 'holding',
      memberCompanyIds: ['vtc'],
    });
    expect(viaCanonical.catalogKey).toBe('decision_types');
    expect(viaCanonical.writeKey).toBe('hr_decision_types');
    expect(publishSpy).toHaveBeenCalledWith('hr_decision_types', expect.any(Object));

    const viaAlias = await service.applyCatalogToMembers('hr_decision_types', {
      tenantId: 'xevn',
      companyId: 'holding',
      memberCompanyIds: ['vtc'],
    });
    expect(viaAlias.catalogKey).toBe('decision_types');
    expect(viaAlias.writeKey).toBe('hr_decision_types');

    getSpy.mockRestore();
    publishSpy.mockRestore();
  });

  it('E-XBOS-CTRL-G1 P1: contract_types / employment_types / pay_types / shifts allowed', async () => {
    const keys = ['contract_types', 'employment_types', 'pay_types', 'shifts'] as const;
    for (const key of keys) {
      const publishSpy = jest.spyOn(service, 'publishCatalog').mockResolvedValue({
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId: 'xevn',
        companyId: 'vtc',
        key,
        name: key,
        domain: 'human_resources',
        assignedTo: ['hrm'],
        version: 1,
        checksum: 'sha256:ok',
        updatedAt: new Date().toISOString(),
        items: [{ code: 'A', label: 'A', status: 'active' }],
      });
      jest.spyOn(service, 'getCatalogForTarget').mockResolvedValue({
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId: 'xevn',
        companyId: 'holding',
        key,
        name: key,
        domain: 'human_resources',
        assignedTo: ['hrm'],
        version: 1,
        checksum: 'sha256:src',
        updatedAt: new Date().toISOString(),
        items: [{ code: 'A', label: 'A', status: 'active' }],
      });
      const result = await service.applyCatalogToMembers(key, {
        tenantId: 'xevn',
        companyId: 'holding',
        memberCompanyIds: ['vtc'],
      });
      expect(result.catalogKey).toBe(key);
      expect(publishSpy).toHaveBeenCalledWith(key, expect.any(Object));
      publishSpy.mockRestore();
      jest.spyOn(service, 'getCatalogForTarget').mockRestore();
    }
  });

  describe('PO-UC-TC-W3-BE-LOG09 / XBOS-DM-LOG-09 cloneCatalogBundle', () => {
    it('HP: copies logistics domain catalogs to empty dest and leaves source untouched', async () => {
      (db.query as jest.Mock).mockImplementation((sql: string) => {
        if (sql.includes('FROM public.config_catalogs c') && sql.includes('lower(c.domain)')) {
          return Promise.resolve({
            rows: [
              {
                catalog_key: 'log_dm_vehicle_type',
                name: 'Loại xe',
                domain: 'logistics',
                assigned_systems: ['xbos'],
                items: [{ code: 'TRUCK', label: 'Xe tải', status: 'active', unit: null }],
              },
              {
                catalog_key: 'log_dm_route_type',
                name: 'Loại tuyến',
                domain: 'logistics',
                assigned_systems: ['xbos'],
                items: [{ code: 'CITY', label: 'Nội thành', status: 'active', unit: null }],
              },
            ],
          });
        }
        if (sql.includes('catalog_key = ANY($3::text[])')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const publishSpy = jest.spyOn(service, 'publishCatalog').mockImplementation(async (key, body) => ({
        contractVersion: 'xbos-config-v1' as const,
        checksumAlgorithm: 'sha256:items-canonical-v1' as const,
        tenantId: body.tenantId,
        companyId: body.companyId,
        key,
        name: body.name,
        domain: body.domain,
        assignedTo: body.assignedTo,
        version: 1,
        checksum: `sha256:${key}`,
        updatedAt: new Date().toISOString(),
        items: body.items.map((item) => ({
          ...item,
          status_label: 'Đang dùng' as const,
          status_tone: 'success' as const,
        })),
      }));

      const result = await service.cloneCatalogBundle({
        sourceTenantId: 'xevn',
        sourceCompanyId: 'holding',
        destTenantId: 'xevn',
        destCompanyId: 'logistics',
        domains: ['logistics'],
        actor: 'ceo@xe.vn',
      });

      expect(result.copiedCount).toBe(2);
      expect(result.skippedCount).toBe(0);
      expect(result.domains).toEqual(['logistics']);
      expect(result.onConflict).toBe('fail');
      expect(result.dest).toEqual({ tenantId: 'xevn', companyId: 'logistics' });
      expect(publishSpy).toHaveBeenCalledTimes(2);
      expect(publishSpy).toHaveBeenCalledWith(
        'log_dm_vehicle_type',
        expect.objectContaining({
          tenantId: 'xevn',
          companyId: 'logistics',
          domain: 'logistics',
        }),
      );
      expect(platformAudit.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'config_catalog.clone_bundle',
          tenantId: 'xevn',
          companyId: 'holding',
        }),
      );
      publishSpy.mockRestore();
    });

    it('FD: onConflict=fail rejects when dest keys collide (no publish / no half-copy)', async () => {
      (db.query as jest.Mock).mockImplementation((sql: string) => {
        if (sql.includes('FROM public.config_catalogs c') && sql.includes('lower(c.domain)')) {
          return Promise.resolve({
            rows: [
              {
                catalog_key: 'log_dm_vehicle_type',
                name: 'Loại xe',
                domain: 'logistics',
                assigned_systems: ['xbos'],
                items: [{ code: 'TRUCK', label: 'Xe tải', status: 'active' }],
              },
            ],
          });
        }
        if (sql.includes('catalog_key = ANY($3::text[])')) {
          return Promise.resolve({ rows: [{ catalog_key: 'log_dm_vehicle_type' }] });
        }
        return Promise.resolve({ rows: [] });
      });
      const publishSpy = jest.spyOn(service, 'publishCatalog');

      await expect(
        service.cloneCatalogBundle({
          sourceTenantId: 'xevn',
          sourceCompanyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'logistics',
          domains: ['logistics'],
          onConflict: 'fail',
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'XBOS-CFG-009',
        status: HttpStatus.CONFLICT,
      });
      expect(publishSpy).not.toHaveBeenCalled();
      publishSpy.mockRestore();
    });

    it('FD: empty domains / same source-dest / empty source match are deterministic 4xx', async () => {
      await expect(
        service.cloneCatalogBundle({
          sourceTenantId: 'xevn',
          sourceCompanyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'holding',
          domains: ['logistics'],
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'XBOS-VAL-013',
        status: HttpStatus.BAD_REQUEST,
      });

      await expect(
        service.cloneCatalogBundle({
          sourceTenantId: 'xevn',
          sourceCompanyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'logistics',
          domains: [],
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'XBOS-VAL-001',
        status: HttpStatus.BAD_REQUEST,
      });

      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      await expect(
        service.cloneCatalogBundle({
          sourceTenantId: 'xevn',
          sourceCompanyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'logistics',
          domains: ['logistics'],
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'XBOS-CFG-008',
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('PO-UC-TC-W3-BE-DM09 / XBOS-DM-09 cloneCatalog', () => {
    const sourceItems = [
      { code: 'CEO', label: 'CEO', status: 'active' as const },
      { code: 'MGR', label: 'Manager', status: 'active' as const },
    ];

    it('HP TC-DM09-CPY-HP-001: clones source partition to dest via publishCatalog', async () => {
      jest.spyOn(service, 'getCatalogForTarget').mockResolvedValue({
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId: 'xevn',
        companyId: 'holding',
        key: 'job_titles',
        name: 'Chức danh',
        domain: 'human_resources',
        assignedTo: ['hrm', 'xbos'],
        version: 4,
        checksum: 'sha256:source',
        updatedAt: new Date().toISOString(),
        items: sourceItems,
      });
      (db.query as jest.Mock).mockImplementation((sql: string) => {
        if (sql.includes('code = ANY($4::text[])')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });
      const publishSpy = jest.spyOn(service, 'publishCatalog').mockResolvedValue({
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId: 'xe-du-lich',
        companyId: 'main',
        key: 'job_titles',
        name: 'Chức danh',
        domain: 'human_resources',
        assignedTo: ['hrm', 'xbos'],
        version: 1,
        checksum: 'sha256:dest',
        updatedAt: new Date().toISOString(),
        items: sourceItems,
      });

      const result = await service.cloneCatalog('job_titles', {
        tenantId: 'xevn',
        companyId: 'holding',
        destTenantId: 'xe-du-lich',
        destCompanyId: 'main',
        actor: 'group_ceo',
      });

      expect(result.catalogKey).toBe('job_titles');
      expect(result.onConflict).toBe('reject');
      expect(result.source).toEqual(
        expect.objectContaining({ tenantId: 'xevn', companyId: 'holding', itemCount: 2 }),
      );
      expect(result.dest).toEqual(
        expect.objectContaining({ tenantId: 'xe-du-lich', companyId: 'main', version: 1 }),
      );
      expect(publishSpy).toHaveBeenCalledWith(
        'job_titles',
        expect.objectContaining({
          tenantId: 'xe-du-lich',
          companyId: 'main',
          name: 'Chức danh',
          items: sourceItems,
          actor: 'group_ceo',
        }),
      );
      expect(platformAudit.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'config_catalog.clone',
          entityId: 'job_titles',
          tenantId: 'xevn',
          companyId: 'holding',
        }),
      );
      publishSpy.mockRestore();
    });

    it('FD TC-DM09-CPY-FD-001: rejects overlapping dest codes with XBOS-CFG-409', async () => {
      jest.spyOn(service, 'getCatalogForTarget').mockResolvedValue({
        contractVersion: 'xbos-config-v1',
        checksumAlgorithm: 'sha256:items-canonical-v1',
        tenantId: 'xevn',
        companyId: 'holding',
        key: 'job_titles',
        name: 'Chức danh',
        domain: 'human_resources',
        assignedTo: ['hrm'],
        version: 2,
        checksum: 'sha256:source',
        updatedAt: new Date().toISOString(),
        items: sourceItems,
      });
      (db.query as jest.Mock).mockImplementation((sql: string) => {
        if (sql.includes('code = ANY($4::text[])')) {
          return Promise.resolve({ rows: [{ code: 'CEO' }] });
        }
        return Promise.resolve({ rows: [] });
      });
      const publishSpy = jest.spyOn(service, 'publishCatalog');

      await expect(
        service.cloneCatalog('job_titles', {
          tenantId: 'xevn',
          companyId: 'holding',
          destTenantId: 'xe-du-lich',
          destCompanyId: 'main',
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'XBOS-CFG-409',
        status: HttpStatus.CONFLICT,
      });
      expect(publishSpy).not.toHaveBeenCalled();
      publishSpy.mockRestore();
    });

    it('rejects self-copy with XBOS-VAL-013', async () => {
      await expect(
        service.cloneCatalog('job_titles', {
          tenantId: 'xevn',
          companyId: 'holding',
          destTenantId: 'xevn',
          destCompanyId: 'holding',
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'XBOS-VAL-013',
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });
});
