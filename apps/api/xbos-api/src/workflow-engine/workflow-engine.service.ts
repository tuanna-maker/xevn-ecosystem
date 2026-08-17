import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { signServiceJwt } from '../common/jwt-sign';
import { resolveHrmApiBaseUrl } from '../common/resolve-hrm-api-base-url';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { isDynamicResolverEnabled, XbosResolverDataSource } from './resolver-data-source';
import {
  ResolverRegistry,
  extractWorkflowGraphSteps,
  sortWorkflowSteps,
  toInboxStepPayload,
} from './resolver-registry';
import type { ResolverRuntimeContext } from './resolver-registry.types';
import {
  definitionAppliesToSpawnScope,
  isHrmLeaveWorkflowCode,
  isHrmRecruitmentWorkflowCode,
  isLegalEntityUuid,
  parseApplyingEntityIdFromGraph,
  pickActiveDefinitionForCompanyPartition,
  type ApplyingEntityPartition,
  type CompanyPartitionPickInput,
  type WorkflowDefinitionPartitionCandidate,
} from './workflow-apply-scope';
import {
  GROUP_APPROVER_USER,
  MASTER_COMPANY_HOLDING,
  MASTER_TENANT_XEVN,
  WF_BUSINESS_TYPE_DEFINITION_REVIEW,
  WF_BUSINESS_TYPE_HRM_CANDIDATE,
  WF_BUSINESS_TYPE_HRM_LEAVE,
  WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
  WF_HRM_CANDIDATE_PIPELINE_CODE,
  WF_HRM_LEAVE_APPROVAL_CODE,
  WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE,
  WF_HRM_REQUISITION_APPROVAL_CODE,
  buildHrmCandidatePipelineDefinition,
  buildHrmLeaveApprovalWorkflowDefinition,
  buildHrmRecruitmentPlanApprovalDefinition,
  buildHrmRequisitionApprovalDefinition,
} from './workflow-catalog.constants';
import {
  enrichWorkflowInboxTaskRow,
  ensureGroupApproverAmongInboxSteps,
  readSubjectTitleFromContext,
} from './workflow-inbox-display';

/**
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-01
 * ADD notifyHrmRecruitmentCallback (step+terminal). Leave notifyHrmLeaveTerminal URL/body untouched.
 * Cite: ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3 Q2 · must_keep LeaveWorkflowBridge.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-TERMINAL-01
 * completeStepTask: after parallel_any, also first-wins skip siblings with same
 * step_key+hat_key when parallel metadata missing (legacy fan-out) so Group CEO
 * approve terminals instance → HRM recruitment callback (AC-REC-WF-03 / J-03).
 * Reject path already skips all pending (J-06 must_keep). Leave terminal untouched.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-COMPLETE-INSTANCE-01
 * completeStepTask: remap notify payload id → instance_id (mirror rejectStepTask)
 * so HRM recruitment/leave terminal gets workflow instance UUID, not step-task id
 * (fixes CANVAS-04 instance_mismatch / J-03). Step callback remapped too; taskId
 * extras still the step-task UUID. Reject/leave URL/body contract must_keep.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21 BM-BE-REC-WF-SPAWN-MEMBER-01
 * FIX G-BM-REC-02 / J-REC-WF-02: after canvas applyingEntityId=member (VISUN),
 * Group CEO holding/main start still spawns. Semantics: group-wide OR Group CEO
 * holding OR matching member partition. Ensure active hrm_* defs (parity leave).
 * Resolver fail on recruitment → soft GROUP_APPROVER_USER inbox (no SPAWN-MISSING
 * when def active). must_keep Leave/Catalog bridges · UF-HRM-12 · U65.
 *
 * @CODE-MEMORY-CHANGE 2026-07-23 D-HRM-REC-WF-OPTION-B-BE-01
 * ADD Option B def resolve: findActiveDefinitionByCode(+partition) picks member
 * override by company_id|applyingEntity before group-wide fallback
 * (ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723 §3). startInstanceFromWorkflowCode
 * passes spawn/context company keys. must_keep J-REC-WF spawn · G-BM-REC-02 ·
 * leave ensure path (no partition = highest version). Soft GROUP_APPROVER = R2 gap
 * (not closed here). No Option C clone · no Bay.vn UI claim.
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-REC-WF-OPTION-B-SPAWN-FIX-01
 * UPGRADE upsertDefinition INSERT to persist `version` (body or MAX+1) so Option B
 * dual active rows (group + VISUN) do not false-fail UNIQUE
 * (tenant_id,workflow_code,version) when FE sends version≥2. Recruitment start
 * also looks up MASTER_TENANT_XEVN when spawn tenant is member. must_keep Option B
 * partition pick · J-REC-WF-02/03. change_mode: UPGRADE
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-BE-INBOX-01
 * FIX J-REC-WF-03 / HP-03: listStepTasks enrich subject_title → workflow_name so
 * CC Inbox shows YCTD stamp (holding spawn visible under main CEO assignee list).
 * Recruitment spawn ensures GROUP_APPROVER_USER among inbox steps when role_code
 * fan-out omits ceo@xe.vn. Soft backfill subjectTitle from HRM for legacy rows.
 * must_keep: Leave/AUTH/EMP/CAT · U65 no seed · assignee filter
 * change_mode: ADD
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-BE-WF-SELF-FD-01
 * FIX BR-WF-04 on completeStepTask: reject when actor userId equals instance
 * context.submitter.userId (case-insensitive) with XBOS-WF-422 — resolver
 * skip-self alone is insufficient for UI/API self-approve FD.
 * must_keep: Leave ladder · inbox approve XBOS-WF-200 non-self · DEPT VAL-014 ·
 * clone paths · AUTH-003 · rejectStepTask · U65 no seed
 * change_mode: FIX · UC-CC-P0-06 / UC-XBOS-CC-06
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-BE-WF-SELF-FD-02
 * FIX live JOIN skew: completeStepTask SELECT uses i.context AS instance_context
 * (not bare i.context after t.*) so node-pg row exposes instance submitter for
 * BR-WF-04. Prefer instance_context then fallback context. Nest must load rebuilt
 * dist (restart watch if stale). must_keep: non-self 201 · AUTH-003 · Leave L2
 * SPEC_GAP · U65 no seed · resolver skip-self
 * change_mode: FIX · UC-CC-P0-06 / UC-XBOS-CC-06
 */

type WorkflowGraphStepRow = Record<string, unknown>;

function normalizeJsonbPayload(value: unknown): string {
  if (value === undefined || value === null) {
    return '{}';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return '{}';
    }
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      return '{}';
    }
  }
  return JSON.stringify(value);
}

