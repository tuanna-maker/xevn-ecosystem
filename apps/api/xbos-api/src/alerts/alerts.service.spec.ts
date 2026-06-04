import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { AlertsService } from './alerts.service';
import { XbosDbService } from '../db/xbos-db.service';
import { PlatformAuditService } from '../platform/platform-audit.service';

const validPayload = {
  tenantId: 'xevn',
  moduleCode: 'TRSPORT',
  occurredAt: '2026-03-25T09:15:00Z',
  entityRef: { routeId: 'route-12' },
  ruleId: 'TRSPORT_FILL_RATE_MIN',
  severity: 'high' as const,
  metricSnapshot: { metricCode: 'fill_rate', value: 0.62, threshold: 0.7 },
  correlationId: 'trsport-2026-03-25-8f1c',
};

describe('AlertsService', () => {
  const db = { query: jest.fn() } as unknown as XbosDbService;
  const platformAudit = { emit: jest.fn().mockResolvedValue(undefined) } as unknown as PlatformAuditService;
  let service: AlertsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AlertsService(db, platformAudit);
    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('SELECT event_id') && String(sql).includes('correlation_id')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('INSERT INTO public.xbos_satellite_violations')) {
        return Promise.resolve({ rows: [{ event_id: 'evt-1' }] });
      }
      if (String(sql).includes('INSERT INTO public.xbos_portal_alerts')) {
        return Promise.resolve({ rows: [{ id: 'alert-1' }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it('rejects unregistered moduleCode with XBOS-ALERT-002', async () => {
    await expect(
      service.ingestViolation({ ...validPayload, moduleCode: 'UNKNOWN-SPOKE' }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-ALERT-002',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('rejects invalid occurredAt with XBOS-ALERT-003', async () => {
    await expect(
      service.ingestViolation({ ...validPayload, occurredAt: 'not-a-date' }),
    ).rejects.toMatchObject<ApiException>({
      code: 'XBOS-ALERT-003',
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('accepts violation and emits platform audit', async () => {
    const result = await service.ingestViolation(validPayload);
    expect(result.duplicate).toBe(false);
    expect(result.eventId).toBe('evt-1');
    expect(result.moduleCode).toBe('trsport');
    expect(result.portalAlertId).toBe('alert-1');
    expect(platformAudit.emit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'satellite.violation.ingest',
        entityType: 'xbos_satellite_violation',
      }),
    );
  });

  it('returns duplicate without re-insert when correlationId exists', async () => {
    (db.query as jest.Mock).mockImplementation((sql: string) => {
      if (String(sql).includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] });
      }
      if (String(sql).includes('SELECT event_id') && String(sql).includes('correlation_id')) {
        return Promise.resolve({ rows: [{ event_id: 'evt-existing' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await service.ingestViolation(validPayload);
    expect(result.duplicate).toBe(true);
    expect(result.eventId).toBe('evt-existing');
    expect(platformAudit.emit).not.toHaveBeenCalled();
  });
});
