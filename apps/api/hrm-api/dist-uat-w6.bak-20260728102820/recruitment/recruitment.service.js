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
exports.RecruitmentService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const recruitment_workflow_bridge_1 = require("./recruitment-workflow.bridge");
let RecruitmentService = class RecruitmentService {
    db;
    recruitmentWorkflowBridge;
    constructor(db, recruitmentWorkflowBridge) {
        this.db = db;
        this.recruitmentWorkflowBridge = recruitmentWorkflowBridge;
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
      CREATE TABLE IF NOT EXISTS public.job_requisitions (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        employment_type TEXT NOT NULL,
        headcount INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_job_requisitions_status CHECK (status IN ('open', 'closed', 'on_hold')),
        CONSTRAINT chk_job_requisitions_headcount CHECK (headcount >= 1)
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_candidates (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        requisition_id UUID NOT NULL REFERENCES public.job_requisitions(id),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        source TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_recruitment_candidates_status CHECK (status IN ('new', 'screening', 'interview', 'offer', 'hired', 'rejected'))
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_interviews (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        candidate_id UUID NOT NULL REFERENCES public.recruitment_candidates(id),
        scheduled_at TIMESTAMPTZ NOT NULL,
        interviewer TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_recruitment_interviews_status CHECK (status IN ('scheduled', 'passed', 'failed', 'cancelled'))
      );
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
        await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
        await this.db.query(`
      ALTER TABLE public.recruitment_interviews
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS job_description TEXT;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS requirements TEXT;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS job_template_id TEXT;
    `);
        await this.db.query(`
      ALTER TABLE public.recruitment_candidates
      ADD COLUMN IF NOT EXISTS employee_id UUID NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS headcount INTEGER NOT NULL DEFAULT 1;
    `);
        await this.db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'chk_job_requisitions_headcount'
        ) THEN
          ALTER TABLE public.job_requisitions
            ADD CONSTRAINT chk_job_requisitions_headcount CHECK (headcount >= 1);
        END IF;
      END $$;
    `);
        await this.recruitmentWorkflowBridge.ensureSchema();
    }
    async createJobRequisition(payload, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const headcount = Math.trunc(Number(payload.headcount));
        if (!Number.isFinite(headcount) || headcount < 1) {
            throw new api_exception_1.ApiException('HRM-REC-400', 'Requisition headcount must be an integer greater than 0', common_1.HttpStatus.BAD_REQUEST);
        }
        const res = await this.db.query(`INSERT INTO public.job_requisitions
        (id, company_id, title, department, employment_type, headcount, status, job_description, requirements, job_template_id)
       VALUES ($1, $2::text, $3, $4, $5, $6, 'open', $7, $8, $9)
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id, created_at, updated_at;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.title.trim(),
            payload.department.trim(),
            payload.employment_type.trim(),
            headcount,
            payload.job_description?.trim() || null,
            payload.requirements?.trim() || null,
            payload.job_template_id?.trim() || null,
        ]);
        return res.rows[0];
    }
    async listJobRequisitions(query, authorization, scopeContext) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size ?? query.pageSize, 20);
        const offset = (page - 1) * pageSize;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const whereClause = filters.join(' AND ');
        const countRes = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.job_requisitions WHERE ${whereClause};`, values);
        const res = await this.db.query(`SELECT id, company_id, title, department, employment_type, headcount, status,
              job_description, requirements, job_template_id,
              workflow_instance_id::text AS workflow_instance_id,
              created_at, updated_at
       FROM public.job_requisitions
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`, [...values, pageSize, offset]);
        return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
    }
    async getJobRequisitionById(requisitionId, query, authorization, scopeContext) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        const filters = ['id = $1::uuid'];
        const values = [requisitionId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT id, company_id, title, department, employment_type, headcount, status,
              job_description, requirements, job_template_id,
              workflow_instance_id::text AS workflow_instance_id,
              created_at, updated_at
       FROM public.job_requisitions
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-404', 'Job requisition not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async updateJobRequisition(requisitionId, payload, query, authorization, scopeContext) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        const peek = await this.db.query(`SELECT company_id::text AS company_id, status,
              workflow_instance_id::text AS workflow_instance_id
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1;`, [requisitionId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, {
            notFoundCode: 'HRM-REC-404',
            mismatchCode: 'HRM-REC-409',
        });
        try {
            this.recruitmentWorkflowBridge.assertNotLockedOrThrow(peek.rows[0]?.workflow_instance_id, peek.rows[0]?.status, 'requisition');
        }
        catch (err) {
            if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
                throw new api_exception_1.ApiException('HRM-REC-WF-LOCKED', 'Requisition status locked while workflow instance is active', common_1.HttpStatus.CONFLICT);
            }
            throw err;
        }
        const nextHeadcount = payload.headcount === undefined || payload.headcount === null
            ? null
            : Math.trunc(Number(payload.headcount));
        if (nextHeadcount !== null && (!Number.isFinite(nextHeadcount) || nextHeadcount < 1)) {
            throw new api_exception_1.ApiException('HRM-REC-400', 'Requisition headcount must be an integer greater than 0', common_1.HttpStatus.BAD_REQUEST);
        }
        const values = [payload.status, nextHeadcount, requisitionId];
        const filters = ['id = $3::uuid'];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`UPDATE public.job_requisitions
       SET status = $1,
           headcount = COALESCE($2, headcount),
           updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, title, department, employment_type, headcount, status,
                 job_description, requirements, job_template_id,
                 workflow_instance_id::text AS workflow_instance_id,
                 created_at, updated_at;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-404', 'Job requisition not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async submitJobRequisitionForApproval(requisitionId, query, authorization, scopeContext, options) {
        await this.ensureSchema();
        const existing = await this.getJobRequisitionById(requisitionId, query, authorization, scopeContext);
        if (existing.workflow_instance_id) {
            return {
                ...existing,
                spawn: { workflowInstanceId: existing.workflow_instance_id, idempotent: true },
            };
        }
        const spawn = await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured({
            businessType: recruitment_workflow_bridge_1.WF_BUSINESS_TYPE_HRM_REQUISITION,
            businessId: requisitionId,
            companyId: existing.company_id,
            submitterUserId: options?.submitterUserId,
            tenantId: options?.tenantId,
            companySlug: options?.companySlug ?? existing.company_id,
        });
        const refreshed = await this.getJobRequisitionById(requisitionId, query, authorization, scopeContext);
        return {
            ...refreshed,
            spawn,
            spawnMissing: !spawn?.workflowInstanceId,
        };
    }
    async createCandidate(payload, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        const reqFilters = ['id = $1::uuid'];
        const reqValues = [payload.requisition_id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(reqFilters, reqValues, scope.companyIds);
        const reqRes = await this.db.query(`SELECT id, company_id FROM public.job_requisitions WHERE ${reqFilters.join(' AND ')} LIMIT 1;`, reqValues);
        if (!reqRes.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-404', 'Requisition not found', common_1.HttpStatus.NOT_FOUND);
        }
        const res = await this.db.query(`INSERT INTO public.recruitment_candidates
        (id, company_id, requisition_id, full_name, email, source, status)
       VALUES ($1, $2::text, $3::uuid, $4, $5, $6, 'new')
       RETURNING id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at;`, [
            (0, node_crypto_1.randomUUID)(),
            reqRes.rows[0].company_id,
            payload.requisition_id,
            payload.full_name.trim(),
            payload.email?.toLowerCase().trim() ?? '',
            payload.source?.trim() ?? '',
        ]);
        return res.rows[0];
    }
    async listCandidates(query, authorization, scopeContext) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id, scopeContext);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size, 20);
        const offset = (page - 1) * pageSize;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.requisition_id) {
            values.push(query.requisition_id);
            filters.push(`requisition_id = $${values.length}::uuid`);
        }
        const whereClause = filters.join(' AND ');
        const countRes = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.recruitment_candidates WHERE ${whereClause};`, values);
        const res = await this.db.query(`SELECT id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at
       FROM public.recruitment_candidates
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2};`, [...values, pageSize, offset]);
        return { total: Number(countRes.rows[0]?.total ?? 0), page, page_size: pageSize, data: res.rows };
    }
    async getCandidateById(candidateId, companyId, authorization, scopeContext) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId, scopeContext);
        const filters = ['id = $1::uuid'];
        const values = [candidateId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT id, company_id, requisition_id, full_name, email, source, status, created_at, updated_at
       FROM public.recruitment_candidates
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async scheduleInterview(payload, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, payload.company_id);
        const candFilters = ['id = $1::uuid'];
        const candValues = [payload.candidate_id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(candFilters, candValues, scope.companyIds);
        const candRes = await this.db.query(`SELECT id, company_id FROM public.recruitment_candidates WHERE ${candFilters.join(' AND ')} LIMIT 1;`, candValues);
        if (!candRes.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-405', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
        }
        const res = await this.db.query(`INSERT INTO public.recruitment_interviews
        (id, company_id, candidate_id, scheduled_at, interviewer, status)
       VALUES ($1, $2::text, $3::uuid, $4::timestamptz, $5, 'scheduled')
       RETURNING id, company_id, candidate_id, scheduled_at, interviewer, status, created_at, updated_at;`, [
            (0, node_crypto_1.randomUUID)(),
            candRes.rows[0].company_id,
            payload.candidate_id,
            payload.scheduled_at,
            payload.interviewer.trim(),
        ]);
        return res.rows[0];
    }
    async updateInterviewStatus(interviewId, payload, requestedCompanyId, authorization) {
        await this.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId);
        const peek = await this.db.query(`SELECT company_id::text AS company_id FROM public.recruitment_interviews WHERE id = $1::uuid LIMIT 1;`, [interviewId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, {
            notFoundCode: 'HRM-REC-406',
            mismatchCode: 'HRM-REC-409',
        });
        const values = [payload.status, interviewId];
        const filters = ['id = $2::uuid'];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`UPDATE public.recruitment_interviews
       SET status = $1, updated_at = NOW()
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, candidate_id, scheduled_at, interviewer, status, created_at, updated_at;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-406', 'Interview not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
};
exports.RecruitmentService = RecruitmentService;
exports.RecruitmentService = RecruitmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        recruitment_workflow_bridge_1.RecruitmentWorkflowBridge])
], RecruitmentService);
//# sourceMappingURL=recruitment.service.js.map