/**
 * @CODE-MEMORY
 * Screen: HRM recruitment → XBOS workflow-engine instances/start + step/terminal callbacks
 * UC: UC-HRM-REC-WF-02..06
 * BR: BR-REC-WF-01..09 · BR-REC-WF-MAP-01
 * SRS: docs/hrm/SRS.md §16.5 (delta) · docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
 * TechSpec: docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3–§6
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §2–§6
 * Purpose: Parallel LeaveWorkflowBridge for plan / requisition / candidate pipeline.
 *   Spawn three workflow_code values; sync stage/status via step+terminal callbacks;
 *   fail-closed STAGE-UNMAPPED / LOCKED / SPAWN-MISSING / CALLBACK-SKIP.
 * WorkItem: XHRM-REC-WF-BE-SPAWN-02
 * Coded: 2026-07-19
 * Callers: RecruitmentWorkflowController · RecruitmentCatalogService · RecruitmentService
 * Callees: CatalogSync → XBOS instances/start · HrmDbService (plans/reqs/candidates + employees email)
 * Impact: Wrong map → funnel F6 drift; leave/catalog bridges must stay untouched
 * must_keep: UF-HRM-12, J-HRM-05, LeaveWorkflowBridge, CatalogWorkflowBridge, AC-CD-F6-*, F4 resolver
 * change_mode: FIX
 * SOLID: SRP — recruitment↔WF bridge only; leave notify path never imported
 * LastVerified: recruitment-workflow.bridge.spec.ts · xhrm-rec-wf-be-spawn-02
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-01
 * ADD RecruitmentWorkflowBridge (Option A HRM spawn). Cite data contract §2 map,
 * §4 workflow_instance_id, §5 DTO, §6 codes. Do not REPLACE leave/catalog bridges.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-SPAWN-01
 * FIX instances/start payload: XBOS requires submitter.employeeId (XBOS-WF-400).
 * Resolve from explicit ctx.submitterEmployeeId or employees.email = submitterUserId
 * (x-user-id / JWT subject). Reuse expandWorkflowResolverCompanyIds (leave helper,
 * read-only import — do not mutate LeaveWorkflowBridge). must_keep leave + F6 map.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-SPAWN-02
 * FIX Group CEO portal identity (ceo@xe.vn) with no employees.email row (dense
 * holding already seeded → ensureSeedData skip). Resolve chain: explicit → UUID →
 * email → user_company_memberships.employee_id → holding master (PORTAL-GCEO/NV001)
 * → idempotent ensure holding employee for documented portal Group CEO emails.
 * Not QA seed — product ensure for portal↔employee master link. must_keep leave+F6.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-DB-01-HIRE-LINK-01
 * ADD stamp candidates.employee_id on terminal hired when AC met via reverse
 * employees.candidate_id (FR-HRM-INT-01 Diễn biến #7 · TechSpec §17.3 G-DB-01).
 * User-facing reject remains catalog HRM-REC-HIRE-400; WF keeps CALLBACK-SKIP.
 * change_mode: ADD · must_keep leave bridge · G-RC-01 · no hard REFERENCES.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BM-BE-REC-WF-SPAWN-MEMBER-01
 * XBOS owns applyingEntityId group+member spawn semantics + recruitment resolver
 * soft-fallback (G-BM-REC-02). HRM bridge spawn payload unchanged (Option A).
 * must_keep LeaveWorkflowBridge · UF-HRM-12 · G-RC-01 · U65.
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BM-BE-REC-WF-04-STEP-SYNC-CALLBACK-01
 * FIX mapRecTaskTypeToStage: accept bare F6 step_key (intake|screening|interview|offer)
 * as well as catalog rec_* taskType — XBOS complete falls back to step_key when
 * inbox payload omits taskType (J-REC-WF-04 · QA bm-qa-j-rec-wf-04-step-sync-01).
 * handleStepCallback also tries stepKey when taskType unmapped.
 * change_mode: FIX · must_keep start-pipeline · J-REC-WF-02/03 · U65 no seed.
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-REC-WF-OPTION-B-BE-01
 * ADD spawn context entityCompanyId + memberCompanyId from HRM entity company
 * (slug/holding) so XBOS Option B partition pick receives correct keys.
 * Headers still normalize Group CEO main→holding. must_keep leave bridge ·
 * J-REC-WF spawn smoke · no Bay.vn UI · no Option C clone.
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01
 * Controllers resolve submitter via JWT when x-user-id missing (see
 * resolve-submitter-user-id.ts). Bridge still fail-closed SPAWN-MISSING when
 * identity unresolved. must_keep Option B company partition · J-REC-WF-02/03.
 * change_mode: UPGRADE
 */
import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { expandWorkflowResolverCompanyIds } from '../attendance/leave-workflow.bridge';
import { CatalogSyncService, resolveXbosApiBaseUrl } from '../catalog-sync/catalog-sync.service';
import { MASTER_TENANT_ID } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';

