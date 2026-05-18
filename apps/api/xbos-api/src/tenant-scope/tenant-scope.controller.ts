import { Controller, Get, Headers, HttpStatus, Query } from '@nestjs/common';
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
    return (fromJwt ?? headerUserId ?? queryUserId ?? process.env.DEV_DEFAULT_USER_ID ?? 'admin@xevn.vn').trim();
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
    const userId = this.resolveUserId(authorization, headerUserId, queryUserId);
    const data = await this.service.groupMemberUnits(userId);
    return ok(data, 'XBOS-TENANT-200', 'Group member units loaded');
  }
}
