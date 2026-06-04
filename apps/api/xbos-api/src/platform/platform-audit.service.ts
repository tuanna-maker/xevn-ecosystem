import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { XbosDbService } from '../db/xbos-db.service';

export type PlatformAuditInput = {
  actor?: string;
  tenantId?: string;
  companyId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  request?: Request;
};

@Injectable()
export class PlatformAuditService {
  constructor(private readonly db: XbosDbService) {}

  private async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS platform_audit_events (
        event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actor TEXT,
        tenant_id TEXT,
        company_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        payload_json JSONB DEFAULT '{}'::jsonb,
        request_id TEXT
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_platform_audit_events_tenant
      ON platform_audit_events (tenant_id, occurred_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_platform_audit_events_request
      ON platform_audit_events (request_id);
    `);
  }

  async emit(input: PlatformAuditInput): Promise<void> {
    await this.ensureSchema();
    const requestId =
      input.request?.platformContext?.requestId ??
      (input.request?.headers['x-request-id'] as string | undefined);
    await this.db.query(
      `INSERT INTO platform_audit_events
        (actor, tenant_id, company_id, action, entity_type, entity_id, payload_json, request_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [
        input.actor ?? null,
        input.tenantId ?? null,
        input.companyId ?? null,
        input.action,
        input.entityType,
        input.entityId ?? null,
        JSON.stringify(input.payload ?? {}),
        requestId ?? null,
      ],
    );
  }

  /** UC-XBOS-06 — scoped audit read (tenant + optional company). */
  async listEvents(filters: {
    tenantId: string;
    companyId: string;
    action?: string;
    entityType?: string;
    limit: number;
  }): Promise<{ total: number; items: Record<string, unknown>[] }> {
    await this.ensureSchema();
    const params: unknown[] = [filters.tenantId, filters.companyId];
    let where = 'tenant_id = $1 AND (company_id = $2 OR company_id IS NULL)';
    if (filters.action) {
      params.push(filters.action);
      where += ` AND action = $${params.length}`;
    }
    if (filters.entityType) {
      params.push(filters.entityType);
      where += ` AND entity_type = $${params.length}`;
    }
    params.push(filters.limit);
    const limitIdx = params.length;
    const res = await this.db.query<Record<string, unknown>>(
      `SELECT event_id, occurred_at, actor, tenant_id, company_id, action, entity_type, entity_id,
              payload_json, request_id
       FROM platform_audit_events
       WHERE ${where}
       ORDER BY occurred_at DESC
       LIMIT $${limitIdx}`,
      params,
    );
    return { total: res.rows.length, items: res.rows };
  }
}
