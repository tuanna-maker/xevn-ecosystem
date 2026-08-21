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
exports.PlatformAuditService = void 0;
const common_1 = require("@nestjs/common");
const xbos_db_service_1 = require("../db/xbos-db.service");
let PlatformAuditService = class PlatformAuditService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
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
    async emit(input) {
        await this.ensureSchema();
        const requestId = input.request?.platformContext?.requestId ??
            input.request?.headers['x-request-id'];
        await this.db.query(`INSERT INTO platform_audit_events
        (actor, tenant_id, company_id, action, entity_type, entity_id, payload_json, request_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`, [
            input.actor ?? null,
            input.tenantId ?? null,
            input.companyId ?? null,
            input.action,
            input.entityType,
            input.entityId ?? null,
            JSON.stringify(input.payload ?? {}),
            requestId ?? null,
        ]);
    }
    /** UC-XBOS-06 — scoped audit read (tenant + optional company). */
    async listEvents(filters) {
        await this.ensureSchema();
        const params = [filters.tenantId, filters.companyId];
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
        const res = await this.db.query(`SELECT event_id, occurred_at, actor, tenant_id, company_id, action, entity_type, entity_id,
              payload_json, request_id
       FROM platform_audit_events
       WHERE ${where}
       ORDER BY occurred_at DESC
       LIMIT $${limitIdx}`, params);
        return { total: res.rows.length, items: res.rows };
    }
};
exports.PlatformAuditService = PlatformAuditService;
exports.PlatformAuditService = PlatformAuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], PlatformAuditService);
