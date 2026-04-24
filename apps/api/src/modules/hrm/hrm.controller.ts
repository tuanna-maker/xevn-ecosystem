import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HrmService } from './hrm.service';
import { SaveEmployeeMetadataValuesDto } from './dto';

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

  @Put('employees/:employeeId/metadata-values')
  putMetadataValues(
    @Param('employeeId') employeeId: string,
    @Body() body: SaveEmployeeMetadataValuesDto,
  ) {
    return this.hrmService.upsertEmployeeMetadataValues({
      employeeId,
      tenantId: body.tenantId,
      legalEntityId: body.legalEntityId,
      values: body.values,
    });
  }
}
