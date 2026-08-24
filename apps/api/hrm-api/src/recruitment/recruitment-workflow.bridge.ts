/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng — XBOS workflow bridge
 * UC:         FR-UC-H04 · plan/requisition/candidate WF
 * BR:         Soft spawn; stage map; terminal hire AC
 * Purpose:    Bridge recruitment entities → XBOS workflow-engine (start + callbacks).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    recruitment.service · recruitment-catalog.service
 * Callees:    CatalogSyncService · HrmDbService · leave expandWorkflowResolverCompanyIds
 * must_keep:  soft null on XBOS fail; Group CEO holding/main; hire_ac_unmet skip; U65 no seed
 * SOLID:      Bridge tách khỏi RecruitmentService
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist recruitment-workflow.bridge.js/.d.ts (export parity)
 * Why: TS2307 R-HRM-DIST-MISSING blocked nest/tsc
 * must_keep: WF codes · REC_WF_TASK_TYPE_TO_STAGE · F6 stages · soft spawn
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-BE-INBOX-01
 * change_mode: ADD
 * What: Pass context.subjectTitle (YCTD/plan/candidate label) on XBOS start so
 *   Inbox list can show this-wave stamp without FE join / seed
 * Why: HP-03 / J-REC-WF-03 — spawn 201 + ceo task present but stamp absent on card
 * must_keep: soft null on XBOS fail · Group CEO holding/main · Leave bridge untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01
 * ADD lock need_hire cells on plan WF approve (F-REC-HC-03) · activation_mode snapshot.
 * change_mode: ADD · must_keep soft spawn · UF-HRM-12 · REC-03 OUT
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * EXPAND status CHK open_for_hire · pass XBOS conditions {headcount_mode,hire_reason}
 * · terminal approve → open_for_hire (in_plan) / approved+BOD gate (out_of_plan).
 * change_mode: UPGRADE · must_keep soft spawn · one hrm_requisition_approval · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-YCTD-WF-INBOX-BRIDGE-01
 * FIX XBOS spawn submitter.userId = employeeId (UUID), portal email in submitterPortalEmail —
 * BR-WF-04 blocks ceo@ inbox Duyệt when userId email equals actor (U65 Group CEO).
 * must_keep: employeeId SoT · soft spawn · Y-S9 terminal · resolver email lookup unchanged
 * change_mode: FIX · J-REC-WF / AC-REC-WF-03
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-REC-YCTD-BOD-OPEN-FOR-HIRE-01
 * FIX out_of_plan terminal: catalog `hrm_requisition_approval` = 1 inbox leg — terminal = WF complete
 * → open_for_hire + cv_intake_allowed (không kẹt `approved` + BOD 409 UV). POST transitions bod_complete giữ nguyên.
 * must_keep: in_plan terminal → open_for_hire · manual bod_complete path · spawn submitter UUID
 * change_mode: FIX · AC-REC-01 · Y-S9
 */
import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { expandWorkflowResolverCompanyIds } from '../attendance/leave-workflow.bridge';
import {
  CatalogSyncService,
  resolveXbosApiBaseUrl,
} from '../catalog-sync/catalog-sync.service';
import { MASTER_TENANT_ID } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  lockNeedHireCells,
  projectMonthsForApi,
  toPersistCell,
} from './recruitment-plan-headcount';

const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';
export const PORTAL_GROUP_CEO_EMAIL = 'ceo@xe.vn';
const PORTAL_GROUP_CEO_EMPLOYEE_CODE = 'PORTAL-GCEO';
const HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID =
  '11111111-1111-4111-8111-111111111111';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE =
  'hrm_recruitment_plan_approval';
export const WF_HRM_REQUISITION_APPROVAL_CODE = 'hrm_requisition_approval';
export const WF_HRM_JOB_POSTING_APPROVAL_CODE = 'hrm_job_posting_approval';
export const WF_HRM_CANDIDATE_PIPELINE_CODE = 'hrm_candidate_pipeline';
export const WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = 'hrm_recruitment_plan';
export const WF_BUSINESS_TYPE_HRM_REQUISITION = 'hrm_requisition';
export const WF_BUSINESS_TYPE_HRM_JOB_POSTING = 'hrm_job_posting';
export const WF_BUSINESS_TYPE_HRM_CANDIDATE = 'hrm_candidate';

export const REC_WF_TASK_TYPE_TO_STAGE: Readonly<Record<string, string>> = {
  rec_intake: 'new',
  rec_screening: 'screening',
  rec_interview: 'interview',
  rec_offer: 'offer',
  intake: 'new',
  screening: 'screening',
  interview: 'interview',
  offer: 'offer',
};

export const F6_CANDIDATE_STAGES = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

