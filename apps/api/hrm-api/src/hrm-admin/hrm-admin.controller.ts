import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { HrmAdminService } from './hrm-admin.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { ok } from '../common/api-response';

@Controller('admin')
export class HrmAdminController {
  constructor(private readonly hrmAdminService: HrmAdminService) {}

  @Post('platform-admin')
  createPlatformAdmin(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreatePlatformAdminDto,
  ) {
    return this.hrmAdminService
      .createPlatformAdmin(authorization, body)
      .then((data) => ok(data, 'HRM-ADMIN-201', 'Platform admin created'));
  }

  @Post('company-admin')
  createCompanyAdmin(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateCompanyAdminDto,
  ) {
    return this.hrmAdminService
      .createCompanyAdmin(authorization, body)
      .then((data) => ok(data, 'HRM-ADMIN-202', 'Company admin created or updated'));
  }

  @Post('invite-employee')
  inviteEmployees(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: InviteEmployeesDto,
  ) {
    return this.hrmAdminService
      .inviteEmployees(authorization, body)
      .then((data) => ok(data, 'HRM-ADMIN-203', 'Employee invitation batch processed'));
  }

  @Post('reset-user-password')
  resetUserPassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: ResetUserPasswordDto,
  ) {
    return this.hrmAdminService
      .resetUserPassword(authorization, body)
      .then((data) => ok(data, 'HRM-ADMIN-204', 'User credential updated'));
  }

  @Get('companies')
  listAdminCompanies(@Headers('authorization') authorization: string | undefined) {
    return this.hrmAdminService
      .listAdminCompanies(authorization)
      .then((data) => ok(data, 'HRM-ADMIN-205', 'Admin companies listed'));
  }

  @Get('company-memberships')
  listCompanyMemberships(
    @Headers('authorization') authorization: string | undefined,
    @Query('company_id') companyId?: string,
  ) {
    return this.hrmAdminService
      .listCompanyMemberships(authorization, companyId)
      .then((data) => ok(data, 'HRM-ADMIN-206', 'Company memberships listed'));
  }

  @Post('company-memberships')
  upsertCompanyMembership(
    @Headers('authorization') authorization: string | undefined,
    @Body()
    body: {
      email: string;
      full_name: string;
      role: string;
      company_id: string;
      employee_id?: string | null;
      status?: string;
    },
  ) {
    return this.hrmAdminService
      .upsertCompanyMembership(authorization, body)
      .then((data) => ok(data, 'HRM-ADMIN-207', 'Company membership saved'));
  }

  @Patch('company-memberships/:membershipId')
  updateCompanyMembership(
    @Headers('authorization') authorization: string | undefined,
    @Param('membershipId') membershipId: string,
    @Body() body: { role?: string; employee_id?: string | null; status?: string; full_name?: string; email?: string },
  ) {
    return this.hrmAdminService
      .updateCompanyMembership(authorization, membershipId, body)
      .then((data) => ok(data, 'HRM-ADMIN-208', 'Company membership updated'));
  }

  @Delete('company-memberships/:membershipId')
  deleteCompanyMembership(
    @Headers('authorization') authorization: string | undefined,
    @Param('membershipId') membershipId: string,
  ) {
    return this.hrmAdminService
      .deleteCompanyMembership(authorization, membershipId)
      .then((data) => ok(data, 'HRM-ADMIN-209', 'Company membership deleted'));
  }
}
