/**
 * @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  getVerifiedInternalJwtPayload,
  isAuthorizedInternalRequest,
} from '../../common/internal-auth';
import { ApiException } from '../../common/api.exception';
import { ok } from '../../common/api-response';
import { resolveScopeContext } from '../../common/scope-context';
import { InsuranceRateService } from './insurance-rate.service';
import { CreateInsuranceRateDto } from './dto/create-insurance-rate.dto';
import { UpdateInsuranceRateDto } from './dto/update-insurance-rate.dto';
import { UpdateMinimumWageDto } from './dto/update-minimum-wage.dto';

@Controller('settings/insurance-rates')
export class InsuranceRateController {
  constructor(private readonly service: InsuranceRateService) {}

  private assertAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized settings access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /** Resolve tenant_id: prefer JWT claim, fall back to x-tenant-id header, then default 'xevn'. */
  private resolveTenantId(
    authorization: string | undefined,
    headerTenantId: string | undefined,
  ): string {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const fromJwt =
      (payload?.['tenant_id'] as string | undefined) ??
      (payload?.['tenantId'] as string | undefined);
    return fromJwt ?? headerTenantId ?? 'xevn';
  }

  @Get()
  async findAll(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tid = this.resolveTenantId(authorization, tenantId);
    resolveScopeContext(authorization, { tenantId: tid, companyId });
    const [rates, regions] = await Promise.all([
      this.service.findAllRates(tid, companyId),
      this.service.findAllRegions(tid, companyId),
    ]);
    return ok(
      { rates, regions },
      'HRM-INS-RATE-200',
      'Insurance rates and regions',
    );
  }

  @Get('rates/:id')
  async findRateById(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tid = this.resolveTenantId(authorization, tenantId);
    resolveScopeContext(authorization, { tenantId: tid, companyId });
    return this.service
      .findRateById(tid, companyId, id)
      .then((data) => ok(data, 'HRM-INS-RATE-200', 'Insurance rate'));
  }

  @Post('rates')
  async createRate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() dto: CreateInsuranceRateDto,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tid = this.resolveTenantId(authorization, tenantId);
    resolveScopeContext(authorization, { tenantId: tid, companyId });
    return this.service
      .createRate(tid, companyId, dto)
      .then((data) => ok(data, 'HRM-INS-RATE-201', 'Insurance rate created'));
  }

  @Put('rates/:id')
  async updateRate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Body() dto: UpdateInsuranceRateDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tid = this.resolveTenantId(authorization, tenantId);
    resolveScopeContext(authorization, { tenantId: tid, companyId });
    return this.service
      .updateRate(tid, companyId, id, dto)
      .then((data) => ok(data, 'HRM-INS-RATE-200', 'Insurance rate updated'));
  }

  @Get('minimum-wage-regions')
  async findAllRegions(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tid = this.resolveTenantId(authorization, tenantId);
    resolveScopeContext(authorization, { tenantId: tid, companyId });
    return this.service
      .findAllRegions(tid, companyId)
      .then((data) => ok(data, 'HRM-INS-RATE-200', 'Minimum wage regions'));
  }

  @Put('minimum-wage-regions/:id')
  async updateRegion(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('company_id') companyId: string,
    @Body() dto: UpdateMinimumWageDto,
  ) {
    this.assertAccess(authorization, internalApiKey);
    if (!companyId?.trim()) {
      throw new ApiException(
        'HRM-VAL-001',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const tid = this.resolveTenantId(authorization, tenantId);
    resolveScopeContext(authorization, { tenantId: tid, companyId });
    return this.service
      .updateRegion(tid, companyId, id, dto)
      .then((data) =>
        ok(data, 'HRM-INS-RATE-200', 'Minimum wage region updated'),
      );
  }
}
