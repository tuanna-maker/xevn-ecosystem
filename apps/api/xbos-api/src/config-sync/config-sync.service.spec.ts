import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ConfigSyncService } from './config-sync.service';
import { XbosDbService } from '../db/xbos-db.service';
import { createHash } from 'node:crypto';

describe('ConfigSyncService', () => {
  const db = {
    query: jest.fn(),
  } as unknown as XbosDbService;

  let service: ConfigSyncService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ConfigSyncService(db);
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
