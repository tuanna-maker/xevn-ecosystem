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
});
