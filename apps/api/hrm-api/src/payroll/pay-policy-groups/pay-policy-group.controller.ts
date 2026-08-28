/**
 * @CODE-MEMORY
 * Screen:     Settings → Lương → Nhóm Chính sách (F-PAY-POLICY-GROUP-01)
 * UC:         UC-G0-01..04
 * SRS:        SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md
 * TechSpec:   TECHSPEC_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md §3.5
 * Purpose:    Transport layer — HTTP endpoints cho pay_policy_groups.
 *             SRP: chỉ parse input, delegate sang Service, trả HTTP response.
 * Coded:      2026-08-27
 * Routes:     GET    /api/hrm/pay-policy-groups
 *             GET    /api/hrm/pay-policy-groups/check-code?code=XXX
 *             POST   /api/hrm/pay-policy-groups
 *             PUT    /api/hrm/pay-policy-groups/:id
 *             DELETE /api/hrm/pay-policy-groups/:id
 * RBAC:       List/check = authenticated; Create/Update/Delete = HR_ADMIN (via header role check)
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { PayPolicyGroupService } from './pay-policy-group.service';
import { CreatePayPolicyGroupDto } from './dto/create-pay-policy-group.dto';
import { UpdatePayPolicyGroupDto } from './dto/update-pay-policy-group.dto';
import { QueryPayPolicyGroupDto } from './dto/query-pay-policy-group.dto';

@Controller('pay-policy-groups')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }))
export class PayPolicyGroupController {
  constructor(private readonly svc: PayPolicyGroupService) {}

  /** UC-G0-01: Xem danh sách nhóm chính sách */
  @Get()
  async findAll(@Req() req: any, @Query() query: QueryPayPolicyGroupDto) {
    const tenantId = this._tenantId(req);
    const data = await this.svc.findAll(tenantId, query.is_active);
    return { data, meta: { total: data.length } };
  }

  /** UC-G0-02 (real-time check): Kiểm tra code unique trước khi tạo */
  @Get('check-code')
  async checkCode(@Req() req: any, @Query('code') code: string) {
    if (!code) return { available: false, reason: 'Code không được để trống' };
    const tenantId = this._tenantId(req);
    return this.svc.checkCodeAvailable(code, tenantId);
  }

  /** UC-G0-02: Tạo nhóm chính sách mới */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: any, @Body() dto: CreatePayPolicyGroupDto) {
    this._assertRole(req, 'HR_ADMIN');
    const tenantId = this._tenantId(req);
    const userId = this._userId(req);
    const data = await this.svc.create(tenantId, dto, userId);
    return { data };
  }

  /** UC-G0-03: Sửa nhóm chính sách (tenant only, code immutable) */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayPolicyGroupDto,
  ) {
    this._assertRole(req, 'HR_ADMIN');
    const tenantId = this._tenantId(req);
    const userId = this._userId(req);
    const data = await this.svc.update(id, tenantId, dto, userId);
    return { data };
  }

  /** UC-G0-04: Xóa mềm nhóm chính sách */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    this._assertRole(req, 'HR_ADMIN');
    const tenantId = this._tenantId(req);
    await this.svc.remove(id, tenantId);
    return { message: 'Xóa nhóm thành công' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  private _tenantId(req: any): string {
    return req.headers['x-tenant-id'] || req.user?.tenantId || 'xevn';
  }

  private _userId(req: any): string {
    return req.headers['x-user-id'] || req.user?.sub || 'system';
  }

  /** RBAC check theo header role (thống nhất với pattern payroll-config.controller.ts) */
  private _assertRole(req: any, requiredRole: string): void {
    const role = req.headers['x-user-role'] || req.user?.role || '';
    if (!role.includes(requiredRole) && role !== 'SUPER_ADMIN') {
      throw new ApiException(
        'HRM-AUTH-FORBIDDEN',
        `Chức năng này yêu cầu quyền ${requiredRole}`,
        HttpStatus.FORBIDDEN,
      );
    }
  }
}