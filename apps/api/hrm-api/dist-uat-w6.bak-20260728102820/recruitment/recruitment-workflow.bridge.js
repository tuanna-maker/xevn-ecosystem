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
var RecruitmentWorkflowBridge_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruitmentWorkflowBridge = exports.F6_CANDIDATE_STAGES = exports.REC_WF_TASK_TYPE_TO_STAGE = exports.WF_BUSINESS_TYPE_HRM_CANDIDATE = exports.WF_BUSINESS_TYPE_HRM_REQUISITION = exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = exports.WF_HRM_CANDIDATE_PIPELINE_CODE = exports.WF_HRM_REQUISITION_APPROVAL_CODE = exports.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = exports.PORTAL_GROUP_CEO_EMAIL = void 0;
exports.mapRecTaskTypeToStage = mapRecTaskTypeToStage;
exports.isRecruitmentWorkflowLocked = isRecruitmentWorkflowLocked;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const leave_workflow_bridge_1 = require("../attendance/leave-workflow.bridge");
const catalog_sync_service_1 = require("../catalog-sync/catalog-sync.service");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';
exports.PORTAL_GROUP_CEO_EMAIL = 'ceo@xe.vn';
const PORTAL_GROUP_CEO_EMPLOYEE_CODE = 'PORTAL-GCEO';
const HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID = '11111111-1111-4111-8111-111111111111';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
exports.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = 'hrm_recruitment_plan_approval';
exports.WF_HRM_REQUISITION_APPROVAL_CODE = 'hrm_requisition_approval';
exports.WF_HRM_CANDIDATE_PIPELINE_CODE = 'hrm_candidate_pipeline';
exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = 'hrm_recruitment_plan';
exports.WF_BUSINESS_TYPE_HRM_REQUISITION = 'hrm_requisition';
exports.WF_BUSINESS_TYPE_HRM_CANDIDATE = 'hrm_candidate';
exports.REC_WF_TASK_TYPE_TO_STAGE = {
    rec_intake: 'new',
    rec_screening: 'screening',
    rec_interview: 'interview',
    rec_offer: 'offer',
    intake: 'new',
    screening: 'screening',
    interview: 'interview',
    offer: 'offer',
};
exports.F6_CANDIDATE_STAGES = [
    'new',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected',
];
const PLAN_TERMINAL = new Set(['approved', 'rejected', 'cancelled']);
const REQUISITION_TERMINAL = new Set(['open', 'approved', 'rejected', 'closed', 'cancelled']);
const CANDIDATE_TERMINAL = new Set(['hired', 'rejected']);
function mapRecTaskTypeToStage(taskType) {
    const key = taskType.trim().toLowerCase();
    if (!key)
        return null;
    const direct = exports.REC_WF_TASK_TYPE_TO_STAGE[key];
    if (direct)
        return direct;
    if (key.startsWith('rec_')) {
        return exports.REC_WF_TASK_TYPE_TO_STAGE[key.slice(4)] ?? null;
    }
    return exports.REC_WF_TASK_TYPE_TO_STAGE[`rec_${key}`] ?? null;
}
function isRecruitmentWorkflowLocked(workflowInstanceId, statusOrStage, entity) {
    if (!workflowInstanceId?.trim())
        return false;
    const value = (statusOrStage ?? '').trim().toLowerCase();
    if (entity === 'plan')
        return !PLAN_TERMINAL.has(value);
    if (entity === 'requisition')
        return !REQUISITION_TERMINAL.has(value);
    return !CANDIDATE_TERMINAL.has(value);
}
function workflowCodeForBusinessType(businessType) {
    if (businessType === exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN)
        return exports.WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE;
    if (businessType === exports.WF_BUSINESS_TYPE_HRM_REQUISITION)
        return exports.WF_HRM_REQUISITION_APPROVAL_CODE;
    return exports.WF_HRM_CANDIDATE_PIPELINE_CODE;
}
function tableForBusinessType(businessType) {
    if (businessType === exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
        return { table: 'public.recruitment_plans', statusCol: 'status' };
    }
    if (businessType === exports.WF_BUSINESS_TYPE_HRM_REQUISITION) {
        return { table: 'public.job_requisitions', statusCol: 'status' };
    }
    return { table: 'public.candidates', statusCol: 'stage' };
}
let RecruitmentWorkflowBridge = RecruitmentWorkflowBridge_1 = class RecruitmentWorkflowBridge {
    catalogSync;
    db;
    logger = new common_1.Logger(RecruitmentWorkflowBridge_1.name);
    constructor(catalogSync, db) {
        this.catalogSync = catalogSync;
        this.db = db;
    }
    xbosBaseUrl() {
        return (0, catalog_sync_service_1.resolveXbosApiBaseUrl)();
    }
    async resolveSubmitterEmployeeId(ctx) {
        const explicit = ctx.submitterEmployeeId?.trim();
        if (explicit)
            return explicit;
        const userKey = ctx.submitterUserId?.trim().toLowerCase();
        if (!userKey)
            return null;
        if (UUID_RE.test(userKey))
            return userKey;
        const companyRaw = (ctx.companySlug ?? ctx.companyId ?? '').trim();
        const companyIds = companyRaw ? (0, leave_workflow_bridge_1.expandWorkflowResolverCompanyIds)(companyRaw) : [];
        try {
            const byEmail = await this.resolveEmployeeIdByEmail(userKey, companyIds);
            if (byEmail)
                return byEmail;
            const byMembership = await this.resolveEmployeeIdViaMembership(userKey, companyIds);
            if (byMembership)
                return byMembership;
            if (this.isPortalGroupCeoIdentity(userKey)) {
                const master = await this.resolveHoldingGroupCeoMasterEmployee(userKey);
                if (master)
                    return master;
                return await this.ensureHoldingPortalGroupCeoEmployee(userKey);
            }
            return null;
        }
        catch (err) {
            this.logger.warn(`HRM-REC-WF-SPAWN-MISSING: submitter employee resolve failed user=${userKey} ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }
    isPortalGroupCeoIdentity(userKey) {
        return userKey === exports.PORTAL_GROUP_CEO_EMAIL;
    }
    async resolveEmployeeIdByEmail(userKey, companyIds) {
        if (companyIds.length > 0) {
            const scoped = await this.db.query(`SELECT id::text AS id
         FROM public.employees
         WHERE lower(email) = $1
           AND archived_at IS NULL
           AND company_id = ANY($2::text[])
         LIMIT 1`, [userKey, companyIds]);
            if (scoped.rows[0]?.id)
                return scoped.rows[0].id;
        }
        const anyCompany = await this.db.query(`SELECT id::text AS id
       FROM public.employees
       WHERE lower(email) = $1
         AND archived_at IS NULL
       ORDER BY CASE WHEN company_id IN ('holding', 'main') THEN 0 ELSE 1 END, updated_at DESC NULLS LAST
       LIMIT 1`, [userKey]);
        return anyCompany.rows[0]?.id ?? null;
    }
    async resolveEmployeeIdViaMembership(userKey, companyIds) {
        try {
            const scopeKeys = companyIds.length > 0 ? companyIds : [GROUP_HOLDING_COMPANY_ID, GROUP_OPERATING_MAIN];
            const linked = await this.db.query(`SELECT employee_id::text AS employee_id
         FROM public.user_company_memberships
         WHERE lower(coalesce(email, '')) = $1
           AND employee_id IS NOT NULL
           AND lower(coalesce(status, 'active')) = 'active'
         ORDER BY CASE
           WHEN company_id = ANY($2::text[]) THEN 0
           WHEN company_id IN ('holding', 'main') THEN 1
           ELSE 2
         END,
         updated_at DESC NULLS LAST
         LIMIT 1`, [userKey, scopeKeys]);
            return linked.rows[0]?.employee_id ?? null;
        }
        catch {
            return null;
        }
    }
    async resolveHoldingGroupCeoMasterEmployee(userKey) {
        const byPortalCode = await this.db.query(`SELECT id::text AS id
       FROM public.employees
       WHERE archived_at IS NULL
         AND company_id IN ('holding', 'main')
         AND lower(employee_code) = lower($1)
       ORDER BY CASE WHEN company_id = 'holding' THEN 0 ELSE 1 END, updated_at DESC NULLS LAST
       LIMIT 1`, [PORTAL_GROUP_CEO_EMPLOYEE_CODE]);
        if (byPortalCode.rows[0]?.id) {
            await this.linkPortalEmailToEmployeeIfSafe(byPortalCode.rows[0].id, userKey);
            return byPortalCode.rows[0].id;
        }
        const bootstrap = await this.db.query(`SELECT id::text AS id, lower(email) AS email
       FROM public.employees
       WHERE id = $1::uuid
         AND archived_at IS NULL
         AND company_id IN ('holding', 'main')
       LIMIT 1`, [HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID]);
        const boot = bootstrap.rows[0];
        if (boot?.id && boot.email === userKey) {
            return boot.id;
        }
        return null;
    }
    async linkPortalEmailToEmployeeIfSafe(employeeId, userKey) {
        try {
            await this.db.query(`UPDATE public.employees
         SET email = $2,
             updated_at = NOW()
         WHERE id = $1::uuid
           AND archived_at IS NULL
           AND (
             lower(email) = $2
             OR lower(email) IN ('', 'n/a', 'na', 'none')
             OR id = $3::uuid
           )
           AND NOT EXISTS (
             SELECT 1 FROM public.employees e2
             WHERE e2.id <> $1::uuid
               AND e2.archived_at IS NULL
               AND e2.company_id = employees.company_id
               AND lower(e2.email) = $2
           )`, [employeeId, userKey, HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID]);
        }
        catch {
        }
    }
    async ensureHoldingPortalGroupCeoEmployee(userKey) {
        const existing = await this.resolveEmployeeIdByEmail(userKey, [
            GROUP_HOLDING_COMPANY_ID,
            GROUP_OPERATING_MAIN,
        ]);
        if (existing)
            return existing;
        const newId = (0, node_crypto_1.randomUUID)();
        try {
            await this.db.query(`INSERT INTO public.employees (
           id, company_id, employee_code, email, full_name, job_title_key, status, hired_at
         ) VALUES (
           $1::uuid, $2, $3, $4, $5, 'CEO', 'active', CURRENT_DATE
         )`, [
                newId,
                GROUP_HOLDING_COMPANY_ID,
                PORTAL_GROUP_CEO_EMPLOYEE_CODE,
                userKey,
                'CEO Tập đoàn',
            ]);
            this.logger.log(`HRM-REC-WF-SUBMITTER-ENSURE: holding portal Group CEO employee created id=${newId} email=${userKey}`);
            return newId;
        }
        catch (err) {
            const again = await this.resolveEmployeeIdByEmail(userKey, [
                GROUP_HOLDING_COMPANY_ID,
                GROUP_OPERATING_MAIN,
            ]);
            if (again)
                return again;
            const byCode = await this.db.query(`SELECT id::text AS id
         FROM public.employees
         WHERE company_id = $1
           AND lower(employee_code) = lower($2)
           AND archived_at IS NULL
         LIMIT 1`, [GROUP_HOLDING_COMPANY_ID, PORTAL_GROUP_CEO_EMPLOYEE_CODE]);
            if (byCode.rows[0]?.id) {
                await this.linkPortalEmailToEmployeeIfSafe(byCode.rows[0].id, userKey);
                return byCode.rows[0].id;
            }
            this.logger.warn(`HRM-REC-WF-SPAWN-MISSING: ensure portal Group CEO employee failed email=${userKey} ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }
    async ensureSchema() {
        await this.db.query(`
      ALTER TABLE public.recruitment_plans
      ADD COLUMN IF NOT EXISTS workflow_instance_id UUID NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.recruitment_plans
      ADD COLUMN IF NOT EXISTS rejected_reason TEXT NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.recruitment_plans
      ADD COLUMN IF NOT EXISTS wf_callback_fingerprint TEXT NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS workflow_instance_id UUID NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS rejected_reason TEXT NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.job_requisitions
      ADD COLUMN IF NOT EXISTS wf_callback_fingerprint TEXT NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.candidates
      ADD COLUMN IF NOT EXISTS workflow_instance_id UUID NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.candidates
      ADD COLUMN IF NOT EXISTS employee_id UUID NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.candidates
      ADD COLUMN IF NOT EXISTS rejected_reason TEXT NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.candidates
      ADD COLUMN IF NOT EXISTS wf_callback_fingerprint TEXT NULL;
    `);
        await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'chk_job_requisitions_status'
        ) THEN
          ALTER TABLE public.job_requisitions DROP CONSTRAINT chk_job_requisitions_status;
        END IF;
        ALTER TABLE public.job_requisitions
          ADD CONSTRAINT chk_job_requisitions_status
          CHECK (status IN (
            'open', 'closed', 'on_hold',
            'draft', 'pending_approval', 'approved', 'rejected', 'cancelled'
          ));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_recruitment_plans_workflow_instance_id
        ON public.recruitment_plans (workflow_instance_id)
        WHERE workflow_instance_id IS NOT NULL;
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_job_requisitions_workflow_instance_id
        ON public.job_requisitions (workflow_instance_id)
        WHERE workflow_instance_id IS NOT NULL;
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_workflow_instance_id
        ON public.candidates (workflow_instance_id)
        WHERE workflow_instance_id IS NOT NULL;
    `);
    }
    async startRecruitmentWorkflowIfConfigured(ctx) {
        await this.ensureSchema();
        const tenantId = (ctx.tenantId ?? hrm_list_scope_1.MASTER_TENANT_ID).trim().toLowerCase();
        const companySlug = (ctx.companySlug ?? GROUP_HOLDING_COMPANY_ID).trim().toLowerCase() || GROUP_HOLDING_COMPANY_ID;
        const workflowCode = workflowCodeForBusinessType(ctx.businessType);
        const { table, statusCol } = tableForBusinessType(ctx.businessType);
        const isGroupCeoPortal = tenantId === hrm_list_scope_1.MASTER_TENANT_ID &&
            (companySlug === GROUP_OPERATING_MAIN || companySlug === GROUP_HOLDING_COMPANY_ID);
        const xbosHeaderCompanyId = isGroupCeoPortal ? GROUP_HOLDING_COMPANY_ID : companySlug;
        const memberCompanyId = isGroupCeoPortal ? GROUP_HOLDING_COMPANY_ID : companySlug;
        const entityCompanyId = ((ctx.companyId ?? companySlug).trim().toLowerCase() || memberCompanyId);
        if (ctx.businessType === exports.WF_BUSINESS_TYPE_HRM_CANDIDATE) {
            await this.db.query(`UPDATE ${table}
         SET stage = CASE
               WHEN stage IS NULL OR btrim(stage) = '' OR lower(stage) = 'applied' THEN 'new'
               ELSE stage
             END,
             updated_at = NOW()
         WHERE id = $1::uuid`, [ctx.businessId]);
        }
        else {
            await this.db.query(`UPDATE ${table}
         SET ${statusCol} = 'pending_approval', updated_at = NOW()
         WHERE id = $1::uuid`, [ctx.businessId]);
        }
        const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(undefined, {
            tenantId,
            companyId: xbosHeaderCompanyId,
        });
        const contextKey = ctx.businessType === exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN
            ? 'planId'
            : ctx.businessType === exports.WF_BUSINESS_TYPE_HRM_REQUISITION
                ? 'requisitionId'
                : 'candidateId';
        const submitterEmployeeId = await this.resolveSubmitterEmployeeId(ctx);
        if (!submitterEmployeeId) {
            this.logger.warn(`HRM-REC-WF-SPAWN-MISSING: submitter.employeeId unresolved businessType=${ctx.businessType} id=${ctx.businessId} userId=${ctx.submitterUserId ?? ''}`);
            return null;
        }
        try {
            const res = await fetch(`${this.xbosBaseUrl()}/api/xbos/workflow-engine/instances/start`, {
                method: 'POST',
                headers: {
                    ...upstreamHeaders,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    workflowCode,
                    businessType: ctx.businessType,
                    businessId: ctx.businessId,
                    submitter: {
                        userId: ctx.submitterUserId ?? null,
                        employeeId: submitterEmployeeId,
                        companyId: entityCompanyId,
                        companySlug: memberCompanyId,
                    },
                    context: {
                        memberTenantId: tenantId,
                        memberCompanyId,
                        entityCompanyId,
                        [contextKey]: ctx.businessId,
                    },
                }),
            });
            const json = (await res.json());
            if (!res.ok || !json.success) {
                this.logger.warn(`HRM-REC-WF-SPAWN-MISSING: XBOS start failed businessType=${ctx.businessType} id=${ctx.businessId} status=${res.status} code=${json.code ?? 'unknown'} msg=${json.message ?? ''}`);
                return null;
            }
            const instanceId = json.data?.id ?? json.data?.workflowInstanceId;
            if (!instanceId) {
                this.logger.warn(`HRM-REC-WF-SPAWN-MISSING: XBOS start returned no instance id businessType=${ctx.businessType} id=${ctx.businessId}`);
                return null;
            }
            await this.db.query(`UPDATE ${table}
         SET workflow_instance_id = $2::uuid, updated_at = NOW()
         WHERE id = $1::uuid`, [ctx.businessId, instanceId]);
            return { workflowInstanceId: instanceId };
        }
        catch (err) {
            this.logger.warn(`HRM-REC-WF-SPAWN-MISSING: XBOS start error businessType=${ctx.businessType} id=${ctx.businessId} ${err instanceof Error ? err.message : String(err)}`);
            return null;
        }
    }
    async handleStepCallback(payload) {
        await this.ensureSchema();
        if (payload.businessType === exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN ||
            payload.businessType === exports.WF_BUSINESS_TYPE_HRM_REQUISITION) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=plan_req_step_noop businessType=${payload.businessType} id=${payload.businessId}`);
            return { applied: false, skipReason: 'plan_req_step_noop' };
        }
        const mappedStage = mapRecTaskTypeToStage(payload.taskType) ?? mapRecTaskTypeToStage(payload.stepKey);
        if (!mappedStage) {
            throw new Error('HRM-REC-WF-STAGE-UNMAPPED');
        }
        const existing = await this.db.query(`SELECT stage, workflow_instance_id::text AS workflow_instance_id, wf_callback_fingerprint
       FROM public.candidates WHERE id = $1::uuid LIMIT 1`, [payload.businessId]);
        const row = existing.rows[0];
        if (!row) {
            throw new Error('HRM-REC-CP-404');
        }
        if (row.workflow_instance_id &&
            payload.workflowInstanceId &&
            row.workflow_instance_id !== payload.workflowInstanceId) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch candidate=${payload.businessId}`);
            return { applied: false, stage: row.stage, skipReason: 'instance_mismatch' };
        }
        const fingerprint = `${payload.workflowInstanceId}:${payload.stepKey}:${payload.taskId ?? ''}`;
        if (row.wf_callback_fingerprint === fingerprint) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=duplicate_step candidate=${payload.businessId} fp=${fingerprint}`);
            return { applied: false, stage: row.stage, skipReason: 'duplicate_step' };
        }
        const updated = await this.db.query(`UPDATE public.candidates
       SET stage = $2,
           wf_callback_fingerprint = $3,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING stage`, [payload.businessId, mappedStage, fingerprint]);
        return { applied: true, stage: updated.rows[0]?.stage ?? mappedStage };
    }
    async handleTerminalCallback(payload) {
        await this.ensureSchema();
        if (payload.businessType === exports.WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
            return this.handlePlanTerminal(payload);
        }
        if (payload.businessType === exports.WF_BUSINESS_TYPE_HRM_REQUISITION) {
            return this.handleRequisitionTerminal(payload);
        }
        return this.handleCandidateTerminal(payload);
    }
    async handlePlanTerminal(payload) {
        const existing = await this.db.query(`SELECT status, workflow_instance_id::text AS workflow_instance_id
       FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1`, [payload.businessId]);
        const row = existing.rows[0];
        if (!row)
            throw new Error('HRM-REC-PLAN-404');
        if (PLAN_TERMINAL.has((row.status ?? '').toLowerCase())) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=already_terminal plan=${payload.businessId} status=${row.status}`);
            return { applied: false, status: row.status, skipReason: 'already_terminal' };
        }
        if (row.workflow_instance_id &&
            payload.workflowInstanceId &&
            row.workflow_instance_id !== payload.workflowInstanceId) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch plan=${payload.businessId}`);
            return { applied: false, status: row.status, skipReason: 'instance_mismatch' };
        }
        const nextStatus = payload.terminalStatus === 'completed' ? 'approved' : 'rejected';
        const res = await this.db.query(`UPDATE public.recruitment_plans
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`, [payload.businessId, nextStatus, payload.rejectedReason ?? 'Workflow rejected']);
        return { applied: true, status: res.rows[0]?.status ?? nextStatus };
    }
    async handleRequisitionTerminal(payload) {
        const existing = await this.db.query(`SELECT status, workflow_instance_id::text AS workflow_instance_id
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1`, [payload.businessId]);
        const row = existing.rows[0];
        if (!row)
            throw new Error('HRM-REC-404');
        const current = (row.status ?? '').toLowerCase();
        if (['open', 'approved', 'rejected', 'closed', 'cancelled'].includes(current)) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=already_terminal requisition=${payload.businessId} status=${row.status}`);
            return { applied: false, status: row.status, skipReason: 'already_terminal' };
        }
        if (row.workflow_instance_id &&
            payload.workflowInstanceId &&
            row.workflow_instance_id !== payload.workflowInstanceId) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch requisition=${payload.businessId}`);
            return { applied: false, status: row.status, skipReason: 'instance_mismatch' };
        }
        const nextStatus = payload.terminalStatus === 'completed' ? 'open' : 'rejected';
        const res = await this.db.query(`UPDATE public.job_requisitions
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`, [payload.businessId, nextStatus, payload.rejectedReason ?? 'Workflow rejected']);
        return { applied: true, status: res.rows[0]?.status ?? nextStatus };
    }
    async handleCandidateTerminal(payload) {
        const existing = await this.db.query(`SELECT stage,
              workflow_instance_id::text AS workflow_instance_id,
              employee_id::text AS employee_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1`, [payload.businessId]);
        const row = existing.rows[0];
        if (!row)
            throw new Error('HRM-REC-CP-404');
        if (CANDIDATE_TERMINAL.has((row.stage ?? '').toLowerCase())) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=already_terminal candidate=${payload.businessId} stage=${row.stage}`);
            return { applied: false, stage: row.stage, skipReason: 'already_terminal' };
        }
        if (row.workflow_instance_id &&
            payload.workflowInstanceId &&
            row.workflow_instance_id !== payload.workflowInstanceId) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch candidate=${payload.businessId}`);
            return { applied: false, stage: row.stage, skipReason: 'instance_mismatch' };
        }
        if (payload.terminalStatus === 'rejected') {
            const res = await this.db.query(`UPDATE public.candidates
         SET stage = 'rejected',
             rejected_reason = $2,
             updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING stage`, [payload.businessId, payload.rejectedReason ?? 'Workflow rejected']);
            return { applied: true, stage: res.rows[0]?.stage ?? 'rejected' };
        }
        const hireOk = await this.isHireAcMet(payload.businessId, row.employee_id);
        if (!hireOk) {
            this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=hire_ac_unmet candidate=${payload.businessId}`);
            return { applied: false, stage: row.stage, skipReason: 'hire_ac_unmet' };
        }
        const linkedEmployeeId = await this.resolveHireEmployeeIdForStamp(payload.businessId, row.employee_id);
        const res = await this.db.query(linkedEmployeeId
            ? `UPDATE public.candidates
           SET stage = 'hired', employee_id = $2::uuid, updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING stage`
            : `UPDATE public.candidates
           SET stage = 'hired', updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING stage`, linkedEmployeeId ? [payload.businessId, linkedEmployeeId] : [payload.businessId]);
        return { applied: true, stage: res.rows[0]?.stage ?? 'hired' };
    }
    async resolveHireEmployeeIdForStamp(candidateId, employeeId) {
        if (employeeId?.trim())
            return employeeId.trim();
        try {
            const linked = await this.db.query(`SELECT id::text AS id FROM public.employees
         WHERE candidate_id = $1::uuid AND archived_at IS NULL
         LIMIT 1`, [candidateId]);
            return linked.rows[0]?.id ?? null;
        }
        catch {
            return null;
        }
    }
    async isHireAcMet(candidateId, employeeId) {
        if (employeeId?.trim())
            return true;
        try {
            const linked = await this.db.query(`SELECT id::text AS id FROM public.employees
         WHERE candidate_id = $1::uuid AND archived_at IS NULL
         LIMIT 1`, [candidateId]);
            return Boolean(linked.rows[0]?.id);
        }
        catch {
            return false;
        }
    }
    assertNotLockedOrThrow(workflowInstanceId, statusOrStage, entity) {
        if (isRecruitmentWorkflowLocked(workflowInstanceId, statusOrStage, entity)) {
            throw new Error('HRM-REC-WF-LOCKED');
        }
    }
};
exports.RecruitmentWorkflowBridge = RecruitmentWorkflowBridge;
exports.RecruitmentWorkflowBridge = RecruitmentWorkflowBridge = RecruitmentWorkflowBridge_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [catalog_sync_service_1.CatalogSyncService,
        hrm_db_service_1.HrmDbService])
], RecruitmentWorkflowBridge);
//# sourceMappingURL=recruitment-workflow.bridge.js.map