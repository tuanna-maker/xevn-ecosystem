import { Controller, Get, Post, Body, Headers, HttpStatus, Query } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { getVerifiedInternalJwtPayload, isAuthorizedInternalRequest } from '../common/internal-auth';
import { TenantScopeService } from './tenant-scope.service';

@Controller('tenant-scope')
export class TenantScopeController {
  constructor(private readonly service: TenantScopeService) {}

  private assertInternal(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  private resolveUserId(
    authorization?: string,
    headerUserId?: string,
    queryUserId?: string,
  ): string {
    const jwt = getVerifiedInternalJwtPayload(authorization);
    const fromJwt =
      (typeof jwt?.sub === 'string' && jwt.sub.trim()) ||
      (typeof jwt?.email === 'string' && jwt.email.trim()) ||
      undefined;
    return (fromJwt ?? headerUserId ?? queryUserId ?? process.env.DEV_DEFAULT_USER_ID ?? 'admin@xe.vn').trim();
  }

  @Get('accessible')
  async accessible(
    @Query('userId') queryUserId: string | undefined,
    @Headers('x-user-id') headerUserId: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
    const items = await this.service.listAccessible(userId);
    return ok({ userId, items }, 'XBOS-TENANT-200', 'Accessible tenants loaded');
  }

  @Get('group-org-overview')
  async groupOverview(
    @Query('userId') queryUserId: string | undefined,
    @Headers('x-user-id') headerUserId: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
    const data = await this.service.groupOrgOverview(userId);
    return ok(data, 'XBOS-TENANT-200', 'Group org overview loaded');
  }

  @Get('group-member-units')
  async groupMemberUnits(
    @Query('userId') queryUserId: string | undefined,
    @Headers('x-user-id') headerUserId: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const jwt = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
    const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
    const tenantId =
      (typeof jwt?.tenantId === 'string' && jwt.tenantId.trim()) ||
      (typeof jwt?.tenant_id === 'string' && jwt.tenant_id.trim()) ||
      undefined;
    const roleCode =
      (typeof jwt?.roleCode === 'string' && jwt.roleCode.trim()) ||
      (typeof jwt?.role_code === 'string' && jwt.role_code.trim()) ||
      undefined;
    const data = await this.service.groupMemberUnits(userId, { tenantId, roleCode });
    return ok(data, 'XBOS-TENANT-200', 'Group member units loaded');
  }

  @Get('company-units')
  async companyUnits(
    @Query('userId') queryUserId: string | undefined,
    @Headers('x-user-id') headerUserId: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const jwt = getVerifiedInternalJwtPayload(authorization) as Record<string, unknown> | null;
    const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
    const tenantId =
      (typeof jwt?.tenantId === 'string' && jwt.tenantId.trim()) ||
      (typeof jwt?.tenant_id === 'string' && jwt.tenant_id.trim()) ||
      undefined;
    const roleCode =
      (typeof jwt?.roleCode === 'string' && jwt.roleCode.trim()) ||
      (typeof jwt?.role_code === 'string' && jwt.role_code.trim()) ||
      undefined;
    const data = await this.service.companyUnits(userId, { tenantId, roleCode });
    return ok(data, 'XBOS-TENANT-200', 'Company units loaded');
  }

  @Post('members')
  async createMemberTenant(
    @Body() body: any,
    @Query('userId') queryUserId: string | undefined,
    @Headers('x-user-id') headerUserId: string | undefined,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
  ) {
    this.assertInternal(authorization, internalApiKey);
    const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
    const data = await this.service.createMemberTenant(userId, body);
    return ok(data, 'XBOS-TENANT-201', 'Member tenant created successfully');
  }
}
