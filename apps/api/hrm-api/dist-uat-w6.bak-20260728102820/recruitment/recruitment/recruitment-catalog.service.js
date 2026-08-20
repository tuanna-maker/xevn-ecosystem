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
exports.RecruitmentCatalogService = exports.HRM_REC_JD_POS = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const tenant_scope_env_1 = require("../common/tenant-scope-env");
const hrm_db_service_1 = require("../db/hrm-db.service");
const settings_catalogs_service_1 = require("../settings-catalogs/settings-catalogs.service");
const hire_employee_link_1 = require("./hire-employee-link");
const recruitment_workflow_bridge_1 = require("./recruitment-workflow.bridge");
exports.HRM_REC_JD_POS = 'HRM-REC-JD-POS';
let RecruitmentCatalogService = class RecruitmentCatalogService {
    db;
    recruitmentWorkflowBridge;
    settingsCatalogs;
    constructor(db, recruitmentWorkflowBridge, settingsCatalogs) {
        this.db = db;
        this.recruitmentWorkflowBridge = recruitmentWorkflowBridge;
        this.settingsCatalogs = settingsCatalogs;
    }
    resolveCatalogTenantId(tenantId) {
        return tenantId?.trim() || (0, tenant_scope_env_1.masterTenantIdFromEnv)() || hrm_list_scope_1.MASTER_TENANT_ID;
    }
    async assertJdPositionCodeInCatalog(opts) {
        const code = opts.positionCode.trim();
        if (!code) {
            throw new api_exception_1.ApiException(exports.HRM_REC_JD_POS, 'position_code is required (catalog SoT; free-text title/position_name alone forbidden)', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!this.settingsCatalogs) {
            return { code, label: code };
        }
        const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
            tenantId: this.resolveCatalogTenantId(opts.tenantId),
            companyId: opts.companyId,
            catalogKey: 'job_titles',
            code,
            errorCode: exports.HRM_REC_JD_POS,
            errorMessage: `position_code '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
        });
        return { code: hit.code, label: hit.label };
    }
    async ensureWave2Schema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.job_postings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT,
        position TEXT NOT NULL,
        employment_type TEXT NOT NULL DEFAULT 'full-time',
        work_location TEXT,
        salary_min NUMERIC,
        salary_max NUMERIC,
        is_salary_visible BOOLEAN NOT NULL DEFAULT TRUE,
        description TEXT,
        requirements TEXT,
        benefits TEXT,
        headcount INTEGER NOT NULL DEFAULT 1,
        applied_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft',
        deadline DATE,
        priority TEXT NOT NULL DEFAULT 'medium',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        stage TEXT NOT NULL DEFAULT 'applied',
        source TEXT,
        applied_date DATE,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.candidate_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES public.candidates (id) ON DELETE CASCADE,
        job_posting_id UUID NOT NULL REFERENCES public.job_postings (id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        applied_date DATE DEFAULT CURRENT_DATE,
        stage TEXT NOT NULL DEFAULT 'applied',
        rating INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        campaign_id UUID,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_candidate_applications UNIQUE (candidate_id, job_posting_id)
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_month INTEGER NOT NULL DEFAULT 1,
        end_month INTEGER NOT NULL DEFAULT 12,
        year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        note TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        creator_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.headcount_proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        position_name TEXT NOT NULL,
        current_headcount INTEGER NOT NULL DEFAULT 0,
        requested_headcount INTEGER NOT NULL DEFAULT 1,
        proposal_type TEXT NOT NULL DEFAULT 'new',
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'pending',
        justification TEXT,
        expected_start_date DATE,
        salary_budget_min NUMERIC,
        salary_budget_max NUMERIC,
        job_description TEXT,
        requirements TEXT,
        requested_by TEXT NOT NULL DEFAULT 'HR',
        approved_by TEXT,
        approved_at TIMESTAMPTZ,
        rejected_reason TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.candidate_evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        candidate_id UUID NOT NULL,
        interview_id UUID,
        evaluator_name TEXT,
        evaluator_email TEXT,
        total_score NUMERIC,
        weighted_score NUMERIC,
        result TEXT NOT NULL DEFAULT 'pending',
        overall_feedback TEXT,
        recommendation TEXT,
        scores JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.evaluation_criteria_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        category TEXT NOT NULL,
        name TEXT NOT NULL,
        weight NUMERIC NOT NULL DEFAULT 10,
        default_required_score INTEGER NOT NULL DEFAULT 3,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_plan_departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plan_id UUID NOT NULL REFERENCES public.recruitment_plans (id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.recruitment_plan_positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        department_id UUID NOT NULL REFERENCES public.recruitment_plan_departments (id) ON DELETE CASCADE,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        months_data JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.job_description_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        title TEXT NOT NULL,
        position_name TEXT,
        job_description TEXT,
        requirements TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_job_description_templates_company_code UNIQUE (company_id, code)
      );
    `);
        await this.db.query(`ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE`);
        await this.db.query(`ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS position_code TEXT`);
    }
    async listJobPostings(query, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.status) {
            values.push(query.status);
            filters.push(`status = $${values.length}`);
        }
        const res = await this.db.query(`SELECT * FROM public.job_postings WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createJobPosting(payload, authorization) {
        await this.ensureWave2Schema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const id = (0, node_crypto_1.randomUUID)();
        const res = await this.db.query(`INSERT INTO public.job_postings (
        id, company_id, title, department, position, employment_type, work_location,
        salary_min, salary_max, is_salary_visible, description, requirements, benefits,
        headcount, deadline, priority, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::date, $16, $17
      ) RETURNING *;`, [
            id,
            companyId,
            payload.title.trim(),
            payload.department ?? null,
            payload.position.trim(),
            payload.employment_type ?? 'full-time',
            payload.work_location ?? null,
            payload.salary_min ?? null,
            payload.salary_max ?? null,
            payload.is_salary_visible ?? true,
            payload.description ?? null,
            payload.requirements ?? null,
            payload.benefits ?? null,
            payload.headcount ?? 1,
            payload.deadline ?? null,
            payload.priority ?? 'medium',
            payload.status ?? 'draft',
        ]);
        return res.rows[0];
    }
    async deleteJobPosting(id, companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.job_postings WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-JP-404', 'Job posting not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id };
    }
    async listCandidatesTable(query, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, query.company_id);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query.stage) {
            values.push(query.stage);
            filters.push(`stage = $${values.length}`);
        }
        const res = await this.db.query(`SELECT * FROM public.candidates WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async getCandidatePoolById(candidateId, companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [candidateId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.candidates WHERE ${filters.join(' AND ')} LIMIT 1;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-CP-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async listCandidateApplications(companyId, authorization, jobPostingId) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        if (scope.companyIds.length === 1) {
            values.push(scope.companyIds[0]);
            filters.push(`ca.company_id = $${values.length}::text`);
        }
        else {
            values.push(scope.companyIds);
            filters.push(`ca.company_id = ANY($${values.length}::text[])`);
        }
        if (jobPostingId) {
            values.push(jobPostingId);
            filters.push(`ca.job_posting_id = $${values.length}::uuid`);
        }
        const res = await this.db.query(`SELECT ca.*,
        json_build_object(
          'id', c.id,
          'full_name', c.full_name,
          'email', c.email,
          'phone', c.phone,
          'position', jp.position,
          'stage', c.stage,
          'rating', ca.rating,
          'avatar_url', NULL,
          'applied_date', c.applied_date,
          'source', c.source
        ) AS candidates
       FROM public.candidate_applications ca
       INNER JOIN public.candidates c ON c.id = ca.candidate_id
       LEFT JOIN public.job_postings jp ON jp.id = ca.job_posting_id
       WHERE ${filters.join(' AND ')}
       ORDER BY ca.created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createCandidateApplication(companyId, payload, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const company = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, companyId);
        const res = await this.db.query(`INSERT INTO public.candidate_applications (id, candidate_id, job_posting_id, company_id, stage)
       VALUES ($1, $2::uuid, $3::uuid, $4, $5)
       ON CONFLICT (candidate_id, job_posting_id) DO UPDATE SET stage = EXCLUDED.stage, updated_at = NOW()
       RETURNING *;`, [(0, node_crypto_1.randomUUID)(), payload.candidate_id, payload.job_posting_id, company, payload.stage ?? 'applied']);
        return res.rows[0];
    }
    async deleteCandidateApplication(applicationId, companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [applicationId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.candidate_applications WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-REC-CA-404', 'Application not found', common_1.HttpStatus.NOT_FOUND);
        return { id: applicationId };
    }
    async updateCandidateApplicationStage(applicationId, companyId, stage, authorization, employeeId) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peekFilters = ['ca.id = $1::uuid'];
        const peekValues = [applicationId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(peekFilters, peekValues, scope.companyIds);
        const peekSql = peekFilters
            .map((f) => f.replace(/^company_id/, 'ca.company_id'))
            .join(' AND ');
        const peek = await this.db.query(`SELECT ca.id::text AS id,
              ca.candidate_id::text AS candidate_id,
              ca.company_id::text AS company_id,
              c.employee_id::text AS cand_employee_id,
              c.company_id::text AS cand_company_id
       FROM public.candidate_applications ca
       INNER JOIN public.candidates c ON c.id = ca.candidate_id
       WHERE ${peekSql}
       LIMIT 1`, peekValues);
        const app = peek.rows[0];
        if (!app)
            throw new api_exception_1.ApiException('HRM-REC-CA-404', 'Application not found', common_1.HttpStatus.NOT_FOUND);
        if ((0, hire_employee_link_1.isHiredStage)(stage)) {
            const linkedEmployeeId = await (0, hire_employee_link_1.assertHireEmployeeLinkOrThrow)(this.db, app.candidate_id, app.cand_company_id, {
                existingEmployeeId: app.cand_employee_id,
                explicitEmployeeId: employeeId,
            });
            await this.db.query(`UPDATE public.candidates
         SET stage = 'hired', employee_id = $2::uuid, updated_at = NOW()
         WHERE id = $1::uuid`, [app.candidate_id, linkedEmployeeId]);
        }
        const filters = ['id = $1::uuid'];
        const values = [applicationId, stage];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`UPDATE public.candidate_applications SET stage = $2, updated_at = NOW() WHERE ${filters.join(' AND ')} RETURNING *;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-REC-CA-404', 'Application not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async listRecruitmentPlans(companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const plansRes = await this.db.query(`SELECT * FROM public.recruitment_plans WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`, values);
        const plans = plansRes.rows;
        if (plans.length === 0) {
            return { total: 0, data: [] };
        }
        const planIds = plans.map((p) => p.id);
        const deptsRes = await this.db.query(`SELECT * FROM public.recruitment_plan_departments
       WHERE plan_id = ANY($1::uuid[]) ORDER BY sort_order ASC;`, [planIds]);
        const depts = deptsRes.rows;
        const deptIds = depts.map((d) => d.id);
        let positions = [];
        if (deptIds.length > 0) {
            const posRes = await this.db.query(`SELECT * FROM public.recruitment_plan_positions
         WHERE department_id = ANY($1::uuid[]) ORDER BY sort_order ASC;`, [deptIds]);
            positions = posRes.rows;
        }
        const data = plans.map((plan) => {
            const planDepts = depts.filter((d) => d.plan_id === plan.id).map((dept) => ({
                ...dept,
                positions: positions.filter((p) => p.department_id === dept.id),
            }));
            return { ...plan, departments: planDepts };
        });
        return { total: data.length, data };
    }
    async updateJobPosting(jobPostingId, payload, companyId, authorization) {
        await this.ensureWave2Schema();
        const existingRes = await this.db.query(`SELECT * FROM public.job_postings WHERE id = $1::uuid LIMIT 1;`, [jobPostingId]);
        const existing = existingRes.rows[0];
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-REC-JP-404', 'Job posting not found', common_1.HttpStatus.NOT_FOUND);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-REC-JP-404',
            mismatchCode: 'HRM-REC-JP-409',
        });
        const res = await this.db.query(`UPDATE public.job_postings SET
        title = COALESCE($2, title),
        department = COALESCE($3, department),
        position = COALESCE($4, position),
        employment_type = COALESCE($5, employment_type),
        work_location = COALESCE($6, work_location),
        salary_min = COALESCE($7, salary_min),
        salary_max = COALESCE($8, salary_max),
        is_salary_visible = COALESCE($9, is_salary_visible),
        description = COALESCE($10, description),
        requirements = COALESCE($11, requirements),
        benefits = COALESCE($12, benefits),
        headcount = COALESCE($13, headcount),
        deadline = COALESCE($14::date, deadline),
        priority = COALESCE($15, priority),
        status = COALESCE($16, status),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [
            jobPostingId,
            payload.title ?? null,
            payload.department ?? null,
            payload.position ?? null,
            payload.employment_type ?? null,
            payload.work_location ?? null,
            payload.salary_min ?? null,
            payload.salary_max ?? null,
            payload.is_salary_visible ?? null,
            payload.description ?? null,
            payload.requirements ?? null,
            payload.benefits ?? null,
            payload.headcount ?? null,
            payload.deadline ?? null,
            payload.priority ?? null,
            payload.status ?? null,
        ]);
        return res.rows[0];
    }
    async updateCandidatePoolStage(candidateId, companyId, stage, authorization, employeeId) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const existingRes = await this.db.query(`SELECT id::text AS id,
              company_id::text AS company_id,
              stage,
              workflow_instance_id::text AS workflow_instance_id,
              employee_id::text AS employee_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`, [candidateId]);
        const existing = existingRes.rows[0];
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-REC-CP-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-REC-CP-404',
            mismatchCode: 'HRM-REC-CP-409',
        });
        try {
            this.recruitmentWorkflowBridge.assertNotLockedOrThrow(existing.workflow_instance_id, existing.stage, 'candidate');
        }
        catch (err) {
            if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
                throw new api_exception_1.ApiException('HRM-REC-WF-LOCKED', 'Candidate stage locked while workflow instance is active', common_1.HttpStatus.CONFLICT);
            }
            throw err;
        }
        if ((0, hire_employee_link_1.isHiredStage)(stage)) {
            const linkedEmployeeId = await (0, hire_employee_link_1.assertHireEmployeeLinkOrThrow)(this.db, candidateId, existing.company_id, {
                existingEmployeeId: existing.employee_id,
                explicitEmployeeId: employeeId,
            });
            const res = await this.db.query(`UPDATE public.candidates
         SET stage = $2, employee_id = $3::uuid, updated_at = NOW()
         WHERE id = $1::uuid RETURNING *;`, [candidateId, stage, linkedEmployeeId]);
            return res.rows[0];
        }
        const res = await this.db.query(`UPDATE public.candidates SET stage = $2, updated_at = NOW() WHERE id = $1::uuid RETURNING *;`, [candidateId, stage]);
        return res.rows[0];
    }
    async createCandidatePool(payload, authorization) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const stage = payload.stage ?? 'applied';
        let employeeId = payload.employee_id?.trim() || null;
        if ((0, hire_employee_link_1.isHiredStage)(stage)) {
            if (!employeeId) {
                throw new api_exception_1.ApiException(hire_employee_link_1.HRM_REC_HIRE_400, 'Hire requires a linked employee profile (employee_id)', common_1.HttpStatus.BAD_REQUEST);
            }
            employeeId = await (0, hire_employee_link_1.assertEmployeeInCandidateCompany)(this.db, employeeId, companyId);
        }
        const res = await this.db.query(`INSERT INTO public.candidates (
        id, company_id, full_name, email, phone, stage, source, applied_date, notes, employee_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9, $10::uuid)
      RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.full_name.trim(),
            payload.email?.toLowerCase().trim() ?? null,
            payload.phone?.trim() ?? null,
            stage,
            payload.source?.trim() ?? null,
            payload.applied_date ?? null,
            payload.notes ?? null,
            employeeId,
        ]);
        return res.rows[0];
    }
    async updateCandidatePool(candidateId, companyId, payload, authorization) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const existingRes = await this.db.query(`SELECT company_id::text AS company_id,
              stage,
              workflow_instance_id::text AS workflow_instance_id,
              employee_id::text AS employee_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`, [candidateId]);
        const existing = existingRes.rows[0];
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId), {
            notFoundCode: 'HRM-REC-CP-404',
            mismatchCode: 'HRM-REC-CP-409',
        });
        if (payload.stage !== undefined) {
            try {
                this.recruitmentWorkflowBridge.assertNotLockedOrThrow(existing?.workflow_instance_id, existing?.stage, 'candidate');
            }
            catch (err) {
                if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
                    throw new api_exception_1.ApiException('HRM-REC-WF-LOCKED', 'Candidate stage locked while workflow instance is active', common_1.HttpStatus.CONFLICT);
                }
                throw err;
            }
        }
        let nextEmployeeId = null;
        const nextStage = payload.stage ?? null;
        if ((0, hire_employee_link_1.isHiredStage)(nextStage)) {
            nextEmployeeId = await (0, hire_employee_link_1.assertHireEmployeeLinkOrThrow)(this.db, candidateId, existing.company_id, {
                existingEmployeeId: existing?.employee_id,
                explicitEmployeeId: payload.employee_id,
            });
        }
        else if (payload.employee_id?.trim()) {
            nextEmployeeId = await (0, hire_employee_link_1.assertEmployeeInCandidateCompany)(this.db, payload.employee_id.trim(), existing.company_id);
        }
        const res = await this.db.query(`UPDATE public.candidates SET
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        source = COALESCE($5, source),
        stage = COALESCE($6, stage),
        applied_date = COALESCE($7::date, applied_date),
        notes = COALESCE($8, notes),
        employee_id = COALESCE($9::uuid, employee_id),
        updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING *;`, [
            candidateId,
            payload.full_name?.trim() ?? null,
            payload.email?.toLowerCase().trim() ?? null,
            payload.phone?.trim() ?? null,
            payload.source?.trim() ?? null,
            nextStage,
            payload.applied_date ?? null,
            payload.notes ?? null,
            nextEmployeeId,
        ]);
        return res.rows[0];
    }
    async deleteCandidatePool(candidateId, companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [candidateId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.candidates WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-CP-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: candidateId };
    }
    async createRecruitmentPlan(payload, authorization) {
        await this.ensureWave2Schema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const planId = (0, node_crypto_1.randomUUID)();
        const departments = payload.departments ?? [];
        await this.db.query(`INSERT INTO public.recruitment_plans (
        id, company_id, title, start_month, end_month, year, note, status, creator_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`, [
            planId,
            companyId,
            String(payload.title ?? '').trim(),
            payload.start_month ?? 1,
            payload.end_month ?? 12,
            payload.year ?? new Date().getFullYear(),
            payload.note ?? null,
            payload.status ?? 'pending',
            payload.creator_name ?? null,
        ]);
        for (let i = 0; i < departments.length; i++) {
            const dept = departments[i];
            const deptId = (0, node_crypto_1.randomUUID)();
            await this.db.query(`INSERT INTO public.recruitment_plan_departments (id, plan_id, company_id, name, sort_order)
         VALUES ($1, $2, $3, $4, $5);`, [deptId, planId, companyId, String(dept.name ?? '').trim(), i]);
            const positions = dept.positions ?? [];
            for (let j = 0; j < positions.length; j++) {
                const pos = positions[j];
                await this.db.query(`INSERT INTO public.recruitment_plan_positions (id, department_id, company_id, name, months_data, sort_order)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6);`, [
                    (0, node_crypto_1.randomUUID)(),
                    deptId,
                    companyId,
                    String(pos.name ?? '').trim(),
                    JSON.stringify(pos.months ?? pos.months_data ?? []),
                    j,
                ]);
            }
        }
        return this.listRecruitmentPlans(companyId, authorization).then((r) => r.data.find((p) => p.id === planId) ?? { id: planId });
    }
    async deleteRecruitmentPlan(planId, companyId, authorization) {
        await this.ensureWave2Schema();
        const existingRes = await this.db.query(`SELECT company_id FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`, [planId]);
        const existing = existingRes.rows[0];
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', common_1.HttpStatus.NOT_FOUND);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-REC-PLAN-404',
            mismatchCode: 'HRM-REC-PLAN-409',
        });
        await this.db.query(`DELETE FROM public.recruitment_plans WHERE id = $1::uuid;`, [planId]);
        return { id: planId };
    }
    async ensureInterviewsSchema() {
        await this.ensureWave2Schema();
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.interviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        candidate_id UUID,
        candidate_name TEXT NOT NULL,
        candidate_email TEXT,
        candidate_phone TEXT,
        job_posting_id UUID,
        position TEXT,
        interview_date DATE NOT NULL DEFAULT CURRENT_DATE,
        interview_time TEXT NOT NULL DEFAULT '09:00',
        duration_minutes INTEGER,
        interview_type TEXT,
        location TEXT,
        meeting_link TEXT,
        interviewer_name TEXT,
        interviewer_email TEXT,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        feedback TEXT,
        rating INTEGER,
        interview_round INTEGER DEFAULT 1,
        result TEXT DEFAULT 'pending',
        next_steps TEXT,
        created_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    }
    async listInterviews(companyId, authorization) {
        await this.ensureInterviewsSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.interviews WHERE ${filters.join(' AND ')} ORDER BY interview_date DESC, interview_time DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createInterview(payload, authorization) {
        await this.ensureInterviewsSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.interviews (
        id, company_id, candidate_id, candidate_name, candidate_email, candidate_phone,
        job_posting_id, position, interview_date, interview_time, duration_minutes,
        interview_type, location, meeting_link, interviewer_name, interviewer_email,
        notes, status, interview_round, result, next_steps
      ) VALUES (
        $1,$2,$3::uuid,$4,$5,$6,$7::uuid,$8,$9::date,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      ) RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.candidate_id ?? null,
            String(payload.candidate_name ?? 'Candidate').trim(),
            payload.candidate_email ?? null,
            payload.candidate_phone ?? null,
            payload.job_posting_id ?? null,
            payload.position ?? null,
            payload.interview_date ?? new Date().toISOString().slice(0, 10),
            payload.interview_time ?? '09:00',
            payload.duration_minutes ?? 60,
            payload.interview_type ?? 'onsite',
            payload.location ?? null,
            payload.meeting_link ?? null,
            payload.interviewer_name ?? null,
            payload.interviewer_email ?? null,
            payload.notes ?? null,
            payload.status ?? 'scheduled',
            payload.interview_round ?? 1,
            payload.result ?? 'pending',
            payload.next_steps ?? null,
        ]);
        return res.rows[0];
    }
    async updateInterview(id, payload, companyId, authorization) {
        await this.ensureInterviewsSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id FROM public.interviews WHERE id = $1::uuid LIMIT 1;`, [id]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, { notFoundCode: 'HRM-REC-INT-404', mismatchCode: 'HRM-REC-INT-409' });
        const res = await this.db.query(`UPDATE public.interviews SET
        status = COALESCE($2, status),
        rating = COALESCE($3, rating),
        feedback = COALESCE($4, feedback),
        result = COALESCE($5, result),
        next_steps = COALESCE($6, next_steps),
        interview_round = COALESCE($7, interview_round),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [
            id,
            payload.status ?? null,
            payload.rating ?? null,
            payload.feedback ?? null,
            payload.result ?? null,
            payload.next_steps ?? null,
            payload.interview_round ?? null,
        ]);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-REC-INT-404', 'Interview not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async deleteInterview(id, companyId, authorization) {
        await this.ensureInterviewsSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [id];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.interviews WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-REC-INT-404', 'Interview not found', common_1.HttpStatus.NOT_FOUND);
        return { id };
    }
    async listHeadcountProposals(companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.headcount_proposals WHERE ${filters.join(' AND ')} ORDER BY created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createHeadcountProposal(payload, authorization) {
        await this.ensureWave2Schema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.headcount_proposals (
        id, company_id, title, department, position_name, current_headcount, requested_headcount,
        proposal_type, priority, status, justification, expected_start_date,
        salary_budget_min, salary_budget_max, job_description, requirements, requested_by, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13,$14,$15,$16,$17,$18
      ) RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.title,
            payload.department,
            payload.position_name,
            payload.current_headcount ?? 0,
            payload.requested_headcount ?? 1,
            payload.proposal_type ?? 'new',
            payload.priority ?? 'medium',
            payload.status ?? 'pending',
            payload.justification ?? null,
            payload.expected_start_date ?? null,
            payload.salary_budget_min ?? null,
            payload.salary_budget_max ?? null,
            payload.job_description ?? null,
            payload.requirements ?? null,
            payload.requested_by ?? 'HR',
            payload.notes ?? null,
        ]);
        return res.rows[0];
    }
    async updateHeadcountProposalStatus(proposalId, companyId, status, authorization, rejectedReason) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id FROM public.headcount_proposals WHERE id = $1::uuid LIMIT 1;`, [
            proposalId,
        ]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, { notFoundCode: 'HRM-REC-HC-404', mismatchCode: 'HRM-REC-HC-409' });
        const res = await this.db.query(`UPDATE public.headcount_proposals SET
        status = $2,
        rejected_reason = COALESCE($3, rejected_reason),
        approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [proposalId, status, rejectedReason ?? null]);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-REC-HC-404', 'Headcount proposal not found', common_1.HttpStatus.NOT_FOUND);
        return res.rows[0];
    }
    async listCandidateEvaluations(companyId, authorization, candidateId) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        if (scope.companyIds.length === 1) {
            values.push(scope.companyIds[0]);
            filters.push(`e.company_id = $${values.length}::text`);
        }
        else {
            values.push(scope.companyIds);
            filters.push(`e.company_id = ANY($${values.length}::text[])`);
        }
        if (candidateId) {
            values.push(candidateId);
            filters.push(`e.candidate_id = $${values.length}::uuid`);
        }
        const res = await this.db.query(`SELECT e.*, c.full_name AS candidate_name, c.email AS candidate_email, c.stage AS candidate_position
       FROM public.candidate_evaluations e
       LEFT JOIN public.candidates c ON c.id = e.candidate_id
       WHERE ${filters.join(' AND ')}
       ORDER BY e.created_at DESC;`, values);
        const data = res.rows.map((row) => ({
            ...row,
            scores: Array.isArray(row.scores) ? row.scores : [],
        }));
        return { total: data.length, data };
    }
    async createCandidateEvaluation(payload, authorization) {
        await this.ensureWave2Schema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, String(payload.company_id ?? ''));
        const res = await this.db.query(`INSERT INTO public.candidate_evaluations (
        id, company_id, candidate_id, interview_id, evaluator_name, evaluator_email,
        total_score, weighted_score, result, overall_feedback, recommendation, scores
      ) VALUES ($1,$2,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
      RETURNING *;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.candidate_id,
            payload.interview_id ?? null,
            payload.evaluator_name ?? null,
            payload.evaluator_email ?? null,
            payload.total_score ?? null,
            payload.weighted_score ?? null,
            payload.result ?? 'pending',
            payload.overall_feedback ?? null,
            payload.recommendation ?? null,
            JSON.stringify(payload.scores ?? []),
        ]);
        return res.rows[0];
    }
    async deleteCandidateEvaluation(evaluationId, companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [evaluationId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`DELETE FROM public.candidate_evaluations WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0])
            throw new api_exception_1.ApiException('HRM-REC-EVAL-404', 'Evaluation not found', common_1.HttpStatus.NOT_FOUND);
        return { id: evaluationId };
    }
    async listEvaluationCriteriaTemplates(companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['is_active = TRUE'];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`SELECT * FROM public.evaluation_criteria_templates WHERE ${filters.join(' AND ')} ORDER BY sort_order ASC, created_at ASC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async replaceEvaluationCriteriaTemplates(companyId, templates, authorization) {
        await this.ensureWave2Schema();
        const resolved = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, companyId);
        await this.db.query(`DELETE FROM public.evaluation_criteria_templates WHERE company_id = $1;`, [resolved]);
        for (const [index, tpl] of templates.entries()) {
            await this.db.query(`INSERT INTO public.evaluation_criteria_templates (
          id, company_id, category, name, weight, default_required_score, sort_order, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE);`, [
                (0, node_crypto_1.randomUUID)(),
                resolved,
                tpl.category,
                tpl.name,
                tpl.weight ?? 10,
                tpl.default_required_score ?? 3,
                tpl.sort_order ?? index,
            ]);
        }
        return this.listEvaluationCriteriaTemplates(resolved, authorization);
    }
    async updateRecruitmentPlanStatus(planId, companyId, status, authorization) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const existingRes = await this.db.query(`SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`, [planId]);
        const existing = existingRes.rows[0];
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', common_1.HttpStatus.NOT_FOUND);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-REC-PLAN-404',
            mismatchCode: 'HRM-REC-PLAN-409',
        });
        try {
            this.recruitmentWorkflowBridge.assertNotLockedOrThrow(existing.workflow_instance_id, existing.status, 'plan');
        }
        catch (err) {
            if (err instanceof Error && err.message === 'HRM-REC-WF-LOCKED') {
                throw new api_exception_1.ApiException('HRM-REC-WF-LOCKED', 'Recruitment plan status locked while workflow instance is active', common_1.HttpStatus.CONFLICT);
            }
            throw err;
        }
        const res = await this.db.query(`UPDATE public.recruitment_plans SET status = $2, updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [planId, status]);
        return res.rows[0];
    }
    async submitRecruitmentPlanForApproval(planId, companyId, authorization, options) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const existingRes = await this.db.query(`SELECT id, company_id, status, workflow_instance_id::text AS workflow_instance_id
       FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`, [planId]);
        const existing = existingRes.rows[0];
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', common_1.HttpStatus.NOT_FOUND);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-REC-PLAN-404',
            mismatchCode: 'HRM-REC-PLAN-409',
        });
        if (existing.workflow_instance_id) {
            return {
                ...existing,
                status: existing.status === 'pending' ? 'pending_approval' : existing.status,
                workflow_instance_id: existing.workflow_instance_id,
                spawn: { workflowInstanceId: existing.workflow_instance_id, idempotent: true },
            };
        }
        const spawn = await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured({
            businessType: recruitment_workflow_bridge_1.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
            businessId: planId,
            companyId: existing.company_id,
            submitterUserId: options?.submitterUserId,
            tenantId: options?.tenantId,
            companySlug: options?.companySlug ?? existing.company_id,
        });
        const refreshed = await this.db.query(`SELECT * FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1;`, [planId]);
        return {
            ...refreshed.rows[0],
            spawn,
            spawnMissing: !spawn?.workflowInstanceId,
        };
    }
    async startCandidatePipeline(candidateId, companyId, authorization, options) {
        await this.ensureWave2Schema();
        await this.recruitmentWorkflowBridge.ensureSchema();
        const existingRes = await this.db.query(`SELECT id, company_id, stage, workflow_instance_id::text AS workflow_instance_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1;`, [candidateId]);
        const existing = existingRes.rows[0];
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-REC-CP-404', 'Candidate not found', common_1.HttpStatus.NOT_FOUND);
        }
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-REC-CP-404',
            mismatchCode: 'HRM-REC-CP-409',
        });
        if (existing.workflow_instance_id) {
            return {
                ...existing,
                spawn: { workflowInstanceId: existing.workflow_instance_id, idempotent: true },
            };
        }
        const spawn = await this.recruitmentWorkflowBridge.startRecruitmentWorkflowIfConfigured({
            businessType: recruitment_workflow_bridge_1.WF_BUSINESS_TYPE_HRM_CANDIDATE,
            businessId: candidateId,
            companyId: existing.company_id,
            submitterUserId: options?.submitterUserId,
            tenantId: options?.tenantId,
            companySlug: options?.companySlug ?? existing.company_id,
        });
        const refreshed = await this.db.query(`SELECT * FROM public.candidates WHERE id = $1::uuid LIMIT 1;`, [candidateId]);
        return {
            ...refreshed.rows[0],
            spawn,
            spawnMissing: !spawn?.workflowInstanceId,
        };
    }
    async listJobDescriptionTemplates(companyId, authorization, query) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        if (query?.q?.trim()) {
            values.push(`%${query.q.trim().toLowerCase()}%`);
            filters.push(`(lower(code) LIKE $${values.length} OR lower(title) LIKE $${values.length} OR lower(COALESCE(position_name, '')) LIKE $${values.length} OR lower(COALESCE(position_code, '')) LIKE $${values.length})`);
        }
        const activeRaw = query?.active?.trim().toLowerCase();
        if (activeRaw === '1' || activeRaw === 'true' || activeRaw === 'active' || activeRaw === 'yes') {
            filters.push(`is_active = TRUE`);
        }
        else if (activeRaw === '0' ||
            activeRaw === 'false' ||
            activeRaw === 'inactive' ||
            activeRaw === 'draft' ||
            activeRaw === 'no') {
            filters.push(`is_active = FALSE`);
        }
        const whereClause = filters.length ? filters.join(' AND ') : 'TRUE';
        const res = await this.db.query(`SELECT id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active, created_at, updated_at
       FROM public.job_description_templates
       WHERE ${whereClause}
       ORDER BY updated_at DESC, created_at DESC;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async createJobDescriptionTemplate(payload, authorization, options) {
        await this.ensureWave2Schema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const code = payload.code.trim();
        const title = payload.title.trim();
        if (!code || !title) {
            throw new api_exception_1.ApiException('HRM-REC-JD-400', 'code and title are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const catalogPos = await this.assertJdPositionCodeInCatalog({
            companyId,
            positionCode: payload.position_code ?? '',
            tenantId: options?.tenantId,
        });
        const positionName = payload.position_name?.trim() || catalogPos.label || null;
        const dup = await this.db.query(`SELECT id FROM public.job_description_templates WHERE company_id = $1 AND lower(code) = lower($2) LIMIT 1;`, [companyId, code]);
        if (dup.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-JD-409', 'JD template code already exists for company', common_1.HttpStatus.CONFLICT);
        }
        const res = await this.db.query(`INSERT INTO public.job_description_templates
        (id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active, created_at, updated_at;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            code,
            title,
            positionName,
            catalogPos.code,
            payload.job_description?.trim() || null,
            payload.requirements?.trim() || null,
            payload.notes?.trim() || null,
            payload.is_active !== false,
        ]);
        return res.rows[0];
    }
    async updateJobDescriptionTemplate(templateId, companyId, payload, authorization, options) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const peek = await this.db.query(`SELECT company_id::text AS company_id, code, position_code
       FROM public.job_description_templates WHERE id = $1::uuid LIMIT 1;`, [templateId]);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(peek.rows[0], scope, {
            notFoundCode: 'HRM-REC-JD-404',
            mismatchCode: 'HRM-REC-JD-409',
        });
        const existing = peek.rows[0];
        const nextCode = payload.code?.trim();
        if (nextCode && nextCode.toLowerCase() !== existing.code.toLowerCase()) {
            const dup = await this.db.query(`SELECT id FROM public.job_description_templates
         WHERE company_id = $1 AND lower(code) = lower($2) AND id <> $3::uuid LIMIT 1;`, [existing.company_id, nextCode, templateId]);
            if (dup.rows[0]) {
                throw new api_exception_1.ApiException('HRM-REC-JD-409', 'JD template code already exists for company', common_1.HttpStatus.CONFLICT);
            }
        }
        let nextPositionCode;
        let nextPositionName;
        if (payload.position_code !== undefined) {
            const catalogPos = await this.assertJdPositionCodeInCatalog({
                companyId: existing.company_id,
                positionCode: payload.position_code,
                tenantId: options?.tenantId,
            });
            nextPositionCode = catalogPos.code;
            if (payload.position_name === undefined) {
                nextPositionName = catalogPos.label;
            }
        }
        else if (payload.position_name !== undefined) {
            const existingCode = existing.position_code?.trim();
            if (!existingCode) {
                throw new api_exception_1.ApiException(exports.HRM_REC_JD_POS, 'position_code is required when linking a position (free-text position_name alone forbidden)', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const setParts = ['updated_at = NOW()'];
        const values = [];
        const pushSet = (col, value) => {
            values.push(value);
            setParts.push(`${col} = $${values.length}`);
        };
        if (nextCode !== undefined && nextCode.length > 0)
            pushSet('code', nextCode);
        if (payload.title !== undefined)
            pushSet('title', payload.title.trim());
        if (payload.position_name !== undefined) {
            pushSet('position_name', payload.position_name.trim() || null);
        }
        else if (nextPositionName !== undefined) {
            pushSet('position_name', nextPositionName);
        }
        if (nextPositionCode !== undefined)
            pushSet('position_code', nextPositionCode);
        if (payload.job_description !== undefined)
            pushSet('job_description', payload.job_description.trim() || null);
        if (payload.requirements !== undefined)
            pushSet('requirements', payload.requirements.trim() || null);
        if (payload.notes !== undefined)
            pushSet('notes', payload.notes.trim() || null);
        if (payload.is_active !== undefined)
            pushSet('is_active', payload.is_active);
        values.push(templateId);
        const idParam = `$${values.length}`;
        const filters = [`id = ${idParam}::uuid`];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`UPDATE public.job_description_templates SET ${setParts.join(', ')}
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, code, title, position_name, position_code, job_description, requirements, notes, is_active, created_at, updated_at;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-JD-404', 'JD template not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async deleteJobDescriptionTemplate(templateId, companyId, authorization) {
        await this.ensureWave2Schema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['id = $1::uuid'];
        const values = [templateId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
        const res = await this.db.query(`UPDATE public.job_description_templates SET is_active = FALSE, updated_at = NOW()
       WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-REC-JD-404', 'JD template not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: templateId, is_active: false };
    }
};
exports.RecruitmentCatalogService = RecruitmentCatalogService;
exports.RecruitmentCatalogService = RecruitmentCatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        recruitment_workflow_bridge_1.RecruitmentWorkflowBridge,
        settings_catalogs_service_1.SettingsCatalogsService])
], RecruitmentCatalogService);
//# sourceMappingURL=recruitment-catalog.service.js.map