import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '../common/api-response';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { CompanyScopeService } from './company-scope.service';

@Controller('company-scope')
export class CompanyScopeController {
  constructor(private readonly companyScopeService: CompanyScopeService) {}

  @Get('companies')
  listScopedCompanies(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
  ) {
    return this.companyScopeService
      .listScopedCompanies(authorization, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-COS-201', 'Scoped companies listed'));
  }

  @Get('memberships')
  listScopedMemberships(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId?: string,
  ) {
    return this.companyScopeService
      .listScopedMemberships(
        authorization,
        companyId,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-COS-202', 'Scoped memberships listed'));
  }

  @Post('memberships')
  upsertScopedMembership(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body()
    body: {
      email: string;
      full_name: string;
      role: string;
      company_id: string;
      employee_id?: string | null;
      status?: string;
      tenant_id?: string;
    },
  ) {
    return this.companyScopeService
      .upsertScopedMembership(
        authorization,
        body,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-COS-203', 'Scoped membership saved'));
  }

  @Patch('memberships/:membershipId')
  updateScopedMembership(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('membershipId') membershipId: string,
    @Body()
    body: {
      role?: string;
      employee_id?: string | null;
      status?: string;
      full_name?: string;
      email?: string;
    },
  ) {
    return this.companyScopeService
      .updateScopedMembership(
        authorization,
        membershipId,
        body,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-COS-204', 'Scoped membership updated'));
  }

  @Delete('memberships/:membershipId')
  deleteScopedMembership(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Param('membershipId') membershipId: string,
  ) {
    return this.companyScopeService
      .deleteScopedMembership(
        authorization,
        membershipId,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-COS-205', 'Scoped membership deleted'));
  }
}
