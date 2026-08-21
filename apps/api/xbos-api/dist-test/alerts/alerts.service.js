"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
const platform_audit_service_1 = require("../platform/platform-audit.service");
const satellite_alerts_constants_1 = require("./satellite-alerts.constants");
let AlertsService = class AlertsService {
    db;
    platformAudit;
    constructor(db, platformAudit) {
        this.db = db;
        this.platformAudit = platformAudit;
    }
    async ensureViolationSchema() {
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
    parseOccurredAtUtc(occurredAt) {
        const trimmed = occurredAt.trim();
        const parsed = new Date(trimmed);
        if (Number.isNaN(parsed.getTime())) {
            throw new api_exception_1.ApiException('XBOS-ALERT-003', 'occurredAt must be a valid ISO-8601 datetime', common_1.HttpStatus.BAD_REQUEST, { field: 'occurredAt' });
        }
        return parsed;
    }
    assertIngestPayload(body) {
        if (!body?.tenantId?.trim()) {
            throw new api_exception_1.ApiException('XBOS-ALERT-001', 'tenantId is required', common_1.HttpStatus.BAD_REQUEST, {
                field: 'tenantId',
            });
        }
        if (!body?.moduleCode?.trim()) {
            throw new api_exception_1.ApiException('XBOS-ALERT-001', 'moduleCode is required', common_1.HttpStatus.BAD_REQUEST, {
                field: 'moduleCode',
            });
        }
        if (!body?.correlationId?.trim()) {
            throw new api_exception_1.ApiException('XBOS-ALERT-001', 'correlationId is required', common_1.HttpStatus.BAD_REQUEST, {
                field: 'correlationId',
            });
        }
        if (!body?.ruleId?.trim()) {
            throw new api_exception_1.ApiException('XBOS-ALERT-001', 'ruleId is required', common_1.HttpStatus.BAD_REQUEST, {
                field: 'ruleId',
            });
        }
        if (!body?.entityRef || typeof body.entityRef !== 'object' || Array.isArray(body.entityRef)) {
            throw new api_exception_1.ApiException('XBOS-ALERT-001', 'entityRef must be an object', common_1.HttpStatus.BAD_REQUEST, {
                field: 'entityRef',
            });
        }
        if (!body?.metricSnapshot || typeof body.metricSnapshot !== 'object' || Array.isArray(body.metricSnapshot)) {
            throw new api_exception_1.ApiException('XBOS-ALERT-001', 'metricSnapshot must be an object', common_1.HttpStatus.BAD_REQUEST, {
                field: 'metricSnapshot',
            });
        }
        if (!(0, satellite_alerts_constants_1.isRegisteredModuleCode)(body.moduleCode)) {
            throw new api_exception_1.ApiException('XBOS-ALERT-002', `moduleCode '${body.moduleCode}' is not registered`, common_1.HttpStatus.BAD_REQUEST, { field: 'moduleCode' });
        }
    }
    severityToPortalLevel(severity) {
        if (severity === 'critical')
            return 'critical';
        if (severity === 'high')
            return 'warn';
        return 'info';
    }
    async ingestViolation(body) {
        this.assertIngestPayload(body);
        await this.ensureViolationSchema();
        const tenantId = body.tenantId.trim();
        const moduleCode = (0, satellite_alerts_constants_1.normalizeModuleCode)(body.moduleCode);
        const correlationId = body.correlationId.trim();
        const occurredAt = this.parseOccurredAtUtc(body.occurredAt);
        const companyId = body.companyId?.trim() || null;
        const severity = body.severity;
        const summary = body.summary?.trim() ||
            `Violation ${body.ruleId} from ${moduleCode} (${severity})`;
        const payloadJson = {
            entityRef: body.entityRef,
            metricSnapshot: body.metricSnapshot,
            ruleId: body.ruleId,
        };
        const existing = await this.db.query(`
      SELECT event_id::text
      FROM public.xbos_satellite_violations
      WHERE tenant_id = $1 AND correlation_id = $2
      LIMIT 1
      `, [tenantId, correlationId]);
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
        const insert = await this.db.query(`
      INSERT INTO public.xbos_satellite_violations (
        tenant_id, company_id, module_code, occurred_at, entity_ref, rule_id,
        severity, metric_snapshot, correlation_id, summary, payload_json
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8::jsonb, $9, $10, $11::jsonb)
      RETURNING event_id::text
      `, [
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
        ]);
        const eventId = insert.rows[0]?.event_id ?? '';
        await this.platformAudit.emit({
            tenantId,
            companyId: companyId ?? undefined,
            action: 'satellite.violation.ingest',
            entityType: 'xbos_satellite_violation',
            entityId: eventId,
            payload: { moduleCode, ruleId: body.ruleId, severity, correlationId },
        });
        let portalAlertId = null;
        if (severity === 'high' || severity === 'critical') {
            await this.ensurePortalAlertsSchema();
            const portal = await this.db.query(`
        INSERT INTO public.xbos_portal_alerts (
          tenant_id, company_id, module_code, level, title, detail, source_system, source_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'satellite-violation', $7)
        RETURNING id::text
        `, [
                tenantId,
                companyId,
                moduleCode,
                this.severityToPortalLevel(severity),
                summary.slice(0, 240),
                JSON.stringify(body.metricSnapshot).slice(0, 2000),
                eventId,
            ]);
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
    async ensurePortalAlertsSchema() {
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
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService,
        platform_audit_service_1.PlatformAuditService])
], AlertsService);
