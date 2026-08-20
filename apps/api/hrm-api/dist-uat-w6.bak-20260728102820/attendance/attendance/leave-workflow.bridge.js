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
var LeaveWorkflowBridge_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveWorkflowBridge = void 0;
exports.expandWorkflowResolverCompanyIds = expandWorkflowResolverCompanyIds;
const common_1 = require("@nestjs/common");
const catalog_sync_service_1 = require("../catalog-sync/catalog-sync.service");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const attendance_event_fanout_service_1 = require("../notifications/attendance-event-fanout.service");
const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';
const WF_HRM_LEAVE_APPROVAL_CODE = 'hrm_leave_approval';
const WF_BUSINESS_TYPE_HRM_LEAVE = 'hrm_leave';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function expandWorkflowResolverCompanyIds(companyId) {
    const raw = companyId.trim().toLowerCase();
    if (!raw)
        return [];
    const out = new Set();
    const normalized = raw === hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID ? GROUP_HOLDING_COMPANY_ID : raw;
    out.add(normalized);
    if (UUID_RE.test(normalized)) {
        for (const slug of hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS) {
            if (hrm_list_scope_1.HRM_COMPANY_UUID_BY_SLUG[slug] === normalized) {
                out.add(slug);
                break;
            }
        }
    }
    else {
        const uuid = hrm_list_scope_1.HRM_COMPANY_UUID_BY_SLUG[normalized];
        if (uuid)
            out.add(uuid);
    }
    return [...out];
}
let LeaveWorkflowBridge = LeaveWorkflowBridge_1 = class LeaveWorkflowBridge {
    catalogSync;
    db;
    fanout;
    logger = new common_1.Logger(LeaveWorkflowBridge_1.name);
    constructor(catalogSync, db, fanout) {
        this.catalogSync = catalogSync;
        this.db = db;
        this.fanout = fanout;
    }
    xbosBaseUrl() {
        return (0, catalog_sync_service_1.resolveXbosApiBaseUrl)();
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.leave_requests (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ NULL,
        reviewed_by TEXT NULL,
        employee_code TEXT NULL,
        employee_name TEXT NULL,
        department TEXT NULL,
        position TEXT NULL,
        total_days NUMERIC NOT NULL DEFAULT 1,
        handover_to TEXT NULL,
        handover_tasks TEXT NULL,
        approver_employee_id UUID NULL,
        rejected_reason TEXT NULL,
        attachment_url TEXT NULL,
        workflow_instance_id UUID NULL,
        CONSTRAINT chk_leave_date_range CHECK (start_date <= end_date),
        CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
      );
    `);
        await this.db.query(`
      ALTER TABLE public.leave_requests
      ADD COLUMN IF NOT EXISTS workflow_instance_id UUID NULL;
    `);
    }
    async resolveManagerForWorkflow(employeeId, companyId) {
        const params = [employeeId];
        let companyFilter = '';
        if (companyId?.trim()) {
            const companyIds = expandWorkflowResolverCompanyIds(companyId);
            params.push(companyIds);
            companyFilter = ` AND e.company_id = ANY($${params.length}::text[])`;
        }
        const res = await this.db.query(`
        SELECT lower(m.email) AS manager_user_id, m.id::text AS manager_employee_id
        FROM public.employees e
        LEFT JOIN public.employees m ON m.id = e.manager_id AND m.archived_at IS NULL
        WHERE e.id = $1::uuid
          AND e.archived_at IS NULL
          ${companyFilter}
        LIMIT 1;
      `, params);
        const row = res.rows[0];
        return {
            manager_user_id: row?.manager_user_id ?? null,
            manager_employee_id: row?.manager_employee_id ?? null,
        };
    }
    async startLeaveWorkflowIfConfigured(ctx) {
        await this.ensureSchema();
        const tenantId = (ctx.tenantId ?? hrm_list_scope_1.MASTER_TENANT_ID).trim().toLowerCase();
        const companySlug = (ctx.companySlug ?? GROUP_HOLDING_COMPANY_ID).trim().toLowerCase() || GROUP_HOLDING_COMPANY_ID;
        const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(undefined, {
            tenantId,
            companyId: companySlug === GROUP_OPERATING_MAIN ? GROUP_HOLDING_COMPANY_ID : companySlug,
        });
        try {
            const res = await fetch(`${this.xbosBaseUrl()}/api/xbos/workflow-engine/instances/start`, {
                method: 'POST',
                headers: {
                    ...upstreamHeaders,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    workflowCode: WF_HRM_LEAVE_APPROVAL_CODE,
                    businessType: WF_BUSINESS_TYPE_HRM_LEAVE,
                    businessId: ctx.leaveRequestId,
                    submitter: {
                        userId: ctx.submitterUserId ?? null,
                        employeeId: ctx.employeeId,
                        companyId: ctx.companyId,
                        companySlug,
                    },
                    context: {
                        memberTenantId: tenantId,
                        memberCompanyId: companySlug,
                        leaveRequestId: ctx.leaveRequestId,
                    },
                }),
            });
            const json = (await res.json());
            if (!res.ok || !json.success) {
                this.logger.warn(`HRM-WF-SPAWN-MISSING: XBOS workflow start failed status=${res.status} code=${json.code ?? 'unknown'} msg=${json.message ?? ''}`);
                return null;
            }
            const instanceId = json.data?.id ?? json.data?.workflowInstanceId;
            if (!instanceId)
                return null;
            await this.db.query(`UPDATE public.leave_requests
         SET workflow_instance_id = $2::uuid
         WHERE id = $1::uuid`, [ctx.leaveRequestId, instanceId]);
            return { workflowInstanceId: instanceId };
        }
        catch (err) {
            this.logger.warn(`HRM-WF-SPAWN-MISSING: XBOS workflow start error ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }
    async handleTerminalCallback(payload) {
        await this.ensureSchema();
        const pending = await this.db.query(`SELECT status FROM public.leave_requests WHERE id = $1::uuid LIMIT 1`, [payload.leaveRequestId]);
        const currentStatus = pending.rows[0]?.status;
        if (!currentStatus) {
            throw new Error('HRM-LEAVE-404');
        }
        if (currentStatus !== 'pending') {
            this.logger.log(`HRM-WF-CALLBACK-SKIP leave=${payload.leaveRequestId} status=${currentStatus}`);
            return { applied: false, status: currentStatus };
        }
        const reviewerName = (payload.reviewerName ?? payload.reviewerUserId).trim();
        if (payload.terminalStatus === 'completed') {
            const res = await this.db.query(`
          UPDATE public.leave_requests
          SET status = 'approved',
              reviewed_at = NOW(),
              reviewed_by = $2
          WHERE id = $1::uuid AND status = 'pending'
          RETURNING *;
        `, [payload.leaveRequestId, reviewerName]);
            const row = res.rows[0];
            if (!row) {
                throw new Error('HRM-LEAVE-404');
            }
            await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
            return { applied: true, status: 'approved' };
        }
        const res = await this.db.query(`
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `, [payload.leaveRequestId, reviewerName, payload.rejectedReason ?? 'Workflow rejected']);
        const row = res.rows[0];
        if (!row) {
            throw new Error('HRM-LEAVE-404');
        }
        await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
        return { applied: true, status: 'rejected' };
    }
    toPayload(row) {
        return {
            id: row.id,
            company_id: row.company_id,
            employee_id: row.employee_id,
            employee_code: row.employee_code ?? '',
            employee_name: row.employee_name ?? '',
            leave_type: row.leave_type,
            start_date: row.start_date,
            end_date: row.end_date,
            total_days: Number(row.total_days ?? 1),
            reason: row.reason,
            status: row.status,
            requested_at: row.requested_at,
            reviewed_at: row.reviewed_at,
            reviewed_by: row.reviewed_by,
            rejected_reason: row.rejected_reason,
        };
    }
};
exports.LeaveWorkflowBridge = LeaveWorkflowBridge;
exports.LeaveWorkflowBridge = LeaveWorkflowBridge = LeaveWorkflowBridge_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [catalog_sync_service_1.CatalogSyncService,
        hrm_db_service_1.HrmDbService,
        attendance_event_fanout_service_1.AttendanceEventFanoutService])
], LeaveWorkflowBridge);
//# sourceMappingURL=leave-workflow.bridge.js.map