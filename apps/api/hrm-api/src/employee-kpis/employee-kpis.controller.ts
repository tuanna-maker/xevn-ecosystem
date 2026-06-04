import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeKpiDto } from './dto/create-employee-kpi.dto';
import { ListEmployeeKpisQueryDto } from './dto/list-employee-kpis.query.dto';
import { EmployeeKpisService } from './employee-kpis.service';

@Controller('employee-kpis')
export class EmployeeKpisController {
  constructor(private readonly service: EmployeeKpisService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized employee KPI access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeeKpisQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service.list(query, authorization).then((data) => ok(data, 'HRM-KPI-200', 'Employee KPIs listed'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateEmployeeKpiDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service.create(body, authorization).then((data) => ok(data, 'HRM-KPI-201', 'Employee KPI created'));
  }

  @Delete(':kpiId')
  remove(
    @Param('kpiId') kpiId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.service.remove(kpiId, companyId, authorization).then((data) => ok(data, 'HRM-KPI-200', 'Employee KPI deleted'));
  }
}