const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';

/** Mirror XBOS GROUP_APPROVER_USER — portal Group CEO without mobile employee_id JWT. */
export const PORTAL_GROUP_CEO_EMAIL = 'ceo@xe.vn';
const PORTAL_GROUP_CEO_EMPLOYEE_CODE = 'PORTAL-GCEO';
/** Bootstrap holding NV001 id — prefer when still present and email matches / vacant. */
const HOLDING_BOOTSTRAP_CEO_EMPLOYEE_ID = '11111111-1111-4111-8111-111111111111';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE = 'hrm_recruitment_plan_approval';
export const WF_HRM_REQUISITION_APPROVAL_CODE = 'hrm_requisition_approval';
export const WF_HRM_CANDIDATE_PIPELINE_CODE = 'hrm_candidate_pipeline';

export const WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN = 'hrm_recruitment_plan';
export const WF_BUSINESS_TYPE_HRM_REQUISITION = 'hrm_requisition';
export const WF_BUSINESS_TYPE_HRM_CANDIDATE = 'hrm_candidate';

/**
 * Data contract §2.2 — LOCKED F6 non-terminal map (must_keep AC-CD-F6-*).
 * Keys are catalog `taskType` (`rec_*`). Live XBOS inbox often stores bare
 * `step_key` (intake|screening|…) — see `mapRecTaskTypeToStage` normalization.
 */
