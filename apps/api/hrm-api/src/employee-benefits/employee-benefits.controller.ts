import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeBenefitDto } from './dto/create-employee-benefit.dto';
import { ListEmployeeBenefitsQueryDto } from './dto/list-employee-benefits.query.dto';
import { UpdateEmployeeBenefitDto } from './dto/update-employee-benefit.dto';
import { EmployeeBenefitsService } from './employee-benefits.service';

@Controller('employee-benefits')
export class EmployeeBenefitsController {
  constructor(private readonly service: EmployeeBenefitsService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized employee benefits access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeeBenefitsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service
      .list(query, authorization)
      .then((data) => ok(data, 'HRM-EBEN-200', 'Employee benefits listed'));
  }

  @Get(':benefitId')
  getById(
    @Param('benefitId') benefitId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.service
      .getById(benefitId, companyId, authorization)
      .then((data) => ok(data, 'HRM-EBEN-200', 'Employee benefit loaded'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateEmployeeBenefitDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service
      .create(body, authorization)
      .then((data) => ok(data, 'HRM-EBEN-201', 'Employee benefit created'));
  }

  @Patch(':benefitId')
  update(
    @Param('benefitId') benefitId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdateEmployeeBenefitDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service
      .update(benefitId, body, authorization)
      .then((data) => ok(data, 'HRM-EBEN-200', 'Employee benefit updated'));
  }

  @Delete(':benefitId')
  remove(
    @Param('benefitId') benefitId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: companyId ?? headerCompanyId });
    return this.service
      .remove(benefitId, companyId, authorization)
      .then((data) => ok(data, 'HRM-EBEN-200', 'Employee benefit deleted'));
  }
}
