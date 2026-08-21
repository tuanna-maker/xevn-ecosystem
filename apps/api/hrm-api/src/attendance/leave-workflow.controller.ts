import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { LeaveWorkflowBridge } from './leave-workflow.bridge';

@Controller('attendance')
export class LeaveWorkflowController {
  constructor(private readonly bridge: LeaveWorkflowBridge) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized internal access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('workflow-resolver/manager')
  async resolveManager(
    @Query('employee_id') employeeId: string,
    @Query('company_id') companyId: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    if (!employeeId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'employee_id required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const data = await this.bridge.resolveManagerForWorkflow(
      employeeId.trim(),
      companyId?.trim(),
    );
    return ok(data, 'HRM-WF-RESOLVE-200', 'Manager resolved');
  }

  @Post('leave-workflow/terminal')
  async terminalCallback(
    @Body()
    body: {
      leaveRequestId: string;
      workflowInstanceId?: string;
      terminalStatus: 'completed' | 'rejected';
      reviewerUserId: string;
      reviewerName?: string;
      rejectedReason?: string | null;
    },
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    if (
      !body.leaveRequestId?.trim() ||
      !body.terminalStatus ||
      !body.reviewerUserId?.trim()
    ) {
      throw new ApiException(
        'HRM-VAL-001',
        'leaveRequestId, terminalStatus, reviewerUserId required',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.bridge.handleTerminalCallback({
        leaveRequestId: body.leaveRequestId.trim(),
        workflowInstanceId: body.workflowInstanceId,
        terminalStatus: body.terminalStatus,
        reviewerUserId: body.reviewerUserId.trim(),
        reviewerName: body.reviewerName,
        rejectedReason: body.rejectedReason,
      });
      return ok(result, 'HRM-WF-CALLBACK-200', 'Terminal callback processed');
    } catch (err) {
      if (err instanceof Error && err.message === 'HRM-LEAVE-404') {
        throw new ApiException(
          'HRM-LEAVE-404',
          'Leave request not found',
          HttpStatus.NOT_FOUND,
        );
      }
      throw err;
    }
  }
}
