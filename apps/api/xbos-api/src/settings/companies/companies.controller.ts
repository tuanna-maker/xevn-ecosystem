/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 *
 * Controller prefix: settings/companies
 * Full URL: /api/xbos/settings/companies (global prefix = api/xbos)
 * Auth: isAuthorizedInternalRequest (JWT or x-internal-api-key) — same pattern as org-foundation.
 */
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { ok } from '../../common/api-response';
import { getVerifiedInternalJwtPayload, isAuthorizedInternalRequest } from '../../common/internal-auth';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateModulesDto } from './dto/update-modules.dto';

@Controller('settings/companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  private assertInternal(authorization?: string, internalApiKey?: string): void {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-SETTINGS-401', 'Unauthorized: valid JWT or x-internal-api-key required', HttpStatus.UNAUTHORIZED);
    }
  }

  private resolveActor(authorization?: string): string {
    const jwt = getVerifiedInternalJwtPayload(authorization);
    if (jwt) {
      const sub = typeof jwt.sub === 'string' ? jwt.sub.trim() : '';
      const email = typeof jwt.email === 'string' ? jwt.email.trim() : '';
      return sub || email || 'system';
    }
    return 'system';
  }

  /**
   * GET /api/xbos/settings/companies
   * List all tenants with their primary legal entity.
   */
  @Get()
  async listCompanies(
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const items = await this.service.listCompanies();
    return ok({ items }, 'XBOS-SETTINGS-200', 'Companies loaded');
  }

  /**
   * POST /api/xbos/settings/companies
   * Provision new company + tenant (status = provisioning).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCompany(
    @Body() body: CreateCompanyDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const issuedBy = this.resolveActor(authorization);
    const result = await this.service.createCompany(body, issuedBy);
    return ok(result, 'XBOS-SETTINGS-201', 'Company provisioning initiated');
  }

  /**
   * PUT /api/xbos/settings/companies/:tenantId/activate
   * Activate tenant (provisioning -> active). Emits TENANT_PROVISIONED.
   */
  @Put(':tenantId/activate')
  async activateTenant(
    @Param('tenantId') tenantId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const issuedBy = this.resolveActor(authorization);
    await this.service.activateTenant(tenantId, issuedBy);
    return ok({ tenantId }, 'XBOS-SETTINGS-200', 'Tenant activated');
  }

  /**
   * PUT /api/xbos/settings/companies/:tenantId/suspend
   * Suspend tenant. Emits TENANT_SUSPENDED.
   */
  @Put(':tenantId/suspend')
  async suspendTenant(
    @Param('tenantId') tenantId: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const issuedBy = this.resolveActor(authorization);
    await this.service.suspendTenant(tenantId, issuedBy);
    return ok({ tenantId }, 'XBOS-SETTINGS-200', 'Tenant suspended');
  }

  /**
   * PATCH /api/xbos/settings/companies/:tenantId/modules
   * Update modules JSONB. Emits TENANT_MODULE_ADDED if active + new modules.
   */
  @Patch(':tenantId/modules')
  async updateModules(
    @Param('tenantId') tenantId: string,
    @Body() body: UpdateModulesDto,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const issuedBy = this.resolveActor(authorization);
    await this.service.updateModules(tenantId, body, issuedBy);
    return ok({ tenantId }, 'XBOS-SETTINGS-200', 'Modules updated');
  }
}
