import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HrmService } from './hrm.service';
import { ApproveEmployeeMetadataChangeDto, SubmitEmployeeMetadataChangeDto } from './dto';

@ApiTags('HRM metadata runtime')
@Controller('hrm')
export class HrmController {
  constructor(private readonly hrmService: HrmService) {}

  @Get('employees/:employeeId/metadata-form')
  getMetadataForm(
    @Param('employeeId') employeeId: string,
    @Query('tenantId') tenantId = 'tenant-xevn-holding',
    @Query('legalEntityId') legalEntityId = 'comp-001',
  ) {
    return this.hrmService.getEmployeeMetadataForm({
      tenantId,
      legalEntityId,
      employeeId,
    });
  }

  @Get('employees/:employeeId/profile')
  getProfile(
    @Param('employeeId') employeeId: string,
    @Query('tenantId') tenantId = 'tenant-xevn-holding',
    @Query('legalEntityId') legalEntityId = 'comp-001',
  ) {
    return this.hrmService.getEmployeeMetadataForm({
      tenantId,
      legalEntityId,
      employeeId,
    });
  }

  @Post('employees/:employeeId/metadata-change-requests')
  createMetadataChangeRequest(
    @Param('employeeId') employeeId: string,
    @Body() body: SubmitEmployeeMetadataChangeDto,
  ) {
    return this.hrmService.submitMetadataChangeRequest({
      employeeId,
      tenantId: body.tenantId,
      legalEntityId: body.legalEntityId,
      values: body.values,
      reason: body.reason ?? 'Cập nhật thông tin động từ HRM',
      requestedBy: body.actorUserId ?? 'hrm-user',
    });
  }

  @Post('metadata-change-requests/:requestId/approve')
  approveMetadataChangeRequest(
    @Param('requestId') requestId: string,
    @Body() body: ApproveEmployeeMetadataChangeDto,
  ) {
    return this.hrmService.approveMetadataChangeRequest({
      tenantId: body.tenantId,
      requestId,
      actorUserId: body.approverUserId ?? 'approver-user',
    });
  }

  @Get('metadata-change-requests')
  listMetadataChangeRequests(
    @Query('tenantId') tenantId = 'tenant-xevn-holding',
    @Query('employeeId') employeeId?: string,
  ) {
    return this.hrmService.listMetadataChangeRequests({ tenantId, employeeId });
  }
}
