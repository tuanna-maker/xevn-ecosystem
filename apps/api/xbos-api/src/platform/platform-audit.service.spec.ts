import { PlatformAuditService } from './platform-audit.service';
import { XbosDbService } from '../db/xbos-db.service';

describe('PlatformAuditService', () => {
  const db = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as XbosDbService;
  let service: PlatformAuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PlatformAuditService(db);
  });

  it('listEvents scopes query by tenant and company (UC-XBOS-06)', async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [{ action: 'test' }] });
    const out = await service.listEvents({
      tenantId: 'xevn',
      companyId: 'holding',
      limit: 10,
    });
    expect(out.total).toBe(1);
    const selectCall = (db.query as jest.Mock).mock.calls.find((call: unknown[]) =>
      String(call[0]).includes('SELECT event_id'),
    );
    expect(selectCall).toBeDefined();
    expect(String(selectCall![0])).toContain('platform_audit_events');
    expect(selectCall![1]).toEqual(expect.arrayContaining(['xevn', 'holding', 10]));
  });

  it('ensureSchema runs before emit and listEvents', async () => {
    await service.emit({
      actor: 'qa-bot',
      tenantId: 'xevn',
      companyId: 'holding',
      action: 'config_catalog.publish',
      entityType: 'config_catalog',
      entityId: 'job_titles',
      payload: { version: 2 },
    });
    expect((db.query as jest.Mock).mock.calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS platform_audit_events');
  });

  it('inserts platform_audit_events row on emit', async () => {
    await service.emit({
      actor: 'qa-bot',
      tenantId: 'xevn',
      companyId: 'holding',
      action: 'config_catalog.publish',
      entityType: 'config_catalog',
      entityId: 'job_titles',
      payload: { version: 2 },
    });

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO platform_audit_events'),
      expect.arrayContaining([
        'qa-bot',
        'xevn',
        'holding',
        'config_catalog.publish',
        'config_catalog',
        'job_titles',
      ]),
    );
  });
});