const PLAN_TERMINAL = new Set(['approved', 'rejected', 'cancelled']);
const REQUISITION_TERMINAL = new Set([
  'draft',
  'open',
  'open_for_hire',
  'approved',
  'rejected',
  'closed',
  'cancelled',
]);
const CANDIDATE_TERMINAL = new Set(['hired', 'rejected']);
const JOB_POSTING_TERMINAL = new Set(['active', 'closed', 'rejected', 'cancelled']);

export type RecruitmentBusinessType =
  | typeof WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN
  | typeof WF_BUSINESS_TYPE_HRM_REQUISITION
  | typeof WF_BUSINESS_TYPE_HRM_JOB_POSTING
  | typeof WF_BUSINESS_TYPE_HRM_CANDIDATE;

export type RecruitmentWorkflowSpawnContext = {
  businessType: RecruitmentBusinessType;
  businessId: string;
  companyId: string;
  submitterUserId?: string;
  submitterEmployeeId?: string;
  tenantId?: string;
  companySlug?: string;
  /** YCTD Wave-2 — XBOS matrix conditions (mode + hire_reason). */
  conditions?: {
    headcount_mode?: string;
    hire_reason?: string;
  };
  approvalMatrixKey?: string;
};

export type RecruitmentStepCallbackPayload = {
  businessType: RecruitmentBusinessType;
  businessId: string;
  workflowInstanceId: string;
  stepKey: string;
  taskType: string;
  taskId?: string;
  reviewerUserId: string;
  reviewerName?: string;
};

export type RecruitmentTerminalCallbackPayload = {
  businessType: RecruitmentBusinessType;
  businessId: string;
  workflowInstanceId: string;
  terminalStatus: 'completed' | 'rejected';
  reviewerUserId: string;
  reviewerName?: string;
  rejectedReason?: string | null;
};

export function mapRecTaskTypeToStage(taskType: string): string | null {
  const key = taskType.trim().toLowerCase();
  if (!key) return null;
  const direct = REC_WF_TASK_TYPE_TO_STAGE[key];
  if (direct) return direct;
  if (key.startsWith('rec_')) {
    return REC_WF_TASK_TYPE_TO_STAGE[key.slice(4)] ?? null;
  }
  return REC_WF_TASK_TYPE_TO_STAGE[`rec_${key}`] ?? null;
}

export function isRecruitmentWorkflowLocked(
  workflowInstanceId: string | null | undefined,
  statusOrStage: string | null | undefined,
  entity: 'plan' | 'requisition' | 'candidate' | 'job_posting',
): boolean {
  if (!workflowInstanceId?.trim()) return false;
  const value = (statusOrStage ?? '').trim().toLowerCase();
  if (entity === 'plan') return !PLAN_TERMINAL.has(value);
  if (entity === 'requisition') return !REQUISITION_TERMINAL.has(value);
  if (entity === 'job_posting') return !JOB_POSTING_TERMINAL.has(value);
  return !CANDIDATE_TERMINAL.has(value);
}

function workflowCodeForBusinessType(
  businessType: RecruitmentBusinessType,
): string {
  if (businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
    return WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE;
  }
  if (businessType === WF_BUSINESS_TYPE_HRM_REQUISITION) {
    return WF_HRM_REQUISITION_APPROVAL_CODE;
  }
  if (businessType === WF_BUSINESS_TYPE_HRM_JOB_POSTING) {
    return WF_HRM_JOB_POSTING_APPROVAL_CODE;
  }
  return WF_HRM_CANDIDATE_PIPELINE_CODE;
}

function tableForBusinessType(businessType: RecruitmentBusinessType): {
  table: string;
  statusCol: string;
} {
  if (businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
    return { table: 'public.recruitment_plans', statusCol: 'status' };
  }
  if (businessType === WF_BUSINESS_TYPE_HRM_REQUISITION) {
    return { table: 'public.job_requisitions', statusCol: 'status' };
  }
  if (businessType === WF_BUSINESS_TYPE_HRM_JOB_POSTING) {
    return { table: 'public.job_postings', statusCol: 'status' };
  }
  return { table: 'public.candidates', statusCol: 'stage' };
}

@Injectable()
export class RecruitmentWorkflowBridge {
  private readonly logger = new Logger(RecruitmentWorkflowBridge.name);

  constructor(
    private readonly catalogSync: CatalogSyncService,
    private readonly db: HrmDbService,
  ) {}

  private xbosBaseUrl(): string {
    return resolveXbosApiBaseUrl();
  }

