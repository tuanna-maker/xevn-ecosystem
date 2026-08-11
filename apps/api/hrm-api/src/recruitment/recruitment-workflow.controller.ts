/**
 * @CODE-MEMORY
 * Screen: Internal S2S recruitment workflow callbacks (XBOS → HRM)
 * UC: UC-HRM-REC-WF-03 / UC-HRM-REC-WF-04 / UC-HRM-REC-WF-06
 * BR: BR-REC-WF-03..07 · NFR callback auth
 * SRS: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
 * TechSpec: docs/decisions/ADR-XBOS-HRM-RECRUITMENT-WORKFLOW-BRIDGE.md §3 Q2 · §5.2 · §6
 * DataContract: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_DATA_CONTRACT.md §5
 * Purpose: POST /recruitment/workflow/step|terminal — internal JWT auth only.
 * WorkItem: XHRM-REC-WF-BE-01
 * Coded: 2026-07-19
 * Callers: XBOS workflow-engine notifyHrmRecruitmentCallback
 * Callees: RecruitmentWorkflowBridge
 * Impact: Weak auth → forged stage; leave terminal route must stay separate
 * must_keep: LeaveWorkflowBridge, CatalogWorkflowBridge, AC-CD-F6-*, F4 resolver
 * change_mode: UPGRADE
 * LastVerified: recruitment-workflow.bridge.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-01
 * ADD step+terminal controller. Cite ADR §5.2 DTO + isAuthorizedInternalRequest.
 */
import { Body, Controller, Headers, HttpStatus, Post } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import {
  RecruitmentWorkflowBridge,
  type RecruitmentBusinessType,
  WF_BUSINESS_TYPE_HRM_CANDIDATE,
  WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
} from './recruitment-workflow.bridge';

const BUSINESS_TYPES = new Set<string>([
  WF_BUSINESS_TYPE_HRM_RECRUITMENT_PLAN,
  WF_BUSINESS_TYPE_HRM_REQUISITION,
  WF_BUSINESS_TYPE_HRM_CANDIDATE,
]);

@Controller('recruitment')
export class RecruitmentWorkflowController {
  constructor(private readonly bridge: RecruitmentWorkflowBridge) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  private normalizeBusinessType(raw: unknown): RecruitmentBusinessType {
    const value = String(raw ?? '').trim();
    if (!BUSINESS_TYPES.has(value)) {
      throw new ApiException(
        'HRM-VAL-001',
        'businessType must be hrm_recruitment_plan | hrm_requisition | hrm_candidate',
        HttpStatus.BAD_REQUEST,
      );
    }
    return value as RecruitmentBusinessType;
  }

  @Post('workflow/step')
  async stepCallback(
    @Body()
    body: {
      businessType?: string;
      businessId?: string;
      workflowInstanceId?: string;
      stepKey?: string;
      taskType?: string;
      task_type?: string;
      taskId?: string;
      reviewerUserId?: string;
      reviewerName?: string;
    },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const businessType = this.normalizeBusinessType(body.businessType);
    const businessId = String(body.businessId ?? '').trim();
    const workflowInstanceId = String(body.workflowInstanceId ?? '').trim();
    const stepKey = String(body.stepKey ?? '').trim();
    const taskType = String(body.taskType ?? body.task_type ?? '').trim();
    const reviewerUserId = String(body.reviewerUserId ?? '').trim();
    if (!businessId || !workflowInstanceId || !stepKey || !taskType || !reviewerUserId) {
      throw new ApiException(
        'HRM-VAL-001',
        'businessId, workflowInstanceId, stepKey, taskType, reviewerUserId required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.bridge.handleStepCallback({
        businessType,
        businessId,
        workflowInstanceId,
        stepKey,
        taskType,
        taskId: body.taskId,
        reviewerUserId,
        reviewerName: body.reviewerName,
      });
      return ok(result, 'HRM-REC-WF-CALLBACK-200', 'Step callback processed');
    } catch (err) {
      if (err instanceof Error && err.message === 'HRM-REC-WF-STAGE-UNMAPPED') {
        throw new ApiException(
          'HRM-REC-WF-STAGE-UNMAPPED',
          `Unmapped taskType: ${taskType}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      if (err instanceof Error && err.message === 'HRM-REC-CP-404') {
        throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }

  @Post('workflow/terminal')
  async terminalCallback(
    @Body()
    body: {
      businessType?: string;
      businessId?: string;
      workflowInstanceId?: string;
      terminalStatus?: 'completed' | 'rejected';
      reviewerUserId?: string;
      reviewerName?: string;
      rejectedReason?: string | null;
    },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const businessType = this.normalizeBusinessType(body.businessType);
    const businessId = String(body.businessId ?? '').trim();
    const workflowInstanceId = String(body.workflowInstanceId ?? '').trim();
    const terminalStatus = body.terminalStatus;
    const reviewerUserId = String(body.reviewerUserId ?? '').trim();
    if (!businessId || !workflowInstanceId || !terminalStatus || !reviewerUserId) {
      throw new ApiException(
        'HRM-VAL-001',
        'businessId, workflowInstanceId, terminalStatus, reviewerUserId required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (terminalStatus !== 'completed' && terminalStatus !== 'rejected') {
      throw new ApiException(
        'HRM-VAL-001',
        'terminalStatus must be completed | rejected',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.bridge.handleTerminalCallback({
        businessType,
        businessId,
        workflowInstanceId,
        terminalStatus,
        reviewerUserId,
        reviewerName: body.reviewerName,
        rejectedReason: body.rejectedReason,
      });
      return ok(result, 'HRM-REC-WF-CALLBACK-200', 'Terminal callback processed');
    } catch (err) {
      if (err instanceof Error && err.message === 'HRM-REC-PLAN-404') {
        throw new ApiException('HRM-REC-PLAN-404', 'Recruitment plan not found', HttpStatus.NOT_FOUND);
      }
      if (err instanceof Error && err.message === 'HRM-REC-404') {
        throw new ApiException('HRM-REC-404', 'Job requisition not found', HttpStatus.NOT_FOUND);
      }
      if (err instanceof Error && err.message === 'HRM-REC-CP-404') {
        throw new ApiException('HRM-REC-CP-404', 'Candidate not found', HttpStatus.NOT_FOUND);
      }
      throw err;
    }
  }
}
