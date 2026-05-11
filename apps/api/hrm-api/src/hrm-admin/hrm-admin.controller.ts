import { Body, Controller, Headers, Post } from '@nestjs/common';
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
}