export const REC_WF_TASK_TYPE_TO_STAGE: Readonly<Record<string, string>> = {
  rec_intake: 'new',
  rec_screening: 'screening',
  rec_interview: 'interview',
  rec_offer: 'offer',
  /** Bare F6 step_key aliases (J-REC-WF-04 step sync). */
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
const REQUISITION_TERMINAL = new Set(['open', 'approved', 'rejected', 'closed', 'cancelled']);
const CANDIDATE_TERMINAL = new Set(['hired', 'rejected']);

export type RecruitmentBusinessType =
  | typeof WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN
  | typeof WF_BUSINESS_TYPE_HRM_REQUISITION
  | typeof WF_BUSINESS_TYPE_HRM_CANDIDATE;

export type RecruitmentWorkflowSpawnContext = {
  businessType: RecruitmentBusinessType;
  businessId: string;
  companyId: string;
  submitterUserId?: string;
  submitterEmployeeId?: string;
  tenantId?: string;
  companySlug?: string;
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

/**
 * Map XBOS taskType **or** bare step_key → F6 candidate stage.
 * Accepts `rec_screening` and `screening` (live complete path uses step_key
 * when task payload omits taskType).
 */
export function mapRecTaskTypeToStage(taskType: string): string | null {
  const key = taskType.trim().toLowerCase();
  if (!key) return null;
  const direct = REC_WF_TASK_TYPE_TO_STAGE[key];
  if (direct) return direct;
  // Normalize bare ↔ rec_* so either form from XBOS maps.
  if (key.startsWith('rec_')) {
    return REC_WF_TASK_TYPE_TO_STAGE[key.slice(4)] ?? null;
  }
  return REC_WF_TASK_TYPE_TO_STAGE[`rec_${key}`] ?? null;
}

export function isRecruitmentWorkflowLocked(
  workflowInstanceId: string | null | undefined,
  statusOrStage: string | null | undefined,
  entity: 'plan' | 'requisition' | 'candidate',
): boolean {
  if (!workflowInstanceId?.trim()) return false;
  const value = (statusOrStage ?? '').trim().toLowerCase();
  if (entity === 'plan') return !PLAN_TERMINAL.has(value);
  if (entity === 'requisition') return !REQUISITION_TERMINAL.has(value);
  return !CANDIDATE_TERMINAL.has(value);
}

function workflowCodeForBusinessType(businessType: RecruitmentBusinessType): string {
  if (businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) return WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE;
  if (businessType === WF_BUSINESS_TYPE_HRM_REQUISITION) return WF_HRM_REQUISITION_APPROVAL_CODE;
  return WF_HRM_CANDIDATE_PIPELINE_CODE;
}

function tableForBusinessType(businessType: RecruitmentBusinessType): {
  table: string;
  statusCol: 'status' | 'stage';
} {
  if (businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
    return { table: 'public.recruitment_plans', statusCol: 'status' };
  }
  if (businessType === WF_BUSINESS_TYPE_HRM_REQUISITION) {
    return { table: 'public.job_requisitions', statusCol: 'status' };
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

  /**
   * XBOS startInstanceFromWorkflowCode requires non-empty submitter.employeeId.
   * Chain: explicit → UUID userId → employees.email → membership.employee_id →
   * holding master / ensure for portal Group CEO (ceo@xe.vn).
   */
  async resolveSubmitterEmployeeId(ctx: RecruitmentWorkflowSpawnContext): Promise<string | null> {
    const explicit = ctx.submitterEmployeeId?.trim();
    if (explicit) return explicit;

    const userKey = ctx.submitterUserId?.trim().toLowerCase();
    if (!userKey) return null;
    if (UUID_RE.test(userKey)) return userKey;

    const companyRaw = (ctx.companySlug ?? ctx.companyId ?? '').trim();
    const companyIds = companyRaw ? expandWorkflowResolverCompanyIds(companyRaw) : [];

    try {
      const byEmail = await this.resolveEmployeeIdByEmail(userKey, companyIds);
      if (byEmail) return byEmail;

      const byMembership = await this.resolveEmployeeIdViaMembership(userKey, companyIds);
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

    // Fallback: email-only (group CEO / multi-hat may sit under holding while slug is main).
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

  /** HRM admin membership link (portal email → employees.id) when present. */
  private async resolveEmployeeIdViaMembership(
    userKey: string,
    companyIds: string[],
  ): Promise<string | null> {
    try {
      const scopeKeys = companyIds.length > 0 ? companyIds : [GROUP_HOLDING_COMPANY_ID, GROUP_OPERATING_MAIN];
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
      // Table may be absent on thin DBs — treat as no membership link.
      return null;
    }
  }

  /**
   * Holding employee master for portal Group CEO: PORTAL-GCEO code, or bootstrap
   * NV001 id only when email already matches ceo@xe.vn.
   */
  private async resolveHoldingGroupCeoMasterEmployee(userKey: string): Promise<string | null> {
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
      await this.linkPortalEmailToEmployeeIfSafe(byPortalCode.rows[0].id, userKey);
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

  private async linkPortalEmailToEmployeeIfSafe(employeeId: string, userKey: string): Promise<void> {
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
      // Unique email race — ignore; caller already has employee id.
    }
  }

  /**
   * Product ensure (not QA seed): create holding employee for documented portal
   * Group CEO email when workforce density skipped bootstrap ceo@xe.vn row.
   */
  private async ensureHoldingPortalGroupCeoEmployee(userKey: string): Promise<string | null> {
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
      // Race / unique on (company_id, code|email) — re-select.
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

    // ADDITIVE CHECK — keep open/closed/on_hold (UF-HRM-12); add WF lifecycle statuses.
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

  async startRecruitmentWorkflowIfConfigured(
    ctx: RecruitmentWorkflowSpawnContext,
  ): Promise<{ workflowInstanceId?: string } | null> {
    await this.ensureSchema();
    const tenantId = (ctx.tenantId ?? MASTER_TENANT_ID).trim().toLowerCase();
    const companySlug =
      (ctx.companySlug ?? GROUP_HOLDING_COMPANY_ID).trim().toLowerCase() || GROUP_HOLDING_COMPANY_ID;
    const workflowCode = workflowCodeForBusinessType(ctx.businessType);
    const { table, statusCol } = tableForBusinessType(ctx.businessType);

    const isGroupCeoPortal =
      tenantId === MASTER_TENANT_ID &&
      (companySlug === GROUP_OPERATING_MAIN || companySlug === GROUP_HOLDING_COMPANY_ID);
    const xbosHeaderCompanyId = isGroupCeoPortal ? GROUP_HOLDING_COMPANY_ID : companySlug;
    const memberCompanyId = isGroupCeoPortal ? GROUP_HOLDING_COMPANY_ID : companySlug;
    const entityCompanyId = ((ctx.companyId ?? companySlug).trim().toLowerCase() || memberCompanyId);

    // Mark pending before spawn so SPAWN-MISSING still leaves entity waiting (BR-REC-WF-02).
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

    const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(undefined, {
      tenantId,
      companyId: xbosHeaderCompanyId,
    });

    const contextKey =
      ctx.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN
        ? 'planId'
        : ctx.businessType === WF_BUSINESS_TYPE_HRM_REQUISITION
          ? 'requisitionId'
          : 'candidateId';

    const submitterEmployeeId = await this.resolveSubmitterEmployeeId(ctx);
    if (!submitterEmployeeId) {
      this.logger.warn(
        `HRM-REC-WF-SPAWN-MISSING: submitter.employeeId unresolved businessType=${ctx.businessType} id=${ctx.businessId} userId=${ctx.submitterUserId ?? ''}`,
      );
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

  async handleStepCallback(
    payload: RecruitmentStepCallbackPayload,
  ): Promise<{ applied: boolean; stage?: string; status?: string; skipReason?: string }> {
    await this.ensureSchema();

    if (
      payload.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN ||
      payload.businessType === WF_BUSINESS_TYPE_HRM_REQUISITION
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=plan_req_step_noop businessType=${payload.businessType} id=${payload.businessId}`,
      );
      return { applied: false, skipReason: 'plan_req_step_noop' };
    }

    // Prefer taskType; fall back to stepKey (XBOS may send bare step_key only).
    const mappedStage =
      mapRecTaskTypeToStage(payload.taskType) ?? mapRecTaskTypeToStage(payload.stepKey);
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
      return { applied: false, stage: row.stage, skipReason: 'instance_mismatch' };
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
  ): Promise<{ applied: boolean; status?: string; stage?: string; skipReason?: string }> {
    await this.ensureSchema();

    if (payload.businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN) {
      return this.handlePlanTerminal(payload);
    }
    if (payload.businessType === WF_BUSINESS_TYPE_HRM_REQUISITION) {
      return this.handleRequisitionTerminal(payload);
    }
    return this.handleCandidateTerminal(payload);
  }

  private async handlePlanTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{ applied: boolean; status?: string; skipReason?: string }> {
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
      return { applied: false, status: row.status, skipReason: 'already_terminal' };
    }

    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(`HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch plan=${payload.businessId}`);
      return { applied: false, status: row.status, skipReason: 'instance_mismatch' };
    }

    const nextStatus = payload.terminalStatus === 'completed' ? 'approved' : 'rejected';
    const res = await this.db.query<{ status: string }>(
      `UPDATE public.recruitment_plans
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`,
      [payload.businessId, nextStatus, payload.rejectedReason ?? 'Workflow rejected'],
    );
    return { applied: true, status: res.rows[0]?.status ?? nextStatus };
  }

  private async handleRequisitionTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{ applied: boolean; status?: string; skipReason?: string }> {
    const existing = await this.db.query<{
      status: string;
      workflow_instance_id: string | null;
    }>(
      `SELECT status, workflow_instance_id::text AS workflow_instance_id
       FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1`,
      [payload.businessId],
    );
    const row = existing.rows[0];
    if (!row) throw new Error('HRM-REC-404');

    const current = (row.status ?? '').toLowerCase();
    // Terminal for WF unlock: open/approved/rejected/closed/cancelled (data contract §4.1).
    if (['open', 'approved', 'rejected', 'closed', 'cancelled'].includes(current)) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=already_terminal requisition=${payload.businessId} status=${row.status}`,
      );
      return { applied: false, status: row.status, skipReason: 'already_terminal' };
    }

    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch requisition=${payload.businessId}`,
      );
      return { applied: false, status: row.status, skipReason: 'instance_mismatch' };
    }

    // Prefer single write `open` on completed (data contract §3.2).
    const nextStatus = payload.terminalStatus === 'completed' ? 'open' : 'rejected';
    const res = await this.db.query<{ status: string }>(
      `UPDATE public.job_requisitions
       SET status = $2,
           rejected_reason = CASE WHEN $2 = 'rejected' THEN $3 ELSE rejected_reason END,
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING status`,
      [payload.businessId, nextStatus, payload.rejectedReason ?? 'Workflow rejected'],
    );
    return { applied: true, status: res.rows[0]?.status ?? nextStatus };
  }

  private async handleCandidateTerminal(
    payload: RecruitmentTerminalCallbackPayload,
  ): Promise<{ applied: boolean; stage?: string; skipReason?: string }> {
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
      return { applied: false, stage: row.stage, skipReason: 'already_terminal' };
    }

    if (
      row.workflow_instance_id &&
      payload.workflowInstanceId &&
      row.workflow_instance_id !== payload.workflowInstanceId
    ) {
      this.logger.log(
        `HRM-REC-WF-CALLBACK-SKIP reason=instance_mismatch candidate=${payload.businessId}`,
      );
      return { applied: false, stage: row.stage, skipReason: 'instance_mismatch' };
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

    // completed → hired only if hire AC met (employee_id or employees.candidate_id link).
    // FR-HRM-INT-01 / G-DB-01 — stamp soft employee_id when reverse link satisfies AC.
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
      linkedEmployeeId ? [payload.businessId, linkedEmployeeId] : [payload.businessId],
    );
    return { applied: true, stage: res.rows[0]?.stage ?? 'hired' };
  }

  private async resolveHireEmployeeIdForStamp(
    candidateId: string,
    employeeId: string | null,
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

  private async isHireAcMet(candidateId: string, employeeId: string | null): Promise<boolean> {
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
      // employees.candidate_id may not exist yet — treat as unmet (fail-closed hire).
      return false;
    }
  }

  assertNotLockedOrThrow(
    workflowInstanceId: string | null | undefined,
    statusOrStage: string | null | undefined,
    entity: 'plan' | 'requisition' | 'candidate',
  ): void {
    if (isRecruitmentWorkflowLocked(workflowInstanceId, statusOrStage, entity)) {
      throw new Error('HRM-REC-WF-LOCKED');
    }
  }
}
