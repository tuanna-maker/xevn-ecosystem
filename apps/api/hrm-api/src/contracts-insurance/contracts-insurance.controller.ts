import { Body, Controller, Delete, Get, Headers, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import { resolveScopeContext } from '../common/scope-context';
import { ContractsInsuranceService } from './contracts-insurance.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts-insurance')
export class ContractsInsuranceController {
  constructor(private readonly service: ContractsInsuranceService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized contracts/insurance access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('contracts')
  createContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateContractDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service.createContract(body).then((data) => ok(data, 'HRM-CON-201', 'Contract created'));
  }

  @Post('insurance')
  createInsurance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateInsuranceRecordDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.company_id ?? headerCompanyId });
    return this.service.createInsuranceRecord(body).then((data) => ok(data, 'HRM-CON-202', 'Insurance record created'));
  }

  @Get('contracts/expiring')
  listExpiringContracts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListExpiringQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service.listExpiringContracts(query).then((data) => ok(data, 'HRM-CON-200', 'Expiring contracts listed'));
  }

  @Get('contracts')
  listContracts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListContractsQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service.listContracts(query).then((data) => ok(data, 'HRM-CON-200', 'Contracts listed'));
  }

  @Patch('contracts/:contractId')
  updateContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId') contractId: string,
    @Body() body: UpdateContractDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: headerCompanyId });
    return this.service.updateContract(contractId, body).then((data) => ok(data, 'HRM-CON-200', 'Contract updated'));
  }

  @Delete('contracts/:contractId')
  deleteContract(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Param('contractId') contractId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: headerCompanyId });
    return this.service.deleteContract(contractId).then((data) => ok(data, 'HRM-CON-200', 'Contract deleted'));
  }

  @Get('insurance/expiring')
  listExpiringInsurance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListExpiringQueryDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: query.company_id ?? headerCompanyId });
    return this.service.listExpiringInsurance(query).then((data) => ok(data, 'HRM-CON-200', 'Expiring insurance listed'));
  }
}
