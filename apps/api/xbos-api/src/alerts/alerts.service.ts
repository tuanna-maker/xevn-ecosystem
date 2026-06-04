import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { PlatformAuditService } from '../platform/platform-audit.service';
import {
  isRegisteredModuleCode,
  normalizeModuleCode,
  type ViolationSeverity,
} from './satellite-alerts.constants';
import type { ViolationIngestDto } from './dto/violation-ingest.dto';

export type ViolationIngestInput = ViolationIngestDto;

export type ViolationIngestResult = {
  eventId: string;
  duplicate: boolean;
  occurredAtUtc: string;
  moduleCode: string;
  severity: ViolationSeverity;
  portalAlertId: string | null;
};

@Injectable()
export class AlertsService {
  constructor(
    private readonly db: XbosDbService,
    private readonly platformAudit: PlatformAuditService,
  ) {}

  async ensureViolationSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_satellite_violations (
        event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NULL,
        module_code TEXT NOT NULL,
        occurred_at TIMESTAMPTZ NOT NULL,
        entity_ref JSONB NOT NULL DEFAULT '{}'::jsonb,
        rule_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        metric_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
        correlation_id TEXT NOT NULL,
        summary TEXT NULL,
        payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, correlation_id)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_xbos_satellite_violations_tenant_time
      ON public.xbos_satellite_violations (tenant_id, occurred_at DESC);
    `);
  }

  private parseOccurredAtUtc(occurredAt: string): Date {
    const trimmed = occurredAt.trim();
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      throw new ApiException(
        'XBOS-ALERT-003',
        'occurredAt must be a valid ISO-8601 datetime',
        HttpStatus.BAD_REQUEST,
        { field: 'occurredAt' },
      );
    }
    return parsed;
  }

  private assertIngestPayload(body: ViolationIngestInput): void {
    if (!body?.tenantId?.trim()) {
      throw new ApiException('XBOS-ALERT-001', 'tenantId is required', HttpStatus.BAD_REQUEST, {
        field: 'tenantId',
      });
    }
    if (!body?.moduleCode?.trim()) {
      throw new ApiException('XBOS-ALERT-001', 'moduleCode is required', HttpStatus.BAD_REQUEST, {
        field: 'moduleCode',
      });
    }
    if (!body?.correlationId?.trim()) {
      throw new ApiException('XBOS-ALERT-001', 'correlationId is required', HttpStatus.BAD_REQUEST, {
        field: 'correlationId',
      });
    }
    if (!body?.ruleId?.trim()) {
      throw new ApiException('XBOS-ALERT-001', 'ruleId is required', HttpStatus.BAD_REQUEST, {
        field: 'ruleId',
      });
    }
    if (!body?.entityRef || typeof body.entityRef !== 'object' || Array.isArray(body.entityRef)) {
      throw new ApiException('XBOS-ALERT-001', 'entityRef must be an object', HttpStatus.BAD_REQUEST, {
        field: 'entityRef',
      });
    }
    if (!body?.metricSnapshot || typeof body.metricSnapshot !== 'object' || Array.isArray(body.metricSnapshot)) {
      throw new ApiException('XBOS-ALERT-001', 'metricSnapshot must be an object', HttpStatus.BAD_REQUEST, {
        field: 'metricSnapshot',
      });
    }
    if (!isRegisteredModuleCode(body.moduleCode)) {
      throw new ApiException(
        'XBOS-ALERT-002',
        `moduleCode '${body.moduleCode}' is not registered`,
        HttpStatus.BAD_REQUEST,
        { field: 'moduleCode' },
      );
    }
  }

  private severityToPortalLevel(severity: ViolationSeverity): 'info' | 'warn' | 'critical' {
    if (severity === 'critical') return 'critical';
    if (severity === 'high') return 'warn';
    return 'info';
  }

  async ingestViolation(body: ViolationIngestInput): Promise<ViolationIngestResult> {
    this.assertIngestPayload(body);
    await this.ensureViolationSchema();

    const tenantId = body.tenantId.trim();
    const moduleCode = normalizeModuleCode(body.moduleCode);
    const correlationId = body.correlationId.trim();
    const occurredAt = this.parseOccurredAtUtc(body.occurredAt);
    const companyId = body.companyId?.trim() || null;
    const severity = body.severity;
    const summary =
      body.summary?.trim() ||
      `Violation ${body.ruleId} from ${moduleCode} (${severity})`;

    const payloadJson = {
      entityRef: body.entityRef,
      metricSnapshot: body.metricSnapshot,
      ruleId: body.ruleId,
    };

    const existing = await this.db.query<{ event_id: string }>(
      `
      SELECT event_id::text
      FROM public.xbos_satellite_violations
      WHERE tenant_id = $1 AND correlation_id = $2
      LIMIT 1
      `,
      [tenantId, correlationId],
    );
    if (existing.rows[0]) {
      return {
        eventId: existing.rows[0].event_id,
        duplicate: true,
        occurredAtUtc: occurredAt.toISOString(),
        moduleCode,
        severity,
        portalAlertId: null,
      };
    }

    const insert = await this.db.query<{ event_id: string }>(
      `
      INSERT INTO public.xbos_satellite_violations (
        tenant_id, company_id, module_code, occurred_at, entity_ref, rule_id,
        severity, metric_snapshot, correlation_id, summary, payload_json
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8::jsonb, $9, $10, $11::jsonb)
      RETURNING event_id::text
      `,
      [
        tenantId,
        companyId,
        moduleCode,
        occurredAt.toISOString(),
        JSON.stringify(body.entityRef),
        body.ruleId.trim(),
        severity,
        JSON.stringify(body.metricSnapshot),
        correlationId,
        summary,
        JSON.stringify(payloadJson),
      ],
    );

    const eventId = insert.rows[0]?.event_id ?? '';

    await this.platformAudit.emit({
      tenantId,
      companyId: companyId ?? undefined,
      action: 'satellite.violation.ingest',
      entityType: 'xbos_satellite_violation',
      entityId: eventId,
      payload: { moduleCode, ruleId: body.ruleId, severity, correlationId },
    });

    let portalAlertId: string | null = null;
    if (severity === 'high' || severity === 'critical') {
      await this.ensurePortalAlertsSchema();
      const portal = await this.db.query<{ id: string }>(
        `
        INSERT INTO public.xbos_portal_alerts (
          tenant_id, company_id, module_code, level, title, detail, source_system, source_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'satellite-violation', $7)
        RETURNING id::text
        `,
        [
          tenantId,
          companyId,
          moduleCode,
          this.severityToPortalLevel(severity),
          summary.slice(0, 240),
          JSON.stringify(body.metricSnapshot).slice(0, 2000),
          eventId,
        ],
      );
      portalAlertId = portal.rows[0]?.id ?? null;
    }

    return {
      eventId,
      duplicate: false,
      occurredAtUtc: occurredAt.toISOString(),
      moduleCode,
      severity,
      portalAlertId,
    };
  }

  private async ensurePortalAlertsSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_portal_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NULL,
        module_code TEXT NOT NULL DEFAULT 'system',
        level TEXT NOT NULL DEFAULT 'info',
        title TEXT NOT NULL,
        detail TEXT NULL,
        source_system TEXT NOT NULL DEFAULT 'xbos',
        source_id TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dismissed_at TIMESTAMPTZ NULL
      );
    `);
  }
}
