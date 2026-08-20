import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { InsuranceActionDto } from './dto/insurance-action.dto';
import { ListEmployeeInsurancesQueryDto } from './dto/list-employee-insurances.query.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
import { EmployeeInsurancesService } from './employee-insurances.service';

@Controller('employee-insurances')
export class EmployeeInsurancesController {
  constructor(private readonly service: EmployeeInsurancesService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized employee insurances access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  list(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListEmployeeInsurancesQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.service
      .list(query, authorization)
      .then((data) => ok(data, 'HRM-EINS-200', 'Employee insurances listed'));
  }

  @Post(':insuranceId/actions')
  applyAction(
    @Param('insuranceId') insuranceId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: InsuranceActionDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .applyAction(insuranceId, body, authorization)
      .then((data) =>
        ok(data, 'HRM-EINS-200', 'Employee insurance action applied'),
      );
  }

  @Get(':insuranceId')
  getById(
    @Param('insuranceId') insuranceId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .getById(insuranceId, companyId, authorization)
      .then((data) => ok(data, 'HRM-EINS-200', 'Employee insurance loaded'));
  }

  @Post()
  create(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateEmployeeInsuranceDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .create(body, authorization)
      .then((data) => ok(data, 'HRM-EINS-201', 'Employee insurance created'));
  }

  @Patch(':insuranceId')
  update(
    @Param('insuranceId') insuranceId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpdateEmployeeInsuranceDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.service
      .update(insuranceId, body, authorization)
      .then((data) => ok(data, 'HRM-EINS-200', 'Employee insurance updated'));
  }

  @Delete(':insuranceId')
  remove(
    @Param('insuranceId') insuranceId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.service
      .remove(insuranceId, companyId, authorization)
      .then((data) => ok(data, 'HRM-EINS-200', 'Employee insurance deleted'));
  }
}
