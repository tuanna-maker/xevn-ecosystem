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
exports.HrmInboxService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
function resolveInboxPersistCompanyUuid(companyId) {
    const mapped = (0, hrm_list_scope_1.resolveHrmCompanyUuidForSlug)(companyId);
    if (!mapped) {
        throw new api_exception_1.ApiException('HRM-INBOX-COMPANY', `company_id '${companyId}' cannot resolve to UUID for inbox persist`, common_1.HttpStatus.BAD_REQUEST);
    }
    return mapped;
}
let HrmInboxService = class HrmInboxService {
    db;
    constructor(db) {
        this.db = db;
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_inbox_notifications (
        id UUID PRIMARY KEY,
        company_id UUID NOT NULL,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        recipient_employee_id UUID NULL,
        read_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_inbox_company_recipient_created
      ON public.hrm_inbox_notifications (company_id, recipient_employee_id, created_at DESC);
    `);
    }
    async persistAttendanceEnvelope(envelope) {
        await this.ensureSchema();
        const { type, request } = envelope;
        const payload = JSON.stringify(envelope);
        const companyUuid = resolveInboxPersistCompanyUuid(String(request.company_id));
        if (type === 'attendance_update_request.created' ||
            type === 'leave_request.created' ||
            type === 'service_request.created') {
            await this.db.query(`
          INSERT INTO public.hrm_inbox_notifications (id, company_id, event_type, payload, recipient_employee_id)
          VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, NULL);
        `, [(0, node_crypto_1.randomUUID)(), companyUuid, type, payload]);
            return;
        }
        const idCompany = (0, node_crypto_1.randomUUID)();
        await this.db.query(`
        INSERT INTO public.hrm_inbox_notifications (id, company_id, event_type, payload, recipient_employee_id)
        VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, NULL);
      `, [idCompany, companyUuid, type, payload]);
        const targetEmployeeId = 'employee_id' in request && request.employee_id != null && String(request.employee_id).trim() !== ''
            ? String(request.employee_id).trim()
            : null;
        if (!targetEmployeeId)
            return;
        const idEmployee = (0, node_crypto_1.randomUUID)();
        await this.db.query(`
        INSERT INTO public.hrm_inbox_notifications (id, company_id, event_type, payload, recipient_employee_id)
        VALUES ($1::uuid, $2::uuid, $3, $4::jsonb, $5::uuid);
      `, [idEmployee, companyUuid, type, payload, targetEmployeeId]);
    }
    async listInbox(requestedCompanyId, employeeId, limit, authorization, tenantId) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId, { tenantId });
        const filters = [];
        const values = [];
        const companyIds = (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, requestedCompanyId);
        (0, hrm_list_scope_1.pushCompanyIdUuidFilter)(filters, values, companyIds);
        values.push(employeeId);
        filters.push(`(recipient_employee_id IS NULL OR recipient_employee_id = $${values.length}::uuid)`);
        const lim = Math.min(Math.max(limit, 1), 100);
        const res = await this.db.query(`
        SELECT id, company_id, event_type, payload, recipient_employee_id, read_at, created_at
        FROM public.hrm_inbox_notifications
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT ${lim};
      `, values);
        return {
            total: res.rows.length,
            data: res.rows.map((row) => ({
                id: row.id,
                company_id: row.company_id,
                event_type: row.event_type,
                payload: row.payload,
                recipient_employee_id: row.recipient_employee_id,
                read_at: row.read_at,
                created_at: row.created_at,
            })),
        };
    }
    async markRead(notificationId, companyId, viewerEmployeeId) {
        await this.ensureSchema();
        const res = await this.db.query(`
        UPDATE public.hrm_inbox_notifications
        SET read_at = NOW()
        WHERE id = $1::uuid
          AND company_id = $2::uuid
          AND recipient_employee_id = $3::uuid
          AND read_at IS NULL
        RETURNING id, company_id, event_type, payload, recipient_employee_id, read_at, created_at;
      `, [notificationId, companyId, viewerEmployeeId]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-INBOX-404', 'Notification not found or not markable', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            id: row.id,
            company_id: row.company_id,
            event_type: row.event_type,
            read_at: row.read_at,
        };
    }
};
exports.HrmInboxService = HrmInboxService;
exports.HrmInboxService = HrmInboxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], HrmInboxService);
//# sourceMappingURL=hrm-inbox.service.js.map