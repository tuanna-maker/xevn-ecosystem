import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  MASTER_COMPANY_HOLDING,
  MASTER_TENANT_XEVN,
  WF_BUSINESS_TYPE_HRM_CATALOG,
  buildXeDuLichCatalogWorkflowDefinition,
} from '../workflow-engine/workflow-catalog.constants';
import { WorkflowEngineService } from '../workflow-engine/workflow-engine.service';

@Injectable()
export class CatalogGovernanceService {
  constructor(private readonly workflow: WorkflowEngineService) {}

  private hrmBaseUrl(): string {
    const port = process.env.HRM_BE_PORT ?? '28001';
    return (process.env.HRM_API_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, '');
  }

  private internalKey(): string {
    return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
  }

  private async hrmFetch(path: string, init: RequestInit & { reviewerUserId?: string } = {}) {
    const headers: Record<string, string> = {
      'x-internal-api-key': this.internalKey(),
      'content-type': 'application/json',
      ...(init.reviewerUserId ? { 'x-user-id': init.reviewerUserId } : {}),
    };
    const res = await fetch(`${this.hrmBaseUrl()}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
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
    if (existing) return existing;
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
      { method: 'GET' },
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
              assigneeUserId: approvalStep.assigneeUserId ?? 'ceo@xevn.vn',
            },
          ]
        : [],
    });

    const inst = instance as { id: string };
    await this.hrmFetch(`/api/hrm/settings-catalogs/batches/${encodeURIComponent(payload.batchId)}/workflow`, {
      method: 'POST',
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
    const inst = detail.instance as { business_id: string };
    const batchDetail = await this.hrmFetch(
      `/api/hrm/settings-catalogs/batches/${encodeURIComponent(String(inst.business_id))}`,
      { method: 'GET' },
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
    };
    const batchId = String(task.business_id);

    if (decision === 'reject') {
      await this.workflow.rejectStepTask(taskId, { userId: reviewerUserId, reviewNote });
      await this.hrmFetch(
        `/api/hrm/settings-catalogs/batches/${encodeURIComponent(batchId)}/review`,
        {
          method: 'POST',
          reviewerUserId,
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