  /** Inbox display-ready subject (YCTD stamp / plan title / candidate name). */
  async resolveBusinessSubjectTitle(
    ctx: RecruitmentWorkflowSpawnContext,
  ): Promise<string | null> {
    try {
      if (ctx.businessType === WF_BUSINESS_TYPE_HRM_CANDIDATE) {
        const { rows } = await this.db.query<{ subject: string | null }>(
          `SELECT coalesce(
             nullif(btrim(full_name), ''),
             nullif(btrim(email), ''),
             id::text
           ) AS subject
           FROM public.candidates
           WHERE id = $1::uuid
           LIMIT 1`,
          [ctx.businessId],
        );
        return rows[0]?.subject?.trim() || null;
      }
      if (ctx.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
        const { rows } = await this.db.query<{ subject: string | null }>(
          `SELECT nullif(btrim(title), '') AS subject
           FROM public.recruitment_plans
           WHERE id = $1::uuid
           LIMIT 1`,
          [ctx.businessId],
        );
        return rows[0]?.subject?.trim() || null;
      }
      if (ctx.businessType === WF_BUSINESS_TYPE_HRM_JOB_POSTING) {
        const { rows } = await this.db.query<{ subject: string | null }>(
          `SELECT nullif(btrim(title), '') AS subject
           FROM public.job_postings
           WHERE id = $1::uuid
           LIMIT 1`,
          [ctx.businessId],
        );
        return rows[0]?.subject?.trim() || null;
      }
      const { rows } = await this.db.query<{ subject: string | null }>(
        `SELECT nullif(btrim(title), '') AS subject
         FROM public.job_requisitions
         WHERE id = $1::uuid
         LIMIT 1`,
        [ctx.businessId],
      );
      return rows[0]?.subject?.trim() || null;
    } catch (err) {
      this.logger.warn(
        `HRM-REC-WF-SUBJECT-SOFT: title resolve failed businessType=${ctx.businessType} id=${ctx.businessId} ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  async resolveSubmitterEmployeeId(
    ctx: RecruitmentWorkflowSpawnContext,
  ): Promise<string | null> {
    const explicit = ctx.submitterEmployeeId?.trim();
    if (explicit) return explicit;
    const userKey = ctx.submitterUserId?.trim().toLowerCase();
    if (!userKey) return null;
    if (UUID_RE.test(userKey)) return userKey;
    const companyRaw = (ctx.companySlug ?? ctx.companyId ?? '').trim();
    const companyIds = companyRaw
      ? expandWorkflowResolverCompanyIds(companyRaw)
      : [];
    try {
      const byEmail = await this.resolveEmployeeIdByEmail(userKey, companyIds);
      if (byEmail) return byEmail;
      const byMembership = await this.resolveEmployeeIdViaMembership(
        userKey,
        companyIds,
      );
      if (byMembership) return byMembership;
      if (this.isPortalGroupCeoIdentity(userKey)) {
        const master = await this.resolveHoldingGroupCeoMasterEmployee(userKey);
        if (master) return master;
        return await this.ensureHoldingPortalGroupCeoEmployee(userKey);
      }
      return null;
    } catch (err) {
      this.logger.warn(
        `HRM-REC-WF-SPAWN-MISSING: submitter employee resolve failed user=${userKey} ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  private isPortalGroupCeoIdentity(userKey: string): boolean {
    return userKey === PORTAL_GROUP_CEO_EMAIL;
  }

  private async resolveEmployeeIdByEmail(
    userKey: string,
    companyIds: string[],
  ): Promise<string | null> {
    if (companyIds.length > 0) {
      const scoped = await this.db.query<{ id: string }>(
        `SELECT id::text AS id
         FROM public.employees
         WHERE lower(email) = $1
           AND archived_at IS NULL
           AND company_id = ANY($2::text[])
         LIMIT 1`,
        [userKey, companyIds],
      );
      if (scoped.rows[0]?.id) return scoped.rows[0].id;
    }
    const anyCompany = await this.db.query<{ id: string }>(
      `SELECT id::text AS id
       FROM public.employees
       WHERE lower(email) = $1
         AND archived_at IS NULL
       ORDER BY CASE WHEN company_id IN ('holding', 'main') THEN 0 ELSE 1 END, updated_at DESC NULLS LAST
       LIMIT 1`,
      [userKey],
    );
    return anyCompany.rows[0]?.id ?? null;
  }

  private async resolveEmployeeIdViaMembership(
    userKey: string,
    companyIds: string[],
  ): Promise<string | null> {
    try {
      const scopeKeys =
        companyIds.length > 0
          ? companyIds
          : [GROUP_HOLDING_COMPANY_ID, GROUP_OPERATING_MAIN];
      const linked = await this.db.query<{ employee_id: string }>(
        `SELECT employee_id::text AS employee_id
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
         LIMIT 1`,
        [userKey, scopeKeys],
      );
      return linked.rows[0]?.employee_id ?? null;
    } catch {
      return null;
    }
  }

  private async resolveHoldingGroupCeoMasterEmployee(
    userKey: string,
  ): Promise<string | null> {
    const byPortalCode = await this.db.query<{ id: string }>(
      `SELECT id::text AS id
       FROM public.employees
       WHERE archived_at IS NULL
         AND company_id IN ('holding', 'main')
         AND lower(employee_code) = lower($1)
       ORDER BY CASE WHEN company_id = 'holding' THEN 0 ELSE 1 END, updated_at DESC NULLS LAST
       LIMIT 1`,
      [PORTAL_GROUP_CEO_EMPLOYEE_CODE],
    );
    if (byPortalCode.rows[0]?.id) {
      await this.linkPortalEmailToEmployeeIfSafe(
        byPortalCode.rows[0].id,
        userKey,
      );
      return byPortalCode.rows[0].id;
    }
    const bootstrap = await this.db.query<{ id: string; email: string }>(
      `SELECT id::text AS id, lower(email) AS email
       FROM public.employees
       WHERE id = $1::uuid
         AND archived_at IS NULL
         AND company_id IN ('holding', 'main')
       LIMIT 1`,
      [HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID],
    );
    const boot = bootstrap.rows[0];
    if (boot?.id && boot.email === userKey) {
      return boot.id;
    }
    return null;
  }

  private async linkPortalEmailToEmployeeIfSafe(
    employeeId: string,
    userKey: string,
  ): Promise<void> {
    try {
      await this.db.query(
        `UPDATE public.employees
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
           )`,
        [employeeId, userKey, HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID],
      );
    } catch {
      /* soft */
    }
  }

  private async ensureHoldingPortalGroupCeoEmployee(
    userKey: string,
  ): Promise<string | null> {
    const existing = await this.resolveEmployeeIdByEmail(userKey, [
      GROUP_HOLDING_COMPANY_ID,
      GROUP_OPERATING_MAIN,
    ]);
    if (existing) return existing;
    const newId = randomUUID();
    try {
      await this.db.query(
        `INSERT INTO public.employees (
           id, company_id, employee_code, email, full_name, job_title_key, status, hired_at
         ) VALUES (
           $1::uuid, $2, $3, $4, $5, 'CEO', 'active', CURRENT_DATE
         )`,
        [
          newId,
          GROUP_HOLDING_COMPANY_ID,
          PORTAL_GROUP_CEO_EMPLOYEE_CODE,
          userKey,
          'CEO Tập đoàn',
        ],
      );
      this.logger.log(
        `HRM-REC-WF-SUBMITTER-ENSURE: holding portal Group CEO employee created id=${newId} email=${userKey}`,
      );
      return newId;
    } catch (err) {
      const again = await this.resolveEmployeeIdByEmail(userKey, [
        GROUP_HOLDING_COMPANY_ID,
        GROUP_OPERATING_MAIN,
      ]);
      if (again) return again;
      const byCode = await this.db.query<{ id: string }>(
        `SELECT id::text AS id
         FROM public.employees
         WHERE company_id = $1
           AND lower(employee_code) = lower($2)
           AND archived_at IS NULL
         LIMIT 1`,
        [GROUP_HOLDING_COMPANY_ID, PORTAL_GROUP_CEO_EMPLOYEE_CODE],
      );
      if (byCode.rows[0]?.id) {
        await this.linkPortalEmailToEmployeeIfSafe(byCode.rows[0].id, userKey);
        return byCode.rows[0].id;
      }
      this.logger.warn(
        `HRM-REC-WF-SPAWN-MISSING: ensure portal Group CEO employee failed email=${userKey} ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  async ensureSchema(): Promise<void> {
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
      ALTER TABLE public.job_postings
      ADD COLUMN IF NOT EXISTS workflow_instance_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_postings
      ADD COLUMN IF NOT EXISTS rejected_reason TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.job_postings
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
            'open', 'open_for_hire', 'closed', 'on_hold',
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
      CREATE INDEX IF NOT EXISTS idx_job_postings_workflow_instance_id
        ON public.job_postings (workflow_instance_id)
        WHERE workflow_instance_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_candidates_workflow_instance_id
        ON public.candidates (workflow_instance_id)
        WHERE workflow_instance_id IS NOT NULL;
    `);
  }

  async startRecruitmentWorkflowIfConfigured(
    ctx: RecruitmentWorkflowSpawnContext,
  ): Promise<{ workflowInstanceId?: string } | null> {
    await this.ensureSchema();
    const tenantId = (ctx.tenantId ?? MASTER_TENANT_ID).trim().toLowerCase();
    const companySlug =
      (ctx.companySlug ?? GROUP_HOLDING_COMPANY_ID).trim().toLowerCase() ||
      GROUP_HOLDING_COMPANY_ID;
    const workflowCode = workflowCodeForBusinessType(ctx.businessType);
    const { table, statusCol } = tableForBusinessType(ctx.businessType);
    const isGroupCeoPortal =
      tenantId === MASTER_TENANT_ID &&
      (companySlug === GROUP_OPERATING_MAIN ||
        companySlug === GROUP_HOLDING_COMPANY_ID);
    const xbosHeaderCompanyId = isGroupCeoPortal
      ? GROUP_HOLDING_COMPANY_ID
      : companySlug;
    const memberCompanyId = isGroupCeoPortal
      ? GROUP_HOLDING_COMPANY_ID
      : companySlug;
    const entityCompanyId =
      (ctx.companyId ?? companySlug).trim().toLowerCase() || memberCompanyId;

    if (ctx.businessType === WF_BUSINESS_TYPE_HRM_CANDIDATE) {
      await this.db.query(
        `UPDATE ${table}
         SET stage = CASE
               WHEN stage IS NULL OR btrim(stage) = '' OR lower(stage) = 'applied' THEN 'new'
               ELSE stage
             END,
             updated_at = NOW()
         WHERE id = $1::uuid`,
        [ctx.businessId],
      );
    } else {
      await this.db.query(
        `UPDATE ${table}
         SET ${statusCol} = 'pending_approval', updated_at = NOW()
         WHERE id = $1::uuid`,
        [ctx.businessId],
      );
    }

    const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(
      undefined,
      {
        tenantId,
        companyId: xbosHeaderCompanyId,
      },
    );
    const contextKey =
      ctx.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN
        ? 'planId'
        : ctx.businessType === WF_BUSINESS_TYPE_HRM_REQUISITION
          ? 'requisitionId'
          : ctx.businessType === WF_BUSINESS_TYPE_HRM_JOB_POSTING
            ? 'jobPostingId'
            : 'candidateId';
    const submitterEmployeeId = await this.resolveSubmitterEmployeeId(ctx);
    if (!submitterEmployeeId) {
      this.logger.warn(
        `HRM-REC-WF-SPAWN-MISSING: submitter.employeeId unresolved businessType=${ctx.businessType} id=${ctx.businessId} userId=${ctx.submitterUserId ?? ''}`,
      );
      return null;
    }
    const subjectTitle = await this.resolveBusinessSubjectTitle(ctx);
    const portalSubmitterEmail =
      ctx.submitterUserId?.trim().toLowerCase() || null;
    // Portal inbox completes with JWT email (ceo@xe.vn); XBOS BR-WF-04 compares that to context.submitter.userId.
    const xbosSubmitterUserId = submitterEmployeeId;
    try {
      const res = await fetch(
        `${this.xbosBaseUrl()}/api/xbos/workflow-engine/instances/start`,
        {
          method: 'POST',
          headers: {
            ...upstreamHeaders,
            'content-type': 'application/json',
            // Leave parity — scope headers when JWT claims omitted / internal key only.
            'x-tenant-id': tenantId,
            'x-company-id': xbosHeaderCompanyId,
          },
          body: JSON.stringify({
            workflowCode,
            businessType: ctx.businessType,
            businessId: ctx.businessId,
            submitter: {
              userId: xbosSubmitterUserId,
              employeeId: submitterEmployeeId,
              companyId: entityCompanyId,
              companySlug: memberCompanyId,
              ...(portalSubmitterEmail
                ? { submitterPortalEmail: portalSubmitterEmail }
                : {}),
            },
            context: {
              memberTenantId: tenantId,
              memberCompanyId,
              entityCompanyId,
              [contextKey]: ctx.businessId,
              ...(subjectTitle
                ? { subjectTitle, businessTitle: subjectTitle }
                : {}),
              ...(ctx.conditions
                ? {
                    conditions: ctx.conditions,
                    headcount_mode: ctx.conditions.headcount_mode,
                    hire_reason: ctx.conditions.hire_reason,
                  }
                : {}),
              ...(ctx.approvalMatrixKey
                ? { approval_matrix_key: ctx.approvalMatrixKey }
                : {}),
            },
          }),
        },
      );
      const json = (await res.json()) as {
        success?: boolean;
        code?: string;
        message?: string;
        data?: { id?: string; workflowInstanceId?: string };
      };
      if (!res.ok || !json.success) {
        this.logger.warn(
          `HRM-REC-WF-SPAWN-MISSING: XBOS start failed businessType=${ctx.businessType} id=${ctx.businessId} status=${res.status} code=${json.code ?? 'unknown'} msg=${json.message ?? ''}`,
        );
        return null;
      }
      const instanceId = json.data?.id ?? json.data?.workflowInstanceId;
      if (!instanceId) {
        this.logger.warn(
          `HRM-REC-WF-SPAWN-MISSING: XBOS start returned no instance id businessType=${ctx.businessType} id=${ctx.businessId}`,
        );
        return null;
      }
      await this.db.query(
        `UPDATE ${table}
         SET workflow_instance_id = $2::uuid, updated_at = NOW()
         WHERE id = $1::uuid`,
        [ctx.businessId, instanceId],
      );
      return { workflowInstanceId: instanceId };
    } catch (err) {
      this.logger.warn(
        `HRM-REC-WF-SPAWN-MISSING: XBOS start error businessType=${ctx.businessType} id=${ctx.businessId} ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  async handleStepCallback(payload: RecruitmentStepCallbackPayload): Promise<{
    applied: boolean;
    stage?: string;
    status?: string;
    skipReason?: string;
  }> {
    await this.ensureSchema();
    if (
      payload.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN ||
      payload.businessType === WF_BUSINESS_TYPE_HRM_REQUISITION ||
      payload.businessType === WF_BUSINESS_TYPE_HRM_JOB_POSTING
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=plan_req_step_noop businessType=${payload.businessType} id=${payload.businessId}`,
      );
      return { applied: false, skipReason: 'plan_req_step_noop' };
    }
    const mappedStage =
      mapRecTaskTypeToStage(payload.taskType) ??
      mapRecTaskTypeToStage(payload.stepKey);
    if (!mappedStage) {
      throw new Error('HRM-REC-WF-STAGE-UNMAPPED');
    }
    const existing = await this.db.query<{
      stage: string;
      workflow_instance_id: string | null;
      wf_callback_fingerprint: string | null;
    }>(
      `SELECT stage, workflow_instance_id::text AS workflow_instance_id, wf_callback_fingerprint
       FROM public.candidates WHERE id = $1::uuid LIMIT 1`,
      [payload.businessId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new Error('HRM-REC-CP-404');
    }
    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch candidate=${payload.businessId}`,
      );
      return {
        applied: false,
        stage: row.stage,
        skipReason: 'instance_mismatch',
      };
    }
    const fingerprint = `${payload.workflowInstanceId}:${payload.stepKey}:${payload.taskId ?? ''}`;
    if (row.wf_callback_fingerprint === fingerprint) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=duplicate_step candidate=${payload.businessId} fp=${fingerprint}`,
      );
      return { applied: false, stage: row.stage, skipReason: 'duplicate_step' };
    }
    const updated = await this.db.query<{ stage: string }>(
      `UPDATE public.candidates
       SET stage = $2,
           wf_callback_fingerprint = $3,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING stage`,
      [payload.businessId, mappedStage, fingerprint],
    );
    return { applied: true, stage: updated.rows[0]?.stage ?? mappedStage };
  }

  async handleTerminalCallback(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{
    applied: boolean;
    status?: string;
    stage?: string;
    skipReason?: string;
  }> {
    await this.ensureSchema();
    if (payload.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
      return this.handlePlanTerminal(payload);
    }
    if (payload.businessType === WF_BUSINESS_TYPE_HRM_REQUISITION) {
      return this.handleRequisitionTerminal(payload);
    }
    if (payload.businessType === WF_BUSINESS_TYPE_HRM_JOB_POSTING) {
      return this.handleJobPostingTerminal(payload);
    }
    return this.handleCandidateTerminal(payload);
  }

  private async handleJobPostingTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{
    applied: boolean;
    status?: string;
    skipReason?: string;
  }> {
    const existing = await this.db.query<{
      status: string;
      workflow_instance_id: string | null;
    }>(
      `SELECT status, workflow_instance_id::text AS workflow_instance_id
       FROM public.job_postings WHERE id = $1::uuid LIMIT 1`,
      [payload.businessId],
    );
    const row = existing.rows[0];
    if (!row) throw new Error('HRM-REC-JOBPOST-404');
    if (JOB_POSTING_TERMINAL.has((row.status ?? '').toLowerCase())) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=already_terminal job_posting=${payload.businessId} status=${row.status}`,
      );
      return {
        applied: false,
        status: row.status,
        skipReason: 'already_terminal',
      };
    }
    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch job_posting=${payload.businessId}`,
      );
      return {
        applied: false,
        status: row.status,
        skipReason: 'instance_mismatch',
      };
    }
    const nextStatus =
      payload.terminalStatus === 'completed' ? 'active' : 'rejected';
    const res = await this.db.query<{ status: string }>(
      `UPDATE public.job_postings
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`,
      [
        payload.businessId,
        nextStatus,
        payload.rejectedReason ?? 'Workflow rejected',
      ],
    );
    return { applied: true, status: res.rows[0]?.status ?? nextStatus };
  }

  private async handlePlanTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{
    applied: boolean;
    status?: string;
    skipReason?: string;
  }> {
    const existing = await this.db.query<{
      status: string;
      workflow_instance_id: string | null;
    }>(
      `SELECT status, workflow_instance_id::text AS workflow_instance_id
       FROM public.recruitment_plans WHERE id = $1::uuid LIMIT 1`,
      [payload.businessId],
    );
    const row = existing.rows[0];
    if (!row) throw new Error('HRM-REC-PLAN-404');
    if (PLAN_TERMINAL.has((row.status ?? '').toLowerCase())) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=already_terminal plan=${payload.businessId} status=${row.status}`,
      );
      return {
        applied: false,
        status: row.status,
        skipReason: 'already_terminal',
      };
    }
    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch plan=${payload.businessId}`,
      );
      return {
        applied: false,
        status: row.status,
        skipReason: 'instance_mismatch',
      };
    }
    const nextStatus =
      payload.terminalStatus === 'completed' ? 'approved' : 'rejected';
    const res = await this.db.query<{ status: string }>(
      `UPDATE public.recruitment_plans
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           approved_at = CASE WHEN $2 = 'approved' THEN NOW() ELSE approved_at END,
           activation_mode = CASE WHEN $2 = 'approved' THEN COALESCE(activation_mode, 'on_approve') ELSE activation_mode END,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`,
      [
        payload.businessId,
        nextStatus,
        payload.rejectedReason ?? 'Workflow rejected',
      ],
    );
    // F-REC-HC-03 — lock need_hire cells after WF approve (Option A).
    if (nextStatus === 'approved') {
      await this.lockPlanNeedHireCells(payload.businessId);
    }
    return { applied: true, status: res.rows[0]?.status ?? nextStatus };
  }

