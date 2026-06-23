import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import {
  GROUP_APPROVER_USER,
  MASTER_COMPANY_HOLDING,
  WF_BUSINESS_TYPE_DEFINITION_REVIEW,
} from './workflow-catalog.constants';

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

function extractWorkflowGraphSteps(raw: unknown): WorkflowGraphStepRow[] {
  if (Array.isArray(raw)) return raw as WorkflowGraphStepRow[];
  const graph = parseGraphObject(raw);
  const steps = graph.steps ?? graph.nodes;
  return Array.isArray(steps) ? (steps as WorkflowGraphStepRow[]) : [];
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

@Injectable()
export class WorkflowEngineService {
  constructor(private readonly db: XbosDbService) {}

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
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_workflow_definition (
        tenant_id, workflow_code, name, category, scope_level, company_id, graph, conditions, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9) RETURNING *`,
      [tenantId, code, name, category, scopeLevel, companyId, graphJson, conditionsJson, status ?? 'draft'],
    );
    await this.maybeSpawnDefinitionInboxTask(tenantId, companyId, rows[0], body);
    return rows[0];
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

  private buildDefinitionInboxSteps(graphSteps: WorkflowGraphStepRow[]): Array<Record<string, unknown>> {
    const sorted = [...graphSteps].sort((a, b) => {
      const orderA = Number(a.order ?? a.step_order ?? 0);
      const orderB = Number(b.order ?? b.step_order ?? 0);
      return orderA - orderB;
    });
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
    const steps = this.buildDefinitionInboxSteps(graphSteps);
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
        [instance.id, step.stepKey ?? step.id, step.hatKey ?? step.handlerRoleId ?? 'default', step.assigneeUserId ?? null, step.assignmentId ?? null, step.dueAt ?? null, JSON.stringify(step)],
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
    return rows;
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

  async rejectStepTask(taskId: string, body: Record<string, unknown>) {
    const userId = String(body.userId ?? '');
    const reason = String(body.reason ?? body.reviewNote ?? '');
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
    return rows[0];
  }

  async completeStepTask(taskId: string, body: Record<string, unknown>) {
    const userId = String(body.userId ?? '');
    const hatKey = String(body.hatKey ?? '');
    const { rows: taskRows } = await this.db.query(
      `SELECT t.*, i.tenant_id, i.company_id FROM public.xbos_workflow_step_task t
       JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
       WHERE t.id = $1::uuid`,
      [taskId],
    );
    const task = taskRows[0] as Record<string, unknown> | undefined;
    if (!task) throw new ApiException('XBOS-WF-404', 'Task not found', HttpStatus.NOT_FOUND);

    const instanceId = String(task.instance_id ?? '');
    const sameUserOtherHats = await this.db.query(
      `SELECT id, hat_key, status FROM public.xbos_workflow_step_task
       WHERE instance_id = $1::uuid AND assignee_user_id = $2 AND status = 'pending' AND id <> $3::uuid`,
      [instanceId, userId, taskId],
    );
    if (sameUserOtherHats.rows.length > 0 && !hatKey) {
      throw new ApiException('XBOS-WF-422', 'Multi-hat approval: hatKey required (BR-XBOS-MULTI-HAT-01)', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const { rows } = await this.db.query(
      `UPDATE public.xbos_workflow_step_task SET status = 'completed', completed_at = NOW(), payload = payload || $2::jsonb, updated_at = NOW()
       WHERE id = $1::uuid AND ($3::text = '' OR hat_key = $3) RETURNING *`,
      [taskId, JSON.stringify({ approvedBy: userId, hatKey }), hatKey],
    );
    const pendingOnInstance = await this.db.query(
      `SELECT id FROM public.xbos_workflow_step_task WHERE instance_id = $1::uuid AND status = 'pending'`,
      [instanceId],
    );
    if (pendingOnInstance.rows.length === 0) {
      await this.db.query(
        `UPDATE public.xbos_workflow_instance SET status = 'completed', updated_at = NOW() WHERE id = $1::uuid`,
        [instanceId],
      );
    }
    return { task: rows[0], pendingHats: sameUserOtherHats.rows, instanceCompleted: pendingOnInstance.rows.length === 0 };
  }

  async findActiveDefinitionByCode(tenantId: string, workflowCode: string) {
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_workflow_definition
       WHERE tenant_id = $1 AND workflow_code = $2 AND status = 'active'
       ORDER BY version DESC LIMIT 1`,
      [tenantId, workflowCode],
    );
    return rows[0] ?? null;
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
