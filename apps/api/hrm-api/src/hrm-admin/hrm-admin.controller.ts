/**
 * @CODE-MEMORY
 * Screen:     HRM → Quản trị (FR-HRM-02..05)
 * UC:         UC-HRM-02..05
 * BR:         platform_admins · user_company_memberships
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.24–3.27
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · docs/hrm/API_DESIGN_HRM_ADMIN.md
 * Purpose:    HTTP surface admin — envelope HRM-ADMIN-201..209; DTO plane TEXT company_id / UUID user_id.
 * WorkItem:   BE-HRM-ADMIN-DTO-01
 * Coded:      2026-07-27
 * Callers:    web-portal Admin FE / service-role invite
 * Callees:    HrmAdminService · ValidationPipe DTOs
 * FEActions:  POST platform/company/invite/reset → toast + F5
 * BEChain:    Controller → Service → profiles / platform_admins / memberships
 * Impact:     Sai wire code hoặc DTO UUID company → 400 slug / FE lệch F.1
 * must_keep:  FR-02..05 · Auth/Tenant · Fleet/OP · U65 · HOLD_DEPLOY · codes HRM-ADMIN-201..204
 * SOLID:      Controller mỏng — nghiệp vụ ở service
 * LastVerified: hrm-admin.dto.spec.ts · controller.spec · verify-openapi-hrm-p1-s3b · 2026-07-27
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADMIN-DTO-01
 * change_mode: ADD
 * What: Neo CODE-MEMORY — DTO company_id TEXT (G-ADM-DTO-01 CLOSED); không invent FR mới
 * must_keep: path invite-employee singular; Auth dual-plane cite
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-OA-ADMIN-01
 * change_mode: ADD
 * What: Neo OpenAPI F.1 /admin/platform-admin|company-admin|invite-employee|reset-user-password
 *       (hrm-api.yaml 1.3.5-admin-f1 · HRM-ADMIN-201..204 · company_id TEXT slug examples)
 * Why: Residual OpenAPI deepen sau G-ADM-DTO-01 — không đổi DTO/runtime behavior
 * SRS: FR-HRM-02..05 Diễn biến #1–#8
 * TechSpec: docs/hrm/API_DESIGN_HRM_ADMIN.md §A–D · docs/api/openapi/hrm-api.yaml
 * must_keep: G-ADM-DTO-01 CLOSED · Auth/Tenant · U65 · HOLD_DEPLOY · không wipe DTO plane
 */
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
      .then((data) =>
        ok(data, 'HRM-ADMIN-202', 'Company admin created or updated'),
      );
  }

  @Post('invite-employee')
  inviteEmployees(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: InviteEmployeesDto,
  ) {
    return this.hrmAdminService
      .inviteEmployees(authorization, body)
      .then((data) =>
        ok(data, 'HRM-ADMIN-203', 'Employee invitation batch processed'),
      );
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
  listAdminCompanies(
    @Headers('authorization') authorization: string | undefined,
  ) {
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
    @Body()
    body: {
      role?: string;
      employee_id?: string | null;
      status?: string;
      full_name?: string;
      email?: string;
    },
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