  /** PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01 — cell lock without importing catalog (cycle). */
  private async lockPlanNeedHireCells(planId: string): Promise<void> {
    const depts = await this.db.query(
      `SELECT id FROM public.recruitment_plan_departments WHERE plan_id = $1::uuid`,
      [planId],
    );
    for (const dept of depts.rows as Array<{ id: string }>) {
      const posRes = await this.db.query(
        `SELECT id, months_data FROM public.recruitment_plan_positions WHERE department_id = $1::uuid`,
        [dept.id],
      );
      for (const pos of posRes.rows as Array<{
        id: string;
        months_data: unknown;
      }>) {
        const cells = lockNeedHireCells(
          projectMonthsForApi(pos.months_data, true),
        );
        await this.db.query(
          `UPDATE public.recruitment_plan_positions
           SET months_data = $2::jsonb, updated_at = NOW()
           WHERE id = $1::uuid`,
          [pos.id, JSON.stringify(cells.map(toPersistCell))],
        );
      }
    }
  }

  private async handleRequisitionTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{
    applied: boolean;
    status?: string;
    skipReason?: string;
  }> {
    const existing = await this.db.query<{
      status: string;
      workflow_instance_id: string | null;
      headcount_mode: string | null;
      pipeline_flags_json: unknown;
    }>(
      `SELECT status, workflow_instance_id::text AS workflow_instance_id,
              headcount_mode, pipeline_flags_json
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1`,
      [payload.businessId],
    );
    const row = existing.rows[0];
    if (!row) throw new Error('HRM-REC-404');
    const current = (row.status ?? '').toLowerCase();
    if (
      ['open', 'open_for_hire', 'rejected', 'closed', 'cancelled'].includes(
        current,
      )
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=already_terminal requisition=${payload.businessId} status=${row.status}`,
      );
      return {
        applied: false,
        status: row.status,
        skipReason: 'already_terminal',
      };
    }
    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch requisition=${payload.businessId}`,
      );
      return {
        applied: false,
        status: row.status,
        skipReason: 'instance_mismatch',
      };
    }
    const mode = (row.headcount_mode ?? '').trim().toLowerCase();
    let nextStatus: string;
    if (payload.terminalStatus === 'rejected') {
      nextStatus = 'rejected';
    } else if (mode === 'out_of_plan') {
      // Y-S9 — XBOS `hrm_requisition_approval` has one step; terminal fires when instance completes.
      // UV mutate needs open_for_hire (assertYctdReceivableForMutateOrThrow). Second terminal / bod_complete API unchanged.
      nextStatus = 'open_for_hire';
    } else {
      nextStatus = 'open_for_hire';
    }
    const flagsRaw =
      row.pipeline_flags_json && typeof row.pipeline_flags_json === 'object'
        ? (row.pipeline_flags_json as Record<string, unknown>)
        : {};
    const flags =
      nextStatus === 'open_for_hire'
        ? { ...flagsRaw, cv_intake_allowed: true }
        : { ...flagsRaw, cv_intake_allowed: false };
    const res = await this.db.query<{ status: string }>(
      `UPDATE public.job_requisitions
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           approved_at = CASE WHEN $2 = 'open_for_hire' THEN NOW() ELSE approved_at END,
           pipeline_flags_json = $4::jsonb,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`,
      [
        payload.businessId,
        nextStatus,
        payload.rejectedReason ?? 'Workflow rejected',
        JSON.stringify(flags),
      ],
    );
    return { applied: true, status: res.rows[0]?.status ?? nextStatus };
  }

  private async handleCandidateTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{
    applied: boolean;
    stage?: string;
    skipReason?: string;
  }> {
    const existing = await this.db.query<{
      stage: string;
      workflow_instance_id: string | null;
      employee_id: string | null;
    }>(
      `SELECT stage,
              workflow_instance_id::text AS workflow_instance_id,
              employee_id::text AS employee_id
       FROM public.candidates WHERE id = $1::uuid LIMIT 1`,
      [payload.businessId],
    );
    const row = existing.rows[0];
    if (!row) throw new Error('HRM-REC-CP-404');
    if (CANDIDATE_TERMINAL.has((row.stage ?? '').toLowerCase())) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=already_terminal candidate=${payload.businessId} stage=${row.stage}`,
      );
      return {
        applied: false,
        stage: row.stage,
        skipReason: 'already_terminal',
      };
    }
    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch candidate=${payload.businessId}`,
      );
      return {
        applied: false,
        stage: row.stage,
        skipReason: 'instance_mismatch',
      };
    }
    if (payload.terminalStatus === 'rejected') {
      const res = await this.db.query<{ stage: string }>(
        `UPDATE public.candidates
         SET stage = 'rejected',
             rejected_reason = $2,
             updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING stage`,
        [payload.businessId, payload.rejectedReason ?? 'Workflow rejected'],
      );
      return { applied: true, stage: res.rows[0]?.stage ?? 'rejected' };
    }
    const hireOk = await this.isHireAcMet(payload.businessId, row.employee_id);
    if (!hireOk) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=hire_ac_unmet candidate=${payload.businessId}`,
      );
      return { applied: false, stage: row.stage, skipReason: 'hire_ac_unmet' };
    }
    const linkedEmployeeId = await this.resolveHireEmployeeIdForStamp(
      payload.businessId,
      row.employee_id,
    );
    const res = await this.db.query<{ stage: string }>(
      linkedEmployeeId
        ? `UPDATE public.candidates
           SET stage = 'hired', employee_id = $2::uuid, updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING stage`
        : `UPDATE public.candidates
           SET stage = 'hired', updated_at = NOW()
           WHERE id = $1::uuid
           RETURNING stage`,
      linkedEmployeeId
        ? [payload.businessId, linkedEmployeeId]
        : [payload.businessId],
    );
    return { applied: true, stage: res.rows[0]?.stage ?? 'hired' };
  }

  private async resolveHireEmployeeIdForStamp(
    candidateId: string,
    employeeId: string | null | undefined,
  ): Promise<string | null> {
    if (employeeId?.trim()) return employeeId.trim();
    try {
      const linked = await this.db.query<{ id: string }>(
        `SELECT id::text AS id FROM public.employees
         WHERE candidate_id = $1::uuid AND archived_at IS NULL
         LIMIT 1`,
        [candidateId],
      );
      return linked.rows[0]?.id ?? null;
    } catch {
      return null;
    }
  }

  private async isHireAcMet(
    candidateId: string,
    employeeId: string | null | undefined,
  ): Promise<boolean> {
    if (employeeId?.trim()) return true;
    try {
      const linked = await this.db.query<{ id: string }>(
        `SELECT id::text AS id FROM public.employees
         WHERE candidate_id = $1::uuid AND archived_at IS NULL
         LIMIT 1`,
        [candidateId],
      );
      return Boolean(linked.rows[0]?.id);
    } catch {
      return false;
    }
  }

  assertNotLockedOrThrow(
    workflowInstanceId: string | null | undefined,
    statusOrStage: string | null | undefined,
    entity: 'plan' | 'requisition' | 'candidate' | 'job_posting',
  ): void {
    if (
      isRecruitmentWorkflowLocked(workflowInstanceId, statusOrStage, entity)
    ) {
      throw new Error('HRM-REC-WF-LOCKED');
    }
  }
}
