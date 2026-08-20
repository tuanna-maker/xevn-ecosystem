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
exports.PositionRbacService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
let PositionRbacService = class PositionRbacService {
    db;
    constructor(db) {
        this.db = db;
    }
    async listTemplates(tenantId) {
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_position_template
       WHERE tenant_id = $1 AND status <> 'deleted' ORDER BY code`, [tenantId]);
        return rows;
    }
    async upsertTemplate(tenantId, templateId, body) {
        const code = String(body.code ?? '').trim();
        const name = String(body.name ?? '').trim();
        if (!code || !name) {
            throw new api_exception_1.ApiException('XBOS-POS-400', 'code and name required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (templateId) {
            const { rows } = await this.db.query(`UPDATE public.xbos_position_template SET code=$3, name=$4, level_scope=$5, org_type_hint=$6,
         payload=COALESCE($7::jsonb,payload), updated_at=NOW()
         WHERE id=$1::uuid AND tenant_id=$2 RETURNING *`, [templateId, tenantId, code, name, body.levelScope ?? 'group', body.orgTypeHint ?? null, body.payload ? JSON.stringify(body.payload) : null]);
            if (!rows[0])
                throw new api_exception_1.ApiException('XBOS-POS-404', 'Template not found', common_1.HttpStatus.NOT_FOUND);
            return rows[0];
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb) RETURNING *`, [tenantId, code, name, body.levelScope ?? 'group', body.orgTypeHint ?? null, JSON.stringify(body.payload ?? {})]);
        return rows[0];
    }
    async listAssignments(tenantId, companyId) {
        const { rows } = await this.db.query(`SELECT a.*, t.code AS template_code, t.name AS template_name
       FROM public.xbos_position_assignment a
       JOIN public.xbos_position_template t ON t.id = a.position_template_id
       WHERE a.tenant_id = $1 AND a.company_id = $2 AND a.status <> 'deleted'
       ORDER BY a.created_at DESC`, [tenantId, companyId]);
        return rows;
    }
    async upsertAssignment(tenantId, companyId, assignmentId, body) {
        const templateId = String(body.positionTemplateId ?? '');
        if (!templateId)
            throw new api_exception_1.ApiException('XBOS-POS-400', 'positionTemplateId required', common_1.HttpStatus.BAD_REQUEST);
        if (assignmentId) {
            const { rows } = await this.db.query(`UPDATE public.xbos_position_assignment SET
          position_template_id=$4::uuid, org_unit_id=$5::uuid, user_id=$6, employee_id=$7,
          valid_from=$8::date, valid_to=$9::date, updated_at=NOW()
         WHERE id=$1::uuid AND tenant_id=$2 AND company_id=$3 RETURNING *`, [assignmentId, tenantId, companyId, templateId, body.orgUnitId ?? null, body.userId ?? null, body.employeeId ?? null, body.validFrom ?? null, body.validTo ?? null]);
            if (!rows[0])
                throw new api_exception_1.ApiException('XBOS-POS-404', 'Assignment not found', common_1.HttpStatus.NOT_FOUND);
            return rows[0];
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_position_assignment (
        tenant_id, company_id, position_template_id, org_unit_id, user_id, employee_id, valid_from, valid_to
      ) VALUES ($1,$2,$3::uuid,$4::uuid,$5,$6,$7::date,$8::date) RETURNING *`, [tenantId, companyId, templateId, body.orgUnitId ?? null, body.userId ?? null, body.employeeId ?? null, body.validFrom ?? null, body.validTo ?? null]);
        return rows[0];
    }
    async listPermissionDefinitions(tenantId) {
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_permission_definition WHERE tenant_id = $1 AND status <> 'deleted' ORDER BY permission_code`, [tenantId]);
        return rows;
    }
    async upsertPermissionDefinition(tenantId, permissionId, body) {
        let code = String(body.permissionCode ?? '').trim();
        if (!code) {
            code = `PQ-${Date.now().toString(36).toUpperCase()}`;
        }
        const name = String(body.name ?? '').trim();
        if (!name)
            throw new api_exception_1.ApiException('XBOS-POS-400', 'name required', common_1.HttpStatus.BAD_REQUEST);
        if (permissionId) {
            const { rows } = await this.db.query(`UPDATE public.xbos_permission_definition SET name=$3, scope_level=$4, description=$5,
         workflow_ids=COALESCE($6::jsonb, workflow_ids), updated_at=NOW()
         WHERE id=$1::uuid AND tenant_id=$2 RETURNING *`, [permissionId, tenantId, name, body.scopeLevel ?? 'subsidiary', body.description ?? null, body.workflowIds ? JSON.stringify(body.workflowIds) : null]);
            if (!rows[0])
                throw new api_exception_1.ApiException('XBOS-POS-404', 'Permission not found', common_1.HttpStatus.NOT_FOUND);
            return rows[0];
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_permission_definition (tenant_id, permission_code, name, scope_level, description, workflow_ids)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb) RETURNING *`, [tenantId, code, name, body.scopeLevel ?? 'subsidiary', body.description ?? null, JSON.stringify(body.workflowIds ?? [])]);
        return rows[0];
    }
    async grantPermission(tenantId, companyId, body) {
        const permissionId = String(body.permissionId ?? '');
        if (!permissionId)
            throw new api_exception_1.ApiException('XBOS-POS-400', 'permissionId required', common_1.HttpStatus.BAD_REQUEST);
        const conflicts = await this.checkGrantConflicts(tenantId, companyId, permissionId, body.assignmentId);
        if (conflicts.length) {
            throw new api_exception_1.ApiException('XBOS-POS-409', 'Permission grant conflicts detected', common_1.HttpStatus.CONFLICT, { conflicts });
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_permission_grant (tenant_id, company_id, permission_id, assignment_id, valid_from, valid_to)
       VALUES ($1,$2,$3::uuid,$4::uuid,COALESCE($5::timestamptz,NOW()),$6::timestamptz) RETURNING *`, [tenantId, companyId, permissionId, body.assignmentId ?? null, body.validFrom ?? null, body.validTo ?? null]);
        return rows[0];
    }
    async checkGrantConflicts(tenantId, companyId, permissionId, assignmentId) {
        const { rows } = await this.db.query(`SELECT g.*, d.permission_code, d.name AS permission_name
       FROM public.xbos_permission_grant g
       JOIN public.xbos_permission_definition d ON d.id = g.permission_id
       WHERE g.tenant_id = $1 AND g.company_id = $2 AND g.permission_id = $3::uuid
         AND g.status = 'active' AND (g.valid_to IS NULL OR g.valid_to > NOW())
         AND ($4::uuid IS NULL OR g.assignment_id = $4::uuid)`, [tenantId, companyId, permissionId, assignmentId ?? null]);
        return rows;
    }
    async getPermissionMatrix(tenantId, roleId) {
        const { rows } = await this.db.query(`SELECT row_id, view, write, delete, approve, data_scope
       FROM public.xbos_cc_permission_matrix_cell
       WHERE tenant_id = $1 AND role_id = $2`, [tenantId, roleId]);
        return rows.map((r) => ({
            rowId: String(r.row_id),
            view: Boolean(r.view),
            write: Boolean(r.write),
            delete: Boolean(r.delete),
            approve: Boolean(r.approve),
            dataScope: String(r.data_scope ?? 'personal'),
        }));
    }
    async savePermissionMatrix(tenantId, roleId, rows) {
        if (!roleId?.trim()) {
            throw new api_exception_1.ApiException('XBOS-POS-400', 'roleId required', common_1.HttpStatus.BAD_REQUEST);
        }
        for (const row of rows) {
            if (!row.rowId?.trim())
                continue;
            await this.db.query(`INSERT INTO public.xbos_cc_permission_matrix_cell (
          tenant_id, role_id, row_id, view, write, delete, approve, data_scope, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
        ON CONFLICT (tenant_id, role_id, row_id) DO UPDATE SET
          view = EXCLUDED.view, write = EXCLUDED.write, delete = EXCLUDED.delete,
          approve = EXCLUDED.approve, data_scope = EXCLUDED.data_scope, updated_at = NOW()`, [
                tenantId,
                roleId,
                row.rowId,
                Boolean(row.view),
                Boolean(row.write),
                Boolean(row.delete),
                Boolean(row.approve),
                row.dataScope ?? 'personal',
            ]);
        }
        return this.getPermissionMatrix(tenantId, roleId);
    }
    async upsertJobDescription(templateId, body) {
        const version = Number(body.version ?? 1);
        const { rows } = await this.db.query(`INSERT INTO public.xbos_job_description (position_template_id, version, regular_tasks, ad_hoc_tasks, content)
       VALUES ($1::uuid,$2,$3::jsonb,$4::jsonb,$5)
       ON CONFLICT (position_template_id, version) DO UPDATE SET
         regular_tasks = EXCLUDED.regular_tasks, ad_hoc_tasks = EXCLUDED.ad_hoc_tasks,
         content = EXCLUDED.content, updated_at = NOW()
       RETURNING *`, [templateId, version, JSON.stringify(body.regularTasks ?? []), JSON.stringify(body.adHocTasks ?? []), body.content ?? null]);
        return rows[0];
    }
};
exports.PositionRbacService = PositionRbacService;
exports.PositionRbacService = PositionRbacService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], PositionRbacService);
