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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionsService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const tenant_scope_env_1 = require("../common/tenant-scope-env");
const hrm_db_service_1 = require("../db/hrm-db.service");
const hrm_settings_master_keys_1 = require("../settings-catalogs/hrm-settings-master-keys");
const settings_catalogs_service_1 = require("../settings-catalogs/settings-catalogs.service");
let DecisionsService = class DecisionsService {
    db;
    settingsCatalogs;
    constructor(db, settingsCatalogs) {
        this.db = db;
        this.settingsCatalogs = settingsCatalogs;
    }
    resolvePage(value, fallback) {
        const parsed = Number(value ?? fallback);
        if (!Number.isFinite(parsed) || parsed < 1)
            return fallback;
        return Math.trunc(parsed);
    }
    resolvePageSize(value, fallback) {
        const parsed = Number(value ?? fallback);
        if (!Number.isFinite(parsed) || parsed < 1)
            return fallback;
        return Math.min(100, Math.trunc(parsed));
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hr_decisions (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        decision_code TEXT NOT NULL,
        decision_type TEXT NOT NULL DEFAULT 'appointment',
        title TEXT NOT NULL,
        content TEXT,
        employee_id UUID,
        employee_name TEXT NOT NULL,
        employee_code TEXT,
        department TEXT,
        position TEXT,
        effective_date DATE,
        expiry_date DATE,
        signer_name TEXT,
        signer_position TEXT,
        signing_date DATE,
        file_url TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hr_decisions_company_id ON public.hr_decisions (company_id);
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hr_decisions_decision_type ON public.hr_decisions (decision_type);
    `);
    }
    async listDecisions(query, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size, 20);
        const offset = (page - 1) * pageSize;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.decision_type) {
            filters.push(`decision_type = $${values.length + 1}`);
            values.push(query.decision_type);
        }
        if (query.status) {
            filters.push(`status = $${values.length + 1}`);
            values.push(query.status);
        }
        const where = filters.join(' AND ');
        const res = await this.db.query(`SELECT id, company_id, decision_code, decision_type, title, content,
              employee_id, employee_name, employee_code, department, position,
              effective_date::text, expiry_date::text, signer_name, signer_position,
              signing_date::text, file_url, status, notes, created_at, updated_at
       FROM public.hr_decisions
       WHERE ${where}
       ORDER BY created_at DESC;`, values);
        return { total: res.rows.length, page, page_size: pageSize, data: res.rows.slice(offset, offset + pageSize) };
    }
    async createDecision(payload, authorization) {
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        await this.ensureSchema();
        const id = (0, node_crypto_1.randomUUID)();
        const decisionCode = payload.decision_code?.trim() || `DEC-${Date.now()}`;
        const title = payload.title?.trim() || payload.reason?.trim() || `Decision ${decisionCode}`;
        const decisionType = payload.decision_type?.trim() || 'appointment';
        if (this.settingsCatalogs) {
            await this.settingsCatalogs.assertCodeInEffectiveCatalog({
                tenantId: (0, tenant_scope_env_1.masterTenantIdFromEnv)() || 'xevn',
                companyId,
                catalogKey: hrm_settings_master_keys_1.HRM_SC_DEC_KEY,
                code: decisionType,
                errorCode: 'HRM-DEC-TYPE',
                errorMessage: `decision_type '${decisionType}' is not in decision_types catalog (free-text SoT forbidden)`,
            });
        }
        const content = payload.content?.trim() ?? payload.reason?.trim() ?? null;
        const effectiveDate = payload.effective_date ?? payload.decision_date ?? null;
        const res = await this.db.query(`INSERT INTO public.hr_decisions (
        id, company_id, decision_code, decision_type, title, content,
        employee_id, employee_name, employee_code, department, position,
        effective_date, expiry_date, signer_name, signer_position, signing_date,
        file_url, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12::date, $13::date, $14, $15, $16::date, $17, $18, $19
      )
      RETURNING id, company_id, decision_code, decision_type, title, content,
                employee_id, employee_name, employee_code, department, position,
                effective_date::text, expiry_date::text, signer_name, signer_position,
                signing_date::text, file_url, status, notes, created_at, updated_at;`, [
            id,
            companyId,
            decisionCode,
            decisionType,
            title,
            content,
            payload.employee_id ?? null,
            payload.employee_name.trim(),
            payload.employee_code?.trim() ?? null,
            payload.department?.trim() ?? null,
            payload.position?.trim() ?? null,
            effectiveDate,
            payload.expiry_date ?? null,
            payload.signer_name?.trim() ?? null,
            payload.signer_position?.trim() ?? null,
            payload.signing_date ?? null,
            payload.file_url ?? null,
            payload.status ?? 'draft',
            payload.notes?.trim() ?? null,
        ]);
        return res.rows[0];
    }
    async updateDecision(decisionId, payload, authorization) {
        await this.ensureSchema();
        if (!payload.company_id?.trim()) {
            throw new api_exception_1.ApiException('HRM-DEC-002', 'company_id is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id.trim());
        const existing = await this.getDecisionScoped(decisionId, payload.company_id.trim(), authorization);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-DEC-404',
            mismatchCode: 'HRM-DEC-409',
        });
        const fields = [];
        const values = [];
        const set = (col, val) => {
            values.push(val);
            fields.push(`${col} = $${values.length}`);
        };
        if (payload.decision_code != null)
            set('decision_code', payload.decision_code.trim());
        if (payload.decision_type != null)
            set('decision_type', payload.decision_type);
        if (payload.title != null)
            set('title', payload.title.trim());
        if (payload.content !== undefined)
            set('content', payload.content?.trim() ?? null);
        if (payload.employee_id !== undefined)
            set('employee_id', payload.employee_id ?? null);
        if (payload.employee_name != null)
            set('employee_name', payload.employee_name.trim());
        if (payload.employee_code !== undefined)
            set('employee_code', payload.employee_code?.trim() ?? null);
        if (payload.department !== undefined)
            set('department', payload.department?.trim() ?? null);
        if (payload.position !== undefined)
            set('position', payload.position?.trim() ?? null);
        if (payload.effective_date !== undefined)
            set('effective_date', payload.effective_date);
        if (payload.expiry_date !== undefined)
            set('expiry_date', payload.expiry_date);
        if (payload.signer_name !== undefined)
            set('signer_name', payload.signer_name?.trim() ?? null);
        if (payload.signer_position !== undefined)
            set('signer_position', payload.signer_position?.trim() ?? null);
        if (payload.signing_date !== undefined)
            set('signing_date', payload.signing_date);
        if (payload.file_url !== undefined)
            set('file_url', payload.file_url ?? null);
        if (payload.status != null)
            set('status', payload.status);
        if (payload.notes !== undefined)
            set('notes', payload.notes?.trim() ?? null);
        if (fields.length === 0)
            return existing;
        fields.push('updated_at = NOW()');
        values.push(decisionId);
        const res = await this.db.query(`UPDATE public.hr_decisions SET ${fields.join(', ')} WHERE id = $${values.length}
       RETURNING id, company_id, decision_code, decision_type, title, content,
                 employee_id, employee_name, employee_code, department, position,
                 effective_date::text, expiry_date::text, signer_name, signer_position,
                 signing_date::text, file_url, status, notes, created_at, updated_at;`, values);
        return res.rows[0];
    }
    async deleteDecision(decisionId, companyId, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const existing = await this.getDecisionScoped(decisionId, companyId, authorization);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-DEC-404',
            mismatchCode: 'HRM-DEC-409',
        });
        await this.db.query(`DELETE FROM public.hr_decisions WHERE id = $1::uuid;`, [decisionId]);
        return { id: decisionId };
    }
    async getDecisionById(decisionId, companyId, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const row = await this.getDecisionScoped(decisionId, companyId, authorization);
        if (!row) {
            throw new api_exception_1.ApiException('HRM-DEC-404', 'Decision not found', common_1.HttpStatus.NOT_FOUND);
        }
        (0, hrm_list_scope_1.assertResourceInHrmScope)(row, scope, {
            notFoundCode: 'HRM-DEC-404',
            mismatchCode: 'HRM-DEC-409',
        });
        return row;
    }
    async getDecisionScoped(decisionId, companyId, authorization) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [decisionId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT id, company_id, decision_code, decision_type, title, content,
              employee_id, employee_name, employee_code, department, position,
              effective_date::text, expiry_date::text, signer_name, signer_position,
              signing_date::text, file_url, status, notes, created_at, updated_at
       FROM public.hr_decisions WHERE ${filters.join(' AND ')} LIMIT 1;`, values);
        return res.rows[0] ?? null;
    }
    async saveDecisionFile(decisionId, companyId, authorization, file) {
        await this.ensureSchema();
        const existing = await this.getDecisionScoped(decisionId, companyId, authorization);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-DEC-404',
            mismatchCode: 'HRM-DEC-409',
        });
        const baseDir = process.env.HRM_DECISION_UPLOAD_DIR?.trim() ||
            (0, node_path_1.join)(process.cwd(), 'uploads', 'hrm-decisions');
        await (0, promises_1.mkdir)(baseDir, { recursive: true });
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
        const storedName = `${decisionId}-${Date.now()}-${safeName}`;
        const absolutePath = (0, node_path_1.join)(baseDir, storedName);
        await (0, promises_1.writeFile)(absolutePath, file.buffer);
        const fileUrl = `/api/hrm/decisions/files/${storedName}`;
        const res = await this.db.query(`
        UPDATE public.hr_decisions
        SET file_url = $2, updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING id, company_id, decision_code, decision_type, title, content,
                  employee_id, employee_name, employee_code, department, position,
                  effective_date::text, expiry_date::text, signer_name, signer_position,
                  signing_date::text, file_url, status, notes, created_at, updated_at;
      `, [decisionId, fileUrl]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-DEC-404', 'Decision not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            ...row,
            storage_path: absolutePath,
            mime_type: file.mimetype,
        };
    }
};
exports.DecisionsService = DecisionsService;
exports.DecisionsService = DecisionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        settings_catalogs_service_1.SettingsCatalogsService])
], DecisionsService);
//# sourceMappingURL=decisions.service.js.map