function parseGraphObject(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
    return {};
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

/** Instance context from task JOIN — prefer aliased column to avoid t.* / i.context name collisions. */
function parseInstanceContextFromTaskRow(task: Record<string, unknown>): Record<string, unknown> {
  const primary = parseGraphObject(task.instance_context);
  if (Object.keys(primary).length > 0) return primary;
  return parseGraphObject(task.context);
}

function resolveHandlerInboxTarget(handlerRoleId: string): { hatKey: string; assigneeUserId: string } {
  const role = handlerRoleId.trim().toLowerCase();
  if (role === 'bod' || role === 'group_ceo' || role === 'raci_ceo') {
    return { hatKey: 'group_ceo', assigneeUserId: GROUP_APPROVER_USER };
  }
  if (role.startsWith('raci_')) {
    return { hatKey: role, assigneeUserId: GROUP_APPROVER_USER };
  }
  return { hatKey: role || 'default', assigneeUserId: GROUP_APPROVER_USER };
}

function normalizePersistCompanyId(companyId: string | null): string {
  const c = (companyId ?? MASTER_COMPANY_HOLDING).trim().toLowerCase();
  return c === 'main' ? MASTER_COMPANY_HOLDING : c;
}

function internalApiKey(): string {
  return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
}

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);
  private readonly resolverRegistry: ResolverRegistry;

  constructor(private readonly db: XbosDbService) {
    this.resolverRegistry = new ResolverRegistry(new XbosResolverDataSource(db));
  }

  async listDefinitions(tenantId: string, companyId?: string) {
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND status <> 'deleted'
         AND ($2::text IS NULL OR company_id IS NULL OR company_id = $2)
       ORDER BY workflow_code, version DESC`,
      [tenantId, companyId ?? null],
    );
    return rows;
  }

  async upsertDefinition(tenantId: string, companyId: string | null, definitionId: string | null, body: Record<string, unknown>) {
    const code = String(
      body.workflowCode ?? body.workflow_code ?? body.code ?? body.definitionKey ?? '',
    ).trim();
    const name = String(body.name ?? '').trim();
    const nested = (body.payload as Record<string, unknown> | undefined) ?? undefined;
    const graphPayload = body.graph ?? nested?.graph ?? body.steps ?? nested?.steps ?? {};
    const conditionsPayload = body.conditions ?? nested?.conditions ?? {};
    const graphJson = normalizeJsonbPayload(graphPayload);
    const conditionsJson = normalizeJsonbPayload(conditionsPayload);
    const category = String(body.category ?? 'general');
    const scopeLevel = String(body.scopeLevel ?? body.scope_level ?? 'group');
    const status = body.status != null ? String(body.status) : null;

    if (definitionId) {
      if (!name) {
        throw new ApiException('XBOS-WF-400', 'name is required', HttpStatus.BAD_REQUEST);
      }
      const { rows } = await this.db.query(
        `UPDATE public.xbos_workflow_definition SET
          name = $3, category = $4, scope_level = $5, graph = $6::jsonb, conditions = $7::jsonb,
          status = COALESCE($8, status), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 RETURNING *`,
        [definitionId, tenantId, name, category, scopeLevel, graphJson, conditionsJson, status],
      );
      if (!rows[0]) throw new ApiException('XBOS-WF-404', 'Definition not found', HttpStatus.NOT_FOUND);
      return rows[0];
    }

    if (!code || !name) {
      throw new ApiException('XBOS-WF-400', 'workflowCode and name required', HttpStatus.BAD_REQUEST);
    }

    // Option B dual partition: UNIQUE(tenant_id, workflow_code, version) — persist explicit
    // version from FE or allocate MAX+1 (INSERT previously omitted version → always DEFAULT 1).
    const version = await this.resolveDefinitionInsertVersion(tenantId, code, body.version);

    try {
      const { rows } = await this.db.query(
        `INSERT INTO public.xbos_workflow_definition (
          tenant_id, workflow_code, name, category, scope_level, company_id, version, graph, conditions, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10) RETURNING *`,
        [
          tenantId,
          code,
          name,
          category,
          scopeLevel,
          companyId,
          version,
          graphJson,
          conditionsJson,
          status ?? 'draft',
        ],
      );
      await this.maybeSpawnDefinitionInboxTask(tenantId, companyId, rows[0], body);
      return rows[0];
    } catch (err) {
      const pgCode =
        err && typeof err === 'object' && 'code' in err ? String((err as { code?: unknown }).code) : '';
      if (pgCode === '23505') {
        throw new ApiException(
          'XBOS-WF-409',
          `Workflow definition version conflict for ${code} v${version} — use a new version for another company partition`,
          HttpStatus.CONFLICT,
          { workflowCode: code, version },
        );
      }
      throw err;
    }
  }

  /**
   * Allocate definition version for INSERT.
   * Prefer body.version when ≥1; else MAX(version)+1 for (tenant, code).
   */
  private async resolveDefinitionInsertVersion(
    tenantId: string,
    workflowCode: string,
    requested: unknown,
  ): Promise<number> {
    const raw =
      typeof requested === 'number'
        ? requested
        : typeof requested === 'string'
          ? Number(requested.trim())
          : NaN;
    if (Number.isFinite(raw) && raw >= 1) {
      return Math.floor(raw);
    }
    const { rows } = await this.db.query<{ max_v: number | null }>(
      `SELECT MAX(version)::int AS max_v
       FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND workflow_code = $2`,
      [tenantId, workflowCode],
    );
    return (rows[0]?.max_v ?? 0) + 1;
  }

  async ensureHrmLeaveApprovalWorkflow() {
    const body = buildHrmLeaveApprovalWorkflowDefinition();
    const existing = await this.findActiveDefinitionByCode(MASTER_TENANT_XEVN, body.workflowCode);
    if (existing) {
      return existing;
    }
    return this.upsertDefinition(MASTER_TENANT_XEVN, MASTER_COMPANY_HOLDING, null, body);
  }

  /**
   * BM-BE-REC-WF-SPAWN-MEMBER-01 — parity leave ensure for recruitment codes so
   * SPAWN-MISSING is not caused by missing active definition after canvas apply.
   */
  async ensureHrmRecruitmentWorkflowByCode(workflowCode: string) {
    const code = workflowCode.trim();
    const existing = await this.findActiveDefinitionByCode(MASTER_TENANT_XEVN, code);
    if (existing) return existing;

    let body: Record<string, unknown> | null = null;
    if (code === WF_HRM_REQUISITION_APPROVAL_CODE) {
      body = buildHrmRequisitionApprovalDefinition();
    } else if (code === WF_HRM_RECRUITMENT_PLAN_APPROVAL_CODE) {
      body = buildHrmRecruitmentPlanApprovalDefinition();
    } else if (code === WF_HRM_CANDIDATE_PIPELINE_CODE) {
      body = buildHrmCandidatePipelineDefinition();
    }
    if (!body) return null;
    return this.upsertDefinition(MASTER_TENANT_XEVN, MASTER_COMPANY_HOLDING, null, body);
  }

  private async resolveApplyingEntityPartition(
    applyingEntityId: string,
  ): Promise<ApplyingEntityPartition | null> {
    const id = applyingEntityId.trim();
    if (!isLegalEntityUuid(id)) return null;
    try {
      const { rows } = await this.db.query<{ tenant_id: string; company_id: string }>(
        `SELECT tenant_id, company_id FROM public.xbos_legal_entity
         WHERE id = $1::uuid AND status IS DISTINCT FROM 'deleted'
         LIMIT 1`,
        [id],
      );
      const row = rows[0];
      if (!row) return null;
      return { tenantId: String(row.tenant_id), companyId: String(row.company_id) };
    } catch {
      return null;
    }
  }

  private recruitmentFallbackInboxSteps(
    graphSteps: WorkflowGraphStepRow[],
  ): Array<Record<string, unknown>> {
    const sorted = sortWorkflowSteps(graphSteps);
    const first = sorted[0];
    const stepKey = String(
      first?.stepKey ?? first?.step_key ?? first?.id ?? 'requisition_approval',
    );
    return [
      {
        stepKey,
        hatKey: 'group_ceo',
        assigneeUserId: GROUP_APPROVER_USER,
        dueAt: null,
        resolvedVia: 'fixed_user',
        escalated: true,
        escalationReason: 'recruitment_spawn_resolver_fallback',
      },
    ];
  }

  private leaveFallbackInboxSteps(
    graphSteps: WorkflowGraphStepRow[],
  ): Array<Record<string, unknown>> {
    const sorted = sortWorkflowSteps(graphSteps);
    const first = sorted[0];
    const stepKey = String(first?.stepKey ?? first?.step_key ?? first?.id ?? 'manager_approval');
    return [
      {
        stepKey,
        hatKey: 'group_ceo',
        assigneeUserId: GROUP_APPROVER_USER,
        dueAt: null,
        resolvedVia: 'fixed_user',
        escalated: true,
        escalationReason: 'leave_spawn_resolver_fallback',
      },
    ];
  }

  private spawnResolverFallbackSteps(
    workflowCode: string,
    graphSteps: WorkflowGraphStepRow[],
  ): Array<Record<string, unknown>> {
    if (isHrmLeaveWorkflowCode(workflowCode)) {
      return this.leaveFallbackInboxSteps(graphSteps);
    }
    if (isHrmRecruitmentWorkflowCode(workflowCode)) {
      return this.recruitmentFallbackInboxSteps(graphSteps);
    }
    return [];
  }

  private definitionStatusIsActive(
    saved: Record<string, unknown>,
    body: Record<string, unknown>,
  ): boolean {
    const fromBody = body.status != null ? String(body.status).trim().toLowerCase() : '';
    const fromSaved = saved.status != null ? String(saved.status).trim().toLowerCase() : '';
    return fromBody === 'active' || fromSaved === 'active';
  }

  private async hasPendingTaskForDefinition(definitionId: string): Promise<boolean> {
    const { rows } = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM public.xbos_workflow_step_task t
         JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
         WHERE i.definition_id = $1::uuid
           AND t.status = 'pending'
       ) AS exists`,
      [definitionId],
    );
    return Boolean(rows[0]?.exists);
  }

  private async buildDefinitionInboxSteps(graphSteps: WorkflowGraphStepRow[]): Promise<Array<Record<string, unknown>>> {
    const sorted = sortWorkflowSteps(graphSteps);
    const inboxSteps: Array<Record<string, unknown>> = [];
    for (const step of sorted) {
      const handlerRoleId = String(
        step.handlerRoleId ?? step.handler_role_id ?? step.hatKey ?? step.hat_key ?? 'default',
      );
      const target = resolveHandlerInboxTarget(handlerRoleId);
      inboxSteps.push({
        stepKey: String(step.id ?? step.stepKey ?? step.step_key ?? `step-${inboxSteps.length + 1}`),
        hatKey: target.hatKey,
        assigneeUserId: String(step.assigneeUserId ?? step.assignee_user_id ?? target.assigneeUserId),
        dueAt: step.dueAt ?? step.due_at ?? null,
      });
    }
    if (inboxSteps.length === 0) {
      inboxSteps.push({
        stepKey: 'definition_review',
        hatKey: 'group_ceo',
        assigneeUserId: GROUP_APPROVER_USER,
      });
    }
    return inboxSteps;
  }

  private async resolveStepsForGraph(
    graphSteps: WorkflowGraphStepRow[],
    ctx: ResolverRuntimeContext,
    activeOrder?: number,
  ): Promise<Array<Record<string, unknown>>> {
    const sorted = sortWorkflowSteps(graphSteps);
    const targetOrder = activeOrder ?? Number(sorted[0]?.order ?? sorted[0]?.step_order ?? 1);
    const activeSteps = sorted.filter(
      (s) => Number(s.order ?? s.step_order ?? targetOrder) === targetOrder,
    );
    const inboxSteps: Array<Record<string, unknown>> = [];

    if (!isDynamicResolverEnabled()) {
      return this.buildDefinitionInboxSteps(activeSteps.length > 0 ? activeSteps : sorted);
    }

    for (const step of activeSteps.length > 0 ? activeSteps : sorted.slice(0, 1)) {
      const stepKey = String(step.stepKey ?? step.step_key ?? `step-${inboxSteps.length + 1}`);
      const assignees = await this.resolverRegistry.resolveStepTasks(step, { ...ctx, stepKey });
      for (const assignee of assignees) {
        inboxSteps.push(toInboxStepPayload(step, assignee));
      }
    }
    return inboxSteps;
  }

  /** UF-XBOS-08 / U64 — canvas save spawns CC inbox task without seed script. */
  async maybeSpawnDefinitionInboxTask(
    tenantId: string,
    companyId: string | null,
    saved: Record<string, unknown>,
    body: Record<string, unknown>,
  ): Promise<{ instanceId?: string; spawned: boolean }> {
    if (!this.definitionStatusIsActive(saved, body)) {
      return { spawned: false };
    }
    const definitionId = String(saved.id ?? '');
    if (!definitionId) return { spawned: false };
    if (await this.hasPendingTaskForDefinition(definitionId)) {
      return { spawned: false };
    }

    const graphRaw = saved.graph ?? body.graph ?? body.steps ?? body.payload;
    const graphSteps = extractWorkflowGraphSteps(graphRaw);
    const steps = await this.buildDefinitionInboxSteps(graphSteps);
    const workflowCode = String(saved.workflow_code ?? body.workflowCode ?? body.code ?? '');
    const workflowName = String(saved.name ?? body.name ?? workflowCode);

    const instance = await this.startInstance(tenantId, normalizePersistCompanyId(companyId), {
      definitionId,
      businessType: WF_BUSINESS_TYPE_DEFINITION_REVIEW,
      businessId: definitionId,
      context: {
        source: 'workflow_definition_save',
        workflowCode,
        workflowName,
        spawnedAt: new Date().toISOString(),
      },
      steps,
    });
    return { instanceId: String((instance as { id: string }).id), spawned: true };
  }

  async startInstanceFromWorkflowCode(
    tenantId: string,
    companyId: string,
    body: Record<string, unknown>,
  ) {
    const workflowCode = String(body.workflowCode ?? body.workflow_code ?? '').trim();
    const businessType = String(body.businessType ?? body.business_type ?? '').trim();
    const businessId = String(body.businessId ?? body.business_id ?? '').trim();
    const submitter = (body.submitter ?? {}) as Record<string, unknown>;
    const submitterUserId = String(submitter.userId ?? submitter.user_id ?? '').trim();
    const submitterEmployeeId = String(submitter.employeeId ?? submitter.employee_id ?? '').trim();
    const submitterCompanyId = String(submitter.companyId ?? submitter.company_id ?? '').trim();
    const bodyContext = (body.context as Record<string, unknown> | undefined) ?? {};
    const contextMemberCompanyId = String(
      bodyContext.memberCompanyId ?? bodyContext.member_company_id ?? '',
    ).trim();
    const contextMemberTenantId = String(
      bodyContext.memberTenantId ?? bodyContext.member_tenant_id ?? '',
    ).trim();
    const contextEntityCompanyId = String(
      bodyContext.entityCompanyId ?? bodyContext.entity_company_id ?? '',
    ).trim();

    if (!workflowCode || !businessType || !businessId || !submitterEmployeeId) {
      throw new ApiException(
        'XBOS-WF-400',
        'workflowCode, businessType, businessId, submitter.employeeId required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const persistCompanyId = normalizePersistCompanyId(companyId);
    const partition: CompanyPartitionPickInput = {
      spawnCompanyId: contextEntityCompanyId || persistCompanyId,
      spawnTenantId: tenantId,
      contextMemberCompanyId: contextMemberCompanyId || undefined,
      contextMemberTenantId: contextMemberTenantId || undefined,
    };

    // Option B: prefer member override matching spawn company; else group-wide.
    // Recruitment defs SoT under master tenant — member JWT tenant still partitions via context.
    let definition = await this.findActiveDefinitionByCode(tenantId, workflowCode, partition);
    if (
      !definition &&
      isHrmRecruitmentWorkflowCode(workflowCode) &&
      tenantId.trim().toLowerCase() !== MASTER_TENANT_XEVN
    ) {
      definition = await this.findActiveDefinitionByCode(MASTER_TENANT_XEVN, workflowCode, partition);
    }
    if (!definition && workflowCode === WF_HRM_LEAVE_APPROVAL_CODE) {
      definition = await this.ensureHrmLeaveApprovalWorkflow();
    }
    if (!definition && isHrmRecruitmentWorkflowCode(workflowCode)) {
      // nest build: ensure* may return null when code is unknown — do not widen definition to null
      const ensured = await this.ensureHrmRecruitmentWorkflowByCode(workflowCode);
      if (ensured) {
        definition = ensured;
      }
    }
    if (!definition) {
      throw new ApiException('XBOS-WF-404', 'Active workflow definition not found', HttpStatus.NOT_FOUND);
    }

    const def = definition as { id: string; graph?: unknown };
    const applyingEntityId = parseApplyingEntityIdFromGraph(def.graph);
    const resolvedPartition = applyingEntityId
      ? await this.resolveApplyingEntityPartition(applyingEntityId)
      : null;

    if (
      !definitionAppliesToSpawnScope({
        spawnCompanyId: persistCompanyId,
        spawnTenantId: tenantId,
        contextMemberCompanyId,
        contextMemberTenantId,
        applyingEntityId,
        resolvedPartition,
      })
    ) {
      throw new ApiException(
        'XBOS-WF-409',
        'Workflow definition applyingEntity does not match spawn company scope',
        HttpStatus.CONFLICT,
      );
    }

    const graphSteps = extractWorkflowGraphSteps(def.graph);
    const ctx: ResolverRuntimeContext = {
      tenantId,
      companyId: persistCompanyId,
      submitter: {
        userId: submitterUserId,
        employeeId: submitterEmployeeId,
        companyId: submitterCompanyId,
        companySlug: typeof submitter.companySlug === 'string' ? submitter.companySlug : undefined,
      },
      businessType,
      businessId,
      stepKey: String(graphSteps[0]?.stepKey ?? graphSteps[0]?.step_key ?? 'step-1'),
    };

    let steps: Array<Record<string, unknown>>;
    const hasSpawnFallback = isHrmRecruitmentWorkflowCode(workflowCode) || isHrmLeaveWorkflowCode(workflowCode);
    try {
      steps = await this.resolveStepsForGraph(graphSteps, ctx);
      if (steps.length === 0 && hasSpawnFallback) {
        this.logger.warn(
          `XBOS-WF-SPAWN-RESOLVER-FALLBACK code=${workflowCode} reason=empty_steps applyingEntityId=${applyingEntityId || '(group)'}`,
        );
        steps = this.spawnResolverFallbackSteps(workflowCode, graphSteps);
      }
    } catch (err) {
      if (!hasSpawnFallback) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `XBOS-WF-SPAWN-RESOLVER-FALLBACK code=${workflowCode} reason=${msg} applyingEntityId=${applyingEntityId || '(group)'}`,
      );
      steps = this.spawnResolverFallbackSteps(workflowCode, graphSteps);
    }

    // J-REC-WF-03 — role_code group_ceo may return admin@ only; keep portal CEO inbox.
    if (isHrmRecruitmentWorkflowCode(workflowCode)) {
      steps = ensureGroupApproverAmongInboxSteps(steps, GROUP_APPROVER_USER);
    }

    const firstOrder = Number(sortWorkflowSteps(graphSteps)[0]?.order ?? 1);
    const subjectTitle = readSubjectTitleFromContext(bodyContext);

    return this.startInstance(tenantId, persistCompanyId, {
      definitionId: def.id,
      businessType,
      businessId,
      context: {
        ...bodyContext,
        submitter,
        workflowCode,
        currentStepOrder: firstOrder,
        applyingEntityId: applyingEntityId || null,
        applyingEntityPartition: resolvedPartition,
        ...(subjectTitle
          ? { subjectTitle, businessTitle: subjectTitle }
          : {}),
      },
      steps,
    });
  }

  async startInstance(tenantId: string, companyId: string, body: Record<string, unknown>) {
    const definitionId = String(body.definitionId ?? '');
    const businessType = String(body.businessType ?? '');
    const businessId = String(body.businessId ?? '');
    if (!definitionId || !businessType || !businessId) {
      throw new ApiException('XBOS-WF-400', 'definitionId, businessType, businessId required', HttpStatus.BAD_REQUEST);
    }
    const { rows: instRows } = await this.db.query(
      `INSERT INTO public.xbos_workflow_instance (tenant_id, company_id, definition_id, business_type, business_id, context)
       VALUES ($1,$2,$3::uuid,$4,$5,$6::jsonb) RETURNING *`,
      [tenantId, companyId, definitionId, businessType, businessId, JSON.stringify(body.context ?? {})],
    );
    const instance = instRows[0] as { id: string };
    const steps = (body.steps as Array<Record<string, unknown>>) ?? [];
    for (const step of steps) {
      await this.db.query(
        `INSERT INTO public.xbos_workflow_step_task (instance_id, step_key, hat_key, assignee_user_id, assignment_id, due_at, payload)
         VALUES ($1::uuid,$2,$3,$4,$5::uuid,$6::timestamptz,$7::jsonb)`,
        [
          instance.id,
          step.stepKey ?? step.id,
          step.hatKey ?? step.handlerRoleId ?? 'default',
          step.assigneeUserId ?? null,
          step.assignmentId ?? null,
          step.dueAt ?? null,
          JSON.stringify(step),
        ],
      );
    }
    return instRows[0];
  }

  async listStepTasks(filters: {
    assigneeUserId?: string;
    tenantId?: string;
    status?: string;
    businessType?: string;
  }) {
    const clauses = ['1=1'];
    const params: unknown[] = [];
    let idx = 1;
    if (filters.status) {
      clauses.push(`t.status = $${idx++}`);
      params.push(filters.status);
    } else {
      clauses.push(`t.status = 'pending'`);
    }
    if (filters.assigneeUserId) {
      clauses.push(`t.assignee_user_id = $${idx++}`);
      params.push(filters.assigneeUserId);
    }
    if (filters.tenantId) {
      clauses.push(`i.tenant_id = $${idx++}`);
      params.push(filters.tenantId);
    }
    if (filters.businessType) {
      clauses.push(`i.business_type = $${idx++}`);
      params.push(filters.businessType);
    }
    const { rows } = await this.db.query(
      `
      SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.status AS instance_status,
             i.context, i.definition_id, d.workflow_code, d.name AS workflow_name
      FROM public.xbos_workflow_step_task t
      JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
      JOIN public.xbos_workflow_definition d ON d.id = i.definition_id
      WHERE ${clauses.join(' AND ')}
      ORDER BY t.created_at DESC
      LIMIT 200
    `,
      params,
    );
    const withSubjects = await this.backfillMissingRecruitmentSubjectTitles(
      rows as Array<Record<string, unknown>>,
    );
    return withSubjects.map((row) => enrichWorkflowInboxTaskRow(row));
  }

  /**
   * Legacy FE-spawned requisitions may lack context.subjectTitle — soft-fetch HRM
   * titles once and persist so Inbox this-wave stamp matches without seed.
   */
  private async backfillMissingRecruitmentSubjectTitles(
    rows: Array<Record<string, unknown>>,
  ): Promise<Array<Record<string, unknown>>> {
    const needIds = new Map<string, { companyId: string; instanceId: string }>();
    for (const row of rows) {
      const businessType = String(row.business_type ?? '').trim().toLowerCase();
      if (businessType !== WF_BUSINESS_TYPE_HRM_REQUISITION) continue;
      if (readSubjectTitleFromContext(row.context)) continue;
      const businessId = String(row.business_id ?? '').trim();
      const instanceId = String(row.instance_id ?? '').trim();
      if (!businessId || !instanceId) continue;
      if (!needIds.has(businessId)) {
        needIds.set(businessId, {
          companyId: String(row.company_id ?? MASTER_COMPANY_HOLDING).trim() || MASTER_COMPANY_HOLDING,
          instanceId,
        });
      }
    }
    if (needIds.size === 0) return rows;

    const titleById = new Map<string, string>();
    await Promise.all(
      [...needIds.entries()].slice(0, 20).map(async ([businessId, meta]) => {
        const title = await this.fetchHrmRequisitionSubjectTitle(businessId, meta.companyId);
        if (title) titleById.set(businessId, title);
      }),
    );
    if (titleById.size === 0) return rows;

    for (const [businessId, title] of titleById) {
      const meta = needIds.get(businessId);
      if (!meta) continue;
      try {
        await this.db.query(
          `UPDATE public.xbos_workflow_instance
           SET context = coalesce(context, '{}'::jsonb) || $2::jsonb,
               updated_at = NOW()
           WHERE id = $1::uuid
             AND (
               context->>'subjectTitle' IS NULL
               OR btrim(coalesce(context->>'subjectTitle', '')) = ''
             )`,
          [
            meta.instanceId,
            JSON.stringify({ subjectTitle: title, businessTitle: title }),
          ],
        );
      } catch (err) {
        this.logger.warn(
          `XBOS-WF-INBOX-SUBJECT-BACKFILL-SOFT instance=${meta.instanceId} ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return rows.map((row) => {
      const businessId = String(row.business_id ?? '').trim();
      const title = titleById.get(businessId);
      if (!title || readSubjectTitleFromContext(row.context)) return row;
      const context =
        row.context && typeof row.context === 'object' && !Array.isArray(row.context)
          ? { ...(row.context as Record<string, unknown>), subjectTitle: title, businessTitle: title }
          : { subjectTitle: title, businessTitle: title };
      return { ...row, context };
    });
  }

  private async fetchHrmRequisitionSubjectTitle(
    requisitionId: string,
    companyId: string,
  ): Promise<string | null> {
    const scopeCompany = normalizePersistCompanyId(companyId);
    try {
      const res = await fetch(
        `${resolveHrmApiBaseUrl()}/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}?company_id=${encodeURIComponent(scopeCompany)}`,
        {
          method: 'GET',
          headers: {
            'x-internal-api-key': internalApiKey(),
            'x-company-id': scopeCompany,
            'x-tenant-id': MASTER_TENANT_XEVN,
            'content-type': 'application/json',
          },
        },
      );
      if (!res.ok) {
        // Group CEO main↔holding parity — retry alternate slug once
        const alt = scopeCompany === MASTER_COMPANY_HOLDING ? 'main' : MASTER_COMPANY_HOLDING;
        const retry = await fetch(
          `${resolveHrmApiBaseUrl()}/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}?company_id=${encodeURIComponent(alt)}`,
          {
            method: 'GET',
            headers: {
              'x-internal-api-key': internalApiKey(),
              'x-company-id': alt,
              'x-tenant-id': MASTER_TENANT_XEVN,
              'content-type': 'application/json',
            },
          },
        );
        if (!retry.ok) return null;
        const retryJson = (await retry.json()) as { data?: { title?: string } };
        const t = retryJson.data?.title?.trim();
        return t || null;
      }
      const json = (await res.json()) as { data?: { title?: string } };
      const title = json.data?.title?.trim();
      return title || null;
    } catch {
      return null;
    }
  }

  async getTaskById(taskId: string) {
    const { rows } = await this.db.query(
      `SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.status AS instance_status, i.context
       FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`,
      [taskId],
    );
    if (!rows[0]) throw new ApiException('XBOS-WF-404', 'Task not found', HttpStatus.NOT_FOUND);
    return rows[0];
  }

  async getInstanceWithTasks(instanceId: string) {
    const { rows: inst } = await this.db.query(
      `SELECT i.*, d.workflow_code, d.name AS workflow_name
       FROM public.xbos_workflow_instance i
       JOIN public.xbos_workflow_definition d ON d.id = i.definition_id
       WHERE i.id = $1::uuid`,
      [instanceId],
    );
    if (!inst[0]) throw new ApiException('XBOS-WF-404', 'Instance not found', HttpStatus.NOT_FOUND);
    const { rows: tasks } = await this.db.query(
      `SELECT * FROM public.xbos_workflow_step_task WHERE instance_id = $1::uuid ORDER BY created_at`,
      [instanceId],
    );
    return { instance: inst[0], tasks };
  }

  private async maybeAdvanceSequentialStep(instanceId: string): Promise<void> {
    const detail = await this.getInstanceWithTasks(instanceId);
    const inst = detail.instance as {
      definition_id: string;
      context?: Record<string, unknown>;
      business_type: string;
      business_id: string;
      tenant_id: string;
      company_id: string;
    };
    const pending = (detail.tasks as Array<Record<string, unknown>>).filter((t) => t.status === 'pending');
    if (pending.length > 0) return;

    const { rows: defRows } = await this.db.query(
      `SELECT graph FROM public.xbos_workflow_definition WHERE id = $1::uuid`,
      [inst.definition_id],
    );
    const graphSteps = extractWorkflowGraphSteps(defRows[0]?.graph);
    const sorted = sortWorkflowSteps(graphSteps);
    const currentOrder = Number(inst.context?.currentStepOrder ?? sorted[0]?.order ?? 1);
    const nextSteps = sorted.filter((s) => Number(s.order ?? s.step_order ?? 0) > currentOrder);
    if (nextSteps.length === 0) return;

    const nextOrder = Number(nextSteps[0].order ?? nextSteps[0].step_order ?? currentOrder + 1);
    const submitter = (inst.context?.submitter ?? {}) as Record<string, unknown>;
    const ctx: ResolverRuntimeContext = {
      tenantId: inst.tenant_id,
      companyId: inst.company_id,
      submitter: {
        userId: String(submitter.userId ?? submitter.user_id ?? ''),
        employeeId: String(submitter.employeeId ?? submitter.employee_id ?? ''),
        companyId: String(submitter.companyId ?? submitter.company_id ?? ''),
      },
      businessType: inst.business_type,
      businessId: inst.business_id,
      stepKey: String(nextSteps[0].stepKey ?? nextSteps[0].step_key ?? 'step-next'),
    };
    const inboxSteps = await this.resolveStepsForGraph(graphSteps, ctx, nextOrder);
    for (const step of inboxSteps) {
      await this.db.query(
        `INSERT INTO public.xbos_workflow_step_task (instance_id, step_key, hat_key, assignee_user_id, assignment_id, due_at, payload)
         VALUES ($1::uuid,$2,$3,$4,$5::uuid,$6::timestamptz,$7::jsonb)`,
        [
          instanceId,
          step.stepKey,
          step.hatKey,
          step.assigneeUserId,
          step.assignmentId ?? null,
          step.dueAt ?? null,
          JSON.stringify(step),
        ],
      );
    }
    await this.db.query(
      `UPDATE public.xbos_workflow_instance
       SET context = context || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid`,
      [instanceId, JSON.stringify({ currentStepOrder: nextOrder })],
    );
  }

  private async notifyHrmLeaveTerminal(
    instance: Record<string, unknown>,
    terminalStatus: 'completed' | 'rejected',
    reviewerUserId: string,
    reason?: string,
  ): Promise<void> {
    if (String(instance.business_type) !== WF_BUSINESS_TYPE_HRM_LEAVE) return;
    const context = (instance.context ?? {}) as Record<string, unknown>;
    const memberTenantId = String(context.memberTenantId ?? context.member_tenant_id ?? MASTER_TENANT_XEVN);
    const memberCompanyId = String(context.memberCompanyId ?? context.member_company_id ?? 'holding');
    let bearer: string | undefined;
    try {
      bearer = signServiceJwt({
        sub: 'xbos-be',
        svc: 'workflow-engine',
        tenantId: memberTenantId,
        companyId: memberCompanyId,
        roles: ['service'],
      });
    } catch {
      bearer = undefined;
    }
    const headers: Record<string, string> = {
      'x-internal-api-key': internalApiKey(),
      'content-type': 'application/json',
      'x-tenant-id': memberTenantId,
      'x-company-id': memberCompanyId,
    };
    if (bearer) headers.authorization = `Bearer ${bearer}`;

    try {
      const res = await fetch(`${resolveHrmApiBaseUrl()}/api/hrm/attendance/leave-workflow/terminal`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          leaveRequestId: String(instance.business_id),
          workflowInstanceId: String(instance.id ?? ''),
          terminalStatus,
          reviewerUserId,
          reviewerName: reviewerUserId,
          rejectedReason: reason ?? null,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`HRM leave terminal callback failed: ${res.status} ${text.slice(0, 200)}`);
      }
    } catch (err) {
      this.logger.warn(
        `HRM leave terminal callback error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private isRecruitmentBusinessType(businessType: string): boolean {
    return (
      businessType === WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN ||
      businessType === WF_BUSINESS_TYPE_HRM_REQUISITION ||
      businessType === WF_BUSINESS_TYPE_HRM_CANDIDATE
    );
  }

  private buildHrmServiceHeaders(instance: Record<string, unknown>): Record<string, string> {
    const context = (instance.context ?? {}) as Record<string, unknown>;
    const memberTenantId = String(context.memberTenantId ?? context.member_tenant_id ?? MASTER_TENANT_XEVN);
    const memberCompanyId = String(context.memberCompanyId ?? context.member_company_id ?? 'holding');
    let bearer: string | undefined;
    try {
      bearer = signServiceJwt({
        sub: 'xbos-be',
        svc: 'workflow-engine',
        tenantId: memberTenantId,
        companyId: memberCompanyId,
        roles: ['service'],
      });
    } catch {
      bearer = undefined;
    }
    const headers: Record<string, string> = {
      'x-internal-api-key': internalApiKey(),
      'content-type': 'application/json',
      'x-tenant-id': memberTenantId,
      'x-company-id': memberCompanyId,
    };
    if (bearer) headers.authorization = `Bearer ${bearer}`;
    return headers;
  }

  /**
   * ADDITIVE recruitment notify — does not alter leave terminal URL/contract.
   */
  private async notifyHrmRecruitmentCallback(
    instance: Record<string, unknown>,
    mode: 'step' | 'terminal',
    reviewerUserId: string,
    extras?: {
      reason?: string;
      stepKey?: string;
      taskType?: string;
      taskId?: string;
      terminalStatus?: 'completed' | 'rejected';
    },
  ): Promise<void> {
    const businessType = String(instance.business_type ?? '');
    if (!this.isRecruitmentBusinessType(businessType)) return;

    const headers = this.buildHrmServiceHeaders(instance);
    const path =
      mode === 'step'
        ? '/api/hrm/recruitment/workflow/step'
        : '/api/hrm/recruitment/workflow/terminal';
    const body =
      mode === 'step'
        ? {
            businessType,
            businessId: String(instance.business_id ?? ''),
            workflowInstanceId: String(instance.id ?? ''),
            stepKey: extras?.stepKey ?? 'step',
            taskType: extras?.taskType ?? extras?.stepKey ?? '',
            taskId: extras?.taskId,
            reviewerUserId,
            reviewerName: reviewerUserId,
          }
        : {
            businessType,
            businessId: String(instance.business_id ?? ''),
            workflowInstanceId: String(instance.id ?? ''),
            terminalStatus: extras?.terminalStatus ?? 'completed',
            reviewerUserId,
            reviewerName: reviewerUserId,
            rejectedReason: extras?.reason ?? null,
          };

    try {
      const res = await fetch(`${resolveHrmApiBaseUrl()}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`HRM recruitment ${mode} callback failed: ${res.status} ${text.slice(0, 200)}`);
      }
    } catch (err) {
      this.logger.warn(
        `HRM recruitment ${mode} callback error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async rejectStepTask(taskId: string, body: Record<string, unknown>) {
    const userId = String(body.userId ?? '');
    const reason = String(body.reason ?? body.reviewNote ?? '');
    const { rows: beforeRows } = await this.db.query(
      `SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id, i.context, i.id AS instance_id
       FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`,
      [taskId],
    );
    const before = beforeRows[0] as Record<string, unknown> | undefined;
    const { rows } = await this.db.query(
      `UPDATE public.xbos_workflow_step_task
       SET status = 'rejected', completed_at = NOW(), payload = payload || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid AND status = 'pending'
       RETURNING *`,
      [taskId, JSON.stringify({ rejectedBy: userId, reason })],
    );
    if (!rows[0]) throw new ApiException('XBOS-WF-404', 'Task not found or not pending', HttpStatus.NOT_FOUND);
    const task = rows[0] as { instance_id: string };
    await this.db.query(
      `UPDATE public.xbos_workflow_instance SET status = 'rejected', updated_at = NOW() WHERE id = $1::uuid`,
      [task.instance_id],
    );
    await this.db.query(
      `UPDATE public.xbos_workflow_step_task SET status = 'skipped', updated_at = NOW()
       WHERE instance_id = $1::uuid AND status = 'pending' AND id <> $2::uuid`,
      [task.instance_id, taskId],
    );
    if (before) {
      await this.notifyHrmLeaveTerminal(
        {
          ...before,
          id: before.instance_id,
        },
        'rejected',
        userId,
        reason,
      );
      await this.notifyHrmRecruitmentCallback(
        {
          ...before,
          id: before.instance_id,
        },
        'terminal',
        userId,
        { reason, terminalStatus: 'rejected' },
      );
    }
    return rows[0];
  }

  private async applyParallelAnyPolicy(instanceId: string, completedTaskId: string, parallelGroupId: string) {
    await this.db.query(
      `UPDATE public.xbos_workflow_step_task
       SET status = 'skipped',
           payload = payload || '{"autoSkipped":true,"skipReason":"parallel_any_first_wins"}'::jsonb,
           updated_at = NOW()
       WHERE instance_id = $1::uuid
         AND id <> $2::uuid
         AND status = 'pending'
         AND payload->>'parallelGroupId' = $3`,
      [instanceId, completedTaskId, parallelGroupId],
    );
  }

  /**
   * Safety net for role/escalation fan-out that lacked parallelGroupId
   * (pre-TERMINAL-01 spawns). Same step_key + hat_key → any-of-role first wins.
   * Skipped when explicit parallel_group policy=all (must wait for all children).
   */
  private async applySameStepHatAnyPolicy(
    instanceId: string,
    completedTaskId: string,
    stepKey: string,
    hatKey: string,
  ) {
    const sk = stepKey.trim();
    const hk = hatKey.trim().toLowerCase();
    if (!sk || !hk) return;
    await this.db.query(
      `UPDATE public.xbos_workflow_step_task
       SET status = 'skipped',
           payload = COALESCE(payload, '{}'::jsonb) || '{"autoSkipped":true,"skipReason":"same_step_hat_any_first_wins"}'::jsonb,
           updated_at = NOW()
       WHERE instance_id = $1::uuid
         AND id <> $2::uuid
         AND status = 'pending'
         AND step_key = $3
         AND lower(hat_key) = $4`,
      [instanceId, completedTaskId, sk, hk],
    );
  }

  async completeStepTask(taskId: string, body: Record<string, unknown>) {
    const userId = String(body.userId ?? body.user_id ?? '');
    const hatKey = String(body.hatKey ?? '');
    const { rows: taskRows } = await this.db.query(
      `SELECT t.*, i.tenant_id, i.company_id, i.business_type, i.business_id,
              i.context AS instance_context, i.id AS instance_id
       FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`,
      [taskId],
    );
    const task = taskRows[0] as Record<string, unknown> | undefined;
    if (!task) throw new ApiException('XBOS-WF-404', 'Task not found', HttpStatus.NOT_FOUND);

    // BR-WF-04: submitter must not complete their own instance (self-approve FD).
    const actorUserId = userId.trim().toLowerCase();
    const instanceContext = parseInstanceContextFromTaskRow(task);
    const submitter = (instanceContext.submitter ?? {}) as Record<string, unknown>;
    const submitterUserId = String(submitter.userId ?? submitter.user_id ?? '')
      .trim()
      .toLowerCase();
    if (actorUserId && submitterUserId && actorUserId === submitterUserId) {
      throw new ApiException(
        'XBOS-WF-422',
        'Self-approve forbidden: actor is instance submitter (BR-WF-04)',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const instanceId = String(task.instance_id ?? '');
    const sameUserOtherHats = await this.db.query(
      `SELECT id, hat_key, status FROM public.xbos_workflow_step_task
       WHERE instance_id = $1::uuid AND assignee_user_id = $2 AND status = 'pending' AND id <> $3::uuid`,
      [instanceId, userId, taskId],
    );
    if (sameUserOtherHats.rows.length > 0 && !hatKey) {
      throw new ApiException('XBOS-WF-422', 'Multi-hat approval: hatKey required (BR-XBOS-MULTI-HAT-01)', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const taskPayload =
      task.payload && typeof task.payload === 'object'
        ? (task.payload as Record<string, unknown>)
        : typeof task.payload === 'string'
          ? (JSON.parse(task.payload) as Record<string, unknown>)
          : {};
    const parallelGroupId = String(taskPayload.parallelGroupId ?? '');
    const parallelPolicy = String(taskPayload.parallelPolicy ?? 'all').toLowerCase();

    const { rows } = await this.db.query(
      `UPDATE public.xbos_workflow_step_task SET status = 'completed', completed_at = NOW(), payload = payload || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid AND ($3::text = '' OR hat_key = $3) RETURNING *`,
      [taskId, JSON.stringify({ approvedBy: userId, hatKey }), hatKey],
    );

    if (parallelGroupId && parallelPolicy === 'any') {
      await this.applyParallelAnyPolicy(instanceId, taskId, parallelGroupId);
    } else if (!(parallelGroupId && parallelPolicy === 'all')) {
      // XHRM-REC-WF-BE-TERMINAL-01: legacy multi-assignee same hat without parallelGroupId
      const stepKeyForSkip = String(task.step_key ?? taskPayload.stepKey ?? '');
      const hatKeyForSkip = String(task.hat_key ?? taskPayload.hatKey ?? hatKey ?? '');
      await this.applySameStepHatAnyPolicy(instanceId, taskId, stepKeyForSkip, hatKeyForSkip);
    }

    await this.maybeAdvanceSequentialStep(instanceId);

    const pendingOnInstance = await this.db.query(
      `SELECT id FROM public.xbos_workflow_step_task WHERE instance_id = $1::uuid AND status = 'pending'`,
      [instanceId],
    );
    const instanceCompleted = pendingOnInstance.rows.length === 0;
    const stepKey = String(task.step_key ?? taskPayload.stepKey ?? '');
    const taskType = String(
      taskPayload.taskType ?? taskPayload.task_type ?? task.step_key ?? '',
    );
    // JOIN selects i.id AS instance_id but t.* keeps step-task UUID on `id`.
    // Mirror rejectStepTask: remap id → instance_id for HRM workflowInstanceId.
    const notifyInstance: Record<string, unknown> = {
      ...task,
      id: instanceId,
    };
    // Always notify recruitment step first (incl. final step → map stage before terminal).
    await this.notifyHrmRecruitmentCallback(notifyInstance, 'step', userId, {
      stepKey,
      taskType,
      taskId: String(task.id ?? taskId),
    });
    if (instanceCompleted) {
      await this.db.query(
        `UPDATE public.xbos_workflow_instance SET status = 'completed', updated_at = NOW() WHERE id = $1::uuid`,
        [instanceId],
      );
      await this.notifyHrmLeaveTerminal(notifyInstance, 'completed', userId);
      await this.notifyHrmRecruitmentCallback(notifyInstance, 'terminal', userId, {
        terminalStatus: 'completed',
      });
    }
    return { task: rows[0], pendingHats: sameUserOtherHats.rows, instanceCompleted };
  }

  /**
   * Without `partition`: legacy highest-version active (ensure / catalog).
   * With `partition` (Option B): member override → group-wide → G-BM-REC-02 applicable.
   */
  async findActiveDefinitionByCode(
    tenantId: string,
    workflowCode: string,
    partition?: CompanyPartitionPickInput,
  ) {
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND workflow_code = $2 AND status = 'active'
       ORDER BY version DESC`,
      [tenantId, workflowCode],
    );
    if (!rows[0]) return null;
    if (!partition) {
      return rows[0] ?? null;
    }

    const candidates: WorkflowDefinitionPartitionCandidate[] = [];
    for (const row of rows as WorkflowDefinitionPartitionCandidate[]) {
      const applying = parseApplyingEntityIdFromGraph(row.graph);
      let resolvedPartition: ApplyingEntityPartition | null = null;
      if (applying && isLegalEntityUuid(applying)) {
        resolvedPartition = await this.resolveApplyingEntityPartition(applying);
      }
      candidates.push({
        ...row,
        resolvedPartition,
      });
    }

    return pickActiveDefinitionForCompanyPartition(candidates, partition);
  }

  async listInstances(tenantId: string, companyId: string, status?: string) {
    const { rows } = await this.db.query(
      `SELECT i.*, d.workflow_code, d.name AS workflow_name
       FROM public.xbos_workflow_instance i
       JOIN public.xbos_workflow_definition d ON d.id = i.definition_id
       WHERE i.tenant_id = $1 AND i.company_id = $2 AND ($3::text IS NULL OR i.status = $3)
       ORDER BY i.created_at DESC`,
      [tenantId, companyId, status ?? null],
    );
    return rows;
  }

  async upsertReportingRoute(tenantId: string, companyId: string, body: Record<string, unknown>) {
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_reporting_route (tenant_id, company_id, report_level, recipient_user_id, recipient_assignment_id, workflow_category)
       VALUES ($1,$2,$3,$4,$5::uuid,$6) RETURNING *`,
      [tenantId, companyId, body.reportLevel, body.recipientUserId ?? null, body.recipientAssignmentId ?? null, body.workflowCategory ?? null],
    );
    return rows[0];
  }

  async listReportingRoutes(tenantId: string, companyId: string) {
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_reporting_route WHERE tenant_id = $1 AND company_id = $2 AND status = 'active'`,
      [tenantId, companyId],
    );
    return rows;
  }
}
