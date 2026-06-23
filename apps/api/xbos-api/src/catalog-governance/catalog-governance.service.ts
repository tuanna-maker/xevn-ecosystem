import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { resolveHrmApiBaseUrl } from '../common/resolve-hrm-api-base-url';
import {
  GROUP_APPROVER_USER,
  MASTER_COMPANY_HOLDING,
  MASTER_TENANT_XEVN,
  WF_BUSINESS_TYPE_HRM_CATALOG,
  buildXeDuLichCatalogWorkflowDefinition,
} from '../workflow-engine/workflow-catalog.constants';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';

type HrmUpstreamScope = { tenantId?: string; companyId?: string };

type HrmFetchInit = RequestInit & HrmUpstreamScope & { reviewerUserId?: string };

function parseWorkflowGraphSteps(raw: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(raw)) return raw as Array<Record<string, unknown>>;
  if (raw && typeof raw === 'object') {
    const graph = raw as Record<string, unknown>;
    const steps = graph.steps ?? graph.nodes;
    if (Array.isArray(steps)) return steps as Array<Record<string, unknown>>;
  }
  if (typeof raw === 'string') {
    try {
      return parseWorkflowGraphSteps(JSON.parse(raw) as unknown);
    } catch {
      return [];
    }
  }
  return [];
}

function catalogApprovalStepAssignee(steps: Array<Record<string, unknown>>): string | null {
  const approval = steps.find((s) => String(s.stepKey ?? s.step_key ?? '') === 'group_catalog_approval');
  if (!approval) return null;
  const assignee = approval.assigneeUserId ?? approval.assignee_user_id;
  return typeof assignee === 'string' ? assignee.trim().toLowerCase() : null;
}

@Injectable()
export class CatalogGovernanceService {
  constructor(private readonly workflow: WorkflowEngineService) {}

  private internalKey(): string {
    return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
  }

  private resolveMemberScopeFromContext(context: unknown): HrmUpstreamScope {
    if (!context || typeof context !== 'object') {
      return {};
    }
    const ctx = context as Record<string, unknown>;
    const tenantId = typeof ctx.memberTenantId === 'string' ? ctx.memberTenantId.trim() : undefined;
    const companyId = typeof ctx.memberCompanyId === 'string' ? ctx.memberCompanyId.trim() : undefined;
    return { tenantId, companyId };
  }

  private async hrmFetch(path: string, init: HrmFetchInit = {}) {
    const { reviewerUserId, tenantId, companyId, ...fetchInit } = init;
    const headers: Record<string, string> = {
      'x-internal-api-key': this.internalKey(),
      'content-type': 'application/json',
      ...(reviewerUserId ? { 'x-user-id': reviewerUserId } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      ...(companyId ? { 'x-company-id': companyId } : {}),
    };
    const res = await fetch(`${resolveHrmApiBaseUrl()}${path}`, {
      ...fetchInit,
      headers: { ...headers, ...(fetchInit.headers as Record<string, string> | undefined) },
    });
    const text = await res.text();
    let json: { success?: boolean; message?: string; data?: unknown };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      throw new ApiException('XBOS-CAT-502', 'HRM upstream error', HttpStatus.BAD_GATEWAY, {
        status: res.status,
        body: text.slice(0, 200),
      });
    }
    if (!res.ok || json.success === false) {
      throw new ApiException(
        'XBOS-CAT-502',
        json.message ?? 'HRM call failed',
        res.status as HttpStatus,
        json,
      );
    }
    return json.data;
  }

  async ensureXeDuLichCatalogWorkflow() {
    const body = buildXeDuLichCatalogWorkflowDefinition();
    const existing = await this.workflow.findActiveDefinitionByCode(MASTER_TENANT_XEVN, body.workflowCode);
    if (existing) {
      const existingSteps = parseWorkflowGraphSteps((existing as { graph?: unknown }).graph);
      const canonicalAssignee = GROUP_APPROVER_USER.toLowerCase();
      const currentAssignee = catalogApprovalStepAssignee(existingSteps);
      if (currentAssignee !== canonicalAssignee) {
        return this.workflow.upsertDefinition(
          MASTER_TENANT_XEVN,
          MASTER_COMPANY_HOLDING,
          String((existing as { id: string }).id),
          {
            ...body,
            name: String((existing as { name?: string }).name ?? body.name),
          },
        );
      }
      return existing;
    }
    return this.workflow.upsertDefinition(MASTER_TENANT_XEVN, MASTER_COMPANY_HOLDING, null, body);
  }

  async startCatalogApprovalWorkflow(payload: {
    batchId: string;
    memberTenantId: string;
    memberCompanyId: string;
    requesterUserId?: string;
  }) {
    const definition = await this.ensureXeDuLichCatalogWorkflow();
    const def = definition as { id: string; graph?: { steps?: Array<Record<string, unknown>> } };
    const batchDetail = (await this.hrmFetch(
      `/api/hrm/settings-catalogs/batches/${encodeURIComponent(payload.batchId)}`,
      {
        method: 'GET',
        tenantId: payload.memberTenantId,
        companyId: payload.memberCompanyId,
      },
    )) as { batchId: string; items: Array<Record<string, unknown>> };

    const approvalStep = def.graph?.steps?.find((s) => s.stepKey === 'group_catalog_approval');
    const instance = await this.workflow.startInstance(MASTER_TENANT_XEVN, MASTER_COMPANY_HOLDING, {
      definitionId: def.id,
      businessType: WF_BUSINESS_TYPE_HRM_CATALOG,
      businessId: payload.batchId,
      context: {
        memberTenantId: payload.memberTenantId,
        memberCompanyId: payload.memberCompanyId,
        batchId: payload.batchId,
        requesterUserId: payload.requesterUserId ?? null,
        itemCount: batchDetail.items?.length ?? 0,
        items: batchDetail.items ?? [],
      },
      steps: approvalStep
        ? [
            {
              stepKey: approvalStep.stepKey,
              hatKey: approvalStep.hatKey ?? 'group_ceo',
              assigneeUserId: GROUP_APPROVER_USER,
            },
          ]
        : [],
    });

    const inst = instance as { id: string };
    await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(payload.batchId)}/workflow`, {
      method: 'POST',
      tenantId: payload.memberTenantId,
      companyId: payload.memberCompanyId,
      body: JSON.stringify({ workflowInstanceId: inst.id }),
    });

    return { workflowInstanceId: inst.id, definitionId: def.id, batchId: payload.batchId };
  }

  async listApprovalInbox(assigneeUserId: string) {
    const tasks = await this.workflow.listStepTasks({
      assigneeUserId,
      tenantId: MASTER_TENANT_XEVN,
      status: 'pending',
      businessType: WF_BUSINESS_TYPE_HRM_CATALOG,
    });
    return { items: tasks };
  }

  async getApprovalDetail(instanceId: string) {
    const detail = await this.workflow.getInstanceWithTasks(instanceId);
    const inst = detail.instance as { business_id: string; context?: unknown };
    const memberScope = this.resolveMemberScopeFromContext(inst.context);
    const batchDetail = await this.hrmFetch(
      `/api/hrm/settings-catalogs/batches/${encodeURIComponent(String(inst.business_id))}`,
      {
        method: 'GET',
        tenantId: memberScope.tenantId,
        companyId: memberScope.companyId,
      },
    );
    return { ...detail, batchDetail };
  }

  async actOnTask(
    taskId: string,
    decision: 'approve' | 'reject',
    reviewerUserId: string,
    reviewNote?: string,
  ) {
    const task = (await this.workflow.getTaskById(taskId)) as {
      id: string;
      instance_id: string;
      business_id: string;
      hat_key: string;
      context?: unknown;
    };
    const batchId = String(task.business_id);
    const memberScope = this.resolveMemberScopeFromContext(task.context);

    if (decision === 'reject') {
      await this.workflow.rejectStepTask(taskId, { userId: reviewerUserId, reviewNote });
      await this.hrmFetch(
        `/api/hrm/settings-catalogs/batches/${encodeURIComponent(batchId)}/review`,
        {
          method: 'POST',
          reviewerUserId,
          tenantId: memberScope.tenantId,
          companyId: memberScope.companyId,
          body: JSON.stringify({ decision: 'rejected', review_note: reviewNote ?? null }),
        },
      );
      return { decision: 'rejected', batchId, taskId };
    }

    const result = await this.workflow.completeStepTask(taskId, {
      userId: reviewerUserId,
      hatKey: task.hat_key || 'group_ceo',
      reviewNote,
    });
    if ((result as { instanceCompleted?: boolean }).instanceCompleted) {
      await this.hrmFetch(
        `/api/hrm/settings-catalogs/batches/${encodeURIComponent(batchId)}/review`,
        {
          method: 'POST',
          reviewerUserId,
          tenantId: memberScope.tenantId,
          companyId: memberScope.companyId,
          body: JSON.stringify({ decision: 'approved', review_note: reviewNote ?? null }),
        },
      );
    }
    return { decision: 'approved', batchId, taskId, ...result };
  }

  listPendingExtensionRequests(tenantId?: string) {
    const q = new URLSearchParams({ status: 'pending' });
    if (tenantId) q.set('tenantId', tenantId);
    return this.hrmFetch(`/api/hrm/settings-catalogs/extension-requests?${q.toString()}`, {
      method: 'GET',
    });
  }
}